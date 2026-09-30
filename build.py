"""Build Poke-Crawl into one self-contained HTML file.

Usage:  python build.py          -> writes dist/index.html
Only the Python standard library is needed (Python 3.8+).
"""
import base64, glob, json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
p = lambda *parts: os.path.join(ROOT, *parts)
read = lambda *parts: open(p(*parts), encoding='utf-8').read()
b64 = lambda path: 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()

data  = read('data', 'data.json')                     # Pokémon forms, moves, sprites
items = read('data', 'items.json')                    # held items
trs   = json.dumps({os.path.basename(f)[:-4]: b64(f) for f in sorted(glob.glob(p('assets', 'tr', '*.png')))})
candy = b64(p('assets', 'candy.png'))

js = (read('src', 'app1.js') + read('src', 'app2.js')) \
    .replace('__DATA__', data, 1).replace('__ITEMS__', items, 1) \
    .replace('__CANDY__', candy, 1).replace('__TRS__', trs, 1)
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
print(f'Built dist/index.html ({len(html) // 1024} KB)')
