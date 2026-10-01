# PokéSprite

Pokémon and item sprites from [PokéSprite](https://github.com/msikma/pokesprite) by Michiel Sikma and contributors. This is the source of every Pokémon and held-item sprite in the game.

## How the game uses it

`build.py` embeds the sprites it needs into `dist/index.html`; nothing here is loaded at runtime.

- **Pokémon:** each form's `spr` in `data/data.json` is a file name in `pokemon-gen8/regular/` (e.g. `"spr": "charizard"` uses `pokemon-gen8/regular/charizard.png`).
- **Held items:** each item's `id` in `data/items.json` is a file name in one of the `items/*/` folders (e.g. `choice-band` uses `items/hold-item/choice-band.png`).
- The build trims each sprite to its visible pixels, centres it on a square canvas with a 1 pixel border, and scales it up 4×.

To add a Pokémon or item, add it to the data with the right file name; the build finds the sprite. It stops with an error if a file is missing.

## What's here

| Folder | Contents |
|---|---|
| `pokemon-gen8/regular/`, `pokemon-gen8/shiny/` | Every Pokémon and form up to Sword/Shield, 68×56, normal and shiny |
| `icons/pokemon/` | The small 40×30 box icons, normal and shiny |
| `items/` | About 1,000 item sprites by category (held items, berries, balls, medicine, evolution items, …) |
| `data/pokemon.json` | Every Pokémon's names, Pokédex number, slug and forms; `data/item-map.json` maps item ids to files |
| `pokesprite-readme.md`, `contributors.md`, `license.md` | PokéSprite's own README, credits and license |

Only these parts of PokéSprite are included; its build scripts, outlined item variants and misc images were left out.

## License and copyright

PokéSprite's code and data are under the MIT license (`license.md`). **The sprite images themselves are © Nintendo / Creatures Inc. / GAME FREAK Inc.**; the MIT license does not cover them. Poke-Crawl is a free, non-commercial fan project and must stay that way to use them.
