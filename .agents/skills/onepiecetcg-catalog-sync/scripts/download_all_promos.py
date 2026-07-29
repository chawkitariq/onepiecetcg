#!/usr/bin/env python3
"""Download ALL promo cards from /allPromos/ without dedup."""

from __future__ import annotations

import json
import urllib.request
from pathlib import Path

from catalog_skill_lib import (
    normalize_card,
    detect_repo_root,
)

PROMO_URL = "https://optcgapi.com/api/allPromos/"


def main() -> int:
    repo_root = detect_repo_root()
    output_dir = repo_root / "packages/cards/catalog/PROMOS"
    output_dir.mkdir(parents=True, exist_ok=True)

    with urllib.request.urlopen(PROMO_URL) as resp:
        raw = json.loads(resp.read().decode("utf-8"))

    raw_cards = raw if isinstance(raw, list) else raw.get("cards", raw.get("results", raw.get("data", [])))

    cards = []
    for c in raw_cards:
        n = normalize_card(c)
        if n is not None:
            cards.append(n)

    snapshot = {
        "editionId": "PROMOS",
        "name": "One Piece Promotion Cards",
        "cards": [
            {
                "id": c.id,
                "number": c.number,
                "name": c.name,
                "type": c.type,
                "colors": c.colors,
                "cost": c.cost,
                "power": c.power,
                "life": c.life,
                "counter": c.counter,
                "attributes": c.attributes,
                "families": c.families,
                "text": c.text,
                "trigger": c.trigger,
                "imageUrl": c.imageUrl,
                "set": c.set,
                "rarity": c.rarity,
            }
            for c in cards
        ],
    }

    path = output_dir / "PROMOS.json"
    path.write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Wrote {len(cards)} promo cards to {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
