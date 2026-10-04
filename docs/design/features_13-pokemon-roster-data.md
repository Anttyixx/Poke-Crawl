---
title: Pokémon Roster Data — Levels, Roles, Signatures, Abilities, Moves, Move Pools, PP
status: draft content pass 6 — numbers are placeholders, ready to rebalance
---

# Pokémon Roster Data

> **Now in the game (0.4.0).** All 78 lines below are in `data/data.json`, which is the source of truth from here on; this doc is the original design pass. Since then: a Pokémon knows **2 moves** (signature + 1 taught), signatures are a separate kind of move (shared by type, never taught, with 26 unique ones for standout Pokémon), the move list was rebuilt around that, Scyther can also become Kleavor, and real legendaries appear on Legendary nodes. Annihilape is left out until it has a sprite (PokéSprite stops at Gen 8). Regional forms and their evolutions (Sirfetch'd, Mr. Rime, Perrserker) are left out.

Status: 🟡 draft content, unblocks prototyping — see [00-index.md](00-index.md) and [open-questions.md](open-questions.md). Rules for learning and the Move Tutor are in [11-moves.md](11-moves.md). Visual reference: the **Pokédex** artifact, generated from the same data.

Species-level data for all of Gen 1 plus the other members of those families (babies like Pichu and Happiny, later evolutions like Crobat, Scizor and the Eeveelutions): 78 evolution lines, 183 species. Megas, Gigantamax and regional forms are left out. Everything numeric is a first pass meant to be rebalanced.

## Rules this data assumes

**Single type.** Every Pokémon has exactly one type. A line can change type as it evolves (Seel → Dewgong becomes Ice, Onix → Steelix becomes Steel, each Eeveelution takes its own type), and type pools follow the current species.

**Legendary and mythical Pokémon** (Articuno, Zapdos, Moltres, Mewtwo, Mew) are single-stage lines with a 15% stat boost (20% for Mewtwo). They come from Legendary nodes, not wild nodes.

**Branching lines** split on the item the Pokémon is holding when it levels: Gloom (Leaf Stone / Sun Stone), Poliwhirl (Water Stone / King's Rock), Slowpoke (no item / King's Rock), Tyrogue (Power Anklet / Band / Belt) and Eevee (Water, Thunder, Fire, Sun, Moon, Leaf, Ice or Shiny Stone). Without the item, a Pokémon at a stone split just levels in place.

**Levels are stars, ★1 to ★3.** Leveling up evolves the Pokémon if it has a next stage; if it doesn't, it keeps its species and just gets stronger. A three-stage line is one species per star (Bulbasaur ★1 → Ivysaur ★2 → Venusaur ★3); a two-stage line evolves once and then levels in place (Rattata ★1 → Raticate ★2 → Raticate ★3).

**The one split is Oddish.** Gloom ★2 → ★3 branches: holding a **Leaf Stone** it becomes **Vileplume**, holding a **Sun Stone** it becomes **Bellossom**.

**A Pokémon knows 4 moves:** its **signature** plus **3 taught at the Move Tutor**.

**The signature is the only move learned by leveling, and it's replaced at every level.** ★1 signatures are plain shared moves. ★2 signatures are upgrades, sometimes unique. **★3 signatures are always unique** to their line and appear in no pool.

**Every move has a star rating**, and a Pokémon can only be taught moves at or below its own level. Moves it already knows stay when it levels up.

**Damage is a percentage of the user's Attack:** damage = Attack × power% × type multiplier × modifiers, rounded. Heals are a percentage of the target's max HP.

**The signature move is the default; a taught move has a chance.** Each action, a Pokémon uses its taught move on a roll of that move's chance, and its signature otherwise (see 04). The move lists below still say "PP" (the old system): for tutor moves, 8 PP became a 25% chance, 6 → 20%, 4 → 15%, 2 → 10%; signature moves no longer have a number.

**Every Pokémon has one ability**, shared by its whole line.

**Stats** grow by level: roughly ×1.55 HP and ×1.5 Attack at ★2, ×2.2 HP and ×2.1 Attack at ★3; Speed grows more slowly (×1.2, ×1.4).

## How the data is organised

Two separate lists, each with one job:

1. **The master move list** says what every move *is and does*: type, shape, power, PP, star, effect. It says nothing about who learns it.
2. **Move pools** say *who learns what*. A pool is a named list of moves plus a **rule** for which Pokémon qualify. A Pokémon can be taught every move in every pool it qualifies for (minus its own signatures, filtered by star).

```
move pool:  { id: "grass",  rule: { type: grass },          moves: [vineWhip, absorb, growth, megaDrain, …] }
move pool:  { id: "swift",  rule: { stat: spd, min: 40 },   moves: [quickAttack, agility, aerialAce, …] }
move pool:  { id: "universal", rule: { all: true },         moves: [tackle, defenseCurl, helpingHand, …] }
```

Rule kinds so far:

- **all** — every Pokémon (the Universal pool).
- **type** — every Pokémon of that type.
- **stat** — every line whose **★1** stat meets a bar. It checks ★1 stats so a line's pools never change as it levels.

More rule kinds can be added later without touching the move list: ability, body shape, habitat, evolution stage, or an explicit list of lines for one-off cases.

- **Adding a move:** add it to the master list, then drop its id into whichever pools should teach it.
- **Adding a Pokémon:** give it a type and stats. It joins its type pool and any stat pools automatically.
- **A move can sit in more than one pool** (Metronome and Wish are in both Normal and Fairy; Rock Throw is in Power and Sturdy).
- **"Move pool" is a working name.** Alternatives if it needs something in-world: *disciplines*, *schools*, *training styles*.

The build that generates this doc and the Pokédex checks the rules: every move in a pool exists, every move is reachable somewhere, every ★3 signature is unique, every ★1 signature is a shared move, and no signature is above its level.

## Role tags

Categorisation only: **no effect on gameplay.** Each species has a **primary** role (what it excels at) and a **secondary** role (what it's decent at). Tags are per species, so a line can shift as it evolves (Gloom becomes a Blaster as Vileplume or a Striker as Bellossom). They're meant for authoring: deciding which moves a Pokémon should get (so random Pokémon don't get healing moves), and later for building trainer teams.

There's no physical/special split in this game (Attack is the only damage stat), so the damage roles split by **shape** instead: Striker for single targets, Blaster for areas.

| Role | What it means | Primary | Secondary |
|---|---|---|---|
| **Striker** | Heavy single-target damage. Wants high Attack and big single hits. | 47 | 38 |
| **Blaster** | Area damage: splash, full-row, back-row and field moves. | 28 | 23 |
| **Speedster** | Acts early and often. Quick moves, repeat hits, Speed buffs. | 27 | 33 |
| **Tank** | Soaks hits in the front row. High HP, damage reduction. | 36 | 31 |
| **Healer** | Restores HP to teammates. | 8 | 10 |
| **Support** | Buffs teammates' Attack or Speed; useful from the back row. | 6 | 9 |
| **Disruptor** | Wears enemies down: Speed drops, Attack drops, drains and damage over time. | 18 | 26 |
| **All-Rounder** | Balanced, no standout strength or weakness. Adapts to whatever it's taught. | 13 | 13 |

## Type chart (defending types in this roster)

| Defending type | Weak to (2×) | Resists (0.5×) | Immune to (0×) |
|---|---|---|---|
| Normal | Fighting | — | Ghost |
| Fire | Water, Ground, Rock | Fire, Grass, Ice, Bug, Steel, Fairy | — |
| Water | Electric, Grass | Fire, Water, Ice, Steel | — |
| Grass | Fire, Ice, Poison, Flying, Bug | Water, Electric, Grass, Ground | — |
| Electric | Ground | Electric, Flying, Steel | — |
| Ice | Fire, Fighting, Rock, Steel | Ice | — |
| Fighting | Flying, Psychic, Fairy | Bug, Rock, Dark | — |
| Poison | Ground, Psychic | Grass, Fighting, Poison, Bug, Fairy | — |
| Ground | Water, Grass, Ice | Poison, Rock | Electric |
| Flying | Electric, Ice, Rock | Grass, Fighting, Bug | Ground |
| Psychic | Bug, Ghost, Dark | Fighting, Psychic | — |
| Bug | Fire, Flying, Rock | Grass, Fighting, Ground | — |
| Rock | Water, Grass, Fighting, Ground, Steel | Normal, Fire, Poison, Flying | — |
| Ghost | Ghost, Dark | Poison, Bug | Normal, Fighting |
| Dragon | Ice, Dragon, Fairy | Fire, Water, Grass, Electric | — |
| Dark | Fighting, Bug, Fairy | Ghost, Dark | Psychic |
| Steel | Fire, Fighting, Ground | Normal, Grass, Ice, Flying, Psychic, Bug, Rock, Dragon, Steel, Fairy | Poison |
| Fairy | Poison, Steel | Fighting, Bug, Dark | Dragon |

All 18 types now appear on at least one species.

## Move pools

| Pool | Who qualifies | Lines in it | Moves |
|---|---|---|---|
| **Universal** | every Pokémon | all 19 | 7 |
| **Normal** | type is Normal | Rattata, Spearow, Igglybuff, Meowth, Lickitung, Happiny, Kangaskhan, Tauros, Ditto, Eevee, Porygon, Munchlax | 15 |
| **Fire** | type is Fire | Charmander, Vulpix, Growlithe, Ponyta, Magby, Eevee, Moltres | 8 |
| **Water** | type is Water | Squirtle, Psyduck, Poliwag, Tentacool, Seel, Shellder, Krabby, Horsea, Goldeen, Staryu, Magikarp, Eevee | 8 |
| **Grass** | type is Grass | Bulbasaur, Oddish, Paras, Bellsprout, Exeggcute, Tangela, Eevee | 13 |
| **Electric** | type is Electric | Pichu, Magnemite, Voltorb, Elekid, Eevee, Zapdos | 8 |
| **Poison** | type is Poison | Weedle, Ekans, Nidoran♀, Nidoran♂, Zubat, Grimer, Koffing | 9 |
| **Ground** | type is Ground | Sandshrew, Diglett, Cubone, Rhyhorn | 9 |
| **Bug** | type is Bug | Caterpie, Venonat, Scyther, Pinsir | 8 |
| **Flying** | type is Flying | Pidgey, Farfetch'd, Doduo | 10 |
| **Fairy** | type is Fairy | Cleffa, Eevee | 8 |
| **Swift** | ★1 SPD ≥ 40 | Caterpie, Pidgey, Rattata, Pichu, Vulpix, Zubat, Diglett, Meowth, Abra, Tentacool, Ponyta, Doduo, Gastly, Voltorb, Staryu, Smoochum, Elekid, Aerodactyl, Zapdos, Mewtwo | 6 |
| **Power** | ★1 ATK ≥ 32 | Charmander, Weedle, Rattata, Spearow, Ekans, Sandshrew, Nidoran♂, Paras, Diglett, Psyduck, Mankey, Growlithe, Abra, Machop, Bellsprout, Geodude, Ponyta, Magnemite, Farfetch'd, Doduo, Shellder, Gastly, Krabby, Exeggcute, Tyrogue, Rhyhorn, Kangaskhan, Horsea, Goldeen, Scyther, Smoochum, Elekid, Magby, Pinsir, Tauros, Magikarp, Porygon, Omanyte, Kabuto, Aerodactyl, Moltres, Dratini, Mewtwo | 14 |
| **Sturdy** | ★1 HP ≥ 70 | Bulbasaur, Squirtle, Sandshrew, Nidoran♀, Cleffa, Igglybuff, Geodude, Slowpoke, Seel, Grimer, Drowzee, Lickitung, Koffing, Rhyhorn, Happiny, Tangela, Lapras, Munchlax, Articuno | 11 |
| **Fighting** | type is Fighting | Mankey, Machop, Tyrogue | 10 |
| **Psychic** | type is Psychic | Abra, Slowpoke, Drowzee, Mime Jr., Eevee, Mewtwo, Mew | 10 |
| **Rock** | type is Rock | Geodude, Onix, Omanyte, Kabuto, Aerodactyl | 8 |
| **Ice** | type is Ice | Seel, Shellder, Smoochum, Lapras, Eevee, Articuno | 7 |
| **Ghost** | type is Ghost | Gastly | 9 |
| **Dragon** | type is Dragon | Horsea, Dratini | 6 |
| **Steel** | type is Steel | Magnemite, Onix, Scyther | 5 |
| **Dark** | type is Dark | Eevee | 10 |

### Universal pool

Qualifies: every Pokémon. 

- ★: Tackle, Defense Curl, Helping Hand, Focus Energy
- ★★: Headbutt, Swift
- ★★★: Hyper Beam

### Normal pool

Qualifies: type is Normal. Currently: Rattata, Spearow, Igglybuff, Meowth, Lickitung, Happiny, Kangaskhan, Tauros, Ditto, Eevee, Porygon, Munchlax.

- ★: Scratch, Double Slap, Rage, Fury Swipes, Leer
- ★★: Body Slam, Metronome, Wish, Slam, Horn Attack, Soft-Boiled
- ★★★: Hyper Voice, Super Fang, Mega Kick, Sing

### Fire pool

Qualifies: type is Fire. Currently: Charmander, Vulpix, Growlithe, Ponyta, Magby, Eevee, Moltres.

- ★: Ember, Flame Charge
- ★★: Flame Wheel, Fire Spin, Fire Fang, Fire Punch
- ★★★: Flamethrower, Fire Blast

### Water pool

Qualifies: type is Water. Currently: Squirtle, Psyduck, Poliwag, Tentacool, Seel, Shellder, Krabby, Horsea, Goldeen, Staryu, Magikarp, Eevee.

- ★: Water Gun, Bubble, Aqua Jet
- ★★: Water Pulse, Bubble Beam, Aqua Ring
- ★★★: Surf, Hydro Pump

### Grass pool

Qualifies: type is Grass. Currently: Bulbasaur, Oddish, Paras, Bellsprout, Exeggcute, Tangela, Eevee.

- ★: Vine Whip, Absorb, Growth
- ★★: Mega Drain, Razor Leaf, Seed Bomb, Petal Blizzard, Spore Bomb, Leech Seed
- ★★★: Giga Drain, Solar Beam, Petal Dance, Aromatherapy

### Electric pool

Qualifies: type is Electric. Currently: Pichu, Magnemite, Voltorb, Elekid, Eevee, Zapdos.

- ★: Thunder Shock, Nuzzle, Charge
- ★★: Spark, Discharge, Thunder Punch
- ★★★: Thunderbolt, Thunder

### Poison pool

Qualifies: type is Poison. Currently: Weedle, Ekans, Nidoran♀, Nidoran♂, Zubat, Grimer, Koffing.

- ★: Poison Sting, Smog, Poison Tail
- ★★: Acid, Poison Jab, Poison Fang, Venoshock, Sludge
- ★★★: Sludge Bomb

### Ground pool

Qualifies: type is Ground. Currently: Sandshrew, Diglett, Cubone, Rhyhorn.

- ★: Mud-Slap, Mud Shot, Sand Attack
- ★★: Bulldoze, Dig, Bone Club
- ★★★: Earthquake, Earth Power, Bonemerang

### Bug pool

Qualifies: type is Bug. Currently: Caterpie, Venonat, Scyther, Pinsir.

- ★: Bug Bite, String Shot, Fury Cutter, Leech Life
- ★★: Signal Beam, Pin Missile
- ★★★: X-Scissor, Megahorn

### Flying pool

Qualifies: type is Flying. Currently: Pidgey, Farfetch'd, Doduo.

- ★: Gust, Peck
- ★★: Wing Attack, Air Slash, Aerial Ace, Roost
- ★★★: Brave Bird, Hurricane, Drill Peck, Tailwind

### Fairy pool

Qualifies: type is Fairy. Currently: Cleffa, Eevee.

- ★: Fairy Wind, Disarming Voice
- ★★: Draining Kiss, Moonlight, Wish, Metronome
- ★★★: Moonblast, Dazzling Gleam

### Swift pool

Qualifies: ★1 SPD ≥ 40. Currently: Caterpie, Pidgey, Rattata, Pichu, Vulpix, Zubat, Diglett, Meowth, Abra, Tentacool, Ponyta, Doduo, Gastly, Voltorb, Staryu, Smoochum, Elekid, Aerodactyl, Zapdos, Mewtwo.

- ★: Quick Attack, Agility
- ★★: Aerial Ace, Double Kick
- ★★★: Tailwind, Extreme Speed

### Power pool

Qualifies: ★1 ATK ≥ 32. Currently: Charmander, Weedle, Rattata, Spearow, Ekans, Sandshrew, Nidoran♂, Paras, Diglett, Psyduck, Mankey, Growlithe, Abra, Machop, Bellsprout, Geodude, Ponyta, Magnemite, Farfetch'd, Doduo, Shellder, Gastly, Krabby, Exeggcute, Tyrogue, Rhyhorn, Kangaskhan, Horsea, Goldeen, Scyther, Smoochum, Elekid, Magby, Pinsir, Tauros, Magikarp, Porygon, Omanyte, Kabuto, Aerodactyl, Moltres, Dratini, Mewtwo.

- ★: Karate Chop, Rock Throw
- ★★: Bite, Brick Break, Rock Tomb, Take Down, Fire Punch, Thunder Punch, Ice Punch
- ★★★: Swords Dance, Iron Tail, Dragon Claw, Double-Edge, Mega Kick

### Sturdy pool

Qualifies: ★1 HP ≥ 70. Currently: Bulbasaur, Squirtle, Sandshrew, Nidoran♀, Cleffa, Igglybuff, Geodude, Slowpoke, Seel, Grimer, Drowzee, Lickitung, Koffing, Rhyhorn, Happiny, Tangela, Lapras, Munchlax, Articuno.

- ★: Harden, Rock Throw
- ★★: Rollout, Reflect, Heal Pulse, Rest, Icy Wind, Confusion, Amnesia, Iron Defense
- ★★★: Body Press

### Fighting pool

Qualifies: type is Fighting. Currently: Mankey, Machop, Tyrogue.

- ★: Low Kick, Karate Chop, Rock Smash
- ★★: Double Kick, Brick Break, Submission, Mach Punch, Bulk Up
- ★★★: Cross Chop, Close Combat

### Psychic pool

Qualifies: type is Psychic. Currently: Abra, Slowpoke, Drowzee, Mime Jr., Eevee, Mewtwo, Mew.

- ★: Psywave, Agility
- ★★: Confusion, Psybeam, Calm Mind, Reflect, Amnesia, Rest
- ★★★: Psychic, Future Sight

### Rock pool

Qualifies: type is Rock. Currently: Geodude, Onix, Omanyte, Kabuto, Aerodactyl.

- ★: Rock Throw, Sand Attack
- ★★: Rock Tomb, Rollout, Rock Slide, Iron Defense
- ★★★: Ancient Power, Stone Edge

### Ice pool

Qualifies: type is Ice. Currently: Seel, Shellder, Smoochum, Lapras, Eevee, Articuno.

- ★: Powder Snow, Ice Shard
- ★★: Icy Wind, Aurora Beam, Ice Punch
- ★★★: Ice Beam, Blizzard

### Ghost pool

Qualifies: type is Ghost. Currently: Gastly.

- ★: Lick, Astonish, Pursuit
- ★★: Night Shade, Hex, Nasty Plot
- ★★★: Shadow Ball, Dark Pulse, Foul Play

### Dragon pool

Qualifies: type is Dragon. Currently: Horsea, Dratini.

- ★: Twister, Leer, Agility
- ★★: Dragon Breath
- ★★★: Dragon Claw, Outrage

### Steel pool

Qualifies: type is Steel. Currently: Magnemite, Onix, Scyther.

- ★: Metal Claw
- ★★: Steel Wing, Iron Defense
- ★★★: Iron Tail, Flash Cannon

### Dark pool

Qualifies: type is Dark. Currently: Eevee.

- ★: Pursuit, Feint Attack, Astonish
- ★★: Bite, Night Shade, Crunch, Nasty Plot
- ★★★: Dark Pulse, Foul Play, Shadow Ball

## Per-line data

### 1. Bulbasaur line — Grass

**Ability — Overgrow:** Below 33% HP, its Grass moves deal 50% more damage.

**Move pools:** Universal, Grass, Sturdy (★1 stats HP 74 · ATK 27 · SPD 22)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Bulbasaur | Grass | **All-Rounder** / Tank | 74 | 27 | 22 | Vine Whip |
| ★★ | Ivysaur | Grass | **Tank** / Disruptor | 115 | 40 | 26 | Razor Leaf |
| ★★★ | Venusaur | Grass | **Tank** / Blaster | 163 | 57 | 31 | Frenzy Plant ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Vine Whip** (Bulbasaur) — Grass · Single · 45% ATK · 8 PP.
- **★★ Razor Leaf** (Ivysaur) — Grass · Pierce · 25% ATK ×2 · 6 PP.
- **★★★ ◆ Frenzy Plant** (Venusaur) — Grass · Full front row · 75% ATK · 4 PP.

**Can be taught: 29 moves** (from its pools, minus its own signatures):

- ★ (8): Absorb, Defense Curl, Focus Energy, Growth, Harden, Helping Hand, Rock Throw, Tackle
- ★★ (15): Amnesia, Confusion, Headbutt, Heal Pulse, Icy Wind, Iron Defense, Leech Seed, Mega Drain, Petal Blizzard, Reflect, Rest, Rollout, Seed Bomb, Spore Bomb, Swift
- ★★★ (6): Aromatherapy, Body Press, Giga Drain, Hyper Beam, Petal Dance, Solar Beam

### 2. Charmander line — Fire

**Ability — Blaze:** Below 33% HP, its Fire moves deal 50% more damage.

**Move pools:** Universal, Fire, Power (★1 stats HP 52 · ATK 39 · SPD 34)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Charmander | Fire | **Striker** / Speedster | 52 | 39 | 34 | Ember |
| ★★ | Charmeleon | Fire | **Striker** / Blaster | 81 | 58 | 41 | Flame Wheel |
| ★★★ | Charizard | Fire | **Striker** / Blaster | 114 | 82 | 48 | Blast Burn ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Ember** (Charmander) — Fire · Single · 45% ATK · 8 PP.
- **★★ Flame Wheel** (Charmeleon) — Fire · Pierce · 50% ATK · 6 PP.
- **★★★ ◆ Blast Burn** (Charizard) — Fire · Single · 150% ATK · 4 PP. The user skips its next action to recharge.

**Can be taught: 26 moves** (from its pools, minus its own signatures):

- ★ (7): Defense Curl, Flame Charge, Focus Energy, Helping Hand, Karate Chop, Rock Throw, Tackle
- ★★ (11): Bite, Brick Break, Fire Fang, Fire Punch, Fire Spin, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (8): Double-Edge, Dragon Claw, Fire Blast, Flamethrower, Hyper Beam, Iron Tail, Mega Kick, Swords Dance

### 3. Squirtle line — Water

**Ability — Torrent:** Below 33% HP, its Water moves deal 50% more damage.

**Move pools:** Universal, Water, Sturdy (★1 stats HP 72 · ATK 28 · SPD 24)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Squirtle | Water | **Tank** / All-Rounder | 72 | 28 | 24 | Water Gun |
| ★★ | Wartortle | Water | **Tank** / Striker | 112 | 42 | 29 | Aqua Tail ◆ |
| ★★★ | Blastoise | Water | **Tank** / Blaster | 158 | 59 | 34 | Hydro Cannon ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Water Gun** (Squirtle) — Water · Single · 45% ATK · 8 PP.
- **★★ ◆ Aqua Tail** (Wartortle) — Water · Pierce · 60% ATK · 6 PP.
- **★★★ ◆ Hydro Cannon** (Blastoise) — Water · Pierce · 100% ATK · 4 PP.

**Can be taught: 25 moves** (from its pools, minus its own signatures):

- ★ (8): Aqua Jet, Bubble, Defense Curl, Focus Energy, Harden, Helping Hand, Rock Throw, Tackle
- ★★ (13): Amnesia, Aqua Ring, Bubble Beam, Confusion, Headbutt, Heal Pulse, Icy Wind, Iron Defense, Reflect, Rest, Rollout, Swift, Water Pulse
- ★★★ (4): Body Press, Hydro Pump, Hyper Beam, Surf

### 4. Caterpie line — Bug

**Ability — Compound Eyes:** Its repeat-hit moves always land the maximum number of hits.

**Move pools:** Universal, Bug, Swift (★1 stats HP 54 · ATK 26 · SPD 45)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Caterpie | Bug | **Speedster** / Disruptor | 54 | 26 | 45 | Bug Bite |
| ★★ | Metapod | Bug | **Tank** / Support | 84 | 39 | 54 | Harden |
| ★★★ | Butterfree | Bug | **Support** / Disruptor | 119 | 55 | 63 | Quiver Wind ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Bug Bite** (Caterpie) — Bug · Single · 40% ATK · 8 PP.
- **★★ Harden** (Metapod) — Normal · Support · Self · 6 PP. The next 2 hits on the user deal 50% less damage.
- **★★★ ◆ Quiver Wind** (Butterfree) — Bug · Support · Whole team · 4 PP. Whole team gains 25% Speed and 15% Attack for the battle.

**Can be taught: 20 moves** (from its pools, minus its own signatures):

- ★ (9): Agility, Defense Curl, Focus Energy, Fury Cutter, Helping Hand, Leech Life, Quick Attack, String Shot, Tackle
- ★★ (6): Aerial Ace, Double Kick, Headbutt, Pin Missile, Signal Beam, Swift
- ★★★ (5): Extreme Speed, Hyper Beam, Megahorn, Tailwind, X-Scissor

### 5. Weedle line — Poison

**Ability — Poison Point:** When hit by a Single or Pierce move, 30% chance the attacker loses 8% of its max HP.

**Move pools:** Universal, Poison, Power (★1 stats HP 50 · ATK 40 · SPD 34)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Weedle | Poison | **Striker** / Disruptor | 50 | 40 | 34 | Poison Sting |
| ★★ | Kakuna | Poison | **Tank** / Disruptor | 78 | 60 | 41 | Harden |
| ★★★ | Beedrill | Poison | **Striker** / Speedster | 110 | 84 | 48 | Twin Lance ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Poison Sting** (Weedle) — Poison · Single · 20% ATK ×2 · 8 PP.
- **★★ Harden** (Kakuna) — Normal · Support · Self · 6 PP. The next 2 hits on the user deal 50% less damage.
- **★★★ ◆ Twin Lance** (Beedrill) — Poison · Pierce · 50% ATK ×2 · 6 PP.

**Can be taught: 29 moves** (from its pools, minus its own signatures):

- ★ (8): Defense Curl, Focus Energy, Helping Hand, Karate Chop, Poison Tail, Rock Throw, Smog, Tackle
- ★★ (14): Acid, Bite, Brick Break, Fire Punch, Headbutt, Ice Punch, Poison Fang, Poison Jab, Rock Tomb, Sludge, Swift, Take Down, Thunder Punch, Venoshock
- ★★★ (7): Double-Edge, Dragon Claw, Hyper Beam, Iron Tail, Mega Kick, Sludge Bomb, Swords Dance

### 6. Pidgey line — Flying

**Ability — Gale Wings:** At full HP, its first action of each battle happens before anyone else acts.

**Move pools:** Universal, Flying, Swift (★1 stats HP 52 · ATK 30 · SPD 47)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Pidgey | Flying | **Speedster** / Striker | 52 | 30 | 47 | Gust |
| ★★ | Pidgeotto | Flying | **Speedster** / Striker | 81 | 45 | 56 | Wing Attack |
| ★★★ | Pidgeot | Flying | **Striker** / Speedster | 114 | 63 | 66 | Skyward Dive ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Gust** (Pidgey) — Flying · Single · 45% ATK · 8 PP.
- **★★ Wing Attack** (Pidgeotto) — Flying · Pierce · 50% ATK · 6 PP.
- **★★★ ◆ Skyward Dive** (Pidgeot) — Flying · Single · 130% ATK · 4 PP. Ignores Reflect and Defense Curl-style damage reduction.

**Can be taught: 19 moves** (from its pools, minus its own signatures):

- ★ (7): Agility, Defense Curl, Focus Energy, Helping Hand, Peck, Quick Attack, Tackle
- ★★ (6): Aerial Ace, Air Slash, Double Kick, Headbutt, Roost, Swift
- ★★★ (6): Brave Bird, Drill Peck, Extreme Speed, Hurricane, Hyper Beam, Tailwind

### 7. Rattata line — Normal

**Ability — Guts:** Once below 50% HP, gains 30% Attack for the rest of the battle.

**Move pools:** Universal, Normal, Swift, Power (★1 stats HP 50 · ATK 32 · SPD 49)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Rattata | Normal | **Speedster** / Striker | 50 | 32 | 49 | Quick Attack |
| ★★ | Raticate | Normal | **Striker** / Speedster | 78 | 48 | 59 | Hyper Fang ◆ |
| ★★★ | Raticate | Normal | **Striker** / Speedster | 110 | 67 | 69 | Crushing Fang ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Quick Attack** (Rattata) — Normal · Single · 35% ATK · 8 PP. On the first round of a battle, acts before anyone without Quick Attack.
- **★★ ◆ Hyper Fang** (Raticate) — Normal · Single · 75% ATK · 6 PP.
- **★★★ ◆ Crushing Fang** (Raticate) — Normal · Single · 60% ATK ×2 · 6 PP.

**Can be taught: 40 moves** (from its pools, minus its own signatures):

- ★ (12): Agility, Defense Curl, Double Slap, Focus Energy, Fury Swipes, Helping Hand, Karate Chop, Leer, Rage, Rock Throw, Scratch, Tackle
- ★★ (17): Aerial Ace, Bite, Body Slam, Brick Break, Double Kick, Fire Punch, Headbutt, Horn Attack, Ice Punch, Metronome, Rock Tomb, Slam, Soft-Boiled, Swift, Take Down, Thunder Punch, Wish
- ★★★ (11): Double-Edge, Dragon Claw, Extreme Speed, Hyper Beam, Hyper Voice, Iron Tail, Mega Kick, Sing, Super Fang, Swords Dance, Tailwind

### 8. Spearow line — Normal

**Ability — Sniper:** Its super-effective hits deal 2.5× damage instead of 2×.

**Move pools:** Universal, Normal, Power (★1 stats HP 52 · ATK 40 · SPD 36)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Spearow | Normal | **Striker** / Speedster | 52 | 40 | 36 | Peck |
| ★★ | Fearow | Normal | **Striker** / Blaster | 81 | 60 | 43 | Fury Attack ◆ |
| ★★★ | Fearow | Normal | **Striker** / Blaster | 114 | 84 | 50 | Skewer Dive ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Peck** (Spearow) — Flying · Single · 40% ATK · 8 PP.
- **★★ ◆ Fury Attack** (Fearow) — Normal · Single · 15% ATK ×2-5 · 6 PP.
- **★★★ ◆ Skewer Dive** (Fearow) — Normal · Pierce · 100% ATK · 4 PP.

**Can be taught: 35 moves** (from its pools, minus its own signatures):

- ★ (11): Defense Curl, Double Slap, Focus Energy, Fury Swipes, Helping Hand, Karate Chop, Leer, Rage, Rock Throw, Scratch, Tackle
- ★★ (15): Bite, Body Slam, Brick Break, Fire Punch, Headbutt, Horn Attack, Ice Punch, Metronome, Rock Tomb, Slam, Soft-Boiled, Swift, Take Down, Thunder Punch, Wish
- ★★★ (9): Double-Edge, Dragon Claw, Hyper Beam, Hyper Voice, Iron Tail, Mega Kick, Sing, Super Fang, Swords Dance

### 9. Ekans line — Poison

**Ability — Intimidate:** At the start of each battle, the enemy directly across from it loses 15% Attack.

**Move pools:** Universal, Poison, Power (★1 stats HP 64 · ATK 32 · SPD 28)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Ekans | Poison | **Disruptor** / Striker | 64 | 32 | 28 | Poison Sting |
| ★★ | Arbok | Poison | **Disruptor** / Blaster | 99 | 48 | 34 | Acid |
| ★★★ | Arbok | Poison | **Disruptor** / Blaster | 141 | 67 | 39 | Gunk Shot ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Poison Sting** (Ekans) — Poison · Single · 20% ATK ×2 · 8 PP.
- **★★ Acid** (Arbok) — Poison · Splash · 35% ATK · 6 PP.
- **★★★ ◆ Gunk Shot** (Arbok) — Poison · Splash · 90% ATK · 4 PP.

**Can be taught: 28 moves** (from its pools, minus its own signatures):

- ★ (8): Defense Curl, Focus Energy, Helping Hand, Karate Chop, Poison Tail, Rock Throw, Smog, Tackle
- ★★ (13): Bite, Brick Break, Fire Punch, Headbutt, Ice Punch, Poison Fang, Poison Jab, Rock Tomb, Sludge, Swift, Take Down, Thunder Punch, Venoshock
- ★★★ (7): Double-Edge, Dragon Claw, Hyper Beam, Iron Tail, Mega Kick, Sludge Bomb, Swords Dance

### 10. Pichu line — Electric

**Ability — Static:** When hit by a Single or Pierce move, 30% chance the attacker loses 20% Speed for the battle.

**Move pools:** Universal, Electric, Swift (★1 stats HP 50 · ATK 31 · SPD 51)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Pichu | Electric | **Speedster** / Disruptor | 50 | 31 | 51 | Thunder Shock |
| ★★ | Pikachu | Electric | **Speedster** / Striker | 78 | 46 | 61 | Electro Ball ◆ |
| ★★★ | Raichu | Electric | **Striker** / Speedster | 110 | 65 | 71 | Volt Tackle ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Thunder Shock** (Pichu) — Electric · Single · 45% ATK · 8 PP.
- **★★ ◆ Electro Ball** (Pikachu) — Electric · Single · 50% ATK · 6 PP. +25% power for every 10 Speed the user has over the target (max 120%).
- **★★★ ◆ Volt Tackle** (Raichu) — Electric · Single · 150% ATK · 4 PP. User takes 20% of the damage dealt.

**Can be taught: 20 moves** (from its pools, minus its own signatures):

- ★ (8): Agility, Charge, Defense Curl, Focus Energy, Helping Hand, Nuzzle, Quick Attack, Tackle
- ★★ (7): Aerial Ace, Discharge, Double Kick, Headbutt, Spark, Swift, Thunder Punch
- ★★★ (5): Extreme Speed, Hyper Beam, Tailwind, Thunder, Thunderbolt

### 11. Sandshrew line — Ground

**Ability — Sand Veil:** 15% chance to take no damage from any hit.

**Move pools:** Universal, Ground, Power, Sturdy (★1 stats HP 70 · ATK 32 · SPD 24)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Sandshrew | Ground | **Tank** / Striker | 70 | 32 | 24 | Mud-Slap |
| ★★ | Sandslash | Ground | **Striker** / Tank | 108 | 48 | 29 | Dig |
| ★★★ | Sandslash | Ground | **Striker** / Tank | 154 | 67 | 34 | Fissure Claw ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Mud-Slap** (Sandshrew) — Ground · Single · 40% ATK · 8 PP. Target loses 10% Speed for the battle.
- **★★ Dig** (Sandslash) — Ground · Back row · 55% ATK · 4 PP.
- **★★★ ◆ Fissure Claw** (Sandslash) — Ground · Splash · 85% ATK · 4 PP.

**Can be taught: 38 moves** (from its pools, minus its own signatures):

- ★ (9): Defense Curl, Focus Energy, Harden, Helping Hand, Karate Chop, Mud Shot, Rock Throw, Sand Attack, Tackle
- ★★ (19): Amnesia, Bite, Bone Club, Brick Break, Bulldoze, Confusion, Fire Punch, Headbutt, Heal Pulse, Ice Punch, Icy Wind, Iron Defense, Reflect, Rest, Rock Tomb, Rollout, Swift, Take Down, Thunder Punch
- ★★★ (10): Body Press, Bonemerang, Double-Edge, Dragon Claw, Earth Power, Earthquake, Hyper Beam, Iron Tail, Mega Kick, Swords Dance

### 12. Nidoran♀ line — Poison

**Ability — Solid Rock:** Super-effective hits against it deal 25% less damage.

**Move pools:** Universal, Poison, Sturdy (★1 stats HP 76 · ATK 28 · SPD 22)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Nidoran♀ | Poison | **Tank** / Support | 76 | 28 | 22 | Scratch |
| ★★ | Nidorina | Poison | **Tank** / Healer | 118 | 42 | 26 | Double Kick |
| ★★★ | Nidoqueen | Poison | **Tank** / Blaster | 167 | 59 | 31 | Sludge Wave ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Scratch** (Nidoran♀) — Normal · Single · 40% ATK · 10 PP.
- **★★ Double Kick** (Nidorina) — Fighting · Single · 30% ATK ×2 · 6 PP.
- **★★★ ◆ Sludge Wave** (Nidoqueen) — Poison · Full front row · 80% ATK · 4 PP.

**Can be taught: 27 moves** (from its pools, minus its own signatures):

- ★ (9): Defense Curl, Focus Energy, Harden, Helping Hand, Poison Sting, Poison Tail, Rock Throw, Smog, Tackle
- ★★ (15): Acid, Amnesia, Confusion, Headbutt, Heal Pulse, Icy Wind, Iron Defense, Poison Fang, Poison Jab, Reflect, Rest, Rollout, Sludge, Swift, Venoshock
- ★★★ (3): Body Press, Hyper Beam, Sludge Bomb

### 13. Nidoran♂ line — Poison

**Ability — Sheer Force:** Its moves deal 25% more damage, but their extra effects never trigger.

**Move pools:** Universal, Poison, Power (★1 stats HP 54 · ATK 40 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Nidoran♂ | Poison | **Striker** / Disruptor | 54 | 40 | 30 | Peck |
| ★★ | Nidorino | Poison | **Striker** / Speedster | 84 | 60 | 36 | Poison Jab |
| ★★★ | Nidoking | Poison | **Striker** / Blaster | 119 | 84 | 42 | Horn Drill ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Peck** (Nidoran♂) — Flying · Single · 40% ATK · 8 PP.
- **★★ Poison Jab** (Nidorino) — Poison · Pierce · 55% ATK · 4 PP.
- **★★★ ◆ Horn Drill** (Nidoking) — Poison · Pierce · 110% ATK · 4 PP.

**Can be taught: 29 moves** (from its pools, minus its own signatures):

- ★ (9): Defense Curl, Focus Energy, Helping Hand, Karate Chop, Poison Sting, Poison Tail, Rock Throw, Smog, Tackle
- ★★ (13): Acid, Bite, Brick Break, Fire Punch, Headbutt, Ice Punch, Poison Fang, Rock Tomb, Sludge, Swift, Take Down, Thunder Punch, Venoshock
- ★★★ (7): Double-Edge, Dragon Claw, Hyper Beam, Iron Tail, Mega Kick, Sludge Bomb, Swords Dance

### 14. Cleffa line — Fairy

**Ability — Magic Guard:** Only takes damage from direct hits: immune to recoil, Life Orb, Rocky Helmet and Leech Seed.

**Move pools:** Universal, Fairy, Sturdy (★1 stats HP 86 · ATK 24 · SPD 22)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Cleffa | Fairy | **Healer** / Support | 86 | 24 | 22 | Fairy Wind |
| ★★ | Clefairy | Fairy | **Healer** / Support | 133 | 36 | 26 | Moonlight Mend ◆ |
| ★★★ | Clefable | Fairy | **Healer** / Tank | 189 | 50 | 31 | Lunar Blessing ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Fairy Wind** (Cleffa) — Fairy · Single · 40% ATK · 8 PP.
- **★★ ◆ Moonlight Mend** (Clefairy) — Fairy · Support · Lowest-HP teammate · 6 PP. Heals the lowest-HP teammate 30% of its max HP.
- **★★★ ◆ Lunar Blessing** (Clefable) — Fairy · Support · Whole team · 4 PP. Heals every teammate 30% of its max HP.

**Can be taught: 25 moves** (from its pools, minus its own signatures):

- ★ (7): Defense Curl, Disarming Voice, Focus Energy, Harden, Helping Hand, Rock Throw, Tackle
- ★★ (14): Amnesia, Confusion, Draining Kiss, Headbutt, Heal Pulse, Icy Wind, Iron Defense, Metronome, Moonlight, Reflect, Rest, Rollout, Swift, Wish
- ★★★ (4): Body Press, Dazzling Gleam, Hyper Beam, Moonblast

### 15. Vulpix line — Fire

**Ability — Flash Fire:** Immune to Fire moves. After being hit by one, its own Fire moves deal 50% more damage.

**Move pools:** Universal, Fire, Swift (★1 stats HP 52 · ATK 30 · SPD 45)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Vulpix | Fire | **Speedster** / Blaster | 52 | 30 | 45 | Ember |
| ★★ | Ninetales | Fire | **Blaster** / Speedster | 81 | 45 | 54 | Fox Fire ◆ |
| ★★★ | Ninetales | Fire | **Blaster** / Speedster | 114 | 63 | 63 | Nine-Tail Blaze ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Ember** (Vulpix) — Fire · Single · 45% ATK · 8 PP.
- **★★ ◆ Fox Fire** (Ninetales) — Fire · Splash · 50% ATK · 6 PP.
- **★★★ ◆ Nine-Tail Blaze** (Ninetales) — Fire · Full front row · 85% ATK · 4 PP.

**Can be taught: 20 moves** (from its pools, minus its own signatures):

- ★ (7): Agility, Defense Curl, Flame Charge, Focus Energy, Helping Hand, Quick Attack, Tackle
- ★★ (8): Aerial Ace, Double Kick, Fire Fang, Fire Punch, Fire Spin, Flame Wheel, Headbutt, Swift
- ★★★ (5): Extreme Speed, Fire Blast, Flamethrower, Hyper Beam, Tailwind

### 16. Igglybuff line — Normal

**Ability — Friend Guard:** Teammates in the lanes beside it, in the same row, take 15% less damage.

**Move pools:** Universal, Normal, Sturdy (★1 stats HP 90 · ATK 22 · SPD 20)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Igglybuff | Normal | **Tank** / Support | 90 | 22 | 20 | Tackle |
| ★★ | Jigglypuff | Normal | **Healer** / Tank | 140 | 33 | 24 | Lullaby ◆ |
| ★★★ | Wigglytuff | Normal | **Support** / Healer | 198 | 46 | 28 | Round Chorus ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Tackle** (Igglybuff) — Normal · Single · 40% ATK · 10 PP.
- **★★ ◆ Lullaby** (Jigglypuff) — Normal · Support · Own front row · 6 PP. Heals the own front row 15% of max HP each.
- **★★★ ◆ Round Chorus** (Wigglytuff) — Normal · Support · Whole team · 4 PP. Heals every teammate 20% of max HP and gives them 15% Attack for the battle.

**Can be taught: 32 moves** (from its pools, minus its own signatures):

- ★ (10): Defense Curl, Double Slap, Focus Energy, Fury Swipes, Harden, Helping Hand, Leer, Rage, Rock Throw, Scratch
- ★★ (16): Amnesia, Body Slam, Confusion, Headbutt, Heal Pulse, Horn Attack, Icy Wind, Iron Defense, Metronome, Reflect, Rest, Rollout, Slam, Soft-Boiled, Swift, Wish
- ★★★ (6): Body Press, Hyper Beam, Hyper Voice, Mega Kick, Sing, Super Fang

### 17. Zubat line — Poison

**Ability — Infiltrator:** Its moves ignore Reflect, Harden and Defense Curl-style damage reduction.

**Move pools:** Universal, Poison, Swift (★1 stats HP 50 · ATK 28 · SPD 51)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Zubat | Poison | **Speedster** / Disruptor | 50 | 28 | 51 | Leech Life |
| ★★ | Golbat | Poison | **Speedster** / Striker | 78 | 42 | 61 | Bite |
| ★★★ | Crobat | Poison | **Speedster** / Striker | 110 | 59 | 71 | Cross Poison ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Leech Life** (Zubat) — Bug · Single · 45% ATK · 6 PP. User heals 50% of the damage dealt.
- **★★ Bite** (Golbat) — Dark · Single · 60% ATK · 6 PP.
- **★★★ ◆ Cross Poison** (Crobat) — Poison · Pierce · 55% ATK ×2 · 6 PP.

**Can be taught: 22 moves** (from its pools, minus its own signatures):

- ★ (9): Agility, Defense Curl, Focus Energy, Helping Hand, Poison Sting, Poison Tail, Quick Attack, Smog, Tackle
- ★★ (9): Acid, Aerial Ace, Double Kick, Headbutt, Poison Fang, Poison Jab, Sludge, Swift, Venoshock
- ★★★ (4): Extreme Speed, Hyper Beam, Sludge Bomb, Tailwind

### 18. Oddish line — Grass

**Ability — Chlorophyll:** Gains 25% Speed for the first 2 rounds of every battle.

**Move pools:** Universal, Grass (★1 stats HP 60 · ATK 30 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Oddish | Grass | **All-Rounder** / Disruptor | 60 | 30 | 30 | Absorb |
| ★★ | Gloom | Grass | **Disruptor** / Healer | 93 | 45 | 36 | Mega Drain |
| ★★★ | Vileplume (Leaf Stone) | Grass | **Blaster** / Tank | 158 | 55 | 31 | Toxic Bloom ◆ |
| ★★★ | Bellossom (Sun Stone) | Grass | **Striker** / Speedster | 110 | 59 | 63 | Sun Dance Kick ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Absorb** (Oddish) — Grass · Single · 35% ATK · 8 PP. User heals 50% of the damage dealt.
- **★★ Mega Drain** (Gloom) — Grass · Single · 50% ATK · 6 PP. User heals 50% of the damage dealt.
- **★★★ ◆ Toxic Bloom** (Vileplume) — Grass · Full front row · 80% ATK · 4 PP. Hits count as Poison type if that's more effective.
- **★★★ ◆ Sun Dance Kick** (Bellossom) — Grass · Single · 140% ATK · 4 PP.

**Can be taught: 18 moves** (from its pools, minus its own signatures):

- ★ (6): Defense Curl, Focus Energy, Growth, Helping Hand, Tackle, Vine Whip
- ★★ (7): Headbutt, Leech Seed, Petal Blizzard, Razor Leaf, Seed Bomb, Spore Bomb, Swift
- ★★★ (5): Aromatherapy, Giga Drain, Hyper Beam, Petal Dance, Solar Beam

### 19. Paras line — Grass

**Ability — Effect Spore:** When hit by a Single or Pierce move, 30% chance the attacker loses 15% Attack for the battle.

**Move pools:** Universal, Grass, Power (★1 stats HP 62 · ATK 34 · SPD 26)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Paras | Grass | **Disruptor** / Tank | 62 | 34 | 26 | Scratch |
| ★★ | Parasect | Grass | **Disruptor** / Blaster | 96 | 51 | 31 | Spore Burst ◆ |
| ★★★ | Parasect | Grass | **Disruptor** / Blaster | 136 | 71 | 36 | Fungal Bloom ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Scratch** (Paras) — Normal · Single · 40% ATK · 10 PP.
- **★★ ◆ Spore Burst** (Parasect) — Grass · Splash · 55% ATK · 6 PP.
- **★★★ ◆ Fungal Bloom** (Parasect) — Grass · Back row · 85% ATK · 4 PP.

**Can be taught: 34 moves** (from its pools, minus its own signatures):

- ★ (9): Absorb, Defense Curl, Focus Energy, Growth, Helping Hand, Karate Chop, Rock Throw, Tackle, Vine Whip
- ★★ (15): Bite, Brick Break, Fire Punch, Headbutt, Ice Punch, Leech Seed, Mega Drain, Petal Blizzard, Razor Leaf, Rock Tomb, Seed Bomb, Spore Bomb, Swift, Take Down, Thunder Punch
- ★★★ (10): Aromatherapy, Double-Edge, Dragon Claw, Giga Drain, Hyper Beam, Iron Tail, Mega Kick, Petal Dance, Solar Beam, Swords Dance

### 20. Venonat line — Bug

**Ability — Tinted Lens:** Its not-very-effective hits deal normal damage.

**Move pools:** Universal, Bug (★1 stats HP 54 · ATK 28 · SPD 39)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Venonat | Bug | **Disruptor** / Speedster | 54 | 28 | 39 | Leech Life |
| ★★ | Venomoth | Bug | **Blaster** / Disruptor | 84 | 42 | 47 | Psybeam |
| ★★★ | Venomoth | Bug | **Blaster** / Disruptor | 119 | 59 | 55 | Moonlit Scales ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Leech Life** (Venonat) — Bug · Single · 45% ATK · 6 PP. User heals 50% of the damage dealt.
- **★★ Psybeam** (Venomoth) — Psychic · Pierce · 45% ATK · 6 PP.
- **★★★ ◆ Moonlit Scales** (Venomoth) — Bug · Full front row · 70% ATK · 4 PP. Targets lose 10% Speed for the battle.

**Can be taught: 14 moves** (from its pools, minus its own signatures):

- ★ (7): Bug Bite, Defense Curl, Focus Energy, Fury Cutter, Helping Hand, String Shot, Tackle
- ★★ (4): Headbutt, Pin Missile, Signal Beam, Swift
- ★★★ (3): Hyper Beam, Megahorn, X-Scissor

### 21. Diglett line — Ground

**Ability — Arena Trap:** Enemies in the lane directly across can't be moved by compaction.

**Move pools:** Universal, Ground, Swift, Power (★1 stats HP 44 · ATK 32 · SPD 53)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Diglett | Ground | **Speedster** / Striker | 44 | 32 | 53 | Sand Attack |
| ★★ | Dugtrio | Ground | **Striker** / Speedster | 68 | 48 | 64 | Dig |
| ★★★ | Dugtrio | Ground | **Striker** / Speedster | 97 | 67 | 74 | Triple Burrow ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Sand Attack** (Diglett) — Ground · Single · 20% ATK · 8 PP. Target's next hit misses entirely.
- **★★ Dig** (Dugtrio) — Ground · Back row · 55% ATK · 4 PP.
- **★★★ ◆ Triple Burrow** (Dugtrio) — Ground · Single · 40% ATK ×3 · 6 PP.

**Can be taught: 34 moves** (from its pools, minus its own signatures):

- ★ (10): Agility, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Mud Shot, Mud-Slap, Quick Attack, Rock Throw, Tackle
- ★★ (13): Aerial Ace, Bite, Bone Club, Brick Break, Bulldoze, Double Kick, Fire Punch, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (11): Bonemerang, Double-Edge, Dragon Claw, Earth Power, Earthquake, Extreme Speed, Hyper Beam, Iron Tail, Mega Kick, Swords Dance, Tailwind

### 22. Meowth line — Normal

**Ability — Pickup:** Earns 10% more currency from battles it takes part in. Doesn't affect battle.

**Move pools:** Universal, Normal, Swift (★1 stats HP 50 · ATK 28 · SPD 49)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Meowth | Normal | **Speedster** / Disruptor | 50 | 28 | 49 | Scratch |
| ★★ | Persian | Normal | **Speedster** / Striker | 78 | 42 | 59 | Feint Attack |
| ★★★ | Persian | Normal | **Speedster** / Striker | 110 | 59 | 69 | Payday Slash ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Scratch** (Meowth) — Normal · Single · 40% ATK · 10 PP.
- **★★ Feint Attack** (Persian) — Dark · Single · 45% ATK · 8 PP. Ignores effects that dodge hits, like Sand Veil.
- **★★★ ◆ Payday Slash** (Persian) — Normal · Single · 90% ATK · 4 PP. Winning a battle with Persian on the field pays 20% more currency.

**Can be taught: 27 moves** (from its pools, minus its own signatures):

- ★ (10): Agility, Defense Curl, Double Slap, Focus Energy, Fury Swipes, Helping Hand, Leer, Quick Attack, Rage, Tackle
- ★★ (10): Aerial Ace, Body Slam, Double Kick, Headbutt, Horn Attack, Metronome, Slam, Soft-Boiled, Swift, Wish
- ★★★ (7): Extreme Speed, Hyper Beam, Hyper Voice, Mega Kick, Sing, Super Fang, Tailwind

### 23. Psyduck line — Water

**Ability — Cloud Nine:** Opponents' abilities that boost their own damage don't work while it's on the field.

**Move pools:** Universal, Water, Power (★1 stats HP 60 · ATK 32 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Psyduck | Water | **All-Rounder** / Disruptor | 60 | 32 | 30 | Water Gun |
| ★★ | Golduck | Water | **Blaster** / All-Rounder | 93 | 48 | 36 | Confusion |
| ★★★ | Golduck | Water | **Blaster** / All-Rounder | 132 | 67 | 42 | Headache Wave ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Water Gun** (Psyduck) — Water · Single · 45% ATK · 8 PP.
- **★★ Confusion** (Golduck) — Psychic · Single · 55% ATK · 4 PP.
- **★★★ ◆ Headache Wave** (Golduck) — Water · Splash · 70% ATK · 4 PP. Hits count as Psychic type if that's more effective.

**Can be taught: 28 moves** (from its pools, minus its own signatures):

- ★ (8): Aqua Jet, Bubble, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Rock Throw, Tackle
- ★★ (12): Aqua Ring, Bite, Brick Break, Bubble Beam, Fire Punch, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch, Water Pulse
- ★★★ (8): Double-Edge, Dragon Claw, Hydro Pump, Hyper Beam, Iron Tail, Mega Kick, Surf, Swords Dance

### 24. Mankey line — Fighting

**Ability — Anger Point:** After being hit by a super-effective move, gains 50% Attack for the battle.

**Move pools:** Universal, Power, Fighting (★1 stats HP 52 · ATK 40 · SPD 36)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Mankey | Fighting | **Striker** / Speedster | 52 | 40 | 36 | Low Kick |
| ★★ | Primeape | Fighting | **Striker** / Disruptor | 81 | 60 | 43 | Karate Chop |
| ★★★ | Primeape | Fighting | **Striker** / Disruptor | 114 | 84 | 50 | Rage Fist ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Low Kick** (Mankey) — Fighting · Single · 40% ATK · 8 PP.
- **★★ Karate Chop** (Primeape) — Fighting · Single · 45% ATK · 8 PP.
- **★★★ ◆ Rage Fist** (Primeape) — Fighting · Single · 70% ATK · 4 PP. +15% power for every hit Primeape has taken this battle (max +75%).

**Can be taught: 27 moves** (from its pools, minus its own signatures):

- ★ (6): Defense Curl, Focus Energy, Helping Hand, Rock Smash, Rock Throw, Tackle
- ★★ (13): Bite, Brick Break, Bulk Up, Double Kick, Fire Punch, Headbutt, Ice Punch, Mach Punch, Rock Tomb, Submission, Swift, Take Down, Thunder Punch
- ★★★ (8): Close Combat, Cross Chop, Double-Edge, Dragon Claw, Hyper Beam, Iron Tail, Mega Kick, Swords Dance

### 25. Growlithe line — Fire

**Ability — Intimidate:** At the start of each battle, the enemy directly across from it loses 15% Attack.

**Move pools:** Universal, Fire, Power (★1 stats HP 56 · ATK 40 · SPD 32)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Growlithe | Fire | **Striker** / Tank | 56 | 40 | 32 | Ember |
| ★★ | Arcanine | Fire | **Striker** / Speedster | 87 | 60 | 38 | Fire Fang |
| ★★★ | Arcanine | Fire | **Striker** / Speedster | 123 | 84 | 45 | Extreme Blaze ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Ember** (Growlithe) — Fire · Single · 45% ATK · 8 PP.
- **★★ Fire Fang** (Arcanine) — Fire · Single · 60% ATK · 6 PP.
- **★★★ ◆ Extreme Blaze** (Arcanine) — Fire · Single · 110% ATK · 4 PP. On the first round of a battle, acts before anyone without a first-round move.

**Can be taught: 26 moves** (from its pools, minus its own signatures):

- ★ (7): Defense Curl, Flame Charge, Focus Energy, Helping Hand, Karate Chop, Rock Throw, Tackle
- ★★ (11): Bite, Brick Break, Fire Punch, Fire Spin, Flame Wheel, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (8): Double-Edge, Dragon Claw, Fire Blast, Flamethrower, Hyper Beam, Iron Tail, Mega Kick, Swords Dance

### 26. Poliwag line — Water

**Ability — Water Absorb:** Immune to Water moves; heals 20% of its max HP when hit by one.

**Move pools:** Universal, Water (★1 stats HP 62 · ATK 30 · SPD 34)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Poliwag | Water | **Speedster** / All-Rounder | 62 | 30 | 34 | Bubble |
| ★★ | Poliwhirl | Water | **All-Rounder** / Striker | 96 | 45 | 41 | Bubble Beam |
| ★★★ | Poliwrath (Water Stone) | Water | **Striker** / Tank | 119 | 80 | 48 | Whirlpool Fist ◆ |
| ★★★ | Politoed (King's Rock) | Water | **Support** / Healer | 163 | 55 | 36 | Chorus Rain ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Bubble** (Poliwag) — Water · Splash · 20% ATK · 8 PP.
- **★★ Bubble Beam** (Poliwhirl) — Water · Pierce · 50% ATK · 6 PP.
- **★★★ ◆ Whirlpool Fist** (Poliwrath) — Fighting · Pierce · 95% ATK · 4 PP.
- **★★★ ◆ Chorus Rain** (Politoed) — Water · Support · Whole team · 4 PP. Whole team's Water moves deal 30% more damage for the next 3 rounds, and every teammate heals 10% max HP.

**Can be taught: 13 moves** (from its pools, minus its own signatures):

- ★ (6): Aqua Jet, Defense Curl, Focus Energy, Helping Hand, Tackle, Water Gun
- ★★ (4): Aqua Ring, Headbutt, Swift, Water Pulse
- ★★★ (3): Hydro Pump, Hyper Beam, Surf

### 27. Abra line — Psychic

**Ability — Synchronize:** When an enemy lowers its Attack or Speed, that enemy loses the same amount.

**Move pools:** Universal, Swift, Power, Psychic (★1 stats HP 46 · ATK 42 · SPD 40)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Abra | Psychic | **Speedster** / Blaster | 46 | 42 | 40 | Psywave |
| ★★ | Kadabra | Psychic | **Blaster** / Speedster | 71 | 63 | 48 | Psybeam |
| ★★★ | Alakazam | Psychic | **Blaster** / Speedster | 101 | 88 | 56 | Spoon Storm ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Psywave** (Abra) — Psychic · Single · 40% ATK · 8 PP.
- **★★ Psybeam** (Kadabra) — Psychic · Pierce · 45% ATK · 6 PP.
- **★★★ ◆ Spoon Storm** (Alakazam) — Psychic · Splash · 90% ATK · 4 PP.

**Can be taught: 34 moves** (from its pools, minus its own signatures):

- ★ (8): Agility, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Quick Attack, Rock Throw, Tackle
- ★★ (16): Aerial Ace, Amnesia, Bite, Brick Break, Calm Mind, Confusion, Double Kick, Fire Punch, Headbutt, Ice Punch, Reflect, Rest, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (10): Double-Edge, Dragon Claw, Extreme Speed, Future Sight, Hyper Beam, Iron Tail, Mega Kick, Psychic, Swords Dance, Tailwind

### 28. Machop line — Fighting

**Ability — No Guard:** Its hits ignore dodge effects, and so do hits against it.

**Move pools:** Universal, Power, Fighting (★1 stats HP 58 · ATK 42 · SPD 24)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Machop | Fighting | **Striker** / Tank | 58 | 42 | 24 | Karate Chop |
| ★★ | Machoke | Fighting | **Striker** / Tank | 90 | 63 | 29 | Submission |
| ★★★ | Machamp | Fighting | **Striker** / Tank | 128 | 88 | 34 | Four-Arm Barrage ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Karate Chop** (Machop) — Fighting · Single · 45% ATK · 8 PP.
- **★★ Submission** (Machoke) — Fighting · Single · 90% ATK · 4 PP. User takes 25% of the damage dealt.
- **★★★ ◆ Four-Arm Barrage** (Machamp) — Fighting · Single · 35% ATK ×4 · 4 PP.

**Can be taught: 27 moves** (from its pools, minus its own signatures):

- ★ (7): Defense Curl, Focus Energy, Helping Hand, Low Kick, Rock Smash, Rock Throw, Tackle
- ★★ (12): Bite, Brick Break, Bulk Up, Double Kick, Fire Punch, Headbutt, Ice Punch, Mach Punch, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (8): Close Combat, Cross Chop, Double-Edge, Dragon Claw, Hyper Beam, Iron Tail, Mega Kick, Swords Dance

### 29. Bellsprout line — Grass

**Ability — Gluttony:** Heals 15% of its max HP the first time it drops below 50% HP.

**Move pools:** Universal, Grass, Power (★1 stats HP 48 · ATK 42 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Bellsprout | Grass | **Striker** / Disruptor | 48 | 42 | 30 | Vine Whip |
| ★★ | Weepinbell | Grass | **Disruptor** / Striker | 74 | 63 | 36 | Sludge |
| ★★★ | Victreebel | Grass | **Striker** / Healer | 106 | 88 | 42 | Pitcher Plunge ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Vine Whip** (Bellsprout) — Grass · Single · 45% ATK · 8 PP.
- **★★ Sludge** (Weepinbell) — Poison · Splash · 45% ATK · 4 PP.
- **★★★ ◆ Pitcher Plunge** (Victreebel) — Grass · Single · 120% ATK · 4 PP. User heals 25% of the damage dealt.

**Can be taught: 33 moves** (from its pools, minus its own signatures):

- ★ (8): Absorb, Defense Curl, Focus Energy, Growth, Helping Hand, Karate Chop, Rock Throw, Tackle
- ★★ (15): Bite, Brick Break, Fire Punch, Headbutt, Ice Punch, Leech Seed, Mega Drain, Petal Blizzard, Razor Leaf, Rock Tomb, Seed Bomb, Spore Bomb, Swift, Take Down, Thunder Punch
- ★★★ (10): Aromatherapy, Double-Edge, Dragon Claw, Giga Drain, Hyper Beam, Iron Tail, Mega Kick, Petal Dance, Solar Beam, Swords Dance

### 30. Tentacool line — Water

**Ability — Clear Body:** Enemy effects can't lower its Attack or Speed.

**Move pools:** Universal, Water, Swift (★1 stats HP 54 · ATK 28 · SPD 45)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Tentacool | Water | **Disruptor** / Speedster | 54 | 28 | 45 | Poison Sting |
| ★★ | Tentacruel | Water | **Disruptor** / Blaster | 84 | 42 | 54 | Sludge |
| ★★★ | Tentacruel | Water | **Disruptor** / Blaster | 119 | 59 | 63 | Tentacle Web ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Poison Sting** (Tentacool) — Poison · Single · 20% ATK ×2 · 8 PP.
- **★★ Sludge** (Tentacruel) — Poison · Splash · 45% ATK · 4 PP.
- **★★★ ◆ Tentacle Web** (Tentacruel) — Water · Full front row · 60% ATK · 4 PP. Targets lose 5% max HP at the end of each of the next 2 rounds.

**Can be taught: 21 moves** (from its pools, minus its own signatures):

- ★ (9): Agility, Aqua Jet, Bubble, Defense Curl, Focus Energy, Helping Hand, Quick Attack, Tackle, Water Gun
- ★★ (7): Aerial Ace, Aqua Ring, Bubble Beam, Double Kick, Headbutt, Swift, Water Pulse
- ★★★ (5): Extreme Speed, Hydro Pump, Hyper Beam, Surf, Tailwind

### 31. Geodude line — Rock

**Ability — Sturdy:** At full HP, survives any single hit with at least 1 HP.

**Move pools:** Universal, Power, Sturdy, Rock (★1 stats HP 72 · ATK 34 · SPD 18)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Geodude | Rock | **Tank** / Striker | 72 | 34 | 18 | Rock Throw |
| ★★ | Graveler | Rock | **Tank** / Blaster | 112 | 51 | 22 | Rock Slide |
| ★★★ | Golem | Rock | **Blaster** / Tank | 158 | 71 | 25 | Boulder Crash ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Rock Throw** (Geodude) — Rock · Single · 45% ATK · 8 PP.
- **★★ Rock Slide** (Graveler) — Rock · Full front row · 45% ATK · 4 PP.
- **★★★ ◆ Boulder Crash** (Golem) — Rock · Splash · 100% ATK · 4 PP.

**Can be taught: 33 moves** (from its pools, minus its own signatures):

- ★ (7): Defense Curl, Focus Energy, Harden, Helping Hand, Karate Chop, Sand Attack, Tackle
- ★★ (17): Amnesia, Bite, Brick Break, Confusion, Fire Punch, Headbutt, Heal Pulse, Ice Punch, Icy Wind, Iron Defense, Reflect, Rest, Rock Tomb, Rollout, Swift, Take Down, Thunder Punch
- ★★★ (9): Ancient Power, Body Press, Double-Edge, Dragon Claw, Hyper Beam, Iron Tail, Mega Kick, Stone Edge, Swords Dance

### 32. Ponyta line — Fire

**Ability — Flame Body:** When hit by a Single or Pierce move, 30% chance the attacker loses 8% of its max HP.

**Move pools:** Universal, Fire, Swift, Power (★1 stats HP 50 · ATK 32 · SPD 49)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Ponyta | Fire | **Speedster** / Striker | 50 | 32 | 49 | Ember |
| ★★ | Rapidash | Fire | **Speedster** / Striker | 78 | 48 | 59 | Flame Charge |
| ★★★ | Rapidash | Fire | **Speedster** / Striker | 110 | 67 | 69 | Blazing Gallop ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Ember** (Ponyta) — Fire · Single · 45% ATK · 8 PP.
- **★★ Flame Charge** (Rapidash) — Fire · Single · 35% ATK · 8 PP. User gains 10% Speed for the battle.
- **★★★ ◆ Blazing Gallop** (Rapidash) — Fire · Pierce · 85% ATK · 4 PP. User gains 15% Speed for the battle.

**Can be taught: 32 moves** (from its pools, minus its own signatures):

- ★ (8): Agility, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Quick Attack, Rock Throw, Tackle
- ★★ (14): Aerial Ace, Bite, Brick Break, Double Kick, Fire Fang, Fire Punch, Fire Spin, Flame Wheel, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (10): Double-Edge, Dragon Claw, Extreme Speed, Fire Blast, Flamethrower, Hyper Beam, Iron Tail, Mega Kick, Swords Dance, Tailwind

### 33. Slowpoke line — Psychic

**Ability — Oblivious:** Can't have its Attack lowered, and ignores Speed drops.

**Move pools:** Universal, Sturdy, Psychic (★1 stats HP 86 · ATK 24 · SPD 16)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Slowpoke | Psychic | **Tank** / All-Rounder | 86 | 24 | 16 | Psywave |
| ★★ | Slowbro (Level up) | Psychic | **Tank** / Striker | 133 | 36 | 19 | Amnesia |
| ★★★ | Slowbro (Level up) | Psychic | **Tank** / Striker | 189 | 50 | 22 | Shell Slam ◆ |
| ★★ | Slowking (King's Rock) | Psychic | **Support** / Disruptor | 93 | 51 | 31 | Calm Mind |
| ★★★ | Slowking (King's Rock) | Psychic | **Support** / Disruptor | 132 | 71 | 36 | Royal Decree ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Psywave** (Slowpoke) — Psychic · Single · 40% ATK · 8 PP.
- **★★ Amnesia** (Slowbro) — Psychic · Support · Self · 4 PP. User takes 25% less damage for the rest of the battle, but loses 10% Speed.
- **★★★ ◆ Shell Slam** (Slowbro) — Psychic · Single · 100% ATK · 4 PP. User takes 25% less damage from the next hit.
- **★★ Calm Mind** (Slowking) — Psychic · Support · Self · 4 PP. User gains 20% Attack and 20% Speed for the battle.
- **★★★ ◆ Royal Decree** (Slowking) — Psychic · Support · Whole team · 4 PP. Whole team gains 20% Attack for the battle; the slowest enemy loses 20% Speed.

**Can be taught: 21 moves** (from its pools, minus its own signatures):

- ★ (7): Agility, Defense Curl, Focus Energy, Harden, Helping Hand, Rock Throw, Tackle
- ★★ (10): Confusion, Headbutt, Heal Pulse, Icy Wind, Iron Defense, Psybeam, Reflect, Rest, Rollout, Swift
- ★★★ (4): Body Press, Future Sight, Hyper Beam, Psychic

### 34. Magnemite line — Electric

**Ability — Magnet Pull:** Steel-type enemies can't be moved by compaction while it's on the field.

**Move pools:** Universal, Electric, Power, Steel (★1 stats HP 56 · ATK 36 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Magnemite | Electric | **Blaster** / Disruptor | 56 | 36 | 30 | Thunder Shock |
| ★★ | Magneton | Electric | **Blaster** / Tank | 87 | 54 | 36 | Spark |
| ★★★ | Magnezone | Steel | **Blaster** / Tank | 123 | 76 | 42 | Magnet Storm ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Thunder Shock** (Magnemite) — Electric · Single · 45% ATK · 8 PP.
- **★★ Spark** (Magneton) — Electric · Pierce · 50% ATK · 6 PP.
- **★★★ ◆ Magnet Storm** (Magnezone) — Electric · Full front row · 80% ATK · 4 PP. Double damage against Steel-type targets.

**Can be taught: 30 moves** (from its pools, minus its own signatures):

- ★ (9): Charge, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Metal Claw, Nuzzle, Rock Throw, Tackle
- ★★ (12): Bite, Brick Break, Discharge, Fire Punch, Headbutt, Ice Punch, Iron Defense, Rock Tomb, Steel Wing, Swift, Take Down, Thunder Punch
- ★★★ (9): Double-Edge, Dragon Claw, Flash Cannon, Hyper Beam, Iron Tail, Mega Kick, Swords Dance, Thunder, Thunderbolt

### 35. Farfetch'd — Flying

**Ability — Super Luck:** Its hits deal 25% more damage on the first round of a battle.

**Move pools:** Universal, Flying, Power (★1 stats HP 52 · ATK 38 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Farfetch'd | Flying | **Striker** / All-Rounder | 52 | 38 | 30 | Peck |
| ★★ | Farfetch'd | Flying | **Striker** / All-Rounder | 81 | 57 | 36 | Wing Attack |
| ★★★ | Farfetch'd | Flying | **Striker** / All-Rounder | 114 | 80 | 42 | Leek Blade ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Peck** (Farfetch'd) — Flying · Single · 40% ATK · 8 PP.
- **★★ Wing Attack** (Farfetch'd) — Flying · Pierce · 50% ATK · 6 PP.
- **★★★ ◆ Leek Blade** (Farfetch'd) — Flying · Single · 110% ATK · 4 PP. Ignores Reflect and Defense Curl-style damage reduction.

**Can be taught: 29 moves** (from its pools, minus its own signatures):

- ★ (7): Defense Curl, Focus Energy, Gust, Helping Hand, Karate Chop, Rock Throw, Tackle
- ★★ (12): Aerial Ace, Air Slash, Bite, Brick Break, Fire Punch, Headbutt, Ice Punch, Rock Tomb, Roost, Swift, Take Down, Thunder Punch
- ★★★ (10): Brave Bird, Double-Edge, Dragon Claw, Drill Peck, Hurricane, Hyper Beam, Iron Tail, Mega Kick, Swords Dance, Tailwind

### 36. Doduo line — Flying

**Ability — Early Bird:** Recovers from skipped actions one round sooner.

**Move pools:** Universal, Flying, Swift, Power (★1 stats HP 50 · ATK 34 · SPD 47)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Doduo | Flying | **Speedster** / Striker | 50 | 34 | 47 | Peck |
| ★★ | Dodrio | Flying | **Striker** / Speedster | 78 | 51 | 56 | Fury Swipes |
| ★★★ | Dodrio | Flying | **Striker** / Speedster | 110 | 71 | 66 | Tri Attack ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Peck** (Doduo) — Flying · Single · 40% ATK · 8 PP.
- **★★ Fury Swipes** (Dodrio) — Normal · Single · 15% ATK ×2-5 · 6 PP.
- **★★★ ◆ Tri Attack** (Dodrio) — Flying · Single · 35% ATK ×3 · 4 PP.

**Can be taught: 34 moves** (from its pools, minus its own signatures):

- ★ (9): Agility, Defense Curl, Focus Energy, Gust, Helping Hand, Karate Chop, Quick Attack, Rock Throw, Tackle
- ★★ (14): Aerial Ace, Air Slash, Bite, Brick Break, Double Kick, Fire Punch, Headbutt, Ice Punch, Rock Tomb, Roost, Swift, Take Down, Thunder Punch, Wing Attack
- ★★★ (11): Brave Bird, Double-Edge, Dragon Claw, Drill Peck, Extreme Speed, Hurricane, Hyper Beam, Iron Tail, Mega Kick, Swords Dance, Tailwind

### 37. Seel line — Water

**Ability — Thick Fat:** Takes 50% less damage from Fire and Ice moves.

**Move pools:** Universal, Water, Sturdy, Ice (★1 stats HP 76 · ATK 26 · SPD 22)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Seel | Water | **Tank** / All-Rounder | 76 | 26 | 22 | Water Gun |
| ★★ | Dewgong | Ice | **Tank** / Blaster | 118 | 39 | 26 | Aurora Beam |
| ★★★ | Dewgong | Ice | **Tank** / Blaster | 167 | 55 | 31 | Glacial Crash ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Water Gun** (Seel) — Water · Single · 45% ATK · 8 PP.
- **★★ Aurora Beam** (Dewgong) — Ice · Pierce · 55% ATK · 4 PP. Targets lose 10% Attack for the battle.
- **★★★ ◆ Glacial Crash** (Dewgong) — Ice · Splash · 90% ATK · 4 PP.

**Can be taught: 30 moves** (from its pools, minus its own signatures):

- ★ (10): Aqua Jet, Bubble, Defense Curl, Focus Energy, Harden, Helping Hand, Ice Shard, Powder Snow, Rock Throw, Tackle
- ★★ (14): Amnesia, Aqua Ring, Bubble Beam, Confusion, Headbutt, Heal Pulse, Ice Punch, Icy Wind, Iron Defense, Reflect, Rest, Rollout, Swift, Water Pulse
- ★★★ (6): Blizzard, Body Press, Hydro Pump, Hyper Beam, Ice Beam, Surf

### 38. Grimer line — Poison

**Ability — Stench:** Enemies in the lane directly across lose 10% Speed at the start of battle.

**Move pools:** Universal, Poison, Sturdy (★1 stats HP 80 · ATK 28 · SPD 18)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Grimer | Poison | **Disruptor** / Tank | 80 | 28 | 18 | Poison Sting |
| ★★ | Muk | Poison | **Disruptor** / Tank | 124 | 42 | 22 | Sludge |
| ★★★ | Muk | Poison | **Disruptor** / Tank | 176 | 59 | 25 | Toxic Flood ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Poison Sting** (Grimer) — Poison · Single · 20% ATK ×2 · 8 PP.
- **★★ Sludge** (Muk) — Poison · Splash · 45% ATK · 4 PP.
- **★★★ ◆ Toxic Flood** (Muk) — Poison · Full field · 55% ATK · 4 PP. Targets lose 5% max HP at the end of each of the next 2 rounds.

**Can be taught: 25 moves** (from its pools, minus its own signatures):

- ★ (8): Defense Curl, Focus Energy, Harden, Helping Hand, Poison Tail, Rock Throw, Smog, Tackle
- ★★ (14): Acid, Amnesia, Confusion, Headbutt, Heal Pulse, Icy Wind, Iron Defense, Poison Fang, Poison Jab, Reflect, Rest, Rollout, Swift, Venoshock
- ★★★ (3): Body Press, Hyper Beam, Sludge Bomb

### 39. Shellder line — Water

**Ability — Skill Link:** Its repeat-hit moves always land the maximum number of hits.

**Move pools:** Universal, Water, Power, Ice (★1 stats HP 66 · ATK 32 · SPD 22)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Shellder | Water | **Tank** / Striker | 66 | 32 | 22 | Powder Snow |
| ★★ | Cloyster | Ice | **Striker** / Tank | 102 | 48 | 26 | Icy Wind |
| ★★★ | Cloyster | Ice | **Striker** / Tank | 145 | 67 | 31 | Icicle Spears ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Powder Snow** (Shellder) — Ice · Splash · 25% ATK · 8 PP.
- **★★ Icy Wind** (Cloyster) — Ice · Full front row · 35% ATK · 4 PP. Targets lose 10% Speed for the battle.
- **★★★ ◆ Icicle Spears** (Cloyster) — Ice · Single · 25% ATK ×2-5 · 4 PP.

**Can be taught: 33 moves** (from its pools, minus its own signatures):

- ★ (10): Aqua Jet, Bubble, Defense Curl, Focus Energy, Helping Hand, Ice Shard, Karate Chop, Rock Throw, Tackle, Water Gun
- ★★ (13): Aqua Ring, Aurora Beam, Bite, Brick Break, Bubble Beam, Fire Punch, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch, Water Pulse
- ★★★ (10): Blizzard, Double-Edge, Dragon Claw, Hydro Pump, Hyper Beam, Ice Beam, Iron Tail, Mega Kick, Surf, Swords Dance

### 40. Gastly line — Ghost

**Ability — Levitate:** Immune to Ground moves.

**Move pools:** Universal, Swift, Power, Ghost (★1 stats HP 44 · ATK 34 · SPD 47)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Gastly | Ghost | **Disruptor** / Speedster | 44 | 34 | 47 | Lick |
| ★★ | Haunter | Ghost | **Disruptor** / Striker | 68 | 51 | 56 | Hex |
| ★★★ | Gengar | Ghost | **Blaster** / Disruptor | 97 | 71 | 66 | Phantom Grin ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Lick** (Gastly) — Ghost · Single · 30% ATK · 8 PP. Target loses 10% Speed for the battle.
- **★★ Hex** (Haunter) — Ghost · Single · 50% ATK · 4 PP. Double power if the target is already losing HP each round.
- **★★★ ◆ Phantom Grin** (Gengar) — Ghost · Splash · 90% ATK · 4 PP. Double power against targets already losing HP each round.

**Can be taught: 34 moves** (from its pools, minus its own signatures):

- ★ (10): Agility, Astonish, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Pursuit, Quick Attack, Rock Throw, Tackle
- ★★ (13): Aerial Ace, Bite, Brick Break, Double Kick, Fire Punch, Headbutt, Ice Punch, Nasty Plot, Night Shade, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (11): Dark Pulse, Double-Edge, Dragon Claw, Extreme Speed, Foul Play, Hyper Beam, Iron Tail, Mega Kick, Shadow Ball, Swords Dance, Tailwind

### 41. Onix line — Rock

**Ability — Rock Head:** Takes no recoil damage from its own moves.

**Move pools:** Universal, Rock, Steel (★1 stats HP 68 · ATK 26 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Onix | Rock | **Tank** / Speedster | 68 | 26 | 30 | Rock Throw |
| ★★ | Steelix | Steel | **Tank** / Striker | 105 | 39 | 36 | Iron Defense |
| ★★★ | Steelix | Steel | **Tank** / Striker | 150 | 55 | 42 | Iron Serpent ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Rock Throw** (Onix) — Rock · Single · 45% ATK · 8 PP.
- **★★ Iron Defense** (Steelix) — Steel · Support · Self · 4 PP. The next 3 hits on the user deal 40% less damage.
- **★★★ ◆ Iron Serpent** (Steelix) — Steel · Pierce · 100% ATK · 4 PP.

**Can be taught: 17 moves** (from its pools, minus its own signatures):

- ★ (6): Defense Curl, Focus Energy, Helping Hand, Metal Claw, Sand Attack, Tackle
- ★★ (6): Headbutt, Rock Slide, Rock Tomb, Rollout, Steel Wing, Swift
- ★★★ (5): Ancient Power, Flash Cannon, Hyper Beam, Iron Tail, Stone Edge

### 42. Drowzee line — Psychic

**Ability — Insomnia:** Can't be made to skip actions by enemy moves.

**Move pools:** Universal, Sturdy, Psychic (★1 stats HP 72 · ATK 26 · SPD 22)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Drowzee | Psychic | **Disruptor** / Tank | 72 | 26 | 22 | Psywave |
| ★★ | Hypno | Psychic | **Disruptor** / Healer | 112 | 39 | 26 | Hex |
| ★★★ | Hypno | Psychic | **Disruptor** / Healer | 158 | 55 | 31 | Dream Eater ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Psywave** (Drowzee) — Psychic · Single · 40% ATK · 8 PP.
- **★★ Hex** (Hypno) — Ghost · Single · 50% ATK · 4 PP. Double power if the target is already losing HP each round.
- **★★★ ◆ Dream Eater** (Hypno) — Psychic · Single · 90% ATK · 4 PP. User heals 50% of the damage dealt.

**Can be taught: 23 moves** (from its pools, minus its own signatures):

- ★ (7): Agility, Defense Curl, Focus Energy, Harden, Helping Hand, Rock Throw, Tackle
- ★★ (12): Amnesia, Calm Mind, Confusion, Headbutt, Heal Pulse, Icy Wind, Iron Defense, Psybeam, Reflect, Rest, Rollout, Swift
- ★★★ (4): Body Press, Future Sight, Hyper Beam, Psychic

### 43. Krabby line — Water

**Ability — Hyper Cutter:** Enemy effects can't lower its Attack.

**Move pools:** Universal, Water, Power (★1 stats HP 48 · ATK 46 · SPD 28)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Krabby | Water | **Striker** / Tank | 48 | 46 | 28 | Bubble |
| ★★ | Kingler | Water | **Striker** / Tank | 74 | 69 | 34 | Metal Claw |
| ★★★ | Kingler | Water | **Striker** / Tank | 106 | 97 | 39 | Crabhammer ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Bubble** (Krabby) — Water · Splash · 20% ATK · 8 PP.
- **★★ Metal Claw** (Kingler) — Steel · Single · 40% ATK · 8 PP. User gains 5% Attack for the battle.
- **★★★ ◆ Crabhammer** (Kingler) — Water · Single · 120% ATK · 4 PP.

**Can be taught: 28 moves** (from its pools, minus its own signatures):

- ★ (8): Aqua Jet, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Rock Throw, Tackle, Water Gun
- ★★ (12): Aqua Ring, Bite, Brick Break, Bubble Beam, Fire Punch, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch, Water Pulse
- ★★★ (8): Double-Edge, Dragon Claw, Hydro Pump, Hyper Beam, Iron Tail, Mega Kick, Surf, Swords Dance

### 44. Voltorb line — Electric

**Ability — Aftermath:** When knocked out by a Single or Pierce move, the attacker loses 20% of its max HP.

**Move pools:** Universal, Electric, Swift (★1 stats HP 46 · ATK 26 · SPD 57)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Voltorb | Electric | **Speedster** / Blaster | 46 | 26 | 57 | Thunder Shock |
| ★★ | Electrode | Electric | **Speedster** / Blaster | 71 | 39 | 68 | Spark |
| ★★★ | Electrode | Electric | **Speedster** / Blaster | 101 | 55 | 80 | Self-Destruct ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Thunder Shock** (Voltorb) — Electric · Single · 45% ATK · 8 PP.
- **★★ Spark** (Electrode) — Electric · Pierce · 50% ATK · 6 PP.
- **★★★ ◆ Self-Destruct** (Electrode) — Electric · Full field · 160% ATK · 2 PP. The user faints after using it.

**Can be taught: 19 moves** (from its pools, minus its own signatures):

- ★ (8): Agility, Charge, Defense Curl, Focus Energy, Helping Hand, Nuzzle, Quick Attack, Tackle
- ★★ (6): Aerial Ace, Discharge, Double Kick, Headbutt, Swift, Thunder Punch
- ★★★ (5): Extreme Speed, Hyper Beam, Tailwind, Thunder, Thunderbolt

### 45. Exeggcute line — Grass

**Ability — Harvest:** Every other round, heals 8% of its max HP.

**Move pools:** Universal, Grass, Power (★1 stats HP 64 · ATK 34 · SPD 24)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Exeggcute | Grass | **All-Rounder** / Healer | 64 | 34 | 24 | Absorb |
| ★★ | Exeggutor | Grass | **Blaster** / Healer | 99 | 51 | 29 | Confusion |
| ★★★ | Exeggutor | Grass | **Blaster** / Healer | 141 | 71 | 34 | Egg Barrage ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Absorb** (Exeggcute) — Grass · Single · 35% ATK · 8 PP. User heals 50% of the damage dealt.
- **★★ Confusion** (Exeggutor) — Psychic · Single · 55% ATK · 4 PP.
- **★★★ ◆ Egg Barrage** (Exeggutor) — Grass · Full front row · 80% ATK · 4 PP.

**Can be taught: 33 moves** (from its pools, minus its own signatures):

- ★ (8): Defense Curl, Focus Energy, Growth, Helping Hand, Karate Chop, Rock Throw, Tackle, Vine Whip
- ★★ (15): Bite, Brick Break, Fire Punch, Headbutt, Ice Punch, Leech Seed, Mega Drain, Petal Blizzard, Razor Leaf, Rock Tomb, Seed Bomb, Spore Bomb, Swift, Take Down, Thunder Punch
- ★★★ (10): Aromatherapy, Double-Edge, Dragon Claw, Giga Drain, Hyper Beam, Iron Tail, Mega Kick, Petal Dance, Solar Beam, Swords Dance

### 46. Cubone line — Ground

**Ability — Lightning Rod:** Draws enemy Electric Single moves aimed at its row to itself and takes no damage from them.

**Move pools:** Universal, Ground (★1 stats HP 68 · ATK 30 · SPD 22)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Cubone | Ground | **Tank** / Striker | 68 | 30 | 22 | Mud-Slap |
| ★★ | Marowak | Ground | **Striker** / Tank | 105 | 45 | 26 | Bone Club |
| ★★★ | Marowak | Ground | **Striker** / Tank | 150 | 63 | 31 | Bone Rush ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Mud-Slap** (Cubone) — Ground · Single · 40% ATK · 8 PP. Target loses 10% Speed for the battle.
- **★★ Bone Club** (Marowak) — Ground · Single · 60% ATK · 6 PP.
- **★★★ ◆ Bone Rush** (Marowak) — Ground · Single · 30% ATK ×3-5 · 4 PP.

**Can be taught: 14 moves** (from its pools, minus its own signatures):

- ★ (6): Defense Curl, Focus Energy, Helping Hand, Mud Shot, Sand Attack, Tackle
- ★★ (4): Bulldoze, Dig, Headbutt, Swift
- ★★★ (4): Bonemerang, Earth Power, Earthquake, Hyper Beam

### 47. Tyrogue line — Fighting

**Ability — Steadfast:** Gains 10% Speed each time it's hit (max +40%).

**Move pools:** Universal, Power, Fighting (★1 stats HP 52 · ATK 38 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Tyrogue | Fighting | **All-Rounder** / Striker | 52 | 38 | 30 | Rock Smash |
| ★★ | Hitmonlee (Power Anklet) | Fighting | **Striker** / Speedster | 81 | 57 | 36 | Double Kick |
| ★★★ | Hitmonlee (Power Anklet) | Fighting | **Striker** / Speedster | 114 | 80 | 42 | High Jump Kick ◆ |
| ★★ | Hitmonchan (Power Band) | Fighting | **Striker** / All-Rounder | 93 | 45 | 36 | Mach Punch |
| ★★★ | Hitmonchan (Power Band) | Fighting | **Striker** / All-Rounder | 132 | 63 | 42 | Elemental Combo ◆ |
| ★★ | Hitmontop (Power Belt) | Fighting | **Tank** / Blaster | 112 | 39 | 26 | Bulk Up |
| ★★★ | Hitmontop (Power Belt) | Fighting | **Tank** / Blaster | 158 | 55 | 31 | Triple Spin ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Rock Smash** (Tyrogue) — Fighting · Single · 35% ATK · 8 PP. Target's next hit on the user deals 20% less damage.
- **★★ Double Kick** (Hitmonlee) — Fighting · Single · 30% ATK ×2 · 6 PP.
- **★★★ ◆ High Jump Kick** (Hitmonlee) — Fighting · Single · 140% ATK · 4 PP. If the target faints or dodges, the user loses 25% of its max HP.
- **★★ Mach Punch** (Hitmonchan) — Fighting · Single · 40% ATK · 6 PP. On the first round of a battle, acts before anyone without a first-round move.
- **★★★ ◆ Elemental Combo** (Hitmonchan) — Fighting · Single · 35% ATK ×3 · 4 PP. Each hit uses Fire, Electric, then Ice for type effectiveness.
- **★★ Bulk Up** (Hitmontop) — Fighting · Support · Self · 4 PP. User gains 20% Attack and its next hit taken deals 20% less damage.
- **★★★ ◆ Triple Spin** (Hitmontop) — Fighting · Splash · 70% ATK · 4 PP. User takes 20% less damage for the next round.

**Can be taught: 25 moves** (from its pools, minus its own signatures):

- ★ (7): Defense Curl, Focus Energy, Helping Hand, Karate Chop, Low Kick, Rock Throw, Tackle
- ★★ (10): Bite, Brick Break, Fire Punch, Headbutt, Ice Punch, Rock Tomb, Submission, Swift, Take Down, Thunder Punch
- ★★★ (8): Close Combat, Cross Chop, Double-Edge, Dragon Claw, Hyper Beam, Iron Tail, Mega Kick, Swords Dance

### 48. Lickitung line — Normal

**Ability — Own Tempo:** Can't be made to skip actions or lose Speed from enemy moves.

**Move pools:** Universal, Normal, Sturdy (★1 stats HP 86 · ATK 24 · SPD 20)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Lickitung | Normal | **Tank** / Disruptor | 86 | 24 | 20 | Lick |
| ★★ | Lickilicky | Normal | **Tank** / Disruptor | 133 | 36 | 24 | Slam |
| ★★★ | Lickilicky | Normal | **Tank** / Disruptor | 189 | 50 | 28 | Endless Tongue ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Lick** (Lickitung) — Ghost · Single · 30% ATK · 8 PP. Target loses 10% Speed for the battle.
- **★★ Slam** (Lickilicky) — Normal · Single · 65% ATK · 4 PP.
- **★★★ ◆ Endless Tongue** (Lickilicky) — Normal · Pierce · 90% ATK · 4 PP. Targets lose 10% Speed for the battle.

**Can be taught: 32 moves** (from its pools, minus its own signatures):

- ★ (11): Defense Curl, Double Slap, Focus Energy, Fury Swipes, Harden, Helping Hand, Leer, Rage, Rock Throw, Scratch, Tackle
- ★★ (15): Amnesia, Body Slam, Confusion, Headbutt, Heal Pulse, Horn Attack, Icy Wind, Iron Defense, Metronome, Reflect, Rest, Rollout, Soft-Boiled, Swift, Wish
- ★★★ (6): Body Press, Hyper Beam, Hyper Voice, Mega Kick, Sing, Super Fang

### 49. Koffing line — Poison

**Ability — Levitate:** Immune to Ground moves.

**Move pools:** Universal, Poison, Sturdy (★1 stats HP 72 · ATK 28 · SPD 22)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Koffing | Poison | **Disruptor** / Tank | 72 | 28 | 22 | Smog |
| ★★ | Weezing | Poison | **Disruptor** / Blaster | 112 | 42 | 26 | Sludge |
| ★★★ | Weezing | Poison | **Disruptor** / Blaster | 158 | 59 | 31 | Smog Burst ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Smog** (Koffing) — Poison · Single · 30% ATK · 8 PP. Target loses 5% max HP at the end of each of the next 2 rounds.
- **★★ Sludge** (Weezing) — Poison · Splash · 45% ATK · 4 PP.
- **★★★ ◆ Smog Burst** (Weezing) — Poison · Full field · 50% ATK · 4 PP. Targets lose 5% max HP at the end of each of the next 2 rounds.

**Can be taught: 25 moves** (from its pools, minus its own signatures):

- ★ (8): Defense Curl, Focus Energy, Harden, Helping Hand, Poison Sting, Poison Tail, Rock Throw, Tackle
- ★★ (14): Acid, Amnesia, Confusion, Headbutt, Heal Pulse, Icy Wind, Iron Defense, Poison Fang, Poison Jab, Reflect, Rest, Rollout, Swift, Venoshock
- ★★★ (3): Body Press, Hyper Beam, Sludge Bomb

### 50. Rhyhorn line — Ground

**Ability — Lightning Rod:** Draws enemy Electric Single moves aimed at its row to itself and takes no damage from them.

**Move pools:** Universal, Ground, Power, Sturdy (★1 stats HP 76 · ATK 34 · SPD 16)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Rhyhorn | Ground | **Tank** / Striker | 76 | 34 | 16 | Sand Attack |
| ★★ | Rhydon | Ground | **Striker** / Tank | 118 | 51 | 19 | Horn Attack |
| ★★★ | Rhyperior | Ground | **Blaster** / Tank | 167 | 71 | 22 | Rock Wrecker ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Sand Attack** (Rhyhorn) — Ground · Single · 20% ATK · 8 PP. Target's next hit misses entirely.
- **★★ Horn Attack** (Rhydon) — Normal · Single · 60% ATK · 6 PP.
- **★★★ ◆ Rock Wrecker** (Rhyperior) — Rock · Splash · 130% ATK · 4 PP. The user skips its next action to recharge.

**Can be taught: 39 moves** (from its pools, minus its own signatures):

- ★ (9): Defense Curl, Focus Energy, Harden, Helping Hand, Karate Chop, Mud Shot, Mud-Slap, Rock Throw, Tackle
- ★★ (20): Amnesia, Bite, Bone Club, Brick Break, Bulldoze, Confusion, Dig, Fire Punch, Headbutt, Heal Pulse, Ice Punch, Icy Wind, Iron Defense, Reflect, Rest, Rock Tomb, Rollout, Swift, Take Down, Thunder Punch
- ★★★ (10): Body Press, Bonemerang, Double-Edge, Dragon Claw, Earth Power, Earthquake, Hyper Beam, Iron Tail, Mega Kick, Swords Dance

### 51. Happiny line — Normal

**Ability — Natural Cure:** Clears any damage-over-time effects on itself at the end of each round.

**Move pools:** Universal, Normal, Sturdy (★1 stats HP 96 · ATK 16 · SPD 20)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Happiny | Normal | **Healer** / Tank | 96 | 16 | 20 | Tackle |
| ★★ | Chansey | Normal | **Healer** / Tank | 149 | 24 | 24 | Soft-Boiled |
| ★★★ | Blissey | Normal | **Healer** / Support | 211 | 34 | 28 | Healing Egg ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Tackle** (Happiny) — Normal · Single · 40% ATK · 10 PP.
- **★★ Soft-Boiled** (Chansey) — Normal · Support · Self · 2 PP. User heals 50% of its max HP.
- **★★★ ◆ Healing Egg** (Blissey) — Normal · Support · Whole team · 4 PP. Heals every teammate 35% of its max HP.

**Can be taught: 31 moves** (from its pools, minus its own signatures):

- ★ (10): Defense Curl, Double Slap, Focus Energy, Fury Swipes, Harden, Helping Hand, Leer, Rage, Rock Throw, Scratch
- ★★ (15): Amnesia, Body Slam, Confusion, Headbutt, Heal Pulse, Horn Attack, Icy Wind, Iron Defense, Metronome, Reflect, Rest, Rollout, Slam, Swift, Wish
- ★★★ (6): Body Press, Hyper Beam, Hyper Voice, Mega Kick, Sing, Super Fang

### 52. Tangela line — Grass

**Ability — Regenerator:** Heals 10% of its max HP at the end of every round it didn't take a hit.

**Move pools:** Universal, Grass, Sturdy (★1 stats HP 72 · ATK 28 · SPD 24)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Tangela | Grass | **Tank** / Disruptor | 72 | 28 | 24 | Vine Whip |
| ★★ | Tangrowth | Grass | **Tank** / Striker | 112 | 42 | 29 | Mega Drain |
| ★★★ | Tangrowth | Grass | **Tank** / Striker | 158 | 59 | 34 | Power Whip ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Vine Whip** (Tangela) — Grass · Single · 45% ATK · 8 PP.
- **★★ Mega Drain** (Tangrowth) — Grass · Single · 50% ATK · 6 PP. User heals 50% of the damage dealt.
- **★★★ ◆ Power Whip** (Tangrowth) — Grass · Pierce · 110% ATK · 4 PP.

**Can be taught: 29 moves** (from its pools, minus its own signatures):

- ★ (8): Absorb, Defense Curl, Focus Energy, Growth, Harden, Helping Hand, Rock Throw, Tackle
- ★★ (15): Amnesia, Confusion, Headbutt, Heal Pulse, Icy Wind, Iron Defense, Leech Seed, Petal Blizzard, Razor Leaf, Reflect, Rest, Rollout, Seed Bomb, Spore Bomb, Swift
- ★★★ (6): Aromatherapy, Body Press, Giga Drain, Hyper Beam, Petal Dance, Solar Beam

### 53. Kangaskhan — Normal

**Ability — Scrappy:** Its Normal and Fighting moves can hit Ghost types.

**Move pools:** Universal, Normal, Power (★1 stats HP 68 · ATK 34 · SPD 34)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Kangaskhan | Normal | **All-Rounder** / Striker | 68 | 34 | 34 | Fury Swipes |
| ★★ | Kangaskhan | Normal | **All-Rounder** / Striker | 105 | 51 | 41 | Slam |
| ★★★ | Kangaskhan | Normal | **All-Rounder** / Striker | 150 | 71 | 48 | Parental Bond ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Fury Swipes** (Kangaskhan) — Normal · Single · 15% ATK ×2-5 · 6 PP.
- **★★ Slam** (Kangaskhan) — Normal · Single · 65% ATK · 4 PP.
- **★★★ ◆ Parental Bond** (Kangaskhan) — Normal · Single · 60% ATK ×2 · 4 PP. The second hit uses 50% power.

**Can be taught: 33 moves** (from its pools, minus its own signatures):

- ★ (10): Defense Curl, Double Slap, Focus Energy, Helping Hand, Karate Chop, Leer, Rage, Rock Throw, Scratch, Tackle
- ★★ (14): Bite, Body Slam, Brick Break, Fire Punch, Headbutt, Horn Attack, Ice Punch, Metronome, Rock Tomb, Soft-Boiled, Swift, Take Down, Thunder Punch, Wish
- ★★★ (9): Double-Edge, Dragon Claw, Hyper Beam, Hyper Voice, Iron Tail, Mega Kick, Sing, Super Fang, Swords Dance

### 54. Horsea line — Water

**Ability — Sniper:** Its super-effective hits deal 2.5× damage instead of 2×.

**Move pools:** Universal, Water, Power, Dragon (★1 stats HP 56 · ATK 34 · SPD 34)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Horsea | Water | **Speedster** / Blaster | 56 | 34 | 34 | Bubble |
| ★★ | Seadra | Water | **Blaster** / Speedster | 87 | 51 | 41 | Water Pulse |
| ★★★ | Kingdra | Dragon | **Blaster** / All-Rounder | 123 | 71 | 48 | Dragon Tide ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Bubble** (Horsea) — Water · Splash · 20% ATK · 8 PP.
- **★★ Water Pulse** (Seadra) — Water · Splash · 40% ATK · 6 PP.
- **★★★ ◆ Dragon Tide** (Kingdra) — Dragon · Full front row · 85% ATK · 4 PP. Hits count as Water type if that's more effective.

**Can be taught: 32 moves** (from its pools, minus its own signatures):

- ★ (11): Agility, Aqua Jet, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Leer, Rock Throw, Tackle, Twister, Water Gun
- ★★ (12): Aqua Ring, Bite, Brick Break, Bubble Beam, Dragon Breath, Fire Punch, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (9): Double-Edge, Dragon Claw, Hydro Pump, Hyper Beam, Iron Tail, Mega Kick, Outrage, Surf, Swords Dance

### 55. Goldeen line — Water

**Ability — Swift Swim:** Gains 20% Speed while any teammate knows a Water move.

**Move pools:** Universal, Water, Power (★1 stats HP 52 · ATK 38 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Goldeen | Water | **Striker** / Speedster | 52 | 38 | 30 | Water Gun |
| ★★ | Seaking | Water | **Striker** / All-Rounder | 81 | 57 | 36 | Horn Attack |
| ★★★ | Seaking | Water | **Striker** / All-Rounder | 114 | 80 | 42 | Megahorn Dive ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Water Gun** (Goldeen) — Water · Single · 45% ATK · 8 PP.
- **★★ Horn Attack** (Seaking) — Normal · Single · 60% ATK · 6 PP.
- **★★★ ◆ Megahorn Dive** (Seaking) — Water · Pierce · 100% ATK · 4 PP.

**Can be taught: 28 moves** (from its pools, minus its own signatures):

- ★ (8): Aqua Jet, Bubble, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Rock Throw, Tackle
- ★★ (12): Aqua Ring, Bite, Brick Break, Bubble Beam, Fire Punch, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch, Water Pulse
- ★★★ (8): Double-Edge, Dragon Claw, Hydro Pump, Hyper Beam, Iron Tail, Mega Kick, Surf, Swords Dance

### 56. Staryu line — Water

**Ability — Natural Cure:** Clears any damage-over-time effects on itself at the end of each round.

**Move pools:** Universal, Water, Swift (★1 stats HP 50 · ATK 30 · SPD 49)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Staryu | Water | **Speedster** / All-Rounder | 50 | 30 | 49 | Water Gun |
| ★★ | Starmie | Water | **Blaster** / Speedster | 78 | 45 | 59 | Psybeam |
| ★★★ | Starmie | Water | **Blaster** / Speedster | 110 | 63 | 69 | Prism Spin ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Water Gun** (Staryu) — Water · Single · 45% ATK · 8 PP.
- **★★ Psybeam** (Starmie) — Psychic · Pierce · 45% ATK · 6 PP.
- **★★★ ◆ Prism Spin** (Starmie) — Water · Splash · 85% ATK · 4 PP. Hits count as Psychic type if that's more effective.

**Can be taught: 20 moves** (from its pools, minus its own signatures):

- ★ (8): Agility, Aqua Jet, Bubble, Defense Curl, Focus Energy, Helping Hand, Quick Attack, Tackle
- ★★ (7): Aerial Ace, Aqua Ring, Bubble Beam, Double Kick, Headbutt, Swift, Water Pulse
- ★★★ (5): Extreme Speed, Hydro Pump, Hyper Beam, Surf, Tailwind

### 57. Mime Jr. line — Psychic

**Ability — Filter:** Super-effective hits against it deal 25% less damage.

**Move pools:** Universal, Psychic (★1 stats HP 60 · ATK 30 · SPD 34)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Mime Jr. | Psychic | **Support** / Disruptor | 60 | 30 | 34 | Psywave |
| ★★ | Mr. Mime | Psychic | **Support** / Tank | 93 | 45 | 41 | Reflect |
| ★★★ | Mr. Mime | Psychic | **Support** / Tank | 132 | 63 | 48 | Barrier Wall ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Psywave** (Mime Jr.) — Psychic · Single · 40% ATK · 8 PP.
- **★★ Reflect** (Mr. Mime) — Psychic · Support · Own front row · 4 PP. Own front row takes 25% less damage for the next 2 rounds.
- **★★★ ◆ Barrier Wall** (Mr. Mime) — Psychic · Support · Own front row · 4 PP. Own front row takes 40% less damage for the next 2 rounds.

**Can be taught: 15 moves** (from its pools, minus its own signatures):

- ★ (5): Agility, Defense Curl, Focus Energy, Helping Hand, Tackle
- ★★ (7): Amnesia, Calm Mind, Confusion, Headbutt, Psybeam, Rest, Swift
- ★★★ (3): Future Sight, Hyper Beam, Psychic

### 58. Scyther line — Bug

**Ability — Technician:** Moves with 60% power or less deal 50% more damage.

**Move pools:** Universal, Bug, Power, Steel (★1 stats HP 52 · ATK 42 · SPD 38)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Scyther | Bug | **Speedster** / Striker | 52 | 42 | 38 | Fury Cutter |
| ★★ | Scizor | Steel | **Striker** / Tank | 81 | 63 | 46 | Steel Wing |
| ★★★ | Scizor | Steel | **Striker** / Tank | 114 | 88 | 53 | Bullet Pincer ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Fury Cutter** (Scyther) — Bug · Single · 15% ATK ×2-4 · 6 PP.
- **★★ Steel Wing** (Scizor) — Steel · Single · 60% ATK · 6 PP. User takes 15% less damage from the next hit.
- **★★★ ◆ Bullet Pincer** (Scizor) — Steel · Single · 70% ATK · 4 PP. On the first round of a battle, acts before anyone without a first-round move.

**Can be taught: 31 moves** (from its pools, minus its own signatures):

- ★ (10): Bug Bite, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Leech Life, Metal Claw, Rock Throw, String Shot, Tackle
- ★★ (12): Bite, Brick Break, Fire Punch, Headbutt, Ice Punch, Iron Defense, Pin Missile, Rock Tomb, Signal Beam, Swift, Take Down, Thunder Punch
- ★★★ (9): Double-Edge, Dragon Claw, Flash Cannon, Hyper Beam, Iron Tail, Mega Kick, Megahorn, Swords Dance, X-Scissor

### 59. Smoochum line — Ice

**Ability — Oblivious:** Can't have its Attack lowered, and ignores Speed drops.

**Move pools:** Universal, Swift, Power, Ice (★1 stats HP 50 · ATK 32 · SPD 43)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Smoochum | Ice | **Disruptor** / Speedster | 50 | 32 | 43 | Powder Snow |
| ★★ | Jynx | Ice | **Blaster** / Disruptor | 78 | 48 | 52 | Aurora Beam |
| ★★★ | Jynx | Ice | **Blaster** / Disruptor | 110 | 67 | 60 | Frost Kiss ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Powder Snow** (Smoochum) — Ice · Splash · 25% ATK · 8 PP.
- **★★ Aurora Beam** (Jynx) — Ice · Pierce · 55% ATK · 4 PP. Targets lose 10% Attack for the battle.
- **★★★ ◆ Frost Kiss** (Jynx) — Ice · Single · 100% ATK · 4 PP. User heals 25% of the damage dealt.

**Can be taught: 31 moves** (from its pools, minus its own signatures):

- ★ (9): Agility, Defense Curl, Focus Energy, Helping Hand, Ice Shard, Karate Chop, Quick Attack, Rock Throw, Tackle
- ★★ (12): Aerial Ace, Bite, Brick Break, Double Kick, Fire Punch, Headbutt, Ice Punch, Icy Wind, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (10): Blizzard, Double-Edge, Dragon Claw, Extreme Speed, Hyper Beam, Ice Beam, Iron Tail, Mega Kick, Swords Dance, Tailwind

### 60. Elekid line — Electric

**Ability — Motor Drive:** Immune to Electric moves; gains 20% Speed when hit by one.

**Move pools:** Universal, Electric, Swift, Power (★1 stats HP 50 · ATK 32 · SPD 49)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Elekid | Electric | **Speedster** / Striker | 50 | 32 | 49 | Thunder Shock |
| ★★ | Electabuzz | Electric | **Striker** / Speedster | 78 | 48 | 59 | Thunder Punch |
| ★★★ | Electivire | Electric | **Striker** / Blaster | 110 | 67 | 69 | Plasma Fist ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Thunder Shock** (Elekid) — Electric · Single · 45% ATK · 8 PP.
- **★★ Thunder Punch** (Electabuzz) — Electric · Single · 70% ATK · 4 PP.
- **★★★ ◆ Plasma Fist** (Electivire) — Electric · Pierce · 110% ATK · 4 PP.

**Can be taught: 32 moves** (from its pools, minus its own signatures):

- ★ (10): Agility, Charge, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Nuzzle, Quick Attack, Rock Throw, Tackle
- ★★ (12): Aerial Ace, Bite, Brick Break, Discharge, Double Kick, Fire Punch, Headbutt, Ice Punch, Rock Tomb, Spark, Swift, Take Down
- ★★★ (10): Double-Edge, Dragon Claw, Extreme Speed, Hyper Beam, Iron Tail, Mega Kick, Swords Dance, Tailwind, Thunder, Thunderbolt

### 61. Magby line — Fire

**Ability — Flame Body:** When hit by a Single or Pierce move, 30% chance the attacker loses 8% of its max HP.

**Move pools:** Universal, Fire, Power (★1 stats HP 52 · ATK 42 · SPD 34)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Magby | Fire | **Striker** / Disruptor | 52 | 42 | 34 | Ember |
| ★★ | Magmar | Fire | **Blaster** / Striker | 81 | 63 | 41 | Fire Punch |
| ★★★ | Magmortar | Fire | **Blaster** / Striker | 114 | 88 | 48 | Magma Cannon ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Ember** (Magby) — Fire · Single · 45% ATK · 8 PP.
- **★★ Fire Punch** (Magmar) — Fire · Single · 70% ATK · 4 PP.
- **★★★ ◆ Magma Cannon** (Magmortar) — Fire · Back row · 100% ATK · 4 PP.

**Can be taught: 26 moves** (from its pools, minus its own signatures):

- ★ (7): Defense Curl, Flame Charge, Focus Energy, Helping Hand, Karate Chop, Rock Throw, Tackle
- ★★ (11): Bite, Brick Break, Fire Fang, Fire Spin, Flame Wheel, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (8): Double-Edge, Dragon Claw, Fire Blast, Flamethrower, Hyper Beam, Iron Tail, Mega Kick, Swords Dance

### 62. Pinsir — Bug

**Ability — Hyper Cutter:** Enemy effects can't lower its Attack.

**Move pools:** Universal, Bug, Power (★1 stats HP 54 · ATK 44 · SPD 28)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Pinsir | Bug | **Striker** / Tank | 54 | 44 | 28 | Bug Bite |
| ★★ | Pinsir | Bug | **Striker** / Tank | 84 | 66 | 34 | Brick Break |
| ★★★ | Pinsir | Bug | **Striker** / Tank | 119 | 92 | 39 | Guillotine Grip ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Bug Bite** (Pinsir) — Bug · Single · 40% ATK · 8 PP.
- **★★ Brick Break** (Pinsir) — Fighting · Single · 70% ATK · 4 PP. Ignores Reflect and Defense Curl-style damage reduction.
- **★★★ ◆ Guillotine Grip** (Pinsir) — Bug · Single · 130% ATK · 4 PP. Double power against targets below 25% HP.

**Can be taught: 27 moves** (from its pools, minus its own signatures):

- ★ (9): Defense Curl, Focus Energy, Fury Cutter, Helping Hand, Karate Chop, Leech Life, Rock Throw, String Shot, Tackle
- ★★ (10): Bite, Fire Punch, Headbutt, Ice Punch, Pin Missile, Rock Tomb, Signal Beam, Swift, Take Down, Thunder Punch
- ★★★ (8): Double-Edge, Dragon Claw, Hyper Beam, Iron Tail, Mega Kick, Megahorn, Swords Dance, X-Scissor

### 63. Tauros — Normal

**Ability — Anger Point:** After being hit by a super-effective move, gains 50% Attack for the battle.

**Move pools:** Universal, Normal, Power (★1 stats HP 56 · ATK 40 · SPD 36)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Tauros | Normal | **Striker** / Speedster | 56 | 40 | 36 | Tackle |
| ★★ | Tauros | Normal | **Striker** / Speedster | 87 | 60 | 43 | Horn Attack |
| ★★★ | Tauros | Normal | **Striker** / Speedster | 123 | 84 | 50 | Stampede ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Tackle** (Tauros) — Normal · Single · 40% ATK · 10 PP.
- **★★ Horn Attack** (Tauros) — Normal · Single · 60% ATK · 6 PP.
- **★★★ ◆ Stampede** (Tauros) — Normal · Pierce · 110% ATK · 4 PP. User takes 20% of the damage dealt.

**Can be taught: 33 moves** (from its pools, minus its own signatures):

- ★ (10): Defense Curl, Double Slap, Focus Energy, Fury Swipes, Helping Hand, Karate Chop, Leer, Rage, Rock Throw, Scratch
- ★★ (14): Bite, Body Slam, Brick Break, Fire Punch, Headbutt, Ice Punch, Metronome, Rock Tomb, Slam, Soft-Boiled, Swift, Take Down, Thunder Punch, Wish
- ★★★ (9): Double-Edge, Dragon Claw, Hyper Beam, Hyper Voice, Iron Tail, Mega Kick, Sing, Super Fang, Swords Dance

### 64. Magikarp line — Water

**Ability — Moxie:** Gains 20% Attack each time it knocks out an enemy.

**Move pools:** Universal, Water, Power (★1 stats HP 58 · ATK 42 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Magikarp | Water | **Speedster** / All-Rounder | 38 | 27 | 20 | Tackle |
| ★★ | Gyarados | Water | **Blaster** / Striker | 90 | 63 | 36 | Crunch |
| ★★★ | Gyarados | Water | **Blaster** / Striker | 128 | 88 | 42 | Dragon Fury Tide ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Tackle** (Magikarp) — Normal · Single · 40% ATK · 10 PP.
- **★★ Crunch** (Gyarados) — Dark · Single · 75% ATK · 4 PP.
- **★★★ ◆ Dragon Fury Tide** (Gyarados) — Water · Full front row · 110% ATK · 4 PP. The user skips its next action to recharge.

**Can be taught: 28 moves** (from its pools, minus its own signatures):

- ★ (8): Aqua Jet, Bubble, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Rock Throw, Water Gun
- ★★ (12): Aqua Ring, Bite, Brick Break, Bubble Beam, Fire Punch, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch, Water Pulse
- ★★★ (8): Double-Edge, Dragon Claw, Hydro Pump, Hyper Beam, Iron Tail, Mega Kick, Surf, Swords Dance

### 65. Lapras — Ice

**Ability — Shell Armor:** Takes 15% less damage from Single moves.

**Move pools:** Universal, Sturdy, Ice (★1 stats HP 90 · ATK 26 · SPD 20)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Lapras | Ice | **Tank** / Healer | 90 | 26 | 20 | Powder Snow |
| ★★ | Lapras | Ice | **Tank** / Healer | 140 | 39 | 24 | Water Pulse |
| ★★★ | Lapras | Ice | **Tank** / Healer | 198 | 55 | 28 | Frozen Ferry ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Powder Snow** (Lapras) — Ice · Splash · 25% ATK · 8 PP.
- **★★ Water Pulse** (Lapras) — Water · Splash · 40% ATK · 6 PP.
- **★★★ ◆ Frozen Ferry** (Lapras) — Ice · Support · Whole team · 4 PP. Heals every teammate 25% of its max HP, then deals Ice damage equal to 40% ATK to the enemy front row.

**Can be taught: 23 moves** (from its pools, minus its own signatures):

- ★ (7): Defense Curl, Focus Energy, Harden, Helping Hand, Ice Shard, Rock Throw, Tackle
- ★★ (12): Amnesia, Aurora Beam, Confusion, Headbutt, Heal Pulse, Ice Punch, Icy Wind, Iron Defense, Reflect, Rest, Rollout, Swift
- ★★★ (4): Blizzard, Body Press, Hyper Beam, Ice Beam

### 66. Ditto — Normal

**Ability — Imposter:** Transforms into the enemy directly across at the start of battle, copying its type and stats but keeping its own HP.

**Move pools:** Universal, Normal (★1 stats HP 56 · ATK 26 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Ditto | Normal | **All-Rounder** / Disruptor | 56 | 26 | 30 | Tackle |
| ★★ | Ditto | Normal | **All-Rounder** / Disruptor | 87 | 39 | 36 | Swift |
| ★★★ | Ditto | Normal | **All-Rounder** / Disruptor | 123 | 55 | 42 | Transform ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Tackle** (Ditto) — Normal · Single · 40% ATK · 10 PP.
- **★★ Swift** (Ditto) — Normal · Full front row · 30% ATK · 4 PP.
- **★★★ ◆ Transform** (Ditto) — Normal · Support · Self · 4 PP. Copies the moves of the enemy directly across for the rest of the battle, at full PP.

**Can be taught: 20 moves** (from its pools, minus its own signatures):

- ★ (8): Defense Curl, Double Slap, Focus Energy, Fury Swipes, Helping Hand, Leer, Rage, Scratch
- ★★ (7): Body Slam, Headbutt, Horn Attack, Metronome, Slam, Soft-Boiled, Wish
- ★★★ (5): Hyper Beam, Hyper Voice, Mega Kick, Sing, Super Fang

### 67. Eevee line — Normal

**Ability — Adaptability:** Moves that match its current type deal 25% more damage.

**Move pools:** Universal, Normal, Water, Electric, Fire, Psychic, Dark, Grass, Ice, Fairy (★1 stats HP 60 · ATK 30 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Eevee | Normal | **All-Rounder** / Speedster | 60 | 30 | 30 | Tackle |
| ★★ | Vaporeon (Water Stone) | Water | **Tank** / Healer | 133 | 30 | 24 | Water Pulse |
| ★★★ | Vaporeon (Water Stone) | Water | **Tank** / Healer | 189 | 42 | 28 | Hydro Veil ◆ |
| ★★ | Jolteon (Thunder Stone) | Electric | **Speedster** / Striker | 78 | 42 | 54 | Spark |
| ★★★ | Jolteon (Thunder Stone) | Electric | **Speedster** / Striker | 110 | 59 | 63 | Pin Volley ◆ |
| ★★ | Flareon (Fire Stone) | Fire | **Striker** / Blaster | 81 | 57 | 36 | Fire Fang |
| ★★★ | Flareon (Fire Stone) | Fire | **Striker** / Blaster | 114 | 80 | 42 | Flare Rush ◆ |
| ★★ | Espeon (Sun Stone) | Psychic | **Blaster** / Speedster | 78 | 42 | 54 | Psybeam |
| ★★★ | Espeon (Sun Stone) | Psychic | **Blaster** / Speedster | 110 | 59 | 63 | Morning Sun Psyblast ◆ |
| ★★ | Umbreon (Moon Stone) | Dark | **Tank** / Support | 112 | 39 | 26 | Feint Attack |
| ★★★ | Umbreon (Moon Stone) | Dark | **Tank** / Support | 158 | 55 | 31 | Moonlit Guard ◆ |
| ★★ | Leafeon (Leaf Stone) | Grass | **Striker** / Speedster | 81 | 57 | 36 | Razor Leaf |
| ★★★ | Leafeon (Leaf Stone) | Grass | **Striker** / Speedster | 114 | 80 | 42 | Leaf Blade ◆ |
| ★★ | Glaceon (Ice Stone) | Ice | **Blaster** / Disruptor | 81 | 57 | 36 | Aurora Beam |
| ★★★ | Glaceon (Ice Stone) | Ice | **Blaster** / Disruptor | 114 | 80 | 42 | Diamond Dust ◆ |
| ★★ | Sylveon (Shiny Stone) | Fairy | **Healer** / Blaster | 112 | 39 | 26 | Draining Kiss |
| ★★★ | Sylveon (Shiny Stone) | Fairy | **Healer** / Blaster | 158 | 55 | 31 | Ribbon Chorus ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Tackle** (Eevee) — Normal · Single · 40% ATK · 10 PP.
- **★★ Water Pulse** (Vaporeon) — Water · Splash · 40% ATK · 6 PP.
- **★★★ ◆ Hydro Veil** (Vaporeon) — Water · Full front row · 75% ATK · 4 PP. User heals 25% of the damage dealt.
- **★★ Spark** (Jolteon) — Electric · Pierce · 50% ATK · 6 PP.
- **★★★ ◆ Pin Volley** (Jolteon) — Electric · Single · 25% ATK ×3-5 · 4 PP.
- **★★ Fire Fang** (Flareon) — Fire · Single · 60% ATK · 6 PP.
- **★★★ ◆ Flare Rush** (Flareon) — Fire · Single · 130% ATK · 4 PP. User takes 20% of the damage dealt.
- **★★ Psybeam** (Espeon) — Psychic · Pierce · 45% ATK · 6 PP.
- **★★★ ◆ Morning Sun Psyblast** (Espeon) — Psychic · Splash · 80% ATK · 4 PP. User heals 15% of its max HP.
- **★★ Feint Attack** (Umbreon) — Dark · Single · 45% ATK · 8 PP. Ignores effects that dodge hits, like Sand Veil.
- **★★★ ◆ Moonlit Guard** (Umbreon) — Dark · Support · Own front row · 4 PP. Own front row takes 30% less damage for 2 rounds, and each hit on them costs the attacker 5% max HP.
- **★★ Razor Leaf** (Leafeon) — Grass · Pierce · 25% ATK ×2 · 6 PP.
- **★★★ ◆ Leaf Blade** (Leafeon) — Grass · Single · 110% ATK · 4 PP. Ignores Reflect and Defense Curl-style damage reduction.
- **★★ Aurora Beam** (Glaceon) — Ice · Pierce · 55% ATK · 4 PP. Targets lose 10% Attack for the battle.
- **★★★ ◆ Diamond Dust** (Glaceon) — Ice · Full field · 60% ATK · 4 PP.
- **★★ Draining Kiss** (Sylveon) — Fairy · Single · 45% ATK · 4 PP. User heals 75% of the damage dealt.
- **★★★ ◆ Ribbon Chorus** (Sylveon) — Fairy · Full front row · 70% ATK · 4 PP. Every teammate heals 10% of its max HP.

**Can be taught: 83 moves** (from its pools, minus its own signatures):

- ★ (27): Absorb, Agility, Aqua Jet, Astonish, Bubble, Charge, Defense Curl, Disarming Voice, Double Slap, Ember, Fairy Wind, Flame Charge, Focus Energy, Fury Swipes, Growth, Helping Hand, Ice Shard, Leer, Nuzzle, Powder Snow, Psywave, Pursuit, Rage, Scratch, Thunder Shock, Vine Whip, Water Gun
- ★★ (32): Amnesia, Aqua Ring, Bite, Body Slam, Bubble Beam, Calm Mind, Confusion, Crunch, Discharge, Fire Punch, Fire Spin, Flame Wheel, Headbutt, Horn Attack, Ice Punch, Icy Wind, Leech Seed, Mega Drain, Metronome, Moonlight, Nasty Plot, Night Shade, Petal Blizzard, Reflect, Rest, Seed Bomb, Slam, Soft-Boiled, Spore Bomb, Swift, Thunder Punch, Wish
- ★★★ (24): Aromatherapy, Blizzard, Dark Pulse, Dazzling Gleam, Fire Blast, Flamethrower, Foul Play, Future Sight, Giga Drain, Hydro Pump, Hyper Beam, Hyper Voice, Ice Beam, Mega Kick, Moonblast, Petal Dance, Psychic, Shadow Ball, Sing, Solar Beam, Super Fang, Surf, Thunder, Thunderbolt

### 68. Porygon line — Normal

**Ability — Download:** At the start of battle, gains 15% Attack or 15% Speed, whichever helps more against the enemy across.

**Move pools:** Universal, Normal, Power (★1 stats HP 60 · ATK 32 · SPD 28)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Porygon | Normal | **All-Rounder** / Support | 60 | 32 | 28 | Tackle |
| ★★ | Porygon2 | Normal | **Tank** / All-Rounder | 93 | 48 | 34 | Psybeam |
| ★★★ | Porygon-Z | Normal | **Blaster** / Speedster | 132 | 67 | 39 | Glitch Beam ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Tackle** (Porygon) — Normal · Single · 40% ATK · 10 PP.
- **★★ Psybeam** (Porygon2) — Psychic · Pierce · 45% ATK · 6 PP.
- **★★★ ◆ Glitch Beam** (Porygon-Z) — Normal · Pierce · 100% ATK · 4 PP. Hits count as the type that's most effective against each target.

**Can be taught: 34 moves** (from its pools, minus its own signatures):

- ★ (10): Defense Curl, Double Slap, Focus Energy, Fury Swipes, Helping Hand, Karate Chop, Leer, Rage, Rock Throw, Scratch
- ★★ (15): Bite, Body Slam, Brick Break, Fire Punch, Headbutt, Horn Attack, Ice Punch, Metronome, Rock Tomb, Slam, Soft-Boiled, Swift, Take Down, Thunder Punch, Wish
- ★★★ (9): Double-Edge, Dragon Claw, Hyper Beam, Hyper Voice, Iron Tail, Mega Kick, Sing, Super Fang, Swords Dance

### 69. Omanyte line — Rock

**Ability — Shell Armor:** Takes 15% less damage from Single moves.

**Move pools:** Universal, Power, Rock (★1 stats HP 68 · ATK 32 · SPD 20)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Omanyte | Rock | **Tank** / Blaster | 68 | 32 | 20 | Rock Throw |
| ★★ | Omastar | Rock | **Blaster** / Tank | 105 | 48 | 24 | Rock Tomb |
| ★★★ | Omastar | Rock | **Blaster** / Tank | 150 | 67 | 28 | Spiral Cannon ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Rock Throw** (Omanyte) — Rock · Single · 45% ATK · 8 PP.
- **★★ Rock Tomb** (Omastar) — Rock · Single · 55% ATK · 4 PP. Target loses 15% Speed for the battle.
- **★★★ ◆ Spiral Cannon** (Omastar) — Rock · Pierce · 100% ATK · 4 PP. Hits count as Water type if that's more effective.

**Can be taught: 25 moves** (from its pools, minus its own signatures):

- ★ (6): Defense Curl, Focus Energy, Helping Hand, Karate Chop, Sand Attack, Tackle
- ★★ (11): Bite, Brick Break, Fire Punch, Headbutt, Ice Punch, Iron Defense, Rock Slide, Rollout, Swift, Take Down, Thunder Punch
- ★★★ (8): Ancient Power, Double-Edge, Dragon Claw, Hyper Beam, Iron Tail, Mega Kick, Stone Edge, Swords Dance

### 70. Kabuto line — Rock

**Ability — Battle Armor:** Takes 15% less damage from Single moves.

**Move pools:** Universal, Power, Rock (★1 stats HP 48 · ATK 42 · SPD 32)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Kabuto | Rock | **Tank** / Striker | 48 | 42 | 32 | Scratch |
| ★★ | Kabutops | Rock | **Striker** / Speedster | 74 | 63 | 38 | Rock Tomb |
| ★★★ | Kabutops | Rock | **Striker** / Speedster | 106 | 88 | 45 | Fossil Scythe ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Scratch** (Kabuto) — Normal · Single · 40% ATK · 10 PP.
- **★★ Rock Tomb** (Kabutops) — Rock · Single · 55% ATK · 4 PP. Target loses 15% Speed for the battle.
- **★★★ ◆ Fossil Scythe** (Kabutops) — Rock · Single · 60% ATK ×2 · 4 PP.

**Can be taught: 26 moves** (from its pools, minus its own signatures):

- ★ (7): Defense Curl, Focus Energy, Helping Hand, Karate Chop, Rock Throw, Sand Attack, Tackle
- ★★ (11): Bite, Brick Break, Fire Punch, Headbutt, Ice Punch, Iron Defense, Rock Slide, Rollout, Swift, Take Down, Thunder Punch
- ★★★ (8): Ancient Power, Double-Edge, Dragon Claw, Hyper Beam, Iron Tail, Mega Kick, Stone Edge, Swords Dance

### 71. Aerodactyl — Rock

**Ability — Unnerve:** Enemies can't heal from their own moves while it's on the field.

**Move pools:** Universal, Swift, Power, Rock (★1 stats HP 50 · ATK 34 · SPD 53)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Aerodactyl | Rock | **Speedster** / Striker | 50 | 34 | 53 | Rock Throw |
| ★★ | Aerodactyl | Rock | **Speedster** / Striker | 78 | 51 | 64 | Rock Slide |
| ★★★ | Aerodactyl | Rock | **Speedster** / Striker | 110 | 71 | 74 | Sky Fossil Dive ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Rock Throw** (Aerodactyl) — Rock · Single · 45% ATK · 8 PP.
- **★★ Rock Slide** (Aerodactyl) — Rock · Full front row · 45% ATK · 4 PP.
- **★★★ ◆ Sky Fossil Dive** (Aerodactyl) — Rock · Back row · 100% ATK · 4 PP.

**Can be taught: 31 moves** (from its pools, minus its own signatures):

- ★ (8): Agility, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Quick Attack, Sand Attack, Tackle
- ★★ (13): Aerial Ace, Bite, Brick Break, Double Kick, Fire Punch, Headbutt, Ice Punch, Iron Defense, Rock Tomb, Rollout, Swift, Take Down, Thunder Punch
- ★★★ (10): Ancient Power, Double-Edge, Dragon Claw, Extreme Speed, Hyper Beam, Iron Tail, Mega Kick, Stone Edge, Swords Dance, Tailwind

### 72. Munchlax line — Normal

**Ability — Thick Fat:** Takes 50% less damage from Fire and Ice moves.

**Move pools:** Universal, Normal, Sturdy (★1 stats HP 96 · ATK 26 · SPD 14)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Munchlax | Normal | **Tank** / All-Rounder | 96 | 26 | 14 | Tackle |
| ★★ | Snorlax | Normal | **Tank** / Striker | 149 | 39 | 17 | Slam |
| ★★★ | Snorlax | Normal | **Tank** / Striker | 211 | 55 | 20 | Giga Belly Flop ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Tackle** (Munchlax) — Normal · Single · 40% ATK · 10 PP.
- **★★ Slam** (Snorlax) — Normal · Single · 65% ATK · 4 PP.
- **★★★ ◆ Giga Belly Flop** (Snorlax) — Normal · Splash · 110% ATK · 4 PP. User heals 20% of its max HP afterward.

**Can be taught: 31 moves** (from its pools, minus its own signatures):

- ★ (10): Defense Curl, Double Slap, Focus Energy, Fury Swipes, Harden, Helping Hand, Leer, Rage, Rock Throw, Scratch
- ★★ (15): Amnesia, Body Slam, Confusion, Headbutt, Heal Pulse, Horn Attack, Icy Wind, Iron Defense, Metronome, Reflect, Rest, Rollout, Soft-Boiled, Swift, Wish
- ★★★ (6): Body Press, Hyper Beam, Hyper Voice, Mega Kick, Sing, Super Fang

### 73. Articuno — Ice

**Ability — Pressure:** Enemies spend 2 PP instead of 1 on moves aimed at it.

**Move pools:** Universal, Sturdy, Ice (★1 stats HP 72 · ATK 26 · SPD 22)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Articuno | Ice | **Blaster** / Disruptor | 83 | 30 | 25 | Powder Snow |
| ★★ | Articuno | Ice | **Blaster** / Disruptor | 128 | 45 | 30 | Aurora Beam |
| ★★★ | Articuno | Ice | **Blaster** / Disruptor | 182 | 63 | 35 | Freezing Gale ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Powder Snow** (Articuno) — Ice · Splash · 25% ATK · 8 PP.
- **★★ Aurora Beam** (Articuno) — Ice · Pierce · 55% ATK · 4 PP. Targets lose 10% Attack for the battle.
- **★★★ ◆ Freezing Gale** (Articuno) — Ice · Full field · 80% ATK · 4 PP. Targets lose 15% Speed for the battle.

**Can be taught: 22 moves** (from its pools, minus its own signatures):

- ★ (7): Defense Curl, Focus Energy, Harden, Helping Hand, Ice Shard, Rock Throw, Tackle
- ★★ (11): Amnesia, Confusion, Headbutt, Heal Pulse, Ice Punch, Icy Wind, Iron Defense, Reflect, Rest, Rollout, Swift
- ★★★ (4): Blizzard, Body Press, Hyper Beam, Ice Beam

### 74. Zapdos — Electric

**Ability — Pressure:** Enemies spend 2 PP instead of 1 on moves aimed at it.

**Move pools:** Universal, Electric, Swift (★1 stats HP 50 · ATK 28 · SPD 45)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Zapdos | Electric | **Blaster** / Speedster | 57 | 32 | 52 | Thunder Shock |
| ★★ | Zapdos | Electric | **Blaster** / Speedster | 89 | 48 | 62 | Discharge |
| ★★★ | Zapdos | Electric | **Blaster** / Speedster | 126 | 68 | 72 | Thunder Cage ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Thunder Shock** (Zapdos) — Electric · Single · 45% ATK · 8 PP.
- **★★ Discharge** (Zapdos) — Electric · Splash · 45% ATK · 4 PP.
- **★★★ ◆ Thunder Cage** (Zapdos) — Electric · Full front row · 90% ATK · 4 PP. Targets lose 10% Speed for the battle.

**Can be taught: 19 moves** (from its pools, minus its own signatures):

- ★ (8): Agility, Charge, Defense Curl, Focus Energy, Helping Hand, Nuzzle, Quick Attack, Tackle
- ★★ (6): Aerial Ace, Double Kick, Headbutt, Spark, Swift, Thunder Punch
- ★★★ (5): Extreme Speed, Hyper Beam, Tailwind, Thunder, Thunderbolt

### 75. Moltres — Fire

**Ability — Pressure:** Enemies spend 2 PP instead of 1 on moves aimed at it.

**Move pools:** Universal, Fire, Power (★1 stats HP 52 · ATK 38 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Moltres | Fire | **Blaster** / Striker | 60 | 44 | 34 | Ember |
| ★★ | Moltres | Fire | **Blaster** / Striker | 93 | 66 | 41 | Fire Spin |
| ★★★ | Moltres | Fire | **Blaster** / Striker | 132 | 92 | 48 | Sky Inferno ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Ember** (Moltres) — Fire · Single · 45% ATK · 8 PP.
- **★★ Fire Spin** (Moltres) — Fire · Splash · 35% ATK · 6 PP.
- **★★★ ◆ Sky Inferno** (Moltres) — Fire · Full field · 85% ATK · 4 PP. Targets lose 5% max HP at the end of each of the next 2 rounds.

**Can be taught: 26 moves** (from its pools, minus its own signatures):

- ★ (7): Defense Curl, Flame Charge, Focus Energy, Helping Hand, Karate Chop, Rock Throw, Tackle
- ★★ (11): Bite, Brick Break, Fire Fang, Fire Punch, Flame Wheel, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (8): Double-Edge, Dragon Claw, Fire Blast, Flamethrower, Hyper Beam, Iron Tail, Mega Kick, Swords Dance

### 76. Dratini line — Dragon

**Ability — Multiscale:** At full HP, takes 50% less damage from the first hit.

**Move pools:** Universal, Power, Dragon (★1 stats HP 56 · ATK 42 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Dratini | Dragon | **All-Rounder** / Striker | 56 | 42 | 30 | Twister |
| ★★ | Dragonair | Dragon | **All-Rounder** / Speedster | 87 | 63 | 36 | Dragon Breath |
| ★★★ | Dragonite | Dragon | **Striker** / Tank | 123 | 88 | 42 | Draco Rush ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Twister** (Dratini) — Dragon · Splash · 25% ATK · 8 PP.
- **★★ Dragon Breath** (Dragonair) — Dragon · Single · 60% ATK · 6 PP.
- **★★★ ◆ Draco Rush** (Dragonite) — Dragon · Single · 140% ATK · 4 PP. User takes 15% of the damage dealt.

**Can be taught: 24 moves** (from its pools, minus its own signatures):

- ★ (8): Agility, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Leer, Rock Throw, Tackle
- ★★ (9): Bite, Brick Break, Fire Punch, Headbutt, Ice Punch, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (7): Double-Edge, Dragon Claw, Hyper Beam, Iron Tail, Mega Kick, Outrage, Swords Dance

### 77. Mewtwo — Psychic

**Ability — Pressure:** Enemies spend 2 PP instead of 1 on moves aimed at it.

**Move pools:** Universal, Swift, Power, Psychic (★1 stats HP 50 · ATK 36 · SPD 49)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Mewtwo | Psychic | **Blaster** / Striker | 60 | 43 | 59 | Psywave |
| ★★ | Mewtwo | Psychic | **Blaster** / Striker | 93 | 65 | 71 | Psybeam |
| ★★★ | Mewtwo | Psychic | **Blaster** / Striker | 132 | 91 | 82 | Psystrike ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Psywave** (Mewtwo) — Psychic · Single · 40% ATK · 8 PP.
- **★★ Psybeam** (Mewtwo) — Psychic · Pierce · 45% ATK · 6 PP.
- **★★★ ◆ Psystrike** (Mewtwo) — Psychic · Splash · 120% ATK · 4 PP.

**Can be taught: 34 moves** (from its pools, minus its own signatures):

- ★ (8): Agility, Defense Curl, Focus Energy, Helping Hand, Karate Chop, Quick Attack, Rock Throw, Tackle
- ★★ (16): Aerial Ace, Amnesia, Bite, Brick Break, Calm Mind, Confusion, Double Kick, Fire Punch, Headbutt, Ice Punch, Reflect, Rest, Rock Tomb, Swift, Take Down, Thunder Punch
- ★★★ (10): Double-Edge, Dragon Claw, Extreme Speed, Future Sight, Hyper Beam, Iron Tail, Mega Kick, Psychic, Swords Dance, Tailwind

### 78. Mew — Psychic

**Ability — Synchronize:** When an enemy lowers its Attack or Speed, that enemy loses the same amount.

**Move pools:** Universal, Psychic (★1 stats HP 60 · ATK 30 · SPD 30)

| Level | Species | Type | Role (primary / secondary) | HP | ATK | SPD | Signature move |
|---|---|---|---|---|---|---|---|
| ★ | Mew | Psychic | **All-Rounder** / Support | 69 | 34 | 34 | Psywave |
| ★★ | Mew | Psychic | **All-Rounder** / Support | 107 | 52 | 41 | Calm Mind |
| ★★★ | Mew | Psychic | **All-Rounder** / Support | 152 | 72 | 48 | Genesis Pulse ◆ |

**Signature progression** (◆ = unique to this line):

- **★ Psywave** (Mew) — Psychic · Single · 40% ATK · 8 PP.
- **★★ Calm Mind** (Mew) — Psychic · Support · Self · 4 PP. User gains 20% Attack and 20% Speed for the battle.
- **★★★ ◆ Genesis Pulse** (Mew) — Psychic · Full field · 70% ATK · 4 PP. Hits count as the type that's most effective against each target.

**Can be taught: 15 moves** (from its pools, minus its own signatures):

- ★ (5): Agility, Defense Curl, Focus Energy, Helping Hand, Tackle
- ★★ (7): Amnesia, Confusion, Headbutt, Psybeam, Reflect, Rest, Swift
- ★★★ (3): Future Sight, Hyper Beam, Psychic

## Unique signature moves

Every ★3 signature, and the ★2 signatures that are unique. These appear in no pool.

| Move | Line | Level | Type | Kind / shape | Power | Hits | PP | Effect |
|---|---|---|---|---|---|---|---|---|
| Frenzy Plant | Bulbasaur line | ★★★ | Grass | Full front row | 75% ATK | — | 4 | — |
| Blast Burn | Charmander line | ★★★ | Fire | Single | 150% ATK | — | 4 | The user skips its next action to recharge. |
| Aqua Tail | Squirtle line | ★★ | Water | Pierce | 60% ATK | — | 6 | — |
| Hydro Cannon | Squirtle line | ★★★ | Water | Pierce | 100% ATK | — | 4 | — |
| Quiver Wind | Caterpie line | ★★★ | Bug | Support · Whole team | — | — | 4 | Whole team gains 25% Speed and 15% Attack for the battle. |
| Twin Lance | Weedle line | ★★★ | Poison | Pierce | 50% ATK | 2 | 6 | — |
| Skyward Dive | Pidgey line | ★★★ | Flying | Single | 130% ATK | — | 4 | Ignores Reflect and Defense Curl-style damage reduction. |
| Hyper Fang | Rattata line | ★★ | Normal | Single | 75% ATK | — | 6 | — |
| Crushing Fang | Rattata line | ★★★ | Normal | Single | 60% ATK | 2 | 6 | — |
| Fury Attack | Spearow line | ★★ | Normal | Single | 15% ATK | 2-5 | 6 | — |
| Skewer Dive | Spearow line | ★★★ | Normal | Pierce | 100% ATK | — | 4 | — |
| Gunk Shot | Ekans line | ★★★ | Poison | Splash | 90% ATK | — | 4 | — |
| Electro Ball | Pichu line | ★★ | Electric | Single | 50% ATK | — | 6 | +25% power for every 10 Speed the user has over the target (max 120%). |
| Volt Tackle | Pichu line | ★★★ | Electric | Single | 150% ATK | — | 4 | User takes 20% of the damage dealt. |
| Fissure Claw | Sandshrew line | ★★★ | Ground | Splash | 85% ATK | — | 4 | — |
| Sludge Wave | Nidoran♀ line | ★★★ | Poison | Full front row | 80% ATK | — | 4 | — |
| Horn Drill | Nidoran♂ line | ★★★ | Poison | Pierce | 110% ATK | — | 4 | — |
| Moonlight Mend | Cleffa line | ★★ | Fairy | Support · Lowest-HP teammate | 30% HP | — | 6 | Heals the lowest-HP teammate 30% of its max HP. |
| Lunar Blessing | Cleffa line | ★★★ | Fairy | Support · Whole team | 30% HP | — | 4 | Heals every teammate 30% of its max HP. |
| Fox Fire | Vulpix line | ★★ | Fire | Splash | 50% ATK | — | 6 | — |
| Nine-Tail Blaze | Vulpix line | ★★★ | Fire | Full front row | 85% ATK | — | 4 | — |
| Lullaby | Igglybuff line | ★★ | Normal | Support · Own front row | 15% HP | — | 6 | Heals the own front row 15% of max HP each. |
| Round Chorus | Igglybuff line | ★★★ | Normal | Support · Whole team | 20% HP | — | 4 | Heals every teammate 20% of max HP and gives them 15% Attack for the battle. |
| Cross Poison | Zubat line | ★★★ | Poison | Pierce | 55% ATK | 2 | 6 | — |
| Toxic Bloom | Oddish line | ★★★ | Grass | Full front row | 80% ATK | — | 4 | Hits count as Poison type if that's more effective. |
| Sun Dance Kick | Oddish line | ★★★ | Grass | Single | 140% ATK | — | 4 | — |
| Spore Burst | Paras line | ★★ | Grass | Splash | 55% ATK | — | 6 | — |
| Fungal Bloom | Paras line | ★★★ | Grass | Back row | 85% ATK | — | 4 | — |
| Moonlit Scales | Venonat line | ★★★ | Bug | Full front row | 70% ATK | — | 4 | Targets lose 10% Speed for the battle. |
| Triple Burrow | Diglett line | ★★★ | Ground | Single | 40% ATK | 3 | 6 | — |
| Payday Slash | Meowth line | ★★★ | Normal | Single | 90% ATK | — | 4 | Winning a battle with Persian on the field pays 20% more currency. |
| Headache Wave | Psyduck line | ★★★ | Water | Splash | 70% ATK | — | 4 | Hits count as Psychic type if that's more effective. |
| Rage Fist | Mankey line | ★★★ | Fighting | Single | 70% ATK | — | 4 | +15% power for every hit Primeape has taken this battle (max +75%). |
| Extreme Blaze | Growlithe line | ★★★ | Fire | Single | 110% ATK | — | 4 | On the first round of a battle, acts before anyone without a first-round move. |
| Whirlpool Fist | Poliwag line | ★★★ | Fighting | Pierce | 95% ATK | — | 4 | — |
| Chorus Rain | Poliwag line | ★★★ | Water | Support · Whole team | — | — | 4 | Whole team's Water moves deal 30% more damage for the next 3 rounds, and every teammate heals 10% max HP. |
| Spoon Storm | Abra line | ★★★ | Psychic | Splash | 90% ATK | — | 4 | — |
| Four-Arm Barrage | Machop line | ★★★ | Fighting | Single | 35% ATK | 4 | 4 | — |
| Pitcher Plunge | Bellsprout line | ★★★ | Grass | Single | 120% ATK | — | 4 | User heals 25% of the damage dealt. |
| Tentacle Web | Tentacool line | ★★★ | Water | Full front row | 60% ATK | — | 4 | Targets lose 5% max HP at the end of each of the next 2 rounds. |
| Boulder Crash | Geodude line | ★★★ | Rock | Splash | 100% ATK | — | 4 | — |
| Blazing Gallop | Ponyta line | ★★★ | Fire | Pierce | 85% ATK | — | 4 | User gains 15% Speed for the battle. |
| Shell Slam | Slowpoke line | ★★★ | Psychic | Single | 100% ATK | — | 4 | User takes 25% less damage from the next hit. |
| Royal Decree | Slowpoke line | ★★★ | Psychic | Support · Whole team | — | — | 4 | Whole team gains 20% Attack for the battle; the slowest enemy loses 20% Speed. |
| Magnet Storm | Magnemite line | ★★★ | Electric | Full front row | 80% ATK | — | 4 | Double damage against Steel-type targets. |
| Leek Blade | Farfetch'd | ★★★ | Flying | Single | 110% ATK | — | 4 | Ignores Reflect and Defense Curl-style damage reduction. |
| Tri Attack | Doduo line | ★★★ | Flying | Single | 35% ATK | 3 | 4 | — |
| Glacial Crash | Seel line | ★★★ | Ice | Splash | 90% ATK | — | 4 | — |
| Toxic Flood | Grimer line | ★★★ | Poison | Full field | 55% ATK | — | 4 | Targets lose 5% max HP at the end of each of the next 2 rounds. |
| Icicle Spears | Shellder line | ★★★ | Ice | Single | 25% ATK | 2-5 | 4 | — |
| Phantom Grin | Gastly line | ★★★ | Ghost | Splash | 90% ATK | — | 4 | Double power against targets already losing HP each round. |
| Iron Serpent | Onix line | ★★★ | Steel | Pierce | 100% ATK | — | 4 | — |
| Dream Eater | Drowzee line | ★★★ | Psychic | Single | 90% ATK | — | 4 | User heals 50% of the damage dealt. |
| Crabhammer | Krabby line | ★★★ | Water | Single | 120% ATK | — | 4 | — |
| Self-Destruct | Voltorb line | ★★★ | Electric | Full field | 160% ATK | — | 2 | The user faints after using it. |
| Egg Barrage | Exeggcute line | ★★★ | Grass | Full front row | 80% ATK | — | 4 | — |
| Bone Rush | Cubone line | ★★★ | Ground | Single | 30% ATK | 3-5 | 4 | — |
| High Jump Kick | Tyrogue line | ★★★ | Fighting | Single | 140% ATK | — | 4 | If the target faints or dodges, the user loses 25% of its max HP. |
| Elemental Combo | Tyrogue line | ★★★ | Fighting | Single | 35% ATK | 3 | 4 | Each hit uses Fire, Electric, then Ice for type effectiveness. |
| Triple Spin | Tyrogue line | ★★★ | Fighting | Splash | 70% ATK | — | 4 | User takes 20% less damage for the next round. |
| Endless Tongue | Lickitung line | ★★★ | Normal | Pierce | 90% ATK | — | 4 | Targets lose 10% Speed for the battle. |
| Smog Burst | Koffing line | ★★★ | Poison | Full field | 50% ATK | — | 4 | Targets lose 5% max HP at the end of each of the next 2 rounds. |
| Rock Wrecker | Rhyhorn line | ★★★ | Rock | Splash | 130% ATK | — | 4 | The user skips its next action to recharge. |
| Healing Egg | Happiny line | ★★★ | Normal | Support · Whole team | 35% HP | — | 4 | Heals every teammate 35% of its max HP. |
| Power Whip | Tangela line | ★★★ | Grass | Pierce | 110% ATK | — | 4 | — |
| Parental Bond | Kangaskhan | ★★★ | Normal | Single | 60% ATK | 2 | 4 | The second hit uses 50% power. |
| Dragon Tide | Horsea line | ★★★ | Dragon | Full front row | 85% ATK | — | 4 | Hits count as Water type if that's more effective. |
| Megahorn Dive | Goldeen line | ★★★ | Water | Pierce | 100% ATK | — | 4 | — |
| Prism Spin | Staryu line | ★★★ | Water | Splash | 85% ATK | — | 4 | Hits count as Psychic type if that's more effective. |
| Barrier Wall | Mime Jr. line | ★★★ | Psychic | Support · Own front row | — | — | 4 | Own front row takes 40% less damage for the next 2 rounds. |
| Bullet Pincer | Scyther line | ★★★ | Steel | Single | 70% ATK | — | 4 | On the first round of a battle, acts before anyone without a first-round move. |
| Frost Kiss | Smoochum line | ★★★ | Ice | Single | 100% ATK | — | 4 | User heals 25% of the damage dealt. |
| Plasma Fist | Elekid line | ★★★ | Electric | Pierce | 110% ATK | — | 4 | — |
| Magma Cannon | Magby line | ★★★ | Fire | Back row | 100% ATK | — | 4 | — |
| Guillotine Grip | Pinsir | ★★★ | Bug | Single | 130% ATK | — | 4 | Double power against targets below 25% HP. |
| Stampede | Tauros | ★★★ | Normal | Pierce | 110% ATK | — | 4 | User takes 20% of the damage dealt. |
| Dragon Fury Tide | Magikarp line | ★★★ | Water | Full front row | 110% ATK | — | 4 | The user skips its next action to recharge. |
| Frozen Ferry | Lapras | ★★★ | Ice | Support · Whole team | 25% HP | — | 4 | Heals every teammate 25% of its max HP, then deals Ice damage equal to 40% ATK to the enemy front row. |
| Transform | Ditto | ★★★ | Normal | Support · Self | — | — | 4 | Copies the moves of the enemy directly across for the rest of the battle, at full PP. |
| Hydro Veil | Eevee line | ★★★ | Water | Full front row | 75% ATK | — | 4 | User heals 25% of the damage dealt. |
| Pin Volley | Eevee line | ★★★ | Electric | Single | 25% ATK | 3-5 | 4 | — |
| Flare Rush | Eevee line | ★★★ | Fire | Single | 130% ATK | — | 4 | User takes 20% of the damage dealt. |
| Morning Sun Psyblast | Eevee line | ★★★ | Psychic | Splash | 80% ATK | — | 4 | User heals 15% of its max HP. |
| Moonlit Guard | Eevee line | ★★★ | Dark | Support · Own front row | — | — | 4 | Own front row takes 30% less damage for 2 rounds, and each hit on them costs the attacker 5% max HP. |
| Leaf Blade | Eevee line | ★★★ | Grass | Single | 110% ATK | — | 4 | Ignores Reflect and Defense Curl-style damage reduction. |
| Diamond Dust | Eevee line | ★★★ | Ice | Full field | 60% ATK | — | 4 | — |
| Ribbon Chorus | Eevee line | ★★★ | Fairy | Full front row | 70% ATK | — | 4 | Every teammate heals 10% of its max HP. |
| Glitch Beam | Porygon line | ★★★ | Normal | Pierce | 100% ATK | — | 4 | Hits count as the type that's most effective against each target. |
| Spiral Cannon | Omanyte line | ★★★ | Rock | Pierce | 100% ATK | — | 4 | Hits count as Water type if that's more effective. |
| Fossil Scythe | Kabuto line | ★★★ | Rock | Single | 60% ATK | 2 | 4 | — |
| Sky Fossil Dive | Aerodactyl | ★★★ | Rock | Back row | 100% ATK | — | 4 | — |
| Giga Belly Flop | Munchlax line | ★★★ | Normal | Splash | 110% ATK | — | 4 | User heals 20% of its max HP afterward. |
| Freezing Gale | Articuno | ★★★ | Ice | Full field | 80% ATK | — | 4 | Targets lose 15% Speed for the battle. |
| Thunder Cage | Zapdos | ★★★ | Electric | Full front row | 90% ATK | — | 4 | Targets lose 10% Speed for the battle. |
| Sky Inferno | Moltres | ★★★ | Fire | Full field | 85% ATK | — | 4 | Targets lose 5% max HP at the end of each of the next 2 rounds. |
| Draco Rush | Dratini line | ★★★ | Dragon | Single | 140% ATK | — | 4 | User takes 15% of the damage dealt. |
| Psystrike | Mewtwo | ★★★ | Psychic | Splash | 120% ATK | — | 4 | — |
| Genesis Pulse | Mew | ★★★ | Psychic | Full field | 70% ATK | — | 4 | Hits count as the type that's most effective against each target. |

## Master move list

All 163 shared moves, by star then type. **Pools** is where it's taught; **Signature of** lists lines that get it by leveling instead.

| Move | ★ | Type | Kind / shape | Power | Hits | PP | Pools | Signature of | Effect |
|---|---|---|---|---|---|---|---|---|---|
| Bug Bite | ★ | Bug | Single | 40% ATK | — | 8 | Bug | Caterpie, Pinsir | — |
| Fury Cutter | ★ | Bug | Single | 15% ATK | 2-4 | 6 | Bug | Scyther | — |
| Leech Life | ★ | Bug | Single | 45% ATK | — | 6 | Bug | Zubat, Venonat | User heals 50% of the damage dealt. |
| String Shot | ★ | Bug | Full front row | 15% ATK | — | 8 | Bug | — | Targets lose 15% Speed for the battle. |
| Feint Attack | ★ | Dark | Single | 45% ATK | — | 8 | Dark | Meowth, Eevee | Ignores effects that dodge hits, like Sand Veil. |
| Pursuit | ★ | Dark | Single | 40% ATK | — | 8 | Ghost, Dark | — | Double power against a target below 25% HP. |
| Twister | ★ | Dragon | Splash | 25% ATK | — | 8 | Dragon | Dratini | — |
| Charge | ★ | Electric | Support · Self | — | — | 4 | Electric | — | The user's next Electric move deals double damage. |
| Nuzzle | ★ | Electric | Single | 30% ATK | — | 8 | Electric | — | Target loses 20% Speed for the battle. |
| Thunder Shock | ★ | Electric | Single | 45% ATK | — | 8 | Electric | Pichu, Magnemite, Voltorb, Elekid, Zapdos | — |
| Disarming Voice | ★ | Fairy | Full front row | 25% ATK | — | 6 | Fairy | — | — |
| Fairy Wind | ★ | Fairy | Single | 40% ATK | — | 8 | Fairy | Cleffa | — |
| Karate Chop | ★ | Fighting | Single | 45% ATK | — | 8 | Power, Fighting | Mankey, Machop | — |
| Low Kick | ★ | Fighting | Single | 40% ATK | — | 8 | Fighting | Mankey | — |
| Rock Smash | ★ | Fighting | Single | 35% ATK | — | 8 | Fighting | Tyrogue | Target's next hit on the user deals 20% less damage. |
| Ember | ★ | Fire | Single | 45% ATK | — | 8 | Fire | Charmander, Vulpix, Growlithe, Ponyta, Magby, Moltres | — |
| Flame Charge | ★ | Fire | Single | 35% ATK | — | 8 | Fire | Ponyta | User gains 10% Speed for the battle. |
| Gust | ★ | Flying | Single | 45% ATK | — | 8 | Flying | Pidgey | — |
| Peck | ★ | Flying | Single | 40% ATK | — | 8 | Flying | Spearow, Nidoran♂, Farfetch'd, Doduo | — |
| Astonish | ★ | Ghost | Single | 40% ATK | — | 8 | Ghost, Dark | — | — |
| Lick | ★ | Ghost | Single | 30% ATK | — | 8 | Ghost | Gastly, Lickitung | Target loses 10% Speed for the battle. |
| Absorb | ★ | Grass | Single | 35% ATK | — | 8 | Grass | Oddish, Exeggcute | User heals 50% of the damage dealt. |
| Growth | ★ | Grass | Support · Self | — | — | 4 | Grass | — | User gains 25% Attack for the battle. |
| Vine Whip | ★ | Grass | Single | 45% ATK | — | 8 | Grass | Bulbasaur, Bellsprout, Tangela | — |
| Mud Shot | ★ | Ground | Splash | 25% ATK | — | 6 | Ground | — | Targets lose 10% Speed for the battle. |
| Mud-Slap | ★ | Ground | Single | 40% ATK | — | 8 | Ground | Sandshrew, Cubone | Target loses 10% Speed for the battle. |
| Sand Attack | ★ | Ground | Single | 20% ATK | — | 8 | Ground, Rock | Diglett, Rhyhorn | Target's next hit misses entirely. |
| Ice Shard | ★ | Ice | Single | 35% ATK | — | 8 | Ice | — | On the first round of a battle, acts before anyone without a first-round move. |
| Powder Snow | ★ | Ice | Splash | 25% ATK | — | 8 | Ice | Shellder, Smoochum, Lapras, Articuno | — |
| Defense Curl | ★ | Normal | Support · Self | — | — | 6 | Universal | — | The next 2 hits on the user deal 50% less damage. |
| Double Slap | ★ | Normal | Single | 15% ATK | 2-5 | 6 | Normal | — | — |
| Focus Energy | ★ | Normal | Support · Self | — | — | 4 | Universal | — | The user's next offensive move deals 50% more damage. |
| Fury Swipes | ★ | Normal | Single | 15% ATK | 2-5 | 6 | Normal | Doduo, Kangaskhan | — |
| Harden | ★ | Normal | Support · Self | — | — | 6 | Sturdy | Caterpie, Weedle | The next 2 hits on the user deal 50% less damage. |
| Helping Hand | ★ | Normal | Support · Teammate ahead | — | — | 4 | Universal | — | +30% Attack for the battle to the teammate in front of it; if none, the highest-Attack teammate. |
| Leer | ★ | Normal | Full front row | 10% ATK | — | 8 | Normal, Dragon | — | Targets lose 10% Attack for the battle. |
| Quick Attack | ★ | Normal | Single | 35% ATK | — | 8 | Swift | Rattata | On the first round of a battle, acts before anyone without Quick Attack. |
| Rage | ★ | Normal | Single | 30% ATK | — | 8 | Normal | — | +10% power each time it's used this battle. |
| Scratch | ★ | Normal | Single | 40% ATK | — | 10 | Normal | Nidoran♀, Paras, Meowth, Kabuto | — |
| Tackle | ★ | Normal | Single | 40% ATK | — | 10 | Universal | Igglybuff, Happiny, Tauros, Magikarp, Ditto, Eevee, Porygon, Munchlax | — |
| Poison Sting | ★ | Poison | Single | 20% ATK | 2 | 8 | Poison | Weedle, Ekans, Tentacool, Grimer | — |
| Poison Tail | ★ | Poison | Single | 40% ATK | — | 8 | Poison | — | — |
| Smog | ★ | Poison | Single | 30% ATK | — | 8 | Poison | Koffing | Target loses 5% max HP at the end of each of the next 2 rounds. |
| Agility | ★ | Psychic | Support · Self | — | — | 4 | Swift, Psychic, Dragon | — | User gains 30% Speed for the battle. |
| Psywave | ★ | Psychic | Single | 40% ATK | — | 8 | Psychic | Abra, Slowpoke, Drowzee, Mime Jr., Mewtwo, Mew | — |
| Rock Throw | ★ | Rock | Single | 45% ATK | — | 8 | Power, Sturdy, Rock | Geodude, Onix, Omanyte, Aerodactyl | — |
| Metal Claw | ★ | Steel | Single | 40% ATK | — | 8 | Steel | Krabby | User gains 5% Attack for the battle. |
| Aqua Jet | ★ | Water | Single | 35% ATK | — | 8 | Water | — | On the first round of a battle, acts before anyone without a first-round move. |
| Bubble | ★ | Water | Splash | 20% ATK | — | 8 | Water | Poliwag, Krabby, Horsea | — |
| Water Gun | ★ | Water | Single | 45% ATK | — | 8 | Water | Squirtle, Psyduck, Seel, Goldeen, Staryu | — |
| Pin Missile | ★★ | Bug | Single | 15% ATK | 2-5 | 4 | Bug | — | — |
| Signal Beam | ★★ | Bug | Splash | 40% ATK | — | 4 | Bug | — | — |
| Bite | ★★ | Dark | Single | 60% ATK | — | 6 | Power, Dark | Zubat | — |
| Crunch | ★★ | Dark | Single | 75% ATK | — | 4 | Dark | Magikarp | — |
| Nasty Plot | ★★ | Dark | Support · Self | — | — | 2 | Ghost, Dark | — | User gains 40% Attack for the battle. |
| Dragon Breath | ★★ | Dragon | Single | 60% ATK | — | 6 | Dragon | Dratini | — |
| Discharge | ★★ | Electric | Splash | 45% ATK | — | 4 | Electric | Zapdos | — |
| Spark | ★★ | Electric | Pierce | 50% ATK | — | 6 | Electric | Magnemite, Voltorb, Eevee | — |
| Thunder Punch | ★★ | Electric | Single | 70% ATK | — | 4 | Electric, Power | Elekid | — |
| Draining Kiss | ★★ | Fairy | Single | 45% ATK | — | 4 | Fairy | Eevee | User heals 75% of the damage dealt. |
| Moonlight | ★★ | Fairy | Support · Self | 40% HP | — | 4 | Fairy | — | User heals 40% of its max HP. |
| Brick Break | ★★ | Fighting | Single | 70% ATK | — | 4 | Power, Fighting | Pinsir | Ignores Reflect and Defense Curl-style damage reduction. |
| Bulk Up | ★★ | Fighting | Support · Self | — | — | 4 | Fighting | Tyrogue | User gains 20% Attack and its next hit taken deals 20% less damage. |
| Double Kick | ★★ | Fighting | Single | 30% ATK | 2 | 6 | Swift, Fighting | Nidoran♀, Tyrogue | — |
| Mach Punch | ★★ | Fighting | Single | 40% ATK | — | 6 | Fighting | Tyrogue | On the first round of a battle, acts before anyone without a first-round move. |
| Submission | ★★ | Fighting | Single | 90% ATK | — | 4 | Fighting | Machop | User takes 25% of the damage dealt. |
| Fire Fang | ★★ | Fire | Single | 60% ATK | — | 6 | Fire | Growlithe, Eevee | — |
| Fire Punch | ★★ | Fire | Single | 70% ATK | — | 4 | Fire, Power | Magby | — |
| Fire Spin | ★★ | Fire | Splash | 35% ATK | — | 6 | Fire | Moltres | — |
| Flame Wheel | ★★ | Fire | Pierce | 50% ATK | — | 6 | Fire | Charmander | — |
| Aerial Ace | ★★ | Flying | Single | 60% ATK | — | 6 | Flying, Swift | — | Ignores effects that dodge hits, like Sand Veil. |
| Air Slash | ★★ | Flying | Splash | 45% ATK | — | 4 | Flying | — | — |
| Roost | ★★ | Flying | Support · Self | 40% HP | — | 4 | Flying | — | User heals 40% of its max HP. |
| Wing Attack | ★★ | Flying | Pierce | 50% ATK | — | 6 | Flying | Pidgey, Farfetch'd | — |
| Hex | ★★ | Ghost | Single | 50% ATK | — | 4 | Ghost | Gastly, Drowzee | Double power if the target is already losing HP each round. |
| Night Shade | ★★ | Ghost | Single | — | — | 4 | Ghost, Dark | — | Ignores Attack: deals damage equal to 20% of the user's max HP. |
| Leech Seed | ★★ | Grass | Single | 20% ATK | — | 2 | Grass | — | Target loses 8% max HP at the end of every round; the user heals the same amount. |
| Mega Drain | ★★ | Grass | Single | 50% ATK | — | 6 | Grass | Oddish, Tangela | User heals 50% of the damage dealt. |
| Petal Blizzard | ★★ | Grass | Full front row | 45% ATK | — | 4 | Grass | — | — |
| Razor Leaf | ★★ | Grass | Pierce | 25% ATK | 2 | 6 | Grass | Bulbasaur, Eevee | — |
| Seed Bomb | ★★ | Grass | Single | 70% ATK | — | 4 | Grass | — | — |
| Spore Bomb | ★★ | Grass | Back row | 55% ATK | — | 4 | Grass | — | — |
| Bone Club | ★★ | Ground | Single | 60% ATK | — | 6 | Ground | Cubone | — |
| Bulldoze | ★★ | Ground | Full front row | 40% ATK | — | 4 | Ground | — | Targets lose 10% Speed for the battle. |
| Dig | ★★ | Ground | Back row | 55% ATK | — | 4 | Ground | Sandshrew, Diglett | — |
| Aurora Beam | ★★ | Ice | Pierce | 55% ATK | — | 4 | Ice | Seel, Smoochum, Eevee, Articuno | Targets lose 10% Attack for the battle. |
| Ice Punch | ★★ | Ice | Single | 70% ATK | — | 4 | Power, Ice | — | — |
| Icy Wind | ★★ | Ice | Full front row | 35% ATK | — | 4 | Sturdy, Ice | Shellder | Targets lose 10% Speed for the battle. |
| Body Slam | ★★ | Normal | Single | 75% ATK | — | 4 | Normal | — | — |
| Headbutt | ★★ | Normal | Single | 70% ATK | — | 4 | Universal | — | — |
| Heal Pulse | ★★ | Normal | Support · Lowest-HP teammate | 30% HP | — | 4 | Sturdy | — | Heals the lowest-HP teammate 30% of its max HP. |
| Horn Attack | ★★ | Normal | Single | 60% ATK | — | 6 | Normal | Rhyhorn, Goldeen, Tauros | — |
| Metronome | ★★ | Normal | Single | — | — | 2 | Normal, Fairy | — | Uses a random offensive move from the whole list at its listed power. |
| Slam | ★★ | Normal | Single | 65% ATK | — | 4 | Normal | Lickitung, Kangaskhan, Munchlax | — |
| Soft-Boiled | ★★ | Normal | Support · Self | 50% HP | — | 2 | Normal | Happiny | User heals 50% of its max HP. |
| Swift | ★★ | Normal | Full front row | 30% ATK | — | 4 | Universal | Ditto | — |
| Take Down | ★★ | Normal | Single | 90% ATK | — | 4 | Power | — | User takes 25% of the damage dealt. |
| Wish | ★★ | Normal | Support · Lowest-HP teammate | 50% HP | — | 2 | Normal, Fairy | — | At the end of the next round, the lowest-HP teammate heals 50% of its max HP. |
| Acid | ★★ | Poison | Splash | 35% ATK | — | 6 | Poison | Ekans | — |
| Poison Fang | ★★ | Poison | Single | 50% ATK | — | 6 | Poison | — | Target loses 5% max HP at the end of each of the next 2 rounds. |
| Poison Jab | ★★ | Poison | Pierce | 55% ATK | — | 4 | Poison | Nidoran♂ | — |
| Sludge | ★★ | Poison | Splash | 45% ATK | — | 4 | Poison | Bellsprout, Tentacool, Grimer, Koffing | — |
| Venoshock | ★★ | Poison | Single | 50% ATK | — | 4 | Poison | — | Double power if the target is already losing HP each round (Smog, Poison Fang, Leech Seed). |
| Amnesia | ★★ | Psychic | Support · Self | — | — | 4 | Sturdy, Psychic | Slowpoke | User takes 25% less damage for the rest of the battle, but loses 10% Speed. |
| Calm Mind | ★★ | Psychic | Support · Self | — | — | 4 | Psychic | Slowpoke, Mew | User gains 20% Attack and 20% Speed for the battle. |
| Confusion | ★★ | Psychic | Single | 55% ATK | — | 4 | Sturdy, Psychic | Psyduck, Exeggcute | — |
| Psybeam | ★★ | Psychic | Pierce | 45% ATK | — | 6 | Psychic | Venonat, Abra, Staryu, Eevee, Porygon, Mewtwo | — |
| Reflect | ★★ | Psychic | Support · Own front row | — | — | 4 | Sturdy, Psychic | Mime Jr. | Own front row takes 25% less damage for the next 2 rounds. |
| Rest | ★★ | Psychic | Support · Self | 100% HP | — | 2 | Sturdy, Psychic | — | User heals to full HP, then skips its next 2 actions. |
| Rock Slide | ★★ | Rock | Full front row | 45% ATK | — | 4 | Rock | Geodude, Aerodactyl | — |
| Rock Tomb | ★★ | Rock | Single | 55% ATK | — | 4 | Power, Rock | Omanyte, Kabuto | Target loses 15% Speed for the battle. |
| Rollout | ★★ | Rock | Single | 25% ATK | — | 6 | Sturdy, Rock | — | Power doubles with each use this battle (25% → 50% → 100% → 200% max). |
| Iron Defense | ★★ | Steel | Support · Self | — | — | 4 | Sturdy, Rock, Steel | Onix | The next 3 hits on the user deal 40% less damage. |
| Steel Wing | ★★ | Steel | Single | 60% ATK | — | 6 | Steel | Scyther | User takes 15% less damage from the next hit. |
| Aqua Ring | ★★ | Water | Support · Self | 25% HP | — | 4 | Water | — | User heals 25% of its max HP. |
| Bubble Beam | ★★ | Water | Pierce | 50% ATK | — | 6 | Water | Poliwag | — |
| Water Pulse | ★★ | Water | Splash | 40% ATK | — | 6 | Water | Horsea, Lapras, Eevee | — |
| Megahorn | ★★★ | Bug | Single | 120% ATK | — | 2 | Bug | — | — |
| X-Scissor | ★★★ | Bug | Pierce | 75% ATK | — | 2 | Bug | — | — |
| Dark Pulse | ★★★ | Dark | Splash | 70% ATK | — | 2 | Ghost, Dark | — | — |
| Foul Play | ★★★ | Dark | Single | 90% ATK | — | 2 | Ghost, Dark | — | Uses the target's Attack instead of the user's. |
| Dragon Claw | ★★★ | Dragon | Single | 85% ATK | — | 2 | Power, Dragon | — | — |
| Outrage | ★★★ | Dragon | Single | 40% ATK | 3 | 2 | Dragon | — | The user skips its next action afterwards. |
| Thunder | ★★★ | Electric | Full field | 55% ATK | — | 2 | Electric | — | — |
| Thunderbolt | ★★★ | Electric | Single | 90% ATK | — | 2 | Electric | — | — |
| Dazzling Gleam | ★★★ | Fairy | Full front row | 50% ATK | — | 2 | Fairy | — | — |
| Moonblast | ★★★ | Fairy | Single | 95% ATK | — | 2 | Fairy | — | — |
| Body Press | ★★★ | Fighting | Single | 60% ATK | — | 2 | Sturdy | — | Uses the user's max HP instead of Attack: damage = 25% of max HP × type multiplier. |
| Close Combat | ★★★ | Fighting | Single | 120% ATK | — | 2 | Fighting | — | User takes 15% more damage for the rest of the battle. |
| Cross Chop | ★★★ | Fighting | Single | 100% ATK | — | 2 | Fighting | — | — |
| Fire Blast | ★★★ | Fire | Full field | 55% ATK | — | 2 | Fire | — | — |
| Flamethrower | ★★★ | Fire | Single | 90% ATK | — | 2 | Fire | — | — |
| Brave Bird | ★★★ | Flying | Single | 120% ATK | — | 2 | Flying | — | User takes 25% of the damage dealt. |
| Drill Peck | ★★★ | Flying | Pierce | 80% ATK | — | 2 | Flying | — | — |
| Hurricane | ★★★ | Flying | Back row | 85% ATK | — | 2 | Flying | — | — |
| Tailwind | ★★★ | Flying | Support · Whole team | — | — | 2 | Flying, Swift | — | Whole team gains 20% Speed for the battle. |
| Shadow Ball | ★★★ | Ghost | Single | 90% ATK | — | 2 | Ghost, Dark | — | — |
| Aromatherapy | ★★★ | Grass | Support · Whole team | 12% HP | — | 2 | Grass | — | Heals every teammate 12% of its max HP. |
| Giga Drain | ★★★ | Grass | Single | 65% ATK | — | 2 | Grass | — | User heals 50% of the damage dealt. |
| Petal Dance | ★★★ | Grass | Single | 35% ATK | 2-3 | 2 | Grass | — | — |
| Solar Beam | ★★★ | Grass | Single | 140% ATK | — | 2 | Grass | — | Can't be picked in round 1 (it's charging). |
| Bonemerang | ★★★ | Ground | Single | 45% ATK | 2 | 2 | Ground | — | — |
| Earth Power | ★★★ | Ground | Single | 95% ATK | — | 2 | Ground | — | — |
| Earthquake | ★★★ | Ground | Full field | 60% ATK | — | 2 | Ground | — | — |
| Blizzard | ★★★ | Ice | Full field | 55% ATK | — | 2 | Ice | — | — |
| Ice Beam | ★★★ | Ice | Single | 90% ATK | — | 2 | Ice | — | — |
| Double-Edge | ★★★ | Normal | Single | 120% ATK | — | 2 | Power | — | User takes 33% of the damage dealt. |
| Extreme Speed | ★★★ | Normal | Single | 80% ATK | — | 2 | Swift | — | Always acts first in its round, before Speed order. |
| Hyper Beam | ★★★ | Normal | Single | 120% ATK | — | 2 | Universal | — | The user skips its next action to recharge. |
| Hyper Voice | ★★★ | Normal | Full front row | 55% ATK | — | 2 | Normal | — | — |
| Mega Kick | ★★★ | Normal | Single | 110% ATK | — | 2 | Normal, Power | — | — |
| Sing | ★★★ | Normal | Full front row | — | — | 2 | Normal | — | Targets skip their next action. Can't be picked two turns in a row. |
| Super Fang | ★★★ | Normal | Single | — | — | 2 | Normal | — | Ignores Attack: removes 50% of the target's current HP. |
| Swords Dance | ★★★ | Normal | Support · Self | — | — | 2 | Power | — | User gains 50% Attack for the battle. |
| Sludge Bomb | ★★★ | Poison | Single | 90% ATK | — | 2 | Poison | — | — |
| Future Sight | ★★★ | Psychic | Single | 120% ATK | — | 2 | Psychic | — | Lands at the end of the next round instead of now. |
| Psychic | ★★★ | Psychic | Single | 90% ATK | — | 2 | Psychic | — | — |
| Ancient Power | ★★★ | Rock | Single | 60% ATK | — | 2 | Rock | — | User gains 10% Attack and 10% Speed for the battle. |
| Stone Edge | ★★★ | Rock | Single | 110% ATK | — | 2 | Rock | — | — |
| Flash Cannon | ★★★ | Steel | Pierce | 80% ATK | — | 2 | Steel | — | — |
| Iron Tail | ★★★ | Steel | Single | 90% ATK | — | 2 | Power, Steel | — | — |
| Hydro Pump | ★★★ | Water | Single | 110% ATK | — | 2 | Water | — | — |
| Surf | ★★★ | Water | Full front row | 55% ATK | — | 2 | Water | — | — |

## Known gaps, left for the rebalance pass

- **Poison and Water are the biggest type groups**, a side effect of single-typing Gen 1; Ghost and Dark have one line each, so their pools share moves with each other.
- **Birds that aren't Flying type** (Spearow is Normal, Zubat is Poison) don't get Flying moves beyond their signatures. Fixable later with a rule kind like "can fly" or an explicit line list.
- **Pool size varies a lot**, because lines that clear several stat bars stack pools, and branching lines like Eevee can reach many type pools across their branches. Worth deciding whether to cap it.
- **Some abilities reference systems that don't exist yet** (skipped actions from Sing, currency from Pickup, legendary Pressure's PP cost). They're written to fit the current rules, but need checking once combat is prototyped.
- **Stats come from five archetypes** with small per-line tweaks, not hand-tuned spreads. Legendaries get a flat boost; Magikarp is deliberately weak at ★1.
