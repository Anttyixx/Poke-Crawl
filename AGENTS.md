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
   End every reply that pushes `dev` with the link to that exact build as its very last line, so it is easy to tap (see Reply format below). Every dev deploy is also published at `/dev/<short hash>/` (the `dev` merge commit), a new address that is never cached, so use that form and say which version the title screen should show:
   `Play-test: https://anttyixx.github.io/Poke-Crawl/dev/a1b2c3d/` (title screen shows `0.3.0-dev (a1b2c3d)`)
   It goes live when the deploy run finishes, a minute or two after the push. The plain `/dev/` link can lag behind by several minutes.
4. For each round of tweaks, commit on the same feature branch, merge it into `dev` again, and push.
5. Another agent may be working in this repo too. Always fetch and merge the latest `dev` before merging into it, and never force-push `dev` or `main`.
6. Run `python build.py` before every push and make sure it succeeds.
7. When you merge a change into `dev`, add a line for it to the upcoming version's section of `CHANGELOG.md` (under Added, Changed, Removed or Fixed), written for players.

## Reply format

The user reads replies from the bottom up: the end gives the gist, the top has the detail for when they want more.

- Put the full explanation first: what you did, how it works, what you tested, anything to watch out for.
- End every reply that changes something with a short **Summary** section: 2 to 5 bullets, one line each, saying in plain words what changed for the player (or in the repo). No file names or code unless the change is about them.
- If the reply pushes `dev`, the play-test link goes after the summary, as the very last line.

```
…details…

**Summary**
- Rotom hops between starters faster, with flatter curves on short hops
- The scan window opens and closes 25% faster

Play-test: https://anttyixx.github.io/Poke-Crawl/dev/a1b2c3d/ (title screen shows `0.4.0-dev (a1b2c3d)`)
```

## Versions and releases

Versions are `0.MINOR.PATCH` while the game is in development. Only a release to `main` gets a new version; the dev channel shows the upcoming one.

- `VERSION` holds one line: the version `dev` is heading toward (e.g. `0.2.0`). `build.py` puts it in the game: a stable build shows `0.2.0`, any other build `0.2.0-dev (a1b2c3d)` with its commit. The title screen shows it in the bottom-left corner.
- A release with any new feature or noticeable change bumps MINOR (0.2.0 → 0.3.0). A release of only fixes and small tweaks bumps PATCH (0.2.0 → 0.2.1). 1.0.0 is for when the game is complete; only the user decides that.

To release, only when the user says the work on `dev` is ready:

1. On `dev`, check `VERSION` is right for what is being released (MINOR or PATCH, as above).
2. Write the release notes: the version's section of `CHANGELOG.md` is the release notes. Check it covers every change merged into `dev` since the last release (compare with `git log vX.Y.Z..dev`, using the last release's tag), with nothing missing, outdated or repeated: when a later change reworked an earlier one, keep one line describing the final result. Lead each group with the biggest changes. Then change its heading `## X.Y.Z (upcoming, on dev)` to `## X.Y.Z (YYYY-MM-DD)`. Commit and push `dev`.
3. Merge `dev` into `main` and push `main`.
4. Nothing to do for the tag: the deploy workflow tags `main` as `vX.Y.Z` (from `VERSION`) on every push to `main`, if that tag doesn't exist yet. Check the run's `tag` job succeeded.
5. Back on `dev`, set `VERSION` to the next minor version (e.g. `0.3.0`), add an empty `## 0.3.0 (upcoming, on dev)` section to the top of `CHANGELOG.md`, commit and push.
6. In the reply, include the release notes for the new version (its `CHANGELOG.md` section), then the Summary, then the stable link `https://anttyixx.github.io/Poke-Crawl/` as the last line.

Players read the release notes in the game too: the title screen's "Release notes" button (next to the version, bottom-left) shows `CHANGELOG.md`, newest version first. An empty upcoming section is left out.

## Layout

| Path | What it is |
|---|---|
| `src/app1.js` | Game state, `TUNE` balance numbers (top of file), map generation, slots and animations, the title screen, the Pokédex, every node screen (starter, wild, mart, tutor, daycare), the party and bag on the map |
| `src/app2.js` | Battle engine, encounters, results and run-end |
| `src/body.html` | Screen markup |
| `src/slot.css` | Dynamic slot component styles |
| `src/game.css` | All other styles. Later rules override earlier ones. |
| `data/data.json` | Pokémon `forms`, `moves` and move `pools`. Each form's `spr` names its sprite in `assets/sprites/pokemon`; `role` is its role (Striker, Tank, Support or All-Rounder) and `sub` its sub-role (Healer, Splash, Bulky…, from the roster's playstyle tags); a `branch` marks a split (Eevee, Oddish…), `legendary` keeps a line on Legendary nodes, `tier` is the map (1 to 8) whose wild pool a line belongs to, by strength, `gimmick` marks a line with a gimmick (each map's 12 picks include 1 or 2), and `weight` makes a line rarer in those picks (default 100; Paradox 40; 10 or less marks a Mythical, which is kept out of the pools and can spawn on a map with no Legendary node, see `TUNE.mythical`). `megas` lists every Mega Evolution: the species it comes from (`of`), its sprite, its Mega Stone (an item in `data/items.json` with a `mega` field), its `type`, `ability`, `boost` (multipliers on HP, Attack and Speed) and `sig`, its own signature move (a move with `cat` `mega`). Each move has a `cat` (`sig` shared signature, `unique` signature, `tutor`) and its effects as fields (`drain`, `recoil`, `first`, `spdDrop`, `dot`, …) that the battle engine reads. A pool is a list of tutor moves plus a rule (every Pokémon, a type, or a ★1 stat bar) |
| `data/items.json` | Held items; each item's `id`, without its hyphens, names its sprite in `assets/sprites/items` |
| `assets/candy.png`, `assets/tr/*.png` | EXP Candy sprite and the 18 TR sprites, one per move type |
| `assets/rotomdex.png` | Rotom Pokédex (RotomDex), the Pokédex's icon (96×96, trimmed and scaled like the other sprites) |
| `assets/sprites/` | Sprite library: every Pokémon up to Gen 9 (`pokemon/`, `shiny/`, one frame per file) and ~800 items (`items/`). The source of all Pokémon and item sprites; see `assets/sprites/README.md` for the naming (the art is © Nintendo) |
| `docs/design/` | Feature and design notes (start at `features_00-index.md`; undecided items are in `features_open-questions.md`) |
| `build.py` | Stitches everything into `dist/index.html` |
| `VERSION` | The version `dev` is heading toward; see Versions and releases |
| `CHANGELOG.md` | What changed in each version, written for players; also the in-game release notes |
| `.github/workflows/pages.yml` | Builds `main` and `dev` and deploys both to GitHub Pages on every push to either; the dev build is also published at `/dev/<commit>/`. The copy on `main` is the one that runs, so changes to it must reach `main` |

## How the build works

`build.py` concatenates `app1.js` and `app2.js`, which run as one script in that order and share one IIFE scope. It then substitutes these placeholders, each replaced once:

- `__DATA__` becomes `data/data.json` plus a `sprites` map built from `assets/sprites/pokemon` (one entry per form `spr`)
- `__ITEMS__` becomes `data/items.json` with each item's sprite added as `spr`, from `assets/sprites/items`
- `__CANDY__` becomes the data URI of `assets/candy.png`
- `__TRS__` becomes a JSON map of move type to TR sprite data URI
- `__ROTOMDEX__` becomes the data URI of `assets/rotomdex.png`, the Pokédex's icon
- `__VERSION__` becomes the version label, e.g. `0.2.0` or `0.2.0-dev (a1b2c3d)`
- `__CHANGELOG__` becomes `CHANGELOG.md` converted to HTML (a JSON string), shown by the title screen's release notes

The build also joins `slot.css` and `game.css` in that order and inlines them with `body.html` into one HTML page. The page's only external request is Google Fonts (Chakra Petch).

## Conventions

- Keep balance numbers in the `TUNE` object at the top of `src/app1.js` rather than hard-coding them elsewhere.
- Keep each placeholder appearing exactly once in the JS; the build only replaces the first occurrence.
- To add a new asset or data file, wire it into `build.py`. Nothing is loaded at runtime from disk.
- Never embed sprites in the data files. To add a Pokémon or item, use its file name in `assets/sprites` (`spr` for forms, `id` for items); `build.py` trims, scales (4×) and embeds it.
