"""Рисует лаунчер-иконки ЛАД: тёмный квадрат, янтарное кольцо, три тона аккорда.

Запуск: python tools/make-icons.py
Кладёт PNG в android/app/src/main/res/mipmap-*/.
"""
import math
import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, "android", "app", "src", "main", "res")

BG = (11, 11, 13, 255)
AMBER = (240, 178, 62, 255)
AMBER_SOFT = (240, 178, 62, 150)

S = 1024  # рисуем крупно, потом уменьшаем


def draw_icon(circle_mask: bool) -> Image.Image:
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if circle_mask:
        d.ellipse((0, 0, S - 1, S - 1), fill=BG)
    else:
        d.rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 0.22), fill=BG)

    cx = cy = S / 2
    ring_r = S * 0.30
    dot_r = S * 0.058
    stroke = int(S * 0.026)

    angles = [-90, 30, 150]
    pts = [
        (cx + ring_r * math.cos(math.radians(a)), cy + ring_r * math.sin(math.radians(a)))
        for a in angles
    ]

    # кольцо
    d.ellipse(
        (cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r),
        outline=(240, 178, 62, 90),
        width=stroke,
    )

    # аккорд: треугольник между тонами
    for i in range(3):
        d.line([pts[i], pts[(i + 1) % 3]], fill=AMBER_SOFT, width=int(S * 0.018))

    # сами тоны
    for (x, y) in pts:
        d.ellipse((x - dot_r, y - dot_r, x + dot_r, y + dot_r), fill=AMBER)

    return img


def save(img: Image.Image, path: str, size: int) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.resize((size, size), Image.LANCZOS).save(path, "PNG")


def main() -> None:
    square = draw_icon(False)
    round_ = draw_icon(True)

    densities = {
        "mdpi": 48,
        "hdpi": 72,
        "xhdpi": 96,
        "xxhdpi": 144,
        "xxxhdpi": 192,
    }

    for name, px in densities.items():
        base = os.path.join(RES, f"mipmap-{name}")
        save(square, os.path.join(base, "ic_launcher.png"), px)
        save(round_, os.path.join(base, "ic_launcher_round.png"), px)
        print("mipmap-" + name, px)

    # Play Store / витрина
    store = os.path.join(ROOT, "docs", "icon-512.png")
    os.makedirs(os.path.dirname(store), exist_ok=True)
    save(square, store, 512)
    print("docs/icon-512.png")


if __name__ == "__main__":
    main()
