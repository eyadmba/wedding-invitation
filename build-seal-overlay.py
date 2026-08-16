#!/usr/bin/env python3
"""
Builds seal-overlay.png: takes a transparent seal sprite (any size/shape)
and bakes it onto a full transparent canvas matching the envelope photo's
exact dimensions, at a chosen position and size.

WHY this exists instead of just referencing the seal sprite directly in the
HTML: every envelope layer uses `background-size: cover`, which scales an
image based on ITS OWN aspect ratio vs. the screen. The envelope photo and
a square seal sprite have different aspect ratios, so if the seal were
placed independently, it would drift out of alignment with the envelope's
crease on screens with a different aspect ratio than the one you tested on.
Baking the seal onto a canvas that's the *same size* as the envelope photo
means both layers scale identically under `cover`, on any screen, for free.

USAGE
-----
Just edit the settings below and run:

    python build-seal-overlay.py

It will overwrite seal-overlay.png (used by index.html) and also drop a
preview.png next to it -- open that to check the placement without touching
the browser at all.

You do NOT need to touch masks or re-run anything when you swap the
envelope background image itself (envelope-no-wax-seal.png) -- that file is
referenced directly by filename in index.html, so just overwrite it with
your new design/color/texture and reload the page. This script is only
for the seal sprite.
"""

from PIL import Image, ImageFilter

# ============================================================
#  SETTINGS -- change these, then just run the script again
# ============================================================

# The seal sprite to place. Must have a transparent background (RGBA).
SEAL_SPRITE_PATH = "eb-wax-seal-transparent.png"

# The envelope background photo -- only used to read its exact pixel size,
# so the seal overlay canvas always matches it. Swap this file for a new
# envelope design any time; this script will pick up its new dimensions
# automatically.
ENVELOPE_REFERENCE_PATH = "envelope-no-wax-seal.png"

# Where the seal's CENTER should land, in the envelope photo's own pixel
# coordinates (top-left is 0,0). Increase Y to move it down, increase X to
# move it right.
TARGET_CENTER_X = 772
TARGET_CENTER_Y = 600

# How big the seal should render, in the same pixel coordinates -- this is
# the size of the seal's actual wax blob, not the sprite file's full canvas
# (which likely has transparent padding around it). Roughly matches the
# real seal's visual size in the photo.
TARGET_WIDTH = 190
TARGET_HEIGHT = 195

# Output files
OUTPUT_PATH = "seal-overlay.png"
PREVIEW_PATH = "preview.png"

# ============================================================
#  Script -- no need to edit below this line
# ============================================================


def opaque_content_bbox(im, alpha_threshold=10):
    """Finds the bounding box of the non-transparent content in an RGBA
    image, so we scale based on the seal's actual drawn size, ignoring any
    transparent padding baked into the sprite file."""
    alpha = im.getchannel("A")
    bbox = alpha.point(lambda a: 255 if a > alpha_threshold else 0).getbbox()
    if bbox is None:
        raise ValueError("Seal sprite appears to be fully transparent -- check the file.")
    return bbox


def main():
    envelope = Image.open(ENVELOPE_REFERENCE_PATH)
    W, H = envelope.size
    print(f"Envelope canvas size: {W}x{H} (from {ENVELOPE_REFERENCE_PATH})")

    seal = Image.open(SEAL_SPRITE_PATH).convert("RGBA")
    x0, y0, x1, y1 = opaque_content_bbox(seal)
    content_w, content_h = x1 - x0, y1 - y0
    print(f"Seal sprite: {seal.size}, opaque content bbox: {(x0, y0, x1, y1)} -> {content_w}x{content_h}")

    # scale so the seal's real content lands at TARGET_WIDTH x TARGET_HEIGHT
    scale = ((TARGET_WIDTH / content_w) + (TARGET_HEIGHT / content_h)) / 2
    new_size = (round(seal.width * scale), round(seal.height * scale))
    seal_scaled = seal.resize(new_size, Image.LANCZOS)
    print(f"Scale factor: {scale:.4f} -> sprite resized to {new_size}")

    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    paste_x = round(TARGET_CENTER_X - new_size[0] / 2)
    paste_y = round(TARGET_CENTER_Y - new_size[1] / 2)
    canvas.alpha_composite(seal_scaled, (paste_x, paste_y))
    canvas.save(OUTPUT_PATH)
    print(f"Saved {OUTPUT_PATH} -- seal centered at ({TARGET_CENTER_X}, {TARGET_CENTER_Y}), "
          f"spanning roughly x[{paste_x}-{paste_x+new_size[0]}] y[{paste_y}-{paste_y+new_size[1]}]")

    # preview: composite over the actual envelope so you can eyeball it
    preview = Image.alpha_composite(envelope.convert("RGBA"), canvas).convert("RGB")
    preview.save(PREVIEW_PATH)
    print(f"Saved {PREVIEW_PATH} -- open this to check placement without touching the browser")


if __name__ == "__main__":
    main()
