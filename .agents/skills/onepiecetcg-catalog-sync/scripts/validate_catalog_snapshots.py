#!/usr/bin/env python3
"""Validate downloaded OPTCG catalog snapshots."""

from __future__ import annotations

import sys

from catalog_skill_lib import (
    build_validation_parser,
    detect_repo_root,
    normalize_edition_id,
    parse_edition_filter,
    validate_snapshot_document,
)


def main() -> int:
    """Run the catalog snapshot validator."""

    parser = build_validation_parser()
    args = parser.parse_args()

    repo_root = detect_repo_root()
    input_dir = (
        args.input_dir.resolve()
        if args.input_dir
        else repo_root / 'packages/cards/catalog'
    )
    requested_editions = parse_edition_filter(args.edition)

    if args.source_file is not None:
        candidate_files = [args.source_file.resolve()]
    else:
        candidate_files = sorted(input_dir.rglob('*.json'))

    if requested_editions is not None:
        candidate_files = [
            path
            for path in candidate_files
            if normalize_edition_id(path.stem) in requested_editions
        ]

    if not candidate_files:
        print(f'No catalog snapshot files found in {input_dir}', file=sys.stderr)
        return 1

    issues: list[str] = []
    for path in candidate_files:
        issues.extend(validate_snapshot_document(path))

    if issues:
        for issue in issues:
            print(issue, file=sys.stderr)
        return 1

    print(f'Validated {len(candidate_files)} catalog snapshot file(s)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
