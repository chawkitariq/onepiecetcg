#!/usr/bin/env python3
"""Download OPTCG cards and write one normalized JSON file per edition."""

from __future__ import annotations

from pathlib import Path

from catalog_skill_lib import (
    build_parser,
    detect_repo_root,
    fetch_live_catalog,
    load_cards_from_snapshot,
    write_edition_snapshots,
)


def main() -> int:
    """Run the catalog download workflow."""

    parser = build_parser()
    args = parser.parse_args()

    repo_root = detect_repo_root()
    output_dir = (
        args.output_dir.resolve()
        if args.output_dir
        else repo_root / "packages/cards/catalog"
    )

    if args.source_file is not None:
        cards = load_cards_from_snapshot(args.source_file.resolve())
    else:
        cards = fetch_live_catalog()

    written_paths = write_edition_snapshots(cards, output_dir)
    print(f"Wrote {len(written_paths)} edition snapshot(s) to {output_dir}")
    for path in written_paths:
        print(f"- {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
