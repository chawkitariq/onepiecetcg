#!/usr/bin/env python3
"""Download OPTCG cards and write one normalized JSON file per edition."""

from __future__ import annotations

from pathlib import Path

from catalog_skill_lib import (
    SPECIAL_EDITION_IDS,
    build_download_parser,
    detect_repo_root,
    fetch_don_cards,
    fetch_live_catalog,
    fetch_live_edition_metadata,
    fetch_promo_cards,
    infer_edition_names,
    get_card_edition_id,
    load_cards_from_snapshot,
    parse_edition_filter,
    write_edition_snapshots,
    write_special_snapshot,
)


def main() -> int:
    """Run the catalog download workflow."""

    parser = build_download_parser()
    args = parser.parse_args()

    repo_root = detect_repo_root()
    output_dir = (
        args.output_dir.resolve()
        if args.output_dir
        else repo_root / "packages/cards/catalog"
    )
    requested_editions = parse_edition_filter(args.edition)

    if requested_editions is not None:
        is_don_requested = "DON" in requested_editions
        is_promo_requested = "PROMOS" in requested_editions
        standard_editions = requested_editions - SPECIAL_EDITION_IDS
    else:
        is_don_requested = True
        is_promo_requested = True
        standard_editions = None

    if args.source_file is not None:
        cards = load_cards_from_snapshot(args.source_file.resolve())
        edition_names = infer_edition_names(cards)
    else:
        cards = fetch_live_catalog()
        edition_names = fetch_live_edition_metadata()

    if standard_editions is not None:
        cards = [
            card
            for card in cards
            if (card_edition_id := get_card_edition_id(card.id)) in standard_editions
        ]
        edition_names = {
            edition_id: edition_names[edition_id]
            for edition_id in standard_editions
            if edition_id in edition_names
        }

    written_paths = write_edition_snapshots(cards, output_dir, edition_names)
    print(f"Wrote {len(written_paths)} edition snapshot(s) to {output_dir}")
    for path in written_paths:
        print(f"- {path}")

    if args.source_file is None:
        if is_don_requested:
            don_cards = fetch_don_cards()
            don_path = write_special_snapshot(
                don_cards, "DON", "DON!! Cards", output_dir
            )
            print(f"- {don_path} (DON!! cards)")
            written_paths.append(don_path)

        if is_promo_requested:
            promo_cards = fetch_promo_cards()
            promo_path = write_special_snapshot(
                promo_cards, "PROMOS", "One Piece Promotion Cards", output_dir
            )
            print(f"- {promo_path} (promo cards)")
            written_paths.append(promo_path)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
