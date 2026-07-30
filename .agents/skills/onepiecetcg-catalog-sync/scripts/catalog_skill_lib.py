"""Shared helpers for the OPTCG catalog-sync skill."""

from __future__ import annotations

import argparse
import json
import re
import urllib.error
import urllib.request
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

ALLOWED_CARD_TYPES = {'Leader', 'Character', 'Event', 'Stage', 'DON!!'}
ALLOWED_CARD_COLORS = {'Red', 'Green', 'Blue', 'Purple', 'Black', 'Yellow'}
SPECIAL_EDITION_IDS = {'DON', 'P'}


CATALOG_ENDPOINTS = (
    ("sets", "https://optcgapi.com/api/allSetCards/"),
    ("decks", "https://optcgapi.com/api/allSTCards/"),
    ("promos", "https://optcgapi.com/api/allPromoCards/"),
    ("don", "https://optcgapi.com/api/allDonCards/"),
)

DON_ENDPOINT = "https://optcgapi.com/api/allDonCards/"
PROMO_ENDPOINT = "https://optcgapi.com/api/allPromoCards/"

EDITION_ENDPOINT = "https://optcgapi.com/api/allSets/"


@dataclass(frozen=True)
class CatalogCard:
    """Normalized card metadata used by the catalog-sync skill."""

    id: str
    number: str
    name: str
    type: str
    colors: list[str]
    cost: int | None
    power: int | None
    life: int | None
    counter: int | None
    attributes: list[str]
    families: list[str]
    text: str
    trigger: str | None
    imageUrl: str | None
    set: dict[str, str]
    rarity: str | None


@dataclass(frozen=True)
class EditionMetadata:
    """Normalized edition metadata used by the catalog-sync skill."""

    id: str
    name: str


def detect_repo_root(start: Path | None = None) -> Path:
    """Locate the repository root."""

    candidate = start or Path.cwd()
    for parent in [candidate, *candidate.parents]:
        if (parent / "packages/shared/src/index.ts").is_file():
            return parent
    raise RuntimeError("Could not locate the repository root.")


def normalize_card_id(value: str) -> str:
    """Normalize a card identifier."""

    return value.strip().upper()


def first_value(payload: dict[str, Any], *keys: str) -> Any:
    """Return the first non-empty matching value."""

    for key in keys:
        if key in payload and payload[key] not in (None, ""):
            return payload[key]
    return None


def to_string_list(value: Any) -> list[str]:
    """Normalize list-like or slash-separated text values."""

    if value is None:
        return []
    if isinstance(value, list):
        return [str(entry).strip() for entry in value if str(entry).strip()]
    text = str(value).strip()
    if not text:
        return []
    return [part.strip() for part in re.split(r"[/,]", text) if part.strip()]


def parse_int(value: Any) -> int | None:
    """Parse an integer-like value."""

    if value in (None, ""):
        return None
    try:
        return int(str(value).replace(",", "").strip())
    except ValueError:
        return None


def normalize_don_card(payload: dict[str, Any]) -> CatalogCard | None:
    """Normalize one DON!! card payload into the shared snapshot shape."""

    raw_id = first_value(payload, "card_image_id", "don_id", "id", "number")
    name = first_value(payload, "card_name", "optcg_don_name", "name")
    if raw_id is None or not name:
        card_image_id = payload.get("card_image_id")
        if card_image_id and name:
            raw_id = card_image_id

    if raw_id is None or not name:
        return None

    card_id = normalize_card_id(str(raw_id))
    return CatalogCard(
        id=card_id,
        number=card_id,
        name=str(name).strip(),
        type=str(first_value(payload, "card_type", "type") or "DON!!").strip(),
        colors=[],
        cost=None,
        power=None,
        life=None,
        counter=None,
        attributes=[],
        families=[],
        text=str(first_value(payload, "card_text", "text") or "").strip(),
        trigger=None,
        imageUrl=(
            str(first_value(payload, "card_image", "image") or "").strip() or None
        ),
        set={"id": "DON", "name": "DON!! Cards"},
        rarity=str(first_value(payload, "rarity") or "DON!!").strip() or None,
    )


def normalize_card(payload: dict[str, Any]) -> CatalogCard | None:
    """Normalize one upstream payload into the shared snapshot shape."""

    raw_id = first_value(
        payload,
        "card_set_id",
        "card_id",
        "cardId",
        "id",
        "number",
        "card_number",
    )
    name = first_value(payload, "card_name", "cardName", "name")
    if raw_id is None or not name:
        return None

    card_id = normalize_card_id(str(raw_id))
    set_id = str(
        first_value(payload, "set_id", "setId", "set", "deck_id", "st_id") or card_id
    ).strip()
    set_name = str(
        first_value(payload, "set_name", "setName", "set", "deck_name", "st_name")
        or set_id
    ).strip()

    raw_colors = first_value(payload, "card_color", "cardColor", "colors", "color")
    if isinstance(raw_colors, str):
        colors = [c.strip() for c in re.split(r"[/,\s]+", raw_colors) if c.strip()]
    else:
        colors = to_string_list(raw_colors)

    return CatalogCard(
        id=card_id,
        number=card_id,
        name=str(name).strip(),
        type=str(first_value(payload, "card_type", "cardType", "type") or "").strip(),
        colors=colors,
        cost=parse_int(first_value(payload, "card_cost", "cost")),
        power=parse_int(first_value(payload, "card_power", "power")),
        life=parse_int(first_value(payload, "life", "card_life")),
        counter=parse_int(first_value(payload, "counter_amount", "counter", "card_counter")),
        attributes=to_string_list(first_value(payload, "attribute", "attributes")),
        families=to_string_list(
            first_value(payload, "sub_types", "family", "families", "types")
        ),
        text=str(first_value(payload, "card_text", "effect", "text") or "").strip(),
        trigger=(
            str(first_value(payload, "trigger", "card_trigger", "cardTrigger") or "").strip()
            or None
        ),
        imageUrl=(
            str(first_value(payload, "card_image", "cardImage", "image") or "").strip()
            or None
        ),
        set={"id": set_id, "name": set_name},
        rarity=(
            str(first_value(payload, "rarity") or "").strip() or None
        ),
    )


def extract_cards(payload: Any) -> list[CatalogCard]:
    """Extract normalized cards from a raw payload."""

    raw_cards: list[Any]
    if isinstance(payload, list):
        raw_cards = payload
    elif isinstance(payload, dict):
        for key in ("cards", "results", "data"):
            if isinstance(payload.get(key), list):
                raw_cards = payload[key]
                break
        else:
            raw_cards = []
    else:
        raw_cards = []

    cards: list[CatalogCard] = []
    for raw_card in raw_cards:
        if isinstance(raw_card, dict):
            normalized = normalize_card(raw_card)
            if normalized is not None:
                cards.append(normalized)
    return cards


def extract_editions(payload: Any) -> list[EditionMetadata]:
    """Extract normalized edition metadata from a raw payload."""

    raw_editions: list[Any]
    if isinstance(payload, list):
        raw_editions = payload
    elif isinstance(payload, dict):
        for key in ("sets", "results", "data"):
            if isinstance(payload.get(key), list):
                raw_editions = payload[key]
                break
        else:
            raw_editions = []
    else:
        raw_editions = []

    editions: list[EditionMetadata] = []
    for raw_edition in raw_editions:
        if not isinstance(raw_edition, dict):
            continue
        raw_id = first_value(raw_edition, "set_id", "setId", "id")
        raw_name = first_value(raw_edition, "set_name", "setName", "name")
        if raw_id is None or raw_name is None:
            continue
        edition_id = normalize_edition_id(str(raw_id))
        edition_name = str(raw_name).strip()
        if not edition_name:
            continue
        editions.append(EditionMetadata(id=edition_id, name=edition_name))
    return editions


def _has_valid_colors(card: CatalogCard) -> bool:
    """Check whether at least one color is recognized."""
    if not card.colors:
        return False
    return any(color in ALLOWED_CARD_COLORS for color in card.colors)


def fetch_live_catalog() -> list[CatalogCard]:
    """Fetch and merge the current OPTCG catalog from the upstream API."""

    by_id: dict[str, CatalogCard] = {}
    errors: list[str] = []

    for _, url in CATALOG_ENDPOINTS:
        try:
            with urllib.request.urlopen(url) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as error:
            errors.append(f"{url}: {error}")
            continue

        for card in extract_cards(payload):
            existing = by_id.get(card.id)
            if existing is None:
                by_id[card.id] = card
            elif not _has_valid_colors(existing) and _has_valid_colors(card):
                by_id[card.id] = card

    if not by_id:
        raise RuntimeError("Unable to fetch any OPTCG catalog cards.\n" + "\n".join(errors))

    return list(by_id.values())


def fetch_live_edition_metadata() -> dict[str, str]:
    """Fetch the current edition name map from the upstream API."""

    try:
        with urllib.request.urlopen(EDITION_ENDPOINT) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as error:
        raise RuntimeError(f"Unable to fetch edition metadata: {error}") from error

    editions = {
        edition.id: edition.name
        for edition in extract_editions(payload)
    }
    if not editions:
        raise RuntimeError("Unable to fetch any OPTCG edition metadata.")
    return editions


def load_cards_from_snapshot(path: Path) -> list[CatalogCard]:
    """Load cards from a local JSON snapshot."""

    payload = json.loads(path.read_text(encoding="utf-8"))
    return extract_cards(payload)


def infer_edition_names(cards: list[CatalogCard]) -> dict[str, str]:
    """Infer edition names from the card payloads when no edition map exists."""

    names: dict[str, str] = {}
    for card in cards:
        edition_id = get_card_edition_id(card.id)
        if edition_id is None or edition_id in names:
            continue
        set_name = card.set.get("name", "").strip()
        if set_name:
            names[edition_id] = set_name
    return names


def group_cards_by_edition(cards: list[CatalogCard]) -> dict[str, list[CatalogCard]]:
    """Group cards by edition prefix."""

    grouped: dict[str, list[CatalogCard]] = defaultdict(list)
    for card in cards:
        edition_id = get_card_edition_id(card.id)
        if edition_id is None:
            continue
        grouped[edition_id].append(card)
    return dict(grouped)


def write_edition_snapshots(
    cards: list[CatalogCard],
    output_dir: Path,
    edition_names: dict[str, str] | None = None,
) -> list[Path]:
    """Write one snapshot file per edition and return the written paths."""

    output_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []
    edition_names = edition_names or {}

    for edition_id, edition_cards in sorted(group_cards_by_edition(cards).items()):
        edition_cards = sorted(edition_cards, key=lambda card: card.id)
        path = resolve_edition_snapshot_path(output_dir, edition_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        edition_name = edition_names.get(edition_id)
        if not edition_name and edition_cards:
            edition_name = edition_cards[0].set.get("name", "").strip() or edition_id
        if not edition_name:
            edition_name = edition_id
        path.write_text(
            json.dumps(
                {
                    "editionId": edition_id,
                    "name": edition_name,
                    "cards": [
                        {
                            "id": card.id,
                            "number": card.number,
                            "name": card.name,
                            "type": card.type,
                            "colors": card.colors,
                            "cost": card.cost,
                            "power": card.power,
                            "life": card.life,
                            "counter": card.counter,
                            "attributes": card.attributes,
                            "families": card.families,
                            "text": card.text,
                            "trigger": card.trigger,
                            "imageUrl": card.imageUrl,
                            "set": card.set,
                            "rarity": card.rarity,
                        }
                        for card in edition_cards
                    ],
                },
                ensure_ascii=False,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        written.append(path)

    return written


def fetch_special_cards(url: str, normalize_fn: callable) -> list[CatalogCard]:
    """Fetch cards from a special endpoint (DON or PROMO) and normalize them."""

    try:
        with urllib.request.urlopen(url) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as error:
        raise RuntimeError(f"Unable to fetch cards from {url}: {error}") from error

    raw_cards: list[Any]
    if isinstance(payload, list):
        raw_cards = payload
    elif isinstance(payload, dict):
        for key in ("cards", "results", "data"):
            if isinstance(payload.get(key), list):
                raw_cards = payload[key]
                break
        else:
            raw_cards = []
    else:
        raw_cards = []

    cards: list[CatalogCard] = []
    for raw_card in raw_cards:
        if isinstance(raw_card, dict):
            normalized = normalize_fn(raw_card)
            if normalized is not None:
                cards.append(normalized)
    return cards


def fetch_don_cards() -> list[CatalogCard]:
    """Fetch and normalize all DON!! cards from the upstream API."""

    return fetch_special_cards(DON_ENDPOINT, normalize_don_card)


def fetch_promo_cards() -> list[CatalogCard]:
    """Fetch and normalize all promo cards from the upstream API."""

    return fetch_special_cards(PROMO_ENDPOINT, normalize_card)


def write_special_snapshot(
    cards: list[CatalogCard],
    edition_id: str,
    edition_name: str,
    output_dir: Path,
) -> Path:
    """Write one special-edition snapshot (DON or PROMO) and return the path."""

    family_prefix = edition_id
    output_path = output_dir / family_prefix / f"{edition_id}.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    cards_sorted = sorted(cards, key=lambda card: card.id)

    output_path.write_text(
        json.dumps(
            {
                "editionId": edition_id,
                "name": edition_name,
                "cards": [
                    {
                        "id": card.id,
                        "number": card.number,
                        "name": card.name,
                        "type": card.type,
                        "colors": card.colors,
                        "cost": card.cost,
                        "power": card.power,
                        "life": card.life,
                        "counter": card.counter,
                        "attributes": card.attributes,
                        "families": card.families,
                        "text": card.text,
                        "trigger": card.trigger,
                        "imageUrl": card.imageUrl,
                        "set": card.set,
                        "rarity": card.rarity,
                    }
                    for card in cards_sorted
                ],
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return output_path


def build_download_parser() -> argparse.ArgumentParser:
    """Build the CLI parser used by the download script."""

    parser = argparse.ArgumentParser(
        description="Download OPTCG API cards and write local edition snapshots."
    )
    parser.add_argument(
        "--source-file",
        type=Path,
        help="Read cards from a local JSON snapshot instead of the live API.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Directory where edition snapshots should be written.",
    )
    parser.add_argument(
        "--edition",
        "-e",
        help="Comma-separated edition ids to write, for example OP-01 or OP-01,EB-01. If omitted, write every edition found in the source data.",
    )
    return parser


def build_validation_parser() -> argparse.ArgumentParser:
    """Build the CLI parser used by the validation script."""

    parser = argparse.ArgumentParser(
        description="Validate OPTCG catalog snapshot files."
    )
    parser.add_argument(
        "--source-file",
        type=Path,
        help="Validate one local JSON snapshot instead of a directory of snapshots.",
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        help="Directory containing edition snapshots to validate.",
    )
    parser.add_argument(
        "--edition",
        "-e",
        help="Comma-separated edition ids to validate, for example OP-01 or OP-01,EB-01.",
    )
    return parser


def parse_edition_filter(value: str | None) -> set[str] | None:
    """Parse an optional edition filter."""

    if value is None:
        return None
    editions = {
        normalize_edition_id(item)
        for item in value.split(",")
        if item.strip()
    }
    return editions or None


def normalize_edition_id(value: str) -> str:
    """Normalize an edition id to the hyphenated snapshot format."""

    normalized = normalize_card_id(value)
    match = re.match(r"^([A-Z]+)(\d{2})$", normalized)
    if match is not None:
        return f"{match.group(1)}-{match.group(2)}"
    return normalized


def get_edition_family_prefix(edition_id: str) -> str:
    """Return the folder name used for one edition family."""

    normalized = normalize_edition_id(edition_id)
    match = re.match(r"^([A-Z]+)", normalized)
    if match is None:
        raise ValueError(f"Invalid edition id: {edition_id!r}")
    return match.group(1)


def resolve_edition_snapshot_path(output_dir: Path, edition_id: str) -> Path:
    """Return the path for one edition snapshot."""

    normalized = normalize_edition_id(edition_id)
    family_prefix = get_edition_family_prefix(normalized)
    return output_dir / family_prefix / f"{normalized}.json"


def get_card_edition_id(card_id: str) -> str | None:
    """Extract the edition id from a normalized card id."""

    normalized = normalize_card_id(card_id)
    match = re.match(r"^([A-Z]+-?\d{2})-[A-Z0-9]+$", normalized)
    if match is None:
        return None
    return normalize_edition_id(match.group(1))


def load_snapshot_document(path: Path) -> dict[str, Any]:
    """Load one snapshot document from disk."""

    payload = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(payload, dict):
        raise ValueError(f'{path}: snapshot must be a JSON object')
    return payload


def validate_snapshot_document(path: Path) -> list[str]:
    """Validate the structure of one downloaded snapshot."""

    issues: list[str] = []

    try:
        payload = load_snapshot_document(path)
    except (OSError, json.JSONDecodeError, ValueError) as error:
        return [f'{path}: {error}']

    edition_id = payload.get('editionId')
    if not isinstance(edition_id, str) or not edition_id.strip():
        issues.append(f'{path}: missing or invalid editionId')
        edition_id = path.stem
    else:
        edition_id = normalize_card_id(edition_id)

    edition_name = payload.get('name')
    if not isinstance(edition_name, str) or not edition_name.strip():
        issues.append(f'{path}: missing or invalid name')

    if normalize_card_id(path.stem) != edition_id:
        issues.append(
            f'{path}: editionId {edition_id!r} does not match file name {path.stem!r}'
        )
    try:
        expected_prefix = get_edition_family_prefix(edition_id)
    except ValueError as error:
        issues.append(f'{path}: {error}')
        expected_prefix = ''
    if expected_prefix and normalize_card_id(path.parent.name) != expected_prefix:
        issues.append(
            f'{path}: parent folder {path.parent.name!r} does not match edition prefix {expected_prefix!r}'
        )

    cards = payload.get('cards')
    if not isinstance(cards, list):
        issues.append(f'{path}: cards must be an array')
        return issues
    if not cards:
        issues.append(f'{path}: cards array must not be empty')
        return issues

    seen_ids: set[str] = set()
    for index, card in enumerate(cards, start=1):
        card_label = f'{path} card #{index}'
        if not isinstance(card, dict):
            issues.append(f'{card_label}: card must be an object')
            continue

        card_id = card.get('id')
        number = card.get('number')
        name = card.get('name')
        card_type = card.get('type')
        colors = card.get('colors')
        cost = card.get('cost')
        power = card.get('power')
        life = card.get('life')
        counter = card.get('counter')
        attributes = card.get('attributes')
        families = card.get('families')
        text = card.get('text')
        trigger = card.get('trigger')
        image_url = card.get('imageUrl')
        set_info = card.get('set')
        rarity = card.get('rarity')

        if not isinstance(card_id, str) or not card_id.strip():
            issues.append(f'{card_label}: missing or invalid id')
            continue

        normalized_id = normalize_card_id(card_id)
        if normalized_id in seen_ids:
            issues.append(f'{card_label}: duplicate card id {normalized_id}')
        seen_ids.add(normalized_id)

        if normalized_id != card_id:
            issues.append(f'{card_label}: id must be uppercase and normalized')
        if edition_id not in SPECIAL_EDITION_IDS:
            card_edition_id = get_card_edition_id(normalized_id)
            if card_edition_id is None:
                issues.append(f'{card_label}: id {normalized_id} is not a valid edition card id')
            elif card_edition_id != edition_id:
                issues.append(f'{card_label}: id {normalized_id} does not belong to edition {edition_id}')

        if not isinstance(number, str) or normalize_card_id(number) != normalized_id:
            issues.append(f'{card_label}: number must match id')
        if not isinstance(name, str) or not name.strip():
            issues.append(f'{card_label}: missing or invalid name')

        if not isinstance(card_type, str) or card_type not in ALLOWED_CARD_TYPES:
            issues.append(f'{card_label}: invalid type {card_type!r}')

        if not isinstance(colors, list) or any(
            not isinstance(color, str) or color not in ALLOWED_CARD_COLORS
            for color in colors
        ):
            issues.append(f'{card_label}: colors must be a list of valid card colors')

        for field_name, value in (
            ('cost', cost),
            ('power', power),
            ('life', life),
            ('counter', counter),
        ):
            if value is not None and not isinstance(value, int):
                issues.append(f'{card_label}: {field_name} must be an integer or null')

        for field_name, value in (('attributes', attributes), ('families', families)):
            if not isinstance(value, list) or any(not isinstance(entry, str) or not entry.strip() for entry in value):
                issues.append(f'{card_label}: {field_name} must be a list of non-empty strings')

        if not isinstance(text, str):
            issues.append(f'{card_label}: text must be a string')
        if trigger is not None and not isinstance(trigger, str):
            issues.append(f'{card_label}: trigger must be a string or null')
        if image_url is not None and not isinstance(image_url, str):
            issues.append(f'{card_label}: imageUrl must be a string or null')
        if not isinstance(set_info, dict):
            issues.append(f'{card_label}: set must be an object')
        else:
            set_id = set_info.get('id')
            set_name = set_info.get('name')
            if not isinstance(set_id, str) or not set_id.strip():
                issues.append(f'{card_label}: set.id must be a non-empty string')
            if not isinstance(set_name, str) or not set_name.strip():
                issues.append(f'{card_label}: set.name must be a non-empty string')
        if rarity is not None and not isinstance(rarity, str):
            issues.append(f'{card_label}: rarity must be a string or null')

    return issues
