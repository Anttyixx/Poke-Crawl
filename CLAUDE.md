# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Poke-Crawl** is a browser roguelite. The player picks a starter and climbs a Slay-the-Spire style map of wild Pokémon, Poké Marts, Move Tutors, a daycare, trainers and gym leaders. Battles are automatic, and a run has 3 lives.

There is no framework, package manager, or server. The whole game is plain JS, CSS and HTML, bundled into one self-contained file.

## Build and run

```
python build.py        # writes dist/index.html (standard library only, Python 3.8+)
```

Open `dist/index.html` in a browser to play. `dist/` is gitignored, so never commit it. After any change, rebuild and reload to test it.

## Layout

| Path | What it is |
|---|---|
| `src/app1.js` | Game state, `TUNE` balance numbers (top of file), map generation, slots and animations, every node screen (starter, wild, mart, tutor, daycare) |
| `src/app2.js` | Battle engine, encounters, results and run-end |
| `src/body.html` | Screen markup |
| `src/slot.css` | Dynamic slot component styles |
| `src/game.css` | All other styles. Later rules override earlier ones. |
| `data/data.json` | Pokémon `forms`, `moves` and `sprites` |
| `data/items.json` | Held items, each with an embedded base64 sprite |
| `assets/candy.png`, `assets/tr/*.png` | EXP Candy sprite and the 18 TR sprites, one per move type |
| `docs/design/` | Feature and design notes (start at `features_00-index.md`; undecided items are in `features_open-questions.md`) |
| `build.py` | Stitches everything into `dist/index.html` |
| `.github/workflows/pages.yml` | Rebuilds the game and deploys it to GitHub Pages on every push to `main` |

## How the build works

`build.py` concatenates `app1.js` and `app2.js`, which run as one script in that order and share one IIFE scope. It then substitutes these placeholders, each replaced once:

- `__DATA__` becomes the contents of `data/data.json`
- `__ITEMS__` becomes the contents of `data/items.json`
- `__CANDY__` becomes the data URI of `assets/candy.png`
- `__TRS__` becomes a JSON map of move type to TR sprite data URI

The build also joins `slot.css` and `game.css` in that order and inlines them with `body.html` into one HTML page. The page's only external request is Google Fonts (Chakra Petch).

## Conventions

- Keep balance numbers in the `TUNE` object at the top of `src/app1.js` rather than hard-coding them elsewhere.
- Keep each placeholder appearing exactly once in the JS; the build only replaces the first occurrence.
- To add a new asset or data file, wire it into `build.py`. Nothing is loaded at runtime from disk.
