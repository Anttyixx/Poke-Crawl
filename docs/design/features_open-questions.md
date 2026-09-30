---
title: Open Questions
---

# Open Questions

Everything that still needs a decision. Tagged by urgency:

- **[BLOCKING]** — needs an answer before a prototype can be built
- **[CONTENT]** — needs an answer before authoring actual game content
- **[LATER]** — polish, production, or nice-to-have

As questions get answered, move the answer into the relevant feature doc and delete it from here.

## Blocking the prototype

**[BLOCKING] Tuning the damage formula.** The shape is decided (damage = Attack × move power % × type multiplier × modifiers, see [13-pokemon-roster-data.md](13-pokemon-roster-data.md)), but power % values and HP totals are a first guess until fights are simulated.

**[BLOCKING] Who assigns slots, and when?** On the map, before each battle, or only at daycare nodes? Free rearrangement before every fight makes positioning a reactive tactical layer; locking it between daycare nodes makes it a committed build decision.

**[BLOCKING] How are slots assigned when the party is smaller than 6?** With 1-3 Pokémon, does everyone default to the front row, or can the player deliberately hold someone in back? This matters more than it looks: an empty back slot means that column collapses permanently the moment its front-liner falls.

**[BLOCKING] Does a back-liner advance into a front slot that was empty from the start of the battle,** or only into one vacated by a faint? Decides whether a small party can ever use the back row productively.

**[BLOCKING] Do the drafted support moves make the back row worth using?** 11 shared support moves and several support signatures now exist in [13-pokemon-roster-data.md](13-pokemon-roster-data.md); they need testing on a real board.

**[BLOCKING] What do items actually do,** now that healing consumables have no job and TMs are gone? Held items are drafted in [14-items-data.md](14-items-data.md); permanent boosters and evolution items still need lists. Held items also need designing against abilities so the two don't blur.

**[BLOCKING] What level do Pokémon offered at wild nodes arrive at?** Scaled to the player's current party, scaled to the map, or deliberately behind. This now also decides what they can be taught right away, since moves are gated by star.

## Combat specifics (deliberately deferred)

**[CONTENT] Do splash and column moves center on the target or on the attacker's own column?** The boards are mirrored, so slot-number targeting and column geometry don't line up — your slot 1 attacks enemy slot 1 diagonally across the field. Centering the area on the target is the natural default but needs deciding before any multi-target move is written. See [04-battle-system.md](04-battle-system.md).

**[CONTENT] Confirm the PP scale and a target total PP per Pokémon.** Total PP is a Pokémon's action budget per fight, so this sets how long battles run before Struggle starts mattering. Working scale: 10 / 8 / 6 / 4 / 2, loadouts of roughly 20–30.

**[CONTENT] Struggle's exact damage and self-damage.**

**[CONTENT] Full 18-type chart or a trimmed set?**

**[CONTENT] Is Speed order recalculated each round,** or fixed at battle start?

**[CONTENT] How are Speed ties broken?**

**[CONTENT] Do status conditions exist within a battle?** They'd clear between fights either way, given the full heal.

**[CONTENT] Do abilities interact with position** — front-only effects, back-only effects, on-advance triggers?

**[CONTENT] How are opponent trainer teams constructed and positioned?** Same rules as the player, or authored per encounter? Their slot ordering matters as much as the player's. (Legendary node teams raise the same question — see below.)

**[CONTENT] How does a battle read to the player?** They can't intervene, so the fight has to be legible enough that they understand why they lost and what to change. Design problem, not just animation budget.

**[CONTENT] Battle pacing — how long does a fight take, and can the player speed it up or skip it?**

## Abilities

**[CONTENT] Is one ability per evolution line enough,** or should some lines change ability when they evolve?

**[CONTENT] How do abilities stay distinct from held items,** given both are passive modifiers?

## Leveling and XP

**[CONTENT] How much slower is daycare XP** — a flat fraction, or a fixed trickle per trainer battle?

**[CONTENT] How much XP does each level (★1 → ★2 → ★3) cost, and how big is the run's XP budget?** Trainer nodes are finite and there's no grinding, so total run XP is fixed by map design — and it has to stretch across a party growing to 6 by map 3.

## Wild nodes and team building

**[CONTENT] Is 3 the right per-map ceiling on wild nodes,** and does it change once the party is capped?

**[CONTENT] Are the 3 offered Pokémon randomly drawn from the map pool each time,** and can the player decline all 3?

**[CONTENT] Can the player swap a party member to the daycare at a wild node** when at 6, or does that need a daycare node?

**[CONTENT] Daycare size limit — capped or unlimited?**

**[CONTENT] Can Pokémon be released permanently,** and is there any benefit?

## Currency and Move Tutor

The tutor's rules are drafted in [11-moves.md](11-moves.md#the-move-tutor): 5 moves per visit, each learnable now by someone in the party, teaching priced by star, re-rolls with a climbing fee.

**[CONTENT] How much currency does the player start with, and how much do trainer/gym wins pay out?** Flat amount, or scaled to the map or opponent strength. Tutor prices are placeholders until this is set.

**[CONTENT] Should tutor prices scale with map progress,** or stay flat by star?

**[CONTENT] Should the tutor ever preview moves nobody can learn yet,** to show what leveling unlocks?

**[CONTENT] Is the Move Tutor the only currency sink in the game, or will others get added later?**

**[LATER] What's the in-universe name/flavor for the currency?**

## Legendary node

**[CONTENT] How many Legendary nodes exist per map, if any** — guaranteed, rare, or specific to certain maps?

**[CONTENT] How is a legendary's team built** — same rules as a regular trainer's, or bespoke per legendary?

**[CONTENT] How strong is a Legendary fight meant to be relative to the map's trainer nodes** — an optional high-risk/high-reward detour, or roughly on-curve?

**[CONTENT] Does winning always grant the legendary outright**, with no pick-of-3 the way wild nodes work?

**[CONTENT] Do legendaries follow the normal 4-move / signature / star / PP rules,** or are they special-cased? (A one-stage legendary has no evolution to drive its signature changes.)

**[CONTENT] Which legendary(ies) exist in the prototype roster** — one per map, a fixed set, or randomized per run?

**[CONTENT] Does a Legendary node also pay out XP and currency like a regular trainer battle,** or only the capture?

## Roster and content scope

**[CONTENT] What's the full roster target beyond the 52-species sample set?** Each new line needs stats, an ability, three signature moves, its id added to the right moves in the master list, and art.

**[CONTENT] How big is each map's Pokémon pool, and do pools overlap between maps?** With 2-3 wild nodes per map each drawing 3 options, a pool needs enough species that offers don't repeat within one map.

## Map and run pacing

**[CONTENT] How many nodes per map, and how long is a full run?** This also sets the trainer node count, which *is* the XP budget.

**[CONTENT] What's the node type distribution per map,** beyond the wild node floor of 2? How many Move Tutors per map?

**[CONTENT] Can the player see what's inside a node before committing** — which 3 Pokémon, which item, which trainer — or only the node type?

**[CONTENT] How do trainer levels scale from map 1 to map 8,** and how do wild node offers scale alongside them?

**[CONTENT] Does the player get any read on an encounter's difficulty before committing?** With one loss ending the run and no way to play better in the moment, walking blind into an overtuned fight is a harsh way to lose.

**[LATER] Are there elite or mini-boss nodes between the start and the gym leader,** distinct from the Legendary node?

## Gym leaders

**[CONTENT] Confirm leader team sizes for gyms 2 and 4-8.** Gym 1 is 3, gym 3 onward is 6; the working curve assumes 5 at gym 2.

**[CONTENT] What's the fixed type order for the 8 leaders?**

**[CONTENT] Do gym leaders scale in level relative to the player's team, or are they fixed per map?**

**[CONTENT] Do leaders have a gimmick,** or are they just stronger trainers?

**[CONTENT] Is there a reward beyond daycare access?**

**[CONTENT] Do gym leader Pokémon get signature moves and abilities** the way the player's do?

## Evolution

**[CONTENT] How many more split evolutions should the roster have,** and do they all use item choice like Gloom's Leaf Stone / Sun Stone?

## Run variety — the no-meta-progression problem

**[CONTENT] With nothing carrying between runs, what makes run 20 feel different from run 2?** All the variety burden sits on in-run randomness. Candidates: randomized map layouts and node contents, randomized wild node offers, randomized Move Tutor offers and item availability, randomized gym leader teams within their type, or modifiers picked at run start.

**[LATER] Seeded and/or daily runs?**

**[LATER] Are difficulty modes available from the start?**

**[LATER] Should the game track run history and stats?**

## Tech and platform

**[CONTENT] Single self-contained page, or a real project structure** with React/TypeScript and JSON data files? Given the content volume, data files are probably worth it early — the master move list and line data in [13-pokemon-roster-data.md](13-pokemon-roster-data.md) are already shaped to export that way.

**[CONTENT] Can the player quit mid-run and resume,** and where does save state live?

**[CONTENT] Is there any save-scum protection?** (Relevant to tutor re-rolls: reloading to get a free re-roll should be prevented.)

**[CONTENT] Portrait and landscape both on phone, or portrait only?** Four rows of three stacked vertically is the natural phone layout, but it's tall — worth prototyping early.

**[LATER] Sound and music scope.**

## Scope for the first playable build

**[CONTENT] Confirm the vertical slice:** map 1 end to end — three starters, a pool of species, 2-3 wild nodes, a few trainer fights, a Move Tutor, the 3-Pokémon first gym leader, automatic combat, responsive on phone and desktop.

**[CONTENT] Which of the above can be stubbed** — placeholder art, a handful of abilities, part of the move list, two items — and which have to be real? Note that map 1 barely exercises the front/back row system, so the prototype may want a map 2 stub or a debug 6-Pokémon start to test positioning at all.
