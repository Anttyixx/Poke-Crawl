# Changelog

Each release to `main` (the stable game) gets a version number, `0.MINOR.PATCH` while the game is in development:
a new feature or noticeable change bumps MINOR, a release of only fixes and small tweaks bumps PATCH. The dev
channel shows the upcoming version with its commit, e.g. `0.2.0-dev (a1b2c3d)`.

## 0.4.0 (upcoming, on dev)

### Added
- **Release Pokémon.** A party or daycare Pokémon's scan has a Release button you hold down (so it can't happen by accident). It can't be your last party Pokémon. A released Pokémon leaves an EXP Candy worth 60% of the EXP it earned with you, which you give to one of your Pokémon before carrying on (if it earned none, or nobody can still level up, it leaves nothing). Its held item goes back in your bag.
- **Switch moves from the scan.** Pokémon now remember every move they have learned: the signature move from each level they grew through, and every move a Move Tutor taught them. In a party or daycare Pokémon's scan, each move has a Change button: tap it to switch that move for one it learned before (a signature move for an earlier signature, a taught move for one it was taught before). A move it never learned has to be taught at a Move Tutor, and the tutor no longer offers moves it already learned.
- **Wild Pokémon by map.** Every wild Pokémon is in one of 8 tiers by how strong it ends up, and map N's wild Pokémon come from tier N. When a map starts, 12 Pokémon from its tier are picked for your run: 1 or 2 with a special gimmick, a few at random, and the rest chosen to fit your team (roles and types it's missing, and types that cover its weak spots). Each wild node offers three of them, ones you haven't been offered yet first. The RotomDex shows each line's map ("Wild from map 3").
- **The RotomDex scans everywhere.** Tap a Pokémon or item (a starter, a wild Pokémon, one in your party, bag or daycare, or an item for sale) to select it, and Rotom in the top-right corner starts giving little side-to-side shakes with a tiny hop, glowing with a pulsing halo, to get your attention: tap Rotom to scan what you selected, or double-tap a Pokémon or item to select and scan it in one go. While the scan is open, tapping another Pokémon or item scans that one instead, and nothing can be moved; close the scan (tap Rotom, the Pokémon or item being scanned, or anywhere outside it) and your selection is still there, ready to move. This replaces the old info popup and info box.
- **Release notes.** A "Release notes" button next to the version number in the title screen's bottom-left corner lists what changed in each version, newest first.
- **Scanning with the RotomDex.** On the starter screen, the three starters now stand at the top under the title as bare sprites, with no slot boxes around them. Pick one and tap Rotom, and it flies over to scan it: a small RotomDex window opens right next to it with just that Pokémon's stats, EXP, ability, held item and moves, its border rising in a bump to meet Rotom perched by the Pokémon. Tap another starter and Rotom hops over to scan that one, the window folding away as it sets off and opening out of Rotom again, with the new Pokémon's info, as it lands; the scan looks just like a Pokémon's entry in the full RotomDex. Choose with the "I Choose You!!" button at the bottom of the screen, or tap "Full RotomDex", pinned to the scan's top-right corner, and Rotom opens the whole RotomDex.
- **763 Pokémon from every generation**, in 403 evolution lines: from Bulbasaur to the Paldea starters, with Alolan, Galarian and Hisuian forms (Alolan Vulpix, Galarian Darmanitan, Hisuian Zoroark…), Ultra Beasts, Paradox Pokémon, and new evolutions like Annihilape (Primeape's ★3), Kingambit, Hydrapple and Clodsire. A Pokémon that evolves only once (like Growlithe or Eevee) evolves when it reaches ★3.
- **Mega Evolution.** 95 Mega Evolutions (and Primal Kyogre and Groudon), each with its Mega Stone as a held item. A Pokémon holding its stone Mega Evolves at the start of a battle: it takes on the Mega's own type and stat changes, and its signature move becomes the Mega's own (like Flare Blitz for Mega Charizard X); the move it was taught stays. Only one per side Mega Evolves, the fastest (Rayquaza needs no stone). Poké Marts sometimes stock a stone for a Pokémon in your party, and from gym 4 on, leaders' Pokémon carry theirs. In the RotomDex, each Mega is one more step at the end of its line, in a purple rounded-diamond frame instead of a circle, with its own entry: type, stats, ability, signature move and the stone it takes.
- **RotomDex search.** A search box under the tabs narrows the list as you type: Pokémon by name, type or Mega, moves by name or type, items by name.
- **Starters from every generation.** Each run offers a Grass, a Fire and a Water starter, each from a different generation, picked at random.
- Starting a run fades straight from the title screen to the starters, without the screen wipe.
- **Mythical Pokémon.** From map 2 on, a map without a Legendary node has a small chance of a Mythical Pokémon (like Celebi, Jirachi, Zeraora or one of the Ultra Beasts), which the map's first wild node then offers: 1% on map 2, doubling every map (2%, 4%, 8%… up to 64% on map 8). Paradox Pokémon are in the strongest wild tier, and are a little rarer there. Neither shows up on trainers' teams.
- **Branching evolutions.** Lines like Wurmple and Applin pick their branch when they reach ★2, and lines like Eevee, Tyrogue, Oddish, Ralts and Cyndaquil (Typhlosion or Hisuian Typhlosion) when they reach ★3, then stay on it.
- **Real legendaries.** Legendary Pokémon, from Articuno to Koraidon and Miraidon, wait on Legendary nodes. None appear before map 6; map 6 always has one, and maps 7 and 8 each have a 10% chance (never more than one per map). Beat them to catch them; they never show up as wild Pokémon or on trainers' teams.
- Sell items at Poké Marts: tap an item in your bag (or one a Pokémon holds) and press Sell in its scan, for half its price.

### Changed
- **Roles.** Every Pokémon has a role (Striker, Tank, Support or All-Rounder) and a sub-role that says how it plays it, like Healer Support, Splash Striker or Bulky Tank, shown in its scan and RotomDex entry (hover it for what it means). You can search the RotomDex by role or sub-role. In the RotomDex, only a line's first Pokémon says where it's found (like "Wild from map 3"); its evolutions say what they evolve from.
- **Abilities speak this game's language.** Every ability now describes what it does with HP, Attack and Speed, rows and lanes, and damage over time, instead of Defense, Special Attack, accuracy, weather or status conditions (abilities still aren't active in battle).
- **New sprites.** Every Pokémon and item has a new sprite, from a set that goes up to Generation 9.
- EXP is shown in points (100 to a level) instead of percentages: after a battle you'll see "your party gained 10 EXP each", and a Pokémon's scan shows its EXP like 50/100.
- **Clearer moves.** Every move now leads with what kind of move it is (Attack, Support or Defense) and a plain description of what it does, like "Deals 45% of Attack as damage to the opposing Pokémon in front." The button for switching a move is now a swap icon.
- **Daycare, like the other screens.** The daycare's slots sit in the middle and your party and bag are in the bottom corners, just like on the map: tap a Pokémon in your party, then a daycare slot, to leave it there (or the other way round). The daycare now holds 8 Pokémon instead of 10.
- **After a battle.** The winning side's Pokémon do a little victory dance, then you're taken straight back to the map (no more results window). Notices there say what happened and how much EXP your party earned, your Pokémon's EXP bars fill up, and anyone who levels up or evolves flashes and gets a notice of its own ("Bulbasaur evolved into Ivysaur!"). After a gym you go to the daycare as before, and the same happens there.
- Losing a trainer battle still earns half the EXP a win would have (you still lose a life).
- Putting a wild Pokémon in your party takes you straight back to the map.
- **Battle start.** Instead of a 3-2-1 countdown, the field starts empty and the Pokémon run onto it into their places, bobbing and waddling as they go: yours up from the bottom edge of the battlefield, the opponent's down from the top. The fight starts as soon as they're all in. Skip puts them there at once.
- **Clearer battle log.** Each round has its own box, every Pokémon is shown with its sprite next to its name, and each entry is tinted blue for your side or red for the opponent's. The log scrolls, and keeps the latest move in view unless you've scrolled up to read earlier ones.
- **Battle slots without borders.** On the battlefield, each Pokémon stands on its own with just its HP bar in the top-right corner; the animated border shows only while it's acting (green) or being targeted (red). Tap a Pokémon for its stars, held item and moves.
- **Signature move by default, taught move by chance.** Instead of PP, a Pokémon uses its signature move unless its taught move comes up: each taught move has a chance, from 10% for the strongest to 25% for basic ones. The odds never change during a battle, and a Pokémon's info (and the battle tooltip) shows them, like Vine Whip 80% / Rollout 20%.
- **Move limit.** Instead of PP, each Pokémon can use 12 moves per battle (14 at ★2, 16 at ★3), then it Struggles. It's shown beside the Moves heading in a Pokémon's entry, and the battle tooltip shows how many it has left.
- In the RotomDex and scans, a Pokémon's signature and other moves are listed together under one Moves heading.
- **Smarter move choice.** If the move a Pokémon lands on would fail from where it stands, it uses its other move: in the back row, a Pokémon with an attack and a heal heals instead of wasting its turn. With nothing useful to do, it waits, which doesn't use up its move limit.
- Items and moves you can't afford are greyed out and marked "too expensive" (tap one and the label flashes red and shakes), and items are greyed out with "no room" when your bag is full.
- "Back to map" at the Poké Mart and the Move Tutor is no longer coloured in, so it doesn't look like a buy button.
- Messages like "Pikachu joined your party." or "Bought the Leftovers." now pop up in a small rounded box right above your party or bag, then fade after a few seconds.
- **A cleaner Poké Mart, with your party and bag at hand.** The Mart lists its items like the Move Tutor's moves, each in a big slot with its effect and price, and your party and bag sit in the bottom corners just like on the map. Tap an item and the empty slots in your bag glow, and "Back to map" turns into a Buy button: tap Buy, or one of the glowing slots, to buy it. You can hand it to a Pokémon right there: tap the item in your bag, then the Pokémon.
- **Wild Pokémon screen, like the starter screen.** The three wild Pokémon wait at the top: tap one to pick it (and Rotom to scan it), then "I Choose You!!". Your party and bag sit in the bottom corners just like on the map; once you've chosen, your party slots glow, and you tap one to put the new Pokémon there (a Pokémon already there moves over, or to the daycare). Sending it to the daycare, or releasing it for an EXP Candy when everything is full, work as before.
- In the RotomDex, a Pokémon's type now sits under its picture, and a scan shows the Pokémon's info right from the top of the window.
- **A simpler Move Tutor.** The tutor's 5 moves are listed down the screen, and your party and bag sit in the bottom corners just like on the map. Tap a move and the Pokémon that can learn it glow (the others dim); tap one of them and the TR flies over and teaches it, replacing its taught move. No more moving a Pokémon into a big slot and picking a move slot. Each move shows who in your party can learn it.
- **Livelier RotomDex flights.** Rotom now dives away into the screen mid-flight (shrinking, dimming and going a little hazy) and swoops back out to land. It leans back before it takes off, flutters as it flies, carries a little past its spot before settling, and no two flights are quite the same. Short hops curve less, and it floats gently while it waits. Hopping between Pokémon is quicker, and the RotomDex window opens and closes faster. The scan window opens and closes almost twice as fast again, and starts opening just before Rotom lands so the two arrive together.
- The starter screen no longer moves the tapped Pokémon to a big slot with its stats beside it; the RotomDex scan replaces that.
- Status moves like Will-O-Wisp and Thunder Wave say "no damage" instead of "0% of Attack".
- **Moves rebuilt for 2-move Pokémon.** Signature moves are now their own kind of move: learned by leveling and never taught. Most are shared within a type (Ember, Flamethrower, Surf, Earthquake…), and 26 standout Pokémon have one of their own: Charizard's Blast Burn, Raichu's Volt Tackle, Jigglypuff's Sing, Persian's Pay Day (bonus coins), Ditto's Transform, Magikarp's Splash, Mewtwo's Psystrike and more. The Move Tutor teaches everything else.
- The RotomDex's Moves tab says which Pokémon can be taught each move, and marks unique signatures.
- The RotomDex shows each line as how it evolves, with each Pokémon once and no star levels. Eevee's eight evolutions sit in a grid, and a Pokémon whose signature move changes as it levels lists each one.
- Rotom's flight into the RotomDex is now a short hop and shallow dip, matching its way back (which dips a little less), and opening and closing are 10% quicker.
- Rotom now perches on the RotomDex window's top edge near the left corner, a little bigger, with the window's border rising in a bump to meet it; the window opens out from it. Tap Rotom to close the RotomDex.
- Every Pokémon now knows just 2 moves: its signature move and one move taught at a Move Tutor (it was 2 taught moves). Teaching a Pokémon a new move replaces the one it was taught before. Trainers' and gym leaders' Pokémon follow the same rule.

### Removed
- Caterpie, Rattata, Spearow, Ekans, Nidoran♀, Nidoran♂, Zubat and Paras, and their evolutions, are gone, to match the planned roster.

## 0.3.0 (2026-10-02)

- Wild Pokémon join with 0 EXP instead of a random head start.
- Scroll bars are hidden; pages and lists still scroll as before.
- Starters now know just their signature move. Wild Pokémon usually do too, with a chance of a second move that grows on later maps (10% on map 1, up to about 60% on map 8). Trainers' Pokémon know a second move only when the Pokémon of yours they mirror does.
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
