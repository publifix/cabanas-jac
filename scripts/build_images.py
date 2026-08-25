#!/usr/bin/env python3
"""One-off build script: generates responsive WEBP variants + favicons + OG image
for the Cabanas JAC site from the source photos already in the repo root.
Not part of the site's runtime -- run manually when new source photos are added.
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "img")
os.makedirs(IMG_DIR, exist_ok=True)

# slug -> source filename (relative to repo root)
SOURCES = {
    "hero-puente":            "FB_IMG_1787595640112.jpg_18_11zon.webp",
    "sobre-fachada":          "FB_IMG_1787595580157.jpg_7_11zon.webp",
    "alojamiento-habitacion": "FB_IMG_1787595711180.jpg_25_11zon.webp",
    "alojamiento-cabanas":    "FB_IMG_1787595501848.jpg_1_11zon.webp",
    "restaurante-noche":      "FB_IMG_1787595648897.jpg_20_11zon.webp",
    "restaurante-detalle":    "FB_IMG_1787595605345.jpg_11_11zon.webp",
    "restaurante-letrero":    "FB_IMG_1787595601954.jpg_10_11zon.webp",
    "ubicacion-cascada":      "FB_IMG_1787595586547.jpg_8_11zon.webp",
    "galeria-bambu-canal":    "FB_IMG_1787595625893.jpg_15_11zon.webp",
    "galeria-poza":           "FB_IMG_1787595701429.jpg_24_11zon.webp",
    "galeria-canon":          "FB_IMG_1787595685669.jpg_23_11zon.webp",
    "galeria-recepcion":      "FB_IMG_1787595679493.jpg_22_11zon.webp",
    "galeria-arco":           "FB_IMG_1787595630260.jpg_16_11zon.webp",
    "galeria-puerta-cabana":  "FB_IMG_1787595504466.jpg_2_11zon.webp",
    "galeria-terraza-cabana": "FB_IMG_1787595607505.jpg_12_11zon.webp",
    "galeria-balcon":         "FB_IMG_1787595506877.jpg_3_11zon.webp",
    "galeria-jardin":         "FB_IMG_1787595592722.jpg_9_11zon.webp",
    "galeria-pasillo-noche":  "FB_IMG_1787595616628.jpg_13_11zon.webp",
    "galeria-puente-entrada": "FB_IMG_1787595637192.jpg_17_11zon.webp",
}

WIDTHS = [480, 900, 1600]
QUALITY = 78

for slug, filename in SOURCES.items():
    src_path = os.path.join(ROOT, filename)
    im = Image.open(src_path).convert("RGB")
    w0, h0 = im.size
    made_default = False
    for w in WIDTHS:
        if w > w0:
            continue
        h = round(h0 * (w / w0))
        resized = im.resize((w, h), Image.LANCZOS)
        out_path = os.path.join(IMG_DIR, f"{slug}-{w}.webp")
        resized.save(out_path, "WEBP", quality=QUALITY, method=6)
        if w == 900 or (w == WIDTHS[-1] and not made_default):
            default_path = os.path.join(IMG_DIR, f"{slug}.webp")
            resized.save(default_path, "WEBP", quality=QUALITY, method=6)
            made_default = True
    print(f"{slug}: {w0}x{h0} -> variants written")

# Logo: header (small, retina-ready, transparent bg) + favicon/touch-icon/manifest sources (opaque)
logo = Image.open(os.path.join(ROOT, "logo-jac-cabanas.webp")).convert("RGB")
logo_transparent = logo.convert("RGBA")
ImageDraw.floodfill(logo_transparent, (0, 0), (255, 255, 255, 0), thresh=40)
for w in (96, 192, 320):
    resized = logo_transparent.resize((w, w), Image.LANCZOS)
    resized.save(os.path.join(IMG_DIR, f"logo-{w}.webp"), "WEBP", quality=90, method=6)

for size, name in ((32, "favicon-32.png"), (16, "favicon-16.png"),
                    (180, "apple-touch-icon.png"), (192, "icon-192.png"),
                    (512, "icon-512.png")):
    resized = logo.resize((size, size), Image.LANCZOS)
    resized.save(os.path.join(ROOT, name), "PNG")

# OG / Twitter share image (1200x630) cropped from the hero photo
hero = Image.open(os.path.join(ROOT, SOURCES["hero-puente"])).convert("RGB")
target_ratio = 1200 / 630
w0, h0 = hero.size
cur_ratio = w0 / h0
if cur_ratio > target_ratio:
    new_w = round(h0 * target_ratio)
    left = (w0 - new_w) // 2
    hero_cropped = hero.crop((left, 0, left + new_w, h0))
else:
    new_h = round(w0 / target_ratio)
    top = (h0 - new_h) // 2
    hero_cropped = hero.crop((0, top, w0, top + new_h))
hero_cropped.resize((1200, 630), Image.LANCZOS).save(
    os.path.join(ROOT, "og-image.jpg"), "JPEG", quality=85
)

print("Done.")
