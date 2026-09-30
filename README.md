# Poke-Crawl

A browser roguelite: pick a starter, climb a Slay-the-Spire style map of wild Pokémon,
Poké Marts, Move Tutors, a daycare, trainers and gym leaders, with auto-battles and 3 lives.

## Run it

```
python build.py
```

Then open `dist/index.html` in a browser. There is no server or install step: the build
bundles everything (code, styles, data and sprites) into that one file.

## Where things live

| Path | What it is |
|---|---|
| `src/app1.js` | Game state, `TUNE` balance numbers (top of file), map generation, slots and animations, every node screen (starter, wild, mart, tutor, daycare) |
| `src/app2.js` | Battle engine, encounters, results and run-end |
| `src/body.html` | Screen markup |
| `src/slot.css` | Dynamic slot component styles |
| `src/game.css` | Everything else (later rules override earlier ones) |
| `data/data.json` | Pokémon forms, moves, sprite data |
| `data/items.json` | Held items |
| `assets/` | EXP Candy and the 18 TR sprites |
| `docs/design/` | Feature/design notes |
| `build.py` | Stitches it all into `dist/index.html` |

The build replaces the placeholders `__DATA__`, `__ITEMS__`, `__CANDY__` and `__TRS__` in the JS.

## Play it online (GitHub Pages)

The workflow in `.github/workflows/pages.yml` rebuilds and publishes the game on every push to `main`.
Turn it on once: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
The game will then be at `https://<your-username>.github.io/<repo-name>/`.
