---
title: Poke-Crawl — Feature Index
---

# Poke-Crawl — Feature Index

This is the tracker for the game's design docs. Each feature has its own file. Status reflects how much is actually decided, not just whether a file has words in it.

**Status key:** 🟡 basic pass, some open questions remain · 🔴 needs work · ✅ detailed, no open questions

| Feature | File | Status |
|---|---|---|
| Core Game Loop | [01-core-game-loop.md](01-core-game-loop.md) | 🟡 |
| Starter Selection | [02-starter-selection.md](02-starter-selection.md) | 🟡 |
| Map & Exploration | [03-map-exploration.md](03-map-exploration.md) | 🟡 |
| Battle System | [04-battle-system.md](04-battle-system.md) | 🟡 field, targeting + shapes confirmed; signature by default, taught move by chance, move limit per Pokémon (see 11 and 13) |
| Team Management (party, daycare, moves) | [05-team-management.md](05-team-management.md) | 🟡 |
| Items | [06-items.md](06-items.md) | 🟡 held-item model drafted in [14-items-data.md](14-items-data.md); TMs removed |
| Evolution | [07-evolution.md](07-evolution.md) | 🟡 |
| Gym Leader Bosses | [08-gym-leader-bosses.md](08-gym-leader-bosses.md) | 🟡 |
| Roguelite Run Structure | [09-roguelite-run-structure.md](09-roguelite-run-structure.md) | 🟡 |
| Tech & Platform | [10-tech-and-platform.md](10-tech-and-platform.md) | 🟡 |
| Moves — design, learning & Move Tutor | [11-moves.md](11-moves.md) | 🟡 star ratings, move pools and Move Tutor drafted; move data in [13-pokemon-roster-data.md](13-pokemon-roster-data.md) |
| UI Components | [12-ui-components.md](12-ui-components.md) | 🟡 unit tile, battle variant + empty slot locked; health indicator still A/B (ring vs. bar) |
| Pokémon Roster Data (levels, stats, abilities, signatures, master move list, move pools, PP) | [13-pokemon-roster-data.md](13-pokemon-roster-data.md) | 🟡 draft content pass 7: all of Gen 1 plus family members (78 lines, 183 species), ready to rebalance |
| Held Items — Data Pass | [14-items-data.md](14-items-data.md) | 🟡 draft content pass, 12 items adapted to Poke-Crawl's mechanics |

**[open-questions.md](open-questions.md)** is the running list of everything still undecided, tagged by urgency. Visual reference for the roster: the **Pokédex** artifact.

## The shape of the game, in one paragraph

A run is a sequence of branching maps ending in gym leader fights. **Combat is fully automatic** — the player's decisions all happen on the map: which Pokémon to take, which lanes to put them in and how deep to stack them, which moves to teach, which items they hold, which path to walk. Battles then resolve on their own, and every battle is an independent pass/fail check against the build the player has assembled. There's no attrition and no meta-progression, so the whole game is routing and team-building under a finite XP budget, and the first battle you lose is the last one you play.

## Decisions locked in

**Combat** (full detail and confirmed test cases in [04-battle-system.md](04-battle-system.md))
- **Fully automatic.** All player input happens before a fight starts.
- Stats are **HP, Attack, Speed** only — no Defense, no physical/special split.
- **Damage is a percentage of the user's Attack:** damage = Attack × move power % × type multiplier × modifiers. Heals are a percentage of the target's max HP.
- Every Pokémon has an **Ability** that triggers in battle or applies a passive effect; one per evolution line (list in [13-pokemon-roster-data.md](13-pokemon-roster-data.md)).
- **Both sides field the whole party at once**: a **front row of 3** and a **back row of 3**, across three **lanes**.
- **Only the two front rows are adjacent.**
- **Offensive moves pick a center** using a fixed order: directly ahead → **scan left** (past gaps) → **scan right**. **A back-row Pokémon can't select a center at all, so every offensive move fails there** — including area and field-wide ones.
- **The move's shape radiates from that center.** Confirmed shapes: single, **pierce**, **splash**, **full front row**, **back row only**, and **full field**. Separately, moves can land **repeat hits** on one target, 2-5 times per action.
- **This makes positioning rock-paper-scissors:** stacking a lane protects against single-target damage but is exactly what back-row moves punish; spreading wide avoids that but feeds splash and full-row moves.
- **Support moves can target any teammate on the field**, any lane, either row, from either row. **Each move defines its own rule for which teammate it picks.**
- **Compaction: before every action, everyone pushes as far forward in their lane as possible.** A lane is either occupied at the front or entirely empty.
- **Nobody slides sideways.** A lane whose front-liner falls with nobody behind is **gone for the rest of the battle**.
- **Rounds, in Speed order** — everyone acts once per round, fastest first. **The battle ends the instant one side is empty**, mid-round if that's when it happens.
- **Move selection: signature by default, taught move by chance.** A Pokémon's **signature move** is what it uses unless its **taught move** comes up: each tutor move has a **chance** (10–25%, set per move in `data.json`), rolled every action. If the move it lands on would fail from where it stands (an attack from the back row, a shape that hits nobody, Counter before being hit), it uses the other one; if neither would work, it waits. The odds never change during a battle and show as percentages on the Pokémon's info (e.g. 80% / 20%). Each Pokémon has a **move limit** per battle (12 at ★1, +2 per star; `TUNE.moveLimit` / `moveLimitStep`); waiting doesn't use it, and at 0 it **Struggles**, which keeps long fights from stalling. Held items (and later single-use items) can raise a taught move's chance or the move limit.
- Most Pokémon faint in any given battle; that's normal. **All are fully healed and revived afterward**, so there's no attrition between nodes.
- All battles are trainer battles; none can be fled.

**Moves** (rules in [11-moves.md](11-moves.md); the move list itself in [13-pokemon-roster-data.md](13-pokemon-roster-data.md))
- **A Pokémon knows 4 moves:** 1 **signature** plus 3 **taught at the Move Tutor**.
- **The signature is the only move learned by leveling, and it's replaced at every level (★1–★3).** ★1 is a plain shared move, never unique. ★2 is a real upgrade and sometimes unique. **★3 is always unique** to its line.
- **Every move has a star rating (★1–★3); a Pokémon can only be taught moves at or below its own level.** Moves already known are kept on leveling up.
- **The master move list** defines what every move does; **move pools** define who can learn it. A pool is a list of moves plus a rule: **Universal** (everyone), one pool **per type**, and **stat pools** (Swift, Power, Sturdy) based on ★1 stats. A Pokémon can be taught every move in every pool it qualifies for, minus its own signatures, filtered by star.
- Goal: teachable moves aren't unique to one line. While a type has only one line in the roster, its type pool is effectively that line's alone.
- Each move carries a **type**, a **shape**, a **power %**, a **star rating** (tutor moves also a **chance**), optional **repeat hits**, and — for support moves — its own **target-selection rule**.
- **Learned moves.** A Pokémon remembers every move it has known (`m.learned`): its signatures from each level and every taught move. Its scan has a Change button per move to switch back to one of them for free (signature slot ↔ earlier signatures, taught slot ↔ earlier taught moves; `m.sig` holds a switched-back signature, and leveling up resets it to the new one). Moves it never learned must be taught at a tutor, which no longer offers already-learned moves.
- **A tutor move's chance is its main balance dial**: how often it replaces the signature. Scale: 25% filler · 20% mainline · 15% strong · 10% finisher (from the old PP values 8 / 6 / 4 / 2).
- **Design principle: moves that break the default combat rules need a real drawback or genuine scarcity.**
- **Roster simplification for the current content pass:** every Pokémon has a single type (it can change on evolution, e.g. Onix → Steelix); dual-typing can come back later.

**Run structure**
- No meta-progression, at all. Every run is a clean slate.
- **Losing any battle ends the run.**
- The 8 gym leaders are faced in a **fixed order**.

**Team building**
- Party cap is **6**. Overflow lives in the **Daycare** (replaces the box/PC).
- New Pokémon come from **Wild nodes** (no battle, pick 1 of **3 offered** from that map's pool) or from **Legendary nodes** (beat a legendary's team to capture it).
- **Wild tiers.** Every wild line has a **tier, 1–8** (`tier` on its forms in `data.json`): the first map it can be found on. Each wild Pokémon offered on map N is from tier N 60% of the time (`TUNE.wildTierChance`), otherwise from any earlier tier, so map 1 offers only tier 1. Higher tiers end up stronger (stat totals, abilities: Dratini, Lapras, Snorlax, Scyther at tier 8), but every tier stays worth having; the gap is small on purpose. The RotomDex shows each Pokémon's "Wild from map N".
- Every map guarantees **at least 2 wild nodes on any path**, ceiling of 3. The generator validates every path against the minimum and regenerates until it passes.
- Player starts with 1 and reaches the cap around map 3: 3 by gym 1, 5 by gym 2, 6 by gym 3.
- **Daycare Pokémon gain XP at a reduced rate**; accessed at Daycare nodes and after each boss.
- Starter pool is the classic fire/water/grass trio.

**XP**
- **Trainer battles are the only source**, and XP is a **shared pool split across the active party** — so a wider team is a shallower one, and party width self-balances.

**Evolution**
- **Levels are stars, ★1 to ★3.** Leveling up evolves the Pokémon if it has a next stage; if not, it keeps its species and just gets stronger (full rule in [13-pokemon-roster-data.md](13-pokemon-roster-data.md)).
- **Branching lines split on a held item** when they level: Gloom, Poliwhirl, Slowpoke, Tyrogue and Eevee (8 ways). Without the item, a Pokémon at a stone split levels in place (Slowpoke's split defaults to Slowbro).

**Currency & Items**
- **Currency** — a small starting amount, topped up by winning trainer and gym leader battles, spent only at the **Move Tutor**. Resets each run like everything else.
- **The Move Tutor teaches moves for currency** instead of selling TMs: 5 moves per visit, each learnable now by at least one party member, priced by star (placeholder ★1 40 / ★2 80 / ★3 150), with a re-roll fee that climbs each time (20, 40, 60…). Rules in [11-moves.md](11-moves.md#the-move-tutor).
- **TMs no longer exist as items.** Items are found on the map only (item nodes), kept in an uncapped bag.
- Healing consumables have no job, so the model is being reworked toward held items, permanent boosters and evolution items. **12 held items drafted in [14-items-data.md](14-items-data.md).**

**Map**
- Whole map visible up front; branching paths reconverge before the boss.
- Node types: **Wild, Trainer battle, Item, Daycare, Move Tutor (teaches moves for currency), Legendary, Boss.** Event and Rest nodes were cut for now.

**Gym Leaders**
- Type-themed, mainline-style. **Gym 1 fields 3**; team size grows to a full 6 by map 3.
- Player party size and leader team size stay roughly in step.

**Tech & UI**
- Browser-based, playable on phone and desktop, with layout and element sizing that genuinely adapt to screen width.
- Prototype roster of ~12-15 species — **superseded for the content pass by all of Gen 1 plus their family members** (78 lines, 183 species, no Megas, Gigantamax or regional forms) in [13-pokemon-roster-data.md](13-pokemon-roster-data.md); trim back down if the prototype needs a smaller pool.
- **Every UI component takes one input — its size — and derives everything else in `cqw`.** The base **Pokemon unit tile**, its **battle variant**, and the **empty party slot** tile are locked; the health indicator itself is still being decided between two designs (a ring and a pill-shaped bar) — see [12-ui-components.md](12-ui-components.md).

## What's blocking the prototype

1. **Tuning the damage formula.** Its shape is set (a percentage of Attack), but the power % values and HP totals in [13-pokemon-roster-data.md](13-pokemon-roster-data.md) are a first guess until fights are simulated.
2. **Confirming PP totals per Pokémon** — this sets how long fights run and when Struggle starts mattering. The current scale (loadouts of roughly 20–30 PP) is a first-pass guess.
3. **Support move target rules** are drafted for 11 shared support moves plus the support signatures, but haven't been tested on a real board.
4. **What items are**, now that healing and TMs are off the table. **12 held items now drafted** in [14-items-data.md](14-items-data.md); permanent boosters and evolution items still need concrete lists.
5. **What level wild node offers arrive at.**
