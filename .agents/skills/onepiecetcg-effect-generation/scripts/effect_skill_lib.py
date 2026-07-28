#!/usr/bin/env python3
"""Shared helpers for the project-local OPTCG effect-generation skill."""

from __future__ import annotations

import json
import re
import subprocess
import textwrap
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


CATALOG_ENDPOINTS = (
    "https://optcgapi.com/api/allSetCards/",
    "https://optcgapi.com/api/allSTCards/",
    "https://optcgapi.com/api/allPromoCards/",
    "https://optcgapi.com/api/allDonCards/",
)


@dataclass(frozen=True)
class CatalogCard:
    """Normalized card metadata used by the skill scripts."""

    card_id: str
    name: str
    card_type: str
    colors: list[str]
    cost: int | None
    power: int | None
    life: int | None
    counter: int | None
    attributes: list[str]
    families: list[str]
    text: str
    trigger: str


@dataclass(frozen=True)
class ParsedCardBlock:
    """A raw authored card block extracted from an edition file."""

    card_id: str
    raw_block: str
    effect_ids: tuple[str, ...]
    special_handler_ids: tuple[str, ...]


@dataclass(frozen=True)
class ParsedEditionFile:
    """A parsed `*.effects.ts` file."""

    edition_id: str
    variable_name: str
    path: Path
    cards: tuple[ParsedCardBlock, ...]


@dataclass(frozen=True)
class ParsedSpecialHandler:
    """A parsed `*.special.ts` file."""

    handler_id: str
    card_id: str
    export_name: str
    path: Path


@dataclass
class ValidationIssue:
    """A validation issue reported by the skill."""

    code: str
    message: str


@dataclass
class ValidationReport:
    """Validation result across edition files and special handlers."""

    issues: list[ValidationIssue] = field(default_factory=list)

    @property
    def valid(self) -> bool:
        return len(self.issues) == 0


def normalize_card_id(card_id: str) -> str:
    """Return the canonical uppercase card id."""

    return card_id.strip().upper()


def normalize_edition_id(edition_id: str) -> str:
    """Return the canonical uppercase edition id."""

    return edition_id.strip().upper()


def split_csv_ids(value: str) -> list[str]:
    """Parse a comma-separated list of edition ids."""

    return [normalize_edition_id(entry) for entry in value.split(",") if entry.strip()]


def detect_repo_root(start: Path | None = None) -> Path:
    """Locate the repository root from the current working directory."""

    candidate = start or Path.cwd()

    try:
        output = subprocess.check_output(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=candidate,
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
        if output:
            return Path(output)
    except (OSError, subprocess.CalledProcessError):
        pass

    for parent in [candidate, *candidate.parents]:
        if (parent / "packages/api/src/card-effect/definitions").is_dir():
            return parent

    raise RuntimeError(
        "Could not locate the onepiecetcg repository root from the current directory."
    )


def resolve_default_definitions_dir(repo_root: Path) -> Path:
    """Return the default definitions directory inside the repository."""

    return repo_root / "packages/api/src/card-effect/definitions"


def resolve_default_special_dir(repo_root: Path) -> Path:
    """Return the default special-handler directory inside the repository."""

    return resolve_default_definitions_dir(repo_root) / "special"


def read_text(path: Path) -> str:
    """Read a UTF-8 text file."""

    return path.read_text(encoding="utf-8")


def normalize_effect_text(value: Any) -> str:
    """Normalize card effect text and treat `NULL` as empty."""

    if value is None:
        return ""
    text = str(value).strip()
    if not text or text.upper() == "NULL":
        return ""
    return text


def first_value(payload: dict[str, Any], *keys: str) -> Any:
    """Return the first non-empty value found across the provided keys."""

    for key in keys:
        if key in payload and payload[key] not in (None, ""):
            return payload[key]
    return None


def to_string_list(value: Any) -> list[str]:
    """Normalize a scalar, slash-separated, or array value into strings."""

    if value is None:
        return []
    if isinstance(value, list):
        return [str(entry).strip() for entry in value if str(entry).strip()]
    text = str(value).strip()
    if not text:
        return []
    parts = re.split(r"[/,]", text)
    return [part.strip() for part in parts if part.strip()]


def parse_int(value: Any) -> int | None:
    """Parse an integer-like value."""

    if value in (None, ""):
        return None
    try:
        return int(str(value).replace(",", "").strip())
    except ValueError:
        return None


def normalize_catalog_card(payload: dict[str, Any]) -> CatalogCard | None:
    """Normalize one upstream OPTCG payload into the local card shape."""

    raw_id = first_value(payload, "id", "card_id", "card_set_id")
    if raw_id is None:
        return None

    card_id = normalize_card_id(str(raw_id))
    name = str(first_value(payload, "name", "card_name") or "").strip()
    card_type = str(first_value(payload, "type", "card_type") or "").strip()

    return CatalogCard(
        card_id=card_id,
        name=name,
        card_type=card_type,
        colors=to_string_list(first_value(payload, "colors", "color")),
        cost=parse_int(first_value(payload, "cost")),
        power=parse_int(first_value(payload, "power")),
        life=parse_int(first_value(payload, "life")),
        counter=parse_int(first_value(payload, "counter")),
        attributes=to_string_list(first_value(payload, "attribute", "attributes")),
        families=to_string_list(first_value(payload, "family", "families")),
        text=normalize_effect_text(first_value(payload, "text", "card_text")),
        trigger=normalize_effect_text(first_value(payload, "trigger")),
    )


def extract_cards_from_snapshot(payload: Any) -> list[CatalogCard]:
    """Extract normalized cards from a snapshot JSON payload."""

    raw_cards: list[Any]
    if isinstance(payload, list):
        raw_cards = payload
    elif isinstance(payload, dict) and isinstance(payload.get("cards"), list):
        raw_cards = payload["cards"]
    else:
        raise RuntimeError(
            "Source file must be a JSON array of cards or an object with a cards array."
        )

    cards: list[CatalogCard] = []
    for raw_card in raw_cards:
        if not isinstance(raw_card, dict):
            continue
        normalized = normalize_catalog_card(raw_card)
        if normalized is not None:
            cards.append(normalized)
    return cards


def load_cards_from_snapshot(path: Path) -> list[CatalogCard]:
    """Load normalized cards from a local JSON file."""

    payload = json.loads(read_text(path))
    return extract_cards_from_snapshot(payload)


def fetch_live_catalog() -> list[CatalogCard]:
    """Fetch the current OPTCG catalog directly from the upstream API."""

    cards_by_id: dict[str, CatalogCard] = {}
    errors: list[str] = []

    for endpoint in CATALOG_ENDPOINTS:
        try:
            with urllib.request.urlopen(endpoint) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, json.JSONDecodeError) as error:
            errors.append(f"{endpoint}: {error}")
            continue

        for card in extract_cards_from_snapshot(payload):
            cards_by_id[card.card_id] = card

    if not cards_by_id:
        raise RuntimeError(
            "Unable to fetch any OPTCG catalog cards.\n" + "\n".join(errors)
        )

    return list(cards_by_id.values())


def should_generate_definition(card: CatalogCard) -> bool:
    """Return whether a card should appear in effect definitions."""

    if card.card_type.upper() == "DON!!":
        return False
    return bool(card.text or card.trigger)


def get_card_edition_id(card_id: str) -> str | None:
    """Extract the edition prefix from a card id."""

    normalized = normalize_card_id(card_id)
    if "-" not in normalized:
        return None
    return normalized.split("-", 1)[0]


def scan_object_spans(text: str) -> list[tuple[int, int]]:
    """Return top-level object spans within a TS array body."""

    spans: list[tuple[int, int]] = []
    depth = 0
    start: int | None = None
    in_string: str | None = None
    escape = False
    in_line_comment = False
    in_block_comment = False
    index = 0

    while index < len(text):
        char = text[index]
        next_char = text[index + 1] if index + 1 < len(text) else ""

        if in_line_comment:
            if char == "\n":
                in_line_comment = False
            index += 1
            continue

        if in_block_comment:
            if char == "*" and next_char == "/":
                in_block_comment = False
                index += 2
                continue
            index += 1
            continue

        if in_string is not None:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == in_string:
                in_string = None
            index += 1
            continue

        if char == "/" and next_char == "/":
            in_line_comment = True
            index += 2
            continue

        if char == "/" and next_char == "*":
            in_block_comment = True
            index += 2
            continue

        if char in ("'", '"', "`"):
            in_string = char
            index += 1
            continue

        if char == "{":
            if depth == 0:
                start = index
            depth += 1
            index += 1
            continue

        if char == "}":
            depth -= 1
            if depth == 0 and start is not None:
                spans.append((start, index + 1))
                start = None
            index += 1
            continue

        index += 1

    return spans


def include_leading_comments(text: str, start: int) -> int:
    """Extend a block start upward to include directly attached `//` comments."""

    line_start = text.rfind("\n", 0, start) + 1

    while line_start > 0:
        previous_line_end = line_start - 1
        previous_line_start = text.rfind("\n", 0, previous_line_end) + 1
        previous_line = text[previous_line_start:previous_line_end]
        stripped = previous_line.strip()

        if stripped.startswith("//") or stripped == "":
            line_start = previous_line_start
            continue

        break

    return line_start


def extract_cards_array_body(text: str) -> str:
    """Extract the raw body of the `cards: [...]` array."""

    match = re.search(r"cards\s*:\s*\[", text)
    if not match:
        raise RuntimeError("Could not locate the cards array in the edition file.")

    array_start = match.end() - 1
    depth = 0
    in_string: str | None = None
    in_line_comment = False
    in_block_comment = False
    escape = False

    for index in range(array_start, len(text)):
        char = text[index]
        next_char = text[index + 1] if index + 1 < len(text) else ""

        if in_string is not None:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == in_string:
                in_string = None
            continue

        if in_line_comment:
            if char == "\n":
                in_line_comment = False
            continue

        if in_block_comment:
            if char == "*" and next_char == "/":
                in_block_comment = False
            continue

        if char == "/" and next_char == "/":
            in_line_comment = True
            continue

        if char == "/" and next_char == "*":
            in_block_comment = True
            continue

        if char in ("'", '"', "`"):
            in_string = char
            continue

        if char == "[":
            depth += 1
            continue

        if char == "]":
            depth -= 1
            if depth == 0:
                return text[array_start + 1 : index]

    raise RuntimeError("Could not find the closing bracket for the cards array.")


def parse_edition_file(path: Path) -> ParsedEditionFile:
    """Parse one authored edition definition file."""

    text = read_text(path)
    edition_match = re.search(r"editionId\s*:\s*'([^']+)'", text)
    if not edition_match:
        raise RuntimeError(f"Could not find editionId in {path}.")

    variable_match = re.search(r"export const (\w+)\s*:", text)
    if not variable_match:
        raise RuntimeError(f"Could not find exported variable name in {path}.")

    cards_body = extract_cards_array_body(text)
    cards: list[ParsedCardBlock] = []

    for start, end in scan_object_spans(cards_body):
        block_start = include_leading_comments(cards_body, start)
        raw_block = textwrap.dedent(cards_body[block_start:end]).strip().rstrip(",").strip()
        card_match = re.search(r"cardId\s*:\s*'([^']+)'", raw_block)
        if not card_match:
            raise RuntimeError(f"Could not find cardId in block from {path}.")

        cards.append(
            ParsedCardBlock(
                card_id=normalize_card_id(card_match.group(1)),
                raw_block=raw_block,
                effect_ids=tuple(re.findall(r"\bid\s*:\s*'([^']+)'", raw_block)),
                special_handler_ids=tuple(
                    re.findall(r"specialHandlerId\s*:\s*'([^']+)'", raw_block)
                ),
            )
        )

    return ParsedEditionFile(
        edition_id=normalize_edition_id(edition_match.group(1)),
        variable_name=variable_match.group(1),
        path=path,
        cards=tuple(cards),
    )


def parse_special_handler(path: Path) -> ParsedSpecialHandler:
    """Parse one `*.special.ts` file."""

    text = read_text(path)
    export_match = re.search(r"export const (\w+)\s*:\s*SpecialHandlerDefinition", text)
    if not export_match:
        raise RuntimeError(f"Could not find the exported special handler in {path}.")

    id_match = re.search(r"\bid\s*:\s*'([^']+)'", text)
    card_match = re.search(r"\bcardId\s*:\s*'([^']+)'", text)
    if not id_match or not card_match:
        raise RuntimeError(f"Could not parse handler id/cardId from {path}.")

    return ParsedSpecialHandler(
        handler_id=id_match.group(1).strip(),
        card_id=normalize_card_id(card_match.group(1)),
        export_name=export_match.group(1),
        path=path,
    )


def load_parsed_editions(definitions_dir: Path) -> list[ParsedEditionFile]:
    """Load every authored edition file from the target directory."""

    files = sorted(
        path
        for path in definitions_dir.glob("*.effects.ts")
        if path.is_file() and path.name != "index.ts"
    )
    return [parse_edition_file(path) for path in files]


def load_parsed_special_handlers(special_dir: Path) -> list[ParsedSpecialHandler]:
    """Load every authored special handler from the target directory."""

    files = sorted(
        path
        for path in special_dir.glob("*.special.ts")
        if path.is_file() and path.name != "index.ts"
    )
    return [parse_special_handler(path) for path in files]


def validate_sources(
    editions: list[ParsedEditionFile],
    special_handlers: list[ParsedSpecialHandler],
) -> ValidationReport:
    """Validate authored edition files and special handlers."""

    report = ValidationReport()
    edition_ids: dict[str, Path] = {}
    card_ids: dict[str, Path] = {}
    effect_ids: dict[str, str] = {}
    special_ids: dict[str, ParsedSpecialHandler] = {}
    referenced_special_ids: dict[str, str] = {}

    for edition in editions:
        if edition.edition_id in edition_ids:
            report.issues.append(
                ValidationIssue(
                    "DUPLICATE_EDITION_ID",
                    f'Edition "{edition.edition_id}" is declared in both '
                    f"{edition_ids[edition.edition_id]} and {edition.path}.",
                )
            )
        else:
            edition_ids[edition.edition_id] = edition.path

        for card in edition.cards:
            card_edition_id = get_card_edition_id(card.card_id)
            if card_edition_id != edition.edition_id:
                report.issues.append(
                    ValidationIssue(
                        "CARD_ID_EDITION_MISMATCH",
                        f'Card "{card.card_id}" is stored in edition "{edition.edition_id}".',
                    )
                )

            if card.card_id in card_ids:
                report.issues.append(
                    ValidationIssue(
                        "DUPLICATE_CARD_ID",
                        f'Card "{card.card_id}" is declared in both '
                        f"{card_ids[card.card_id]} and {edition.path}.",
                    )
                )
            else:
                card_ids[card.card_id] = edition.path

            for effect_id in card.effect_ids:
                if effect_id in effect_ids:
                    report.issues.append(
                        ValidationIssue(
                            "DUPLICATE_EFFECT_ID",
                            f'Effect id "{effect_id}" is declared for both '
                            f'{effect_ids[effect_id]} and {card.card_id}.',
                        )
                    )
                else:
                    effect_ids[effect_id] = card.card_id

            for special_handler_id in card.special_handler_ids:
                if special_handler_id in referenced_special_ids:
                    report.issues.append(
                        ValidationIssue(
                            "DUPLICATE_SPECIAL_HANDLER_ID",
                            f'Special handler "{special_handler_id}" is referenced by both '
                            f'{referenced_special_ids[special_handler_id]} and {card.card_id}.',
                        )
                    )
                else:
                    referenced_special_ids[special_handler_id] = card.card_id

    for handler in special_handlers:
        if handler.handler_id in special_ids:
            report.issues.append(
                ValidationIssue(
                    "DUPLICATE_SPECIAL_HANDLER_ID",
                    f'Special handler "{handler.handler_id}" is declared in both '
                    f"{special_ids[handler.handler_id].path} and {handler.path}.",
                )
            )
        else:
            special_ids[handler.handler_id] = handler

    for special_handler_id, card_id in referenced_special_ids.items():
        handler = special_ids.get(special_handler_id)
        if handler is None:
            report.issues.append(
                ValidationIssue(
                    "MISSING_SPECIAL_HANDLER",
                    f'Card "{card_id}" references missing special handler "{special_handler_id}".',
                )
            )
            continue

        if handler.card_id != card_id:
            report.issues.append(
                ValidationIssue(
                    "SPECIAL_HANDLER_CARD_MISMATCH",
                    f'Special handler "{special_handler_id}" targets "{handler.card_id}" '
                    f'but is referenced by "{card_id}".',
                )
            )

    for handler_id, handler in special_ids.items():
        if handler_id not in referenced_special_ids:
            report.issues.append(
                ValidationIssue(
                    "ORPHAN_SPECIAL_HANDLER",
                    f'Special handler "{handler_id}" in {handler.path} is not referenced by any card.',
                )
            )

    return report


def to_variable_name(edition_id: str) -> str:
    """Build the exported TS variable name for an edition file."""

    return f"{edition_id.lower()}EffectDefinitions"


def to_effect_file_name(edition_id: str) -> str:
    """Build the filename for an edition definition file."""

    return f"{edition_id.lower()}.effects.ts"


def quote_ts_string(value: str) -> str:
    """Render a TS single-quoted string literal."""

    escaped = (
        value.replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\r", "\\r")
        .replace("\n", "\\n")
    )
    return f"'{escaped}'"


def is_bare_identifier(value: str) -> bool:
    """Return whether a key can be emitted without quotes."""

    return bool(re.match(r"^[A-Za-z_$][A-Za-z0-9_$]*$", value))


def format_ts_value(value: Any, indent_level: int = 0) -> str:
    """Render a Python value into deterministic TypeScript object syntax."""

    indent = "  " * indent_level
    child_indent = "  " * (indent_level + 1)

    if isinstance(value, str):
        return quote_ts_string(value)

    if isinstance(value, bool):
        return "true" if value else "false"

    if value is None:
        return "null"

    if isinstance(value, (int, float)):
        return str(value)

    if isinstance(value, list):
        if not value:
            return "[]"
        items = ",\n".join(
            f"{child_indent}{format_ts_value(item, indent_level + 1)}" for item in value
        )
        return f"[\n{items},\n{indent}]"

    if isinstance(value, dict):
        if not value:
            return "{}"
        properties = []
        for key, item in value.items():
            rendered_key = key if is_bare_identifier(key) else quote_ts_string(key)
            properties.append(
                f"{child_indent}{rendered_key}: {format_ts_value(item, indent_level + 1)}"
            )
        joined_properties = ",\n".join(properties)
        return f"{{\n{joined_properties},\n{indent}}}"

    raise RuntimeError(f"Unsupported value for TypeScript rendering: {value!r}")


def build_card_comment(card: CatalogCard | None) -> list[str]:
    """Build the generated comment banner for a card block."""

    if card is None:
        return []

    lines = [f"// {card.card_id} {card.name}".rstrip()]
    for text_line in card.text.splitlines():
        stripped = text_line.strip()
        if stripped:
            lines.append(f"// {stripped}")
    if card.trigger:
        lines.append(f"// Trigger: {card.trigger}")
    return lines


def render_generated_card_block(
    card_id: str,
    generated_effects: list[dict[str, Any]] | None,
    catalog_card: CatalogCard | None,
) -> str:
    """Render one generated card block into TS source."""

    payload: dict[str, Any] = {"cardId": normalize_card_id(card_id)}

    if generated_effects:
        rendered_effects: list[dict[str, Any]] = []
        for entry in generated_effects:
            kind = entry.get("kind")
            if kind == "special-ref":
                rendered_effects.append(
                    {
                        "kind": "special-ref",
                        "specialHandlerId": entry["specialHandlerId"].strip(),
                    }
                )
                continue

            effect = entry.get("effect")
            if not isinstance(effect, dict):
                raise RuntimeError(
                    f'Generated {kind!r} effect for "{card_id}" is missing an effect object.'
                )
            rendered_effects.append({"kind": kind, "effect": effect})

        payload["effects"] = rendered_effects

    lines = [*build_card_comment(catalog_card), format_ts_value(payload, 0)]
    return "\n".join(lines)


def render_edition_file(
    edition_id: str,
    ordered_blocks: list[str],
) -> str:
    """Render one edition file."""

    variable_name = to_variable_name(edition_id)
    rendered_cards = ""
    if ordered_blocks:
        indented_blocks = []
        for block in ordered_blocks:
            indented_blocks.append(
                "\n".join(f"    {line}" if line else "" for line in block.splitlines())
            )
        rendered_cards = "\n" + ",\n".join(indented_blocks) + ",\n  "

    return (
        "import type { EditionEffectDefinitions } from '../types/effect-definition-source';\n\n"
        f"export const {variable_name}: EditionEffectDefinitions = {{\n"
        f"  editionId: {quote_ts_string(edition_id)},\n"
        f"  cards: [{rendered_cards}],\n"
        "};\n"
    )


def render_definitions_index(edition_ids: list[str]) -> str:
    """Render `definitions/index.ts` for the selected edition files."""

    imports = "\n".join(
        f"import {{ {to_variable_name(edition_id)} }} from './{to_effect_file_name(edition_id).removesuffix('.ts')}';"
        for edition_id in edition_ids
    )
    entries = "\n".join(f"  {to_variable_name(edition_id)}," for edition_id in edition_ids)
    return (
        "import type { EditionEffectDefinitions } from '../types/effect-definition-source';\n"
        f"{imports}\n\n"
        "export const effectDefinitionEditions: readonly EditionEffectDefinitions[] = [\n"
        f"{entries}\n"
        "];\n"
    )


def render_special_index(handlers: list[ParsedSpecialHandler]) -> str:
    """Render `definitions/special/index.ts` from the discovered special files."""

    imports = "\n".join(
        f"import {{ {handler.export_name} }} from './{handler.path.stem}';"
        for handler in handlers
    )
    entries = "\n".join(f"  {handler.export_name}," for handler in handlers)
    return (
        "import type { SpecialHandlerDefinition } from '../../types/effect-registry';\n"
        f"{imports}\n\n"
        "export const specialHandlerDefinitions: readonly SpecialHandlerDefinition[] = [\n"
        f"{entries}\n"
        "] as const;\n"
    )
