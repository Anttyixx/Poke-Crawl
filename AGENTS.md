# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, and others) working in this repository.
`CLAUDE.md` imports this file, so this is the single copy to edit.

## Project

**Poke-Crawl** is a browser roguelite. The player picks a starter and climbs a Slay-the-Spire style map of wild Pokémon, Poké Marts, Move Tutors, a daycare, trainers and gym leaders. Battles are automatic, and a run has 3 lives.

There is no framework, package manager, or server. The whole game is plain JS, CSS and HTML, bundled into one self-contained file.

## Build and run

```
python build.py        # writes dist/index.html (standard library only, Python 3.8+)
```

Open `dist/index.html` in a browser to play. `dist/` is gitignored, so never commit it. After any change, rebuild and reload to test it.

## Branches and play-testing

Two branches are published as public links:

| Branch | Link | Role |
|---|---|---|
| `main` | https://anttyixx.github.io/Poke-Crawl/ | Stable game |
| `dev` | https://anttyixx.github.io/Poke-Crawl/dev/ | Experimental build of ongoing work |

A push to `main` or `dev` redeploys both links within a minute or two. Pushes to any other branch deploy nothing.

Rules:

1. **Never push directly to `main`.** Update `main` only by merging `dev` into it, and only when the user says the work is ready.
2. Start each new change on a feature branch cut from the latest `dev`, named `feature/<short-name>`. If the user names a branch, use that one.
3. To let the user play-test, merge the feature branch into `dev` and push `dev`. Then tell them to refresh the experimental link.
4. For each round of tweaks, commit on the same feature branch, merge it into `dev` again, and push.
5. Another agent may be working in this repo too. Always fetch and merge the latest `dev` before merging into it, and never force-push `dev` or `main`.
6. Run `python build.py` before every push and make sure it succeeds.
7. When you merge a change into `dev`, add a line for it to the upcoming version's section of `CHANGELOG.md` (under Added, Changed, Removed or Fixed), written for players.

## Versions and releases

Versions are `0.MINOR.PATCH` while the game is in development. Only a release to `main` gets a new version; the dev channel shows the upcoming one.

- `VERSION` holds one line: the version `dev` is heading toward (e.g. `0.2.0`). `build.py` puts it in the game: a stable build shows `0.2.0`, any other build `0.2.0-dev (a1b2c3d)` with its commit. The title screen shows it in the bottom-left corner.
- A release with any new feature or noticeable change bumps MINOR (0.2.0 → 0.3.0). A release of only fixes and small tweaks bumps PATCH (0.2.0 → 0.2.1). 1.0.0 is for when the game is complete; only the user decides that.

To release, only when the user says the work on `dev` is ready:

1. On `dev`, check `VERSION` is right for what is being released (MINOR or PATCH, as above), and in `CHANGELOG.md` change the heading `## X.Y.Z (upcoming, on dev)` to `## X.Y.Z (YYYY-MM-DD)`. Commit and push `dev`.
2. Merge `dev` into `main` and push `main`.
3. Nothing to do for the tag: the deploy workflow tags `main` as `vX.Y.Z` (from `VERSION`) on every push to `main`, if that tag doesn't exist yet. Check the run's `tag` job succeeded.
4. Back on `dev`, set `VERSION` to the next minor version (e.g. `0.3.0`), add an empty `## 0.3.0 (upcoming, on dev)` section to the top of `CHANGELOG.md`, commit and push.

## Layout

| Path | What it is |
|---|---|
| `src/app1.js` | Game state, `TUNE` balance numbers (top of file), map generation, slots and animations, the title screen, the Pokédex, every node screen (starter, wild, mart, tutor, daycare), the party and bag on the map |
| `src/app2.js` | Battle engine, encounters, results and run-end |
| `src/body.html` | Screen markup |
| `src/slot.css` | Dynamic slot component styles |
| `src/game.css` | All other styles. Later rules override earlier ones. |
| `data/data.json` | Pokémon `forms` and `moves`; each form's `spr` names its sprite in `assets/pokesprite` |
| `data/items.json` | Held items; each item's `id` names its sprite in `assets/pokesprite/items` |
| `assets/candy.png`, `assets/tr/*.png` | EXP Candy sprite and the 18 TR sprites, one per move type |
| `assets/pokesprite/` | Sprite library from PokéSprite: every Pokémon (normal and shiny) and ~1,000 items, plus `data/pokemon.json`. The source of all Pokémon and item sprites; see `assets/pokesprite/README.md` (the art is © Nintendo, not MIT) |
| `assets/bush-kit/` | Bush Kit: the rustling-bush animation on the wild screen (`bush-kit.js`, loaded by `build.py` as its own script, exposes `window.BushKit`; art from Pokémon Essentials, credit required) |
| `docs/design/` | Feature and design notes (start at `features_00-index.md`; undecided items are in `features_open-questions.md`) |
| `build.py` | Stitches everything into `dist/index.html` |
| `VERSION` | The version `dev` is heading toward; see Versions and releases |
| `CHANGELOG.md` | What changed in each version, written for players |
| `.github/workflows/pages.yml` | Builds `main` and `dev` and deploys both to GitHub Pages on every push to either |

## How the build works

`build.py` concatenates `app1.js` and `app2.js`, which run as one script in that order and share one IIFE scope. It then substitutes these placeholders, each replaced once:

- `__DATA__` becomes `data/data.json` plus a `sprites` map built from `assets/pokesprite` (one entry per form `spr`)
- `__ITEMS__` becomes `data/items.json` with each item's sprite added as `spr`, from `assets/pokesprite/items`
- `__CANDY__` becomes the data URI of `assets/candy.png`
- `__TRS__` becomes a JSON map of move type to TR sprite data URI
- `__VERSION__` becomes the version label, e.g. `0.2.0` or `0.2.0-dev (a1b2c3d)`

`assets/bush-kit/bush-kit.js` goes in as its own `<script>` before the game's. The build also joins `slot.css` and `game.css` in that order and inlines them with `body.html` into one HTML page. The page's only external request is Google Fonts (Chakra Petch).

## Conventions

- Keep balance numbers in the `TUNE` object at the top of `src/app1.js` rather than hard-coding them elsewhere.
- Keep each placeholder appearing exactly once in the JS; the build only replaces the first occurrence.
- To add a new asset or data file, wire it into `build.py`. Nothing is loaded at runtime from disk.
- Never embed sprites in the data files. To add a Pokémon or item, use its PokéSprite file name (`spr` for forms, `id` for items); `build.py` trims, scales (4×) and embeds it.
