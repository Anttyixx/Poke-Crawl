---
title: Items — Basic Pass
status: basic pass
---

# Items

Status: 🟡 basic pass — see [00-index.md](00-index.md). Held item list drafted in [14-items-data.md](14-items-data.md).

## Decided

- **The game has a currency.** The player starts a run with a small amount, and earns more by **winning trainer battles and gym leader battles** (Wild nodes give no currency since they involve no fight).
- **Currency pays the Move Tutor** (see [11-moves.md](11-moves.md#the-move-tutor)): teaching a move costs currency, priced by the move's star rating, and re-rolling the tutor's offer costs a fee that climbs with each re-roll in one visit. It's the only thing currency buys for now.
- **TMs no longer exist as items.** Moves are taught directly at the tutor rather than bought and carried.
- Currency resets to the run's starting amount at the start of every new run, like everything else — no meta-progression (see [09-roguelite-run-structure.md](09-roguelite-run-structure.md)).
- Items live in a **bag the player always carries**, uncapped and available anywhere. The daycare holds Pokémon only.
- Items don't survive a permadeath — like everything else, they reset on a new run since there's no meta-progression.

## The item model

Two decisions changed what items can be. Combat is **fully automatic**, so the player can't use anything mid-fight. And the party is **fully healed and revived after every battle**, so there's nothing to heal between fights either. Healing consumables have no job in this design at all.

That points the item list toward things that modify a build rather than things you spend in the moment:

- **Held items** — equipped to a Pokémon, passive or auto-triggering effect during battle. This is the core category now, and it's the one that overlaps most with abilities, so the two need to be designed against each other. First 12 drafted in [14-items-data.md](14-items-data.md).
- **Permanent boosters** — one-use items that raise a stat or grant XP permanently for the rest of the run (vitamin- or rare-candy-style).
- **Evolution items** — trigger item-based evolutions (see [07-evolution.md](07-evolution.md)). The Leaf Stone and Sun Stone that split Gloom are the first two.

## Open questions for the detail pass

- Confirm the category list above, and whether healing items really are cut entirely.
- One held item per Pokémon, mainline-style?
- How do held items and abilities stay distinct from one another, given both are passive battle modifiers?
- Do revives exist in any form? With auto-revive after every battle, a revive item has no obvious purpose — unless it does something mid-battle, which would make it the one thing that can intervene in automatic combat.
- **How much does the player start with, and how much do trainer/gym battles pay out** — a flat amount, or scaled to the map or opponent? Tutor prices (★1 40 / ★2 80 / ★3 150, re-rolls from 20) need to be set against this.
- Is the Move Tutor the only currency sink in the game, or will others get added later (buying held items, extra wild node picks)?
- What's the in-universe name/flavor for the currency?
