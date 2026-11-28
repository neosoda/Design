#!/usr/bin/env python3
"""Synchronize V4's standalone demo with editable module sources."""
import argparse
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
MODULES = {"BASE": "base.css", "CORE": "core.css", "MOTION": "motion.css", "COMPONENTS": "components.css", "EXTENSION": "extension.js"}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    file = HERE / "prototype.html"
    old = file.read_text(encoding="utf-8")
    new = old
    for name, source in MODULES.items():
        start, end = f"/* VELORA:{name}:START */", f"/* VELORA:{name}:END */"
        pattern = re.escape(start) + r"[\s\S]*?" + re.escape(end)
        replacement = start + "\n" + (HERE / source).read_text(encoding="utf-8").rstrip() + "\n" + end
        new, count = re.subn(pattern, lambda _: replacement, new)
        if count != 1:
            raise SystemExit(f"Expected one {name} module, found {count}")
    if args.check and old != new:
        raise SystemExit("Standalone prototype is out of sync. Run python sync.py")
    if old != new:
        file.write_text(new, encoding="utf-8")
    print("Velora V4 modules synchronized")
if __name__ == "__main__":
    main()
