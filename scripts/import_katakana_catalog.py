"""Convierte el Excel del catálogo de Karaoke Katakana en backend/data/songs.json.

Uso: python scripts/import_katakana_catalog.py ruta/catalogo-canciones-katakana.xlsx
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from katakana.catalog import parse_catalog_workbook, song_document  # noqa: E402

OUT = Path(__file__).resolve().parents[1] / "backend" / "data" / "songs.json"


def main(path: str) -> None:
    rows = parse_catalog_workbook(Path(path).read_bytes())
    seen = set()
    songs = []
    for row in rows:
        doc = song_document(row)
        if not doc or doc["sourceId"] in seen:
            continue
        seen.add(doc["sourceId"])
        songs.append(doc)
    songs.sort(key=lambda s: s["sourceId"])
    OUT.write_text(json.dumps(songs, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(songs)} canciones -> {OUT}")


if __name__ == "__main__":
    main(sys.argv[1])
