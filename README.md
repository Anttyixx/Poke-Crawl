# Poke-Crawl

### [▶ Play the game](https://anttyixx.github.io/Poke-Crawl/)

Poke-Crawl is a Pokémon roguelite that runs in your browser on phone or desktop.
Pick Bulbasaur, Charmander or Squirtle and climb a branching, Slay-the-Spire style map toward 8 gym leaders.
Along the way you recruit wild Pokémon, shop at Poké Marts, teach moves at Move Tutors, park extras in the daycare, and fight trainers.

Battles play out automatically, so the strategy happens before each fight: who is on your team, where they
stand on the field, which moves they know and which held items they carry. You get 3 lives per run.

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

## Play it online

| Version | Link | Built from |
|---|---|---|
| Stable | https://anttyixx.github.io/Poke-Crawl/ | `main` |
| Experimental | https://anttyixx.github.io/Poke-Crawl/dev/ | `dev` |

The workflow in `.github/workflows/pages.yml` rebuilds and redeploys both on every push to `main` or `dev`.
Ongoing work is merged into `dev` for play-testing, then `dev` is merged into `main` when it is ready.
