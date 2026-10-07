# Sprites

Every Pokémon and held-item sprite in the game, up to Gen 9 (Scarlet/Violet and Legends: Z-A Megas).

The source pack shipped each Pokémon icon as two animation frames side by side (128×64). Only the left frame was kept, so each file here is one Pokémon (64×64; a few large ones 80×80). Item sprites were single images already (mostly 48×48). File names are the pack's, lowercased.

## How the game uses it

`build.py` embeds the sprites it needs into `dist/index.html`; nothing here is loaded at runtime.

- **Pokémon:** each form's `spr` in `data/data.json` is a file name in `pokemon/` (e.g. `"spr": "charizard"` uses `pokemon/charizard.png`).
- **Held items:** each item's `id` in `data/items.json`, without its hyphens, is a file name in `items/` (e.g. `choice-band` uses `items/choiceband.png`).
- The build trims each sprite to its visible pixels, centres it on a square canvas with a 1 pixel border, and scales it up 4×.

To add a Pokémon or item, add it to the data with the right file name; the build finds the sprite. It stops with an error if a file is missing.

## Names

| Folder | Contents |
|---|---|
| `pokemon/` | Normal colours. `name.png` is the base form; `name_1.png`, `name_2.png`, … are its other forms (Megas, regional forms, alternate forms) in the pack's form order |
| `shiny/` | The same names in shiny colours |
| `items/` | Items, named without spaces or punctuation (`rockyhelmet.png`, `charizarditex.png`) |

Some names are spelled out: `nidoranfe` and `nidoranma` (Nidoran♀ and ♂), `mrmime`, `porygonz`, `farfetchd`. `000.png` is the pack's placeholder.

## Copyright

The sprite images are © Nintendo / Creatures Inc. / GAME FREAK Inc. Poke-Crawl is a free, non-commercial fan project and must stay that way to use them.
