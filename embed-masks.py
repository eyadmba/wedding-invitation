#!/usr/bin/env python3
"""
Re-embeds mask-top.png and mask-bottom.png into index.html.

WHY this exists: index.html doesn't load these mask files directly. Opening
the page via file:// triggers a browser restriction where `mask-image`
(unlike `background-image`) refuses to load external files, treating each
local file as its own opaque origin. The fix was to base64-encode the mask
PNGs and paste them straight into the CSS as `data:image/png;base64,...`
strings -- which means the mask-top.png / mask-bottom.png files on disk are
only *source* copies. Editing them does nothing to the live page on their
own; this script re-encodes them and re-pastes the result into index.html.

USAGE
-----
Edit mask-top.png / mask-bottom.png however you like (any image editor,
your own script, etc.), then run:

    python embed-masks.py

It rewrites index.html in place. Reload the page in your browser afterward
(no server restart needed, it's just a static file).

Both masks must be the same pixel size as the envelope photo they're
masking (envelope-no-wax-seal.png) -- that's what keeps the crease lines
aligned with the actual photo underneath.
"""

import base64
import re
import sys

MASK_TOP_PATH = "mask-top.png"
MASK_BOTTOM_PATH = "mask-bottom.png"
HTML_PATH = "index.html"


def to_data_uri(path):
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f"data:image/png;base64,{b64}"


def replace_mask(html, classname, new_uri):
    # matches the -webkit-mask-image/mask-image pair inside the
    # #envelope .envelope-top{...} or #envelope .envelope-bottom{...} rule,
    # regardless of whatever else (z-index, filter, comments) sits above it
    pattern = re.compile(
        r"(#envelope \." + classname + r"\{\s*\n"
        r"(?:\s*z-index:[^\n]*\n)?"
        r"(?:\s*/\*.*?\*/\s*\n)*"
        r"(?:\s*filter:[^\n]*\n)?"
        r"\s*-webkit-mask-image: url\(')[^']*('\)\s*;\s*\n"
        r"\s*mask-image: url\(')[^']*('\))",
        re.S,
    )
    new_html, n = pattern.subn(rf"\1{new_uri}\2{new_uri}\3", html)
    if n != 1:
        print(f"WARNING: expected exactly 1 replacement for .{classname}, made {n}. "
              f"index.html's structure may have changed -- check the result carefully.")
    return new_html


def main():
    with open(HTML_PATH, encoding="utf-8") as f:
        html = f.read()

    top_uri = to_data_uri(MASK_TOP_PATH)
    bottom_uri = to_data_uri(MASK_BOTTOM_PATH)

    html = replace_mask(html, "envelope-top", top_uri)
    html = replace_mask(html, "envelope-bottom", bottom_uri)

    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Done -- {MASK_TOP_PATH} and {MASK_BOTTOM_PATH} re-embedded into {HTML_PATH}.")
    print("Reload the page in your browser to see the change.")


if __name__ == "__main__":
    sys.exit(main())
