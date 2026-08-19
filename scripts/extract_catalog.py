#!/usr/bin/env python3
"""Extract KaraFun artist/title pairs from the supplied layout PDF."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
import uuid
from pathlib import Path

import fitz


COLUMN_STARTS = (31.2, 215.4, 399.7)
CONTENT_TOP = 62
CONTENT_BOTTOM = 812


def normalize(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value.casefold())
    return "".join(char for char in decomposed if not unicodedata.combining(char))


def content_lines(page: fitz.Page) -> list[dict]:
    lines: list[dict] = []
    for block in page.get_text("dict").get("blocks", []):
        for line in block.get("lines", []):
            spans = [span for span in line.get("spans", []) if span["text"].strip()]
            if not spans:
                continue
            first = spans[0]
            x0, y0, _, _ = first["bbox"]
            if not CONTENT_TOP <= y0 <= CONTENT_BOTTOM:
                continue
            if not 6.8 <= first["size"] <= 7.2:
                continue
            column = min(range(3), key=lambda idx: abs(x0 - COLUMN_STARTS[idx]))
            if abs(x0 - COLUMN_STARTS[column]) > 2:
                continue
            text = " ".join(span["text"].strip() for span in spans).strip()
            text = re.sub(r"\s+", " ", text)
            is_artist = "Bold" in first["font"] or bool(first["flags"] & 16)
            lines.append({"column": column, "y": y0, "text": text, "artist": is_artist})
    return sorted(lines, key=lambda item: (item["column"], item["y"]))


def extract(pdf_path: Path) -> list[dict]:
    document = fitz.open(pdf_path)
    songs: list[dict] = []
    current_artist: str | None = None

    for page_index in range(1, document.page_count):
        for line in content_lines(document[page_index]):
            if line["artist"]:
                current_artist = line["text"]
                continue
            if not current_artist:
                continue
            artist = current_artist.strip()
            title = line["text"].strip()
            songs.append(
                {
                    "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"okume:{page_index}:{len(songs)}:{artist}:{title}")),
                    "artist": artist,
                    "title": title,
                    "search": normalize(f"{artist} {title}"),
                }
            )
    return songs


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    songs = extract(args.pdf)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(songs, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({"songs": len(songs), "output": str(args.output)}, ensure_ascii=False))


if __name__ == "__main__":
    main()