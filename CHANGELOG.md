# Changelog

Each release to `main` (the stable game) gets a version number, `0.MINOR.PATCH` while the game is in development:
a new feature or noticeable change bumps MINOR, a release of only fixes and small tweaks bumps PATCH. The dev
channel shows the upcoming version with its commit, e.g. `0.2.0-dev (a1b2c3d)`.

## 0.4.0 (upcoming, on dev)

### Added
- **Every Generation 1 Pokémon**, plus the other members of their families from later generations: babies like Pichu, Cleffa and Happiny, and evolutions like Crobat, Scizor, Kleavor, Magnezone, Blissey and all eight Eeveelutions. 78 evolution lines, 184 Pokémon in all.
- **Branching evolutions.** Eevee, Slowpoke, Tyrogue and Scyther pick their branch when they reach ★2, and Oddish and Poliwag when they reach ★3, then stay on it.
- **Real legendaries.** Articuno, Zapdos, Moltres, Mewtwo and Mew wait on Legendary nodes. Beat them to catch them; they never show up as wild Pokémon or on trainers' teams.

### Changed
- **Moves rebuilt for 2-move Pokémon.** Signature moves are now their own kind of move: learned by leveling and never taught. Most are shared within a type (Ember, Flamethrower, Surf, Earthquake…), and 26 standout Pokémon have one of their own: Charizard's Blast Burn, Raichu's Volt Tackle, Jigglypuff's Sing, Persian's Pay Day (bonus coins), Ditto's Transform, Magikarp's Splash, Mewtwo's Psystrike and more. The Move Tutor teaches everything else.
- Signature moves have more PP, so a Pokémon's main attack carries more of the fight.
- The RotomDex's Moves tab says which Pokémon can be taught each move, and marks unique signatures.
- The RotomDex shows each line as how it evolves, with each Pokémon once and no star levels (Raticate no longer appears twice). Eevee's eight evolutions sit in a grid, and a Pokémon whose signature move changes as it levels lists each one.
- Rotom's flight into the RotomDex is now a short hop and shallow dip, matching its way back (which dips a little less), and opening and closing are 10% quicker.
- Rotom now perches on the RotomDex's top edge, overlapping the window and a little bigger, instead of sitting inside the header; the window opens out from it. Tap Rotom to close the RotomDex.
- Every Pokémon now knows just 2 moves: its signature move and one move taught at a Move Tutor (it was 2 taught moves). Teaching a Pokémon a new move replaces the one it was taught before. Trainers' and gym leaders' Pokémon follow the same rule.

## 0.3.0 (2026-10-02)

### Changed
- The Pokédex is now the RotomDex. Rotom Pokédex waits in the top-right corner of every screen; tap it and it hops up, swoops across the screen and opens the RotomDex as a popup over the game, instead of a separate screen.
- Wild Pokémon now leap onto the screen from different spots along the top half of its edges, at staggered moments, before you choose one.
- Tapping a Pokémon or item on the map opens a redesigned popup in the Pokédex's style. A Pokémon's shows its stats with an EXP bar, ability, held item, signature move in full and the moves it knows, building up piece by piece as it opens.

## 0.2.0 (2026-10-01)

### Added
- **Title screen.** The game opens on the Poke-Crawl logo over a slowly drifting, freshly generated map, with the three starters and a Start button.
- **Pokédex**, from the map's top bar or the title screen, with tabs for Pokémon, Moves and Items pinned to the top.
  - Pokémon are listed by evolution line; tap one to open its stats, ability, signature move (in full) and the tutor moves it can learn.
  - Tutor moves open their details in place, and link to the Moves section.
  - Moves show who has them as a signature move and who can be taught them; tap a Pokémon to jump to its entry.
  - Items show what they do and their Poké Mart price.
- **Party and bag on the map.** The party sits bottom-left and the bag (now 4 slots, 2 by 2) bottom-right, over a feathered blur. Tap a slot for a popup with its details; tap another slot to move, swap or hand over an item.
- **Version number** in the title screen's corner.

### Changed
- Choosing a starter goes straight into the map: the starter jumps into its party slot, the slots pop in, then the top bar arrives and the map generates from the bottom up. (The plain screen wipe remains for players who prefer reduced motion.)
- The bag holds 4 items instead of 5.

### Removed
- The "Party and bag" button and screen; everything it did now happens on the map.

### Fixed
- An item given to a Pokémon flew to the screen's top-left corner instead of to that Pokémon.
- Moving a Pokémon that holds an item flew the item sprite separately; it now travels with the Pokémon.

## 0.1.0

- The game as first imported: starter choice, branching maps with wild Pokémon, Poké Marts, Move Tutors, a daycare, trainers and 8 gym leaders, automatic battles and 3 lives.
