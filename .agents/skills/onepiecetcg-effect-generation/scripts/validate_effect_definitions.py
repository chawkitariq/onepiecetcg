#!/usr/bin/env python3
"""Validate project effect-definition files without relying on backend source scripts."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from effect_skill_lib import (
    detect_repo_root,
    load_parsed_editions,
    load_parsed_special_handlers,
    resolve_default_definitions_dir,
    resolve_default_special_dir,
    validate_sources,
)


def build_parser() -> argparse.ArgumentParser:
    """Build the CLI argument parser."""

    parser = argparse.ArgumentParser(
        description="Validate One Piece TCG effect definitions and special handlers.",
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        help="Repository root. Defaults to the current git root.",
    )
    parser.add_argument(
        "--definitions-dir",
        type=Path,
        help="Definitions directory. Defaults to packages/effect-engine/src/definitions.",
    )
    parser.add_argument(
        "--special-dir",
        type=Path,
        help="Special-handler search root. Defaults to the definitions dir and scans <FAMILY>/special/ beneath it.",
    )
    return parser


def main() -> int:
    """Run the validator CLI."""

    parser = build_parser()
    args = parser.parse_args()

    repo_root = args.repo_root.resolve() if args.repo_root else detect_repo_root()
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

    editions = load_parsed_editions(definitions_dir)
    special_handlers = load_parsed_special_handlers(special_dir)
    report = validate_sources(editions, special_handlers)

    if not report.valid:
        sys.stderr.write(
            f"Effect validation failed with {len(report.issues)} issue(s):\n"
        )
        for issue in report.issues:
            sys.stderr.write(f"- [{issue.code}] {issue.message}\n")
        return 1

    card_count = sum(len(edition.cards) for edition in editions)
    sys.stdout.write(
        f"Validated {card_count} card definition(s) across {len(editions)} edition file(s).\n"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
