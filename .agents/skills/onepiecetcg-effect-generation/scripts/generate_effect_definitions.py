#!/usr/bin/env python3
"""Generate project effect-definition files without relying on backend source scripts."""

from __future__ import annotations

import argparse
from pathlib import Path

from effect_skill_lib import (
    CatalogCard,
    ParsedCardBlock,
    detect_repo_root,
    fetch_live_catalog,
    get_card_edition_id,
    load_cards_from_snapshot,
    load_parsed_editions,
    load_parsed_special_handlers,
    normalize_edition_id,
    render_definitions_index,
    render_edition_file,
    render_generated_card_block,
    render_special_index,
    resolve_default_definitions_dir,
    resolve_default_special_dir,
    should_generate_definition,
    split_csv_ids,
    to_effect_file_name,
    validate_sources,
)


def build_parser() -> argparse.ArgumentParser:
    """Build the CLI argument parser."""

    parser = argparse.ArgumentParser(
        description="Generate deterministic One Piece TCG effect-definition skeletons from a catalog snapshot or live catalog.",
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        help="Repository root. Defaults to the current git root.",
    )
    parser.add_argument(
        "--edition",
        "-e",
        required=True,
        help="Comma-separated edition ids to generate, for example OP01 or OP01,OP02.",
    )
    parser.add_argument(
        "--source-file",
        type=Path,
        help="Read catalog metadata from a local JSON snapshot.",
    )
    parser.add_argument(
        "--definitions-dir",
        type=Path,
        help="Definitions directory to read authored files from. Defaults to packages/api/src/card-effect/definitions.",
    )
    parser.add_argument(
        "--special-dir",
        type=Path,
        help="Special-handler directory. Defaults to <definitions-dir>/special.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Directory where generated *.effects.ts files and index.ts should be written. Defaults to the definitions dir.",
    )
    return parser


def load_catalog_cards(source_file: Path | None) -> list[CatalogCard]:
    """Load cards from the requested source."""

    if source_file is not None:
        return load_cards_from_snapshot(source_file.resolve())
    return fetch_live_catalog()


def block_map_for_editions(editions) -> dict[str, dict[str, ParsedCardBlock]]:
    """Build a nested map of existing authored card blocks."""

    by_edition: dict[str, dict[str, ParsedCardBlock]] = {}
    for edition in editions:
        by_edition[edition.edition_id] = {card.card_id: card for card in edition.cards}
    return by_edition


def build_catalog_index(cards: list[CatalogCard]) -> dict[str, CatalogCard]:
    """Index normalized cards by id."""

    return {card.card_id: card for card in cards}


def collect_target_cards(
    catalog_cards: list[CatalogCard],
    requested_edition_ids: list[str],
    existing_blocks: dict[str, dict[str, ParsedCardBlock]],
) -> dict[str, list[str]]:
    """Build the ordered card ids per target edition."""

    ordered: dict[str, list[str]] = {edition_id: [] for edition_id in requested_edition_ids}

    for card in catalog_cards:
        edition_id = get_card_edition_id(card.card_id)
        if edition_id not in ordered:
            continue
        if not should_generate_definition(card):
            continue
        ordered[edition_id].append(card.card_id)

    for edition_id in requested_edition_ids:
        seen = set(ordered[edition_id])
        for card_id in existing_blocks.get(edition_id, {}):
            if card_id not in seen:
                ordered[edition_id].append(card_id)
                seen.add(card_id)

    return ordered


def merge_generated_blocks(
    ordered_card_ids: list[str],
    catalog_by_id: dict[str, CatalogCard],
    existing_blocks: dict[str, ParsedCardBlock],
    generated_drafts: dict[str, list[dict] | None],
) -> list[str]:
    """Merge preserved authored blocks with generated blocks."""

    merged_blocks: list[str] = []
    for card_id in ordered_card_ids:
        existing = existing_blocks.get(card_id)
        if existing is not None:
            merged_blocks.append(existing.raw_block)
            continue

        merged_blocks.append(
            render_generated_card_block(
                card_id=card_id,
                generated_effects=generated_drafts.get(card_id),
                catalog_card=catalog_by_id.get(card_id),
            )
        )
    return merged_blocks


def collect_missing_cards(
    ordered_card_ids_by_edition: dict[str, list[str]],
    catalog_by_id: dict[str, CatalogCard],
    existing_blocks: dict[str, dict[str, ParsedCardBlock]],
) -> list[CatalogCard]:
    """Collect uncovered cards that need generated draft effects."""

    missing_cards: list[CatalogCard] = []
    for edition_id, ordered_card_ids in ordered_card_ids_by_edition.items():
        authored_card_ids = set(existing_blocks.get(edition_id, {}))
        for card_id in ordered_card_ids:
            if card_id in authored_card_ids:
                continue
            card = catalog_by_id.get(card_id)
            if card is not None:
                missing_cards.append(card)
    return missing_cards


def build_placeholder_drafts(
    missing_cards: list[CatalogCard],
) -> dict[str, list[dict] | None]:
    """Return deterministic placeholder drafts for uncovered cards."""

    return {card.card_id: None for card in missing_cards}


def main() -> int:
    """Run the generator CLI."""

    parser = build_parser()
    args = parser.parse_args()

    repo_root = args.repo_root.resolve() if args.repo_root else detect_repo_root()
    requested_edition_ids = split_csv_ids(args.edition)
    definitions_dir = (
        args.definitions_dir.resolve()
        if args.definitions_dir
        else resolve_default_definitions_dir(repo_root)
    )
    special_dir = (
        args.special_dir.resolve()
        if args.special_dir
        else resolve_default_special_dir(repo_root)
    )
    output_dir = args.output_dir.resolve() if args.output_dir else definitions_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    catalog_cards = load_catalog_cards(args.source_file)
    catalog_by_id = build_catalog_index(catalog_cards)

    parsed_editions = load_parsed_editions(definitions_dir)
    existing_blocks = block_map_for_editions(parsed_editions)
    ordered_card_ids_by_edition = collect_target_cards(
        catalog_cards,
        requested_edition_ids,
        existing_blocks,
    )
    missing_cards = collect_missing_cards(
        ordered_card_ids_by_edition,
        catalog_by_id,
        existing_blocks,
    )

    generated_drafts = build_placeholder_drafts(missing_cards)

    written_paths: list[Path] = []
    for edition_id in requested_edition_ids:
        merged_blocks = merge_generated_blocks(
            ordered_card_ids=ordered_card_ids_by_edition[edition_id],
            catalog_by_id=catalog_by_id,
            existing_blocks=existing_blocks.get(edition_id, {}),
            generated_drafts=generated_drafts,
        )
        edition_path = output_dir / to_effect_file_name(edition_id)
        edition_path.write_text(
            render_edition_file(edition_id, merged_blocks),
            encoding="utf-8",
        )
        written_paths.append(edition_path)

    final_edition_ids = sorted(
        normalize_edition_id(path.stem.split(".")[0])
        for path in output_dir.glob("*.effects.ts")
        if path.name != "index.ts"
    )
    (output_dir / "index.ts").write_text(
        render_definitions_index(final_edition_ids),
        encoding="utf-8",
    )

    special_handlers = load_parsed_special_handlers(special_dir)
    special_index_path = special_dir / "index.ts"
    special_index_path.write_text(
        render_special_index(special_handlers),
        encoding="utf-8",
    )

    validation_report = validate_sources(
        load_parsed_editions(output_dir),
        special_handlers,
    )
    if not validation_report.valid:
        issues = "\n".join(
            f"- [{issue.code}] {issue.message}" for issue in validation_report.issues
        )
        raise RuntimeError(
            "Generated effect definitions failed validation:\n" + issues
        )

    print(
        f"Generated {len(written_paths)} edition file(s) in {output_dir} "
        f"and refreshed {special_index_path}."
    )
    for path in written_paths:
        print(f"- {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
