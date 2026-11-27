"""Build the visual archive galleries with Python 3 (standard library only)."""
import argparse
import html
import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = ["themes","design-systems","components","layouts","motion","typography","assets","inspiration"]
START = "<!-- gallery:start -->"
END = "<!-- gallery:end -->"
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")


def collect(category):
    base = ROOT / "collections" / category
    entries = []
    for item in sorted(base.iterdir()):
        if not item.is_dir():
            continue
        if not SLUG.fullmatch(item.name) or item.is_symlink():
            raise ValueError(f"{item}: invalid directory name")
        meta = json.loads((item / "metadata.json").read_text(encoding="utf-8"))
        for key in ("title", "description", "source", "license", "usage", "preview"):
            if not isinstance(meta.get(key), str) or not meta[key].strip():
                raise ValueError(f"{item}: missing {key}")
        if meta["usage"] not in ("reference", "reusable"):
            raise ValueError(f"{item}: invalid usage")
        if meta["usage"] == "reusable" and meta["license"].casefold() in ("inconnue", "unknown", "n/a"):
            raise ValueError(f"{item}: reusable resource needs a known license")
        tags = meta.get("tags")
        if not isinstance(tags, list) or not all(isinstance(t, str) and t.strip() for t in tags):
            raise ValueError(f"{item}: invalid tags")
        preview = Path(meta["preview"])
        if preview.name != meta["preview"] or preview.suffix.lower() not in (".webp", ".png", ".jpg", ".jpeg", ".gif", ".svg"):
            raise ValueError(f"{item}: invalid preview name or format")
        for path in (item / "README.md", item / preview):
            if not path.is_file() or path.is_symlink() or path.stat().st_size == 0:
                raise ValueError(f"{item}: missing or empty {path.name}")
        entries.append((category, item.name, meta))
    return entries


def gallery(entries, root=False):
    if not entries:
        return "*La collection prend forme. Les premières ressources apparaîtront ici.*" if root else "*Aucune ressource pour le moment.*"
    rows = ["<table>"]
    for i in range(0, len(entries), 2):
        rows.append("<tr>")
        for category, slug, meta in entries[i:i+2]:
            path = f"collections/{category}/{slug}/" if root else f"{slug}/"
            image = path + quote(meta["preview"])
            title = html.escape(meta["title"])
            desc = html.escape(meta["description"])
            tags = html.escape(" · ".join(meta["tags"]))
            usage = "Réutilisable" if meta["usage"] == "reusable" else "Référence"
            rows.append(f'<td width="50%" valign="top"><a href="{path}README.md"><img src="{image}" alt="Aperçu : {title}" width="100%"><br><strong>{title}</strong></a><br>{desc}<br><sub>{usage} · {tags}</sub></td>')
        if len(entries[i:i+2]) == 1:
            rows.append('<td width="50%"></td>')
        rows.append("</tr>")
    return "\n".join(rows + ["</table>"])


def replace_gallery(path, content):
    old = path.read_text(encoding="utf-8")
    if old.count(START) != 1 or old.count(END) != 1 or old.index(START) > old.index(END):
        raise ValueError(f"{path}: invalid gallery markers")
    before, remainder = old.split(START)
    _, after = remainder.split(END)
    return old, before + START + "\n" + content + "\n" + END + after


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Validate without changing files")
    args = parser.parse_args()
    try:
        by_category = {category: collect(category) for category in CATEGORIES}
        all_entries = [entry for entries in by_category.values() for entry in entries]
        pages = {ROOT / "README.md": gallery(all_entries, root=True)}
        pages.update({ROOT / "collections" / category / "README.md": gallery(entries) for category, entries in by_category.items()})
        changes = [(path, new) for path, content in pages.items() for old, new in [replace_gallery(path, content)] if old != new]
        if args.check and changes:
            raise ValueError("Gallery out of date: " + ", ".join(str(p.relative_to(ROOT)) for p, _ in changes))
        for path, new in changes:
            path.write_text(new, encoding="utf-8")
        print(f"{len(all_entries)} resource(s), {len(changes)} gallery update(s).")
        return 0
    except (OSError, ValueError, TypeError) as error:
        print(f"Catalog error: {error}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
