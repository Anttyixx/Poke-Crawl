# Changelog

Each release to `main` (the stable game) gets a version number, `0.MINOR.PATCH` while the game is in development:
a new feature or noticeable change bumps MINOR, a release of only fixes and small tweaks bumps PATCH. The dev
channel shows the upcoming version with its commit, e.g. `0.2.0-dev (a1b2c3d)`.

## 0.3.0 (upcoming, on dev)

### Changed
- Wild Pokémon now leap onto the screen one at a time, each from a different edge, before you choose one.
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
