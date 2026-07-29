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


CATALOG_ENDPOINTS = (
    ("sets", "https://optcgapi.com/api/allSetCards/"),
    ("decks", "https://optcgapi.com/api/allSTCards/"),
    ("promos", "https://optcgapi.com/api/allPromoCards/"),
    ("don", "https://optcgapi.com/api/allDonCards/"),
)


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

    return CatalogCard(
        id=card_id,
        number=card_id,
        name=str(name).strip(),
        type=str(first_value(payload, "card_type", "cardType", "type") or "").strip(),
        colors=to_string_list(
            first_value(payload, "card_color", "cardColor", "colors", "color")
        ),
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
            by_id[card.id] = card

    if not by_id:
        raise RuntimeError("Unable to fetch any OPTCG catalog cards.\n" + "\n".join(errors))

    return list(by_id.values())


def load_cards_from_snapshot(path: Path) -> list[CatalogCard]:
    """Load cards from a local JSON snapshot."""

    payload = json.loads(path.read_text(encoding="utf-8"))
    return extract_cards(payload)


def group_cards_by_edition(cards: list[CatalogCard]) -> dict[str, list[CatalogCard]]:
    """Group cards by edition prefix."""

    grouped: dict[str, list[CatalogCard]] = defaultdict(list)
    for card in cards:
        if "-" not in card.id:
            continue
        edition_id = normalize_card_id(card.id.split("-", 1)[0])
        grouped[edition_id].append(card)
    return dict(grouped)


def write_edition_snapshots(cards: list[CatalogCard], output_dir: Path) -> list[Path]:
    """Write one snapshot file per edition and return the written paths."""

    output_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []

    for edition_id, edition_cards in sorted(group_cards_by_edition(cards).items()):
        edition_cards = sorted(edition_cards, key=lambda card: card.id)
        path = output_dir / f"{edition_id}.json"
        path.write_text(
            json.dumps(
                {
                    "editionId": edition_id,
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


def build_parser() -> argparse.ArgumentParser:
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
    return parser
