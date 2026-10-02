"""Build Poke-Crawl into one self-contained HTML file.

Usage:  python build.py          -> writes dist/index.html
Only the Python standard library is needed (Python 3.8+).

The version shown in the game comes from the VERSION file. A stable build (main) shows it as is, e.g. "0.2.0";
any other build is marked as dev with its commit, e.g. "0.2.0-dev (a1b2c3d)". The channel is taken from the
POKECRAWL_CHANNEL environment variable ("stable" or "dev", set by the deploy workflow), otherwise from the
current git branch (main = stable).

Pokémon and item sprites come from assets/pokesprite (PokéSprite: msikma/pokesprite). A form's "spr" in
data/data.json names its file in pokesprite's pokemon-gen8/regular; an item's id names its file in pokesprite's
items folders. Each sprite is trimmed to the visible pixels, centred on a square canvas with a 1 pixel border,
scaled up 4x (pixel art stays sharp at any size) and embedded as a data URI.
"""
import base64, glob, json, os, struct, subprocess, zlib

ROOT = os.path.dirname(os.path.abspath(__file__))
p = lambda *parts: os.path.join(ROOT, *parts)
read = lambda *parts: open(p(*parts), encoding='utf-8').read()
b64 = lambda path: 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()

# ---------- PNG in/out (standard library only; covers the 8-bit, non-interlaced PNGs pokesprite ships) ----------
def png_read(path):
    """Return (width, height, RGBA bytearray)."""
    raw = open(path, 'rb').read()
    assert raw[:8] == b'\x89PNG\r\n\x1a\n', path
    i, idat, plte, trns = 8, b'', None, b''
    while i < len(raw):
        n, kind = struct.unpack('>I4s', raw[i:i + 8]); body = raw[i + 8:i + 8 + n]; i += 12 + n
        if kind == b'IHDR': w, h, depth, ctype, _, _, interlace = struct.unpack('>IIBBBBB', body)
        elif kind == b'PLTE': plte = body
        elif kind == b'tRNS': trns = body
        elif kind == b'IDAT': idat += body
    if depth != 8 or interlace: raise ValueError(f'{path}: unsupported PNG (bit depth {depth}, interlace {interlace})')
    bpp = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ctype]
    data, stride, rows, prev = zlib.decompress(idat), w * bpp, [], bytearray(w * bpp)
    for y in range(h):
        f, line = data[y * (stride + 1)], bytearray(data[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        for x in range(stride):
            a = line[x - bpp] if x >= bpp else 0; b = prev[x]; c = prev[x - bpp] if x >= bpp else 0
            if f == 1: line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(line); prev = line
    out = bytearray(w * h * 4)
    for y, line in enumerate(rows):
        for x in range(w):
            o = (y * w + x) * 4
            if ctype == 6: out[o:o + 4] = line[x * 4:x * 4 + 4]
            elif ctype == 4: g, al = line[x * 2], line[x * 2 + 1]; out[o:o + 4] = bytes((g, g, g, al))
            elif ctype == 3:
                k = line[x]; out[o:o + 3] = plte[k * 3:k * 3 + 3]; out[o + 3] = trns[k] if k < len(trns) else 255
            elif ctype == 2: out[o:o + 3] = line[x * 3:x * 3 + 3]; out[o + 3] = 255
            else: g = line[x]; out[o:o + 4] = bytes((g, g, g, 255))
    return w, h, out

def png_write(w, h, rgba):
    """RGBA bytes -> PNG bytes."""
    stride = w * 4
    raw = b''.join(b'\x00' + bytes(rgba[y * stride:(y + 1) * stride]) for y in range(h))
    chunk = lambda kind, body: struct.pack('>I', len(body)) + kind + body + struct.pack('>I', zlib.crc32(kind + body))
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')

def game_sprite(path, scale=4):
    """A pokesprite image as the game shows it: trimmed, centred in a square with a 1px border, scaled up."""
    w, h, px = png_read(path)
    seen = [(x, y) for y in range(h) for x in range(w) if px[(y * w + x) * 4 + 3]]
    if not seen: raise ValueError(f'{path} is empty')
    x0, x1 = min(x for x, _ in seen), max(x for x, _ in seen); y0, y1 = min(y for _, y in seen), max(y for _, y in seen)
    cw, ch = x1 - x0 + 1, y1 - y0 + 1
    side = max(cw, ch) + 2; ox, oy = (side - cw) // 2, (side - ch) // 2
    big = side * scale; out = bytearray(big * big * 4)
    for y in range(ch):
        for x in range(cw):
            o = ((y0 + y) * w + x0 + x) * 4
            if not px[o + 3]: continue
            pix = bytes(px[o:o + 4])
            for dy in range(scale):
                row = ((oy + y) * scale + dy) * big
                for dx in range(scale): q = (row + (ox + x) * scale + dx) * 4; out[q:q + 4] = pix
    return 'data:image/png;base64,' + base64.b64encode(png_write(big, big, out)).decode()

SPRITES = p('assets', 'pokesprite')
def item_sprite_path(item_id):
    found = sorted(glob.glob(os.path.join(SPRITES, 'items', '*', item_id + '.png')))
    if not found: raise SystemExit(f'No pokesprite image for item "{item_id}" (looked in assets/pokesprite/items/*/{item_id}.png)')
    return found[0]

# Pokémon forms and moves; sprites are filled in from pokesprite by each form's "spr" name
data_json = json.loads(read('data', 'data.json'))
sprite_names = sorted({f['spr'] for f in data_json['forms']})
missing = [n for n in sprite_names if not os.path.exists(os.path.join(SPRITES, 'pokemon-gen8', 'regular', n + '.png'))]
if missing: raise SystemExit(f'No pokesprite image for: {", ".join(missing)} (looked in assets/pokesprite/pokemon-gen8/regular)')
data_json['sprites'] = {n: game_sprite(os.path.join(SPRITES, 'pokemon-gen8', 'regular', n + '.png')) for n in sprite_names}
data = json.dumps(data_json, ensure_ascii=False, separators=(',', ':'))
# held items; each item's sprite is found by its id
items_json = json.loads(read('data', 'items.json'))
for it in items_json: it['spr'] = game_sprite(item_sprite_path(it['id']))
items = json.dumps(items_json, ensure_ascii=False, separators=(',', ':'))
trs   = json.dumps({os.path.basename(f)[:-4]: b64(f) for f in sorted(glob.glob(p('assets', 'tr', '*.png')))})
candy = b64(p('assets', 'candy.png'))
rotomdex = game_sprite(p('assets', 'rotomdex.png'))   # the Pokédex's icon: Rotom Pokédex

def git(*args):
    try:
        return subprocess.run(['git', *args], cwd=ROOT, capture_output=True, text=True, timeout=10).stdout.strip()
    except Exception:
        return ''

version = read('VERSION').strip()
channel = os.environ.get('POKECRAWL_CHANNEL') or ('stable' if git('branch', '--show-current') == 'main' else 'dev')
label = version if channel == 'stable' else f"{version}-dev ({git('rev-parse', '--short', 'HEAD') or 'local'})"

js = (read('src', 'app1.js') + read('src', 'app2.js')) \
    .replace('__DATA__', data, 1).replace('__ITEMS__', items, 1) \
    .replace('__CANDY__', candy, 1).replace('__TRS__', trs, 1).replace('__ROTOMDEX__', rotomdex, 1).replace('__VERSION__', label, 1)
css = read('src', 'slot.css') + '\n' + read('src', 'game.css')

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Poke-Crawl</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
<body>
{read('src', 'body.html')}
<script>
(() => {{
{js}
}})();
</script>
</body>
</html>
'''
os.makedirs(p('dist'), exist_ok=True)
with open(p('dist', 'index.html'), 'w', encoding='utf-8') as f:
    f.write(html)
print(f'Built dist/index.html, v{label} ({len(html) // 1024} KB)')
