# Pokémon sprites

`pokemon/` holds 1,123 Pokémon sprites, one PNG per Pokémon or form, kept here for future use. The game does not load them yet: the sprites it uses today are embedded in `data/data.json`.

- **Size:** 40 × 30 pixels each, except `snorlax-rest.png` (48 × 48).
- **Names:** lowercase, hyphens for spaces and forms, e.g. `pikachu.png`, `mr-mime.png`, `nidoran-f.png`, `nidoran-m.png`, `arcanine-hisuian.png`, `basculegion-female.png`, `aegislash-shield.png`.
- **Coverage:** every Pokémon in the current game has a file here (Nidoran♀ and Nidoran♂ are `nidoran-f` and `nidoran-m`).

To use them in the game, wire them into `build.py`: nothing is loaded from disk at runtime, so sprites have to be embedded into `dist/index.html` like every other asset.
