---
title: Core Game Loop — Basic Pass
status: basic pass
---

# Core Game Loop

Status: 🟡 basic pass — see [00-index.md](00-index.md)

## Basic flow

1. **New run starts.** Player picks a starter Pokémon from the classic fire/water/grass trio (see [02-starter-selection.md](02-starter-selection.md)).
2. **Map traversal.** Player begins on one end of a branching map and moves node by node toward the other end. The whole map is visible up front, and paths reconverge at points before the boss. See [03-map-exploration.md](03-map-exploration.md).
3. **Along the way**, depending on which path the player takes, they may: pick up a new Pokémon at a **Wild node** (choose 1 of 3 offered, no battle), **fight a trainer** to earn XP, pick up items, or stop at a **Daycare node** to swap Pokémon between the party and the daycare.
4. **End of map: boss battle.** The final node on every map is a Gym Leader boss fight, always fought in a **fixed order** across the 8 maps. See [08-gym-leader-bosses.md](08-gym-leader-bosses.md).
5. **After beating the boss**, the player gets daycare access (swap party members) before moving on to the next map.
6. **Repeat** across all 8 gym leader maps, in the fixed order.
7. **Win condition:** defeat all 8 gym leaders.
8. **Lose condition — permadeath.** Losing any battle ends the run. Since the party is fully healed and revived after every fight, there's no wearing down — each battle is an independent check and the first loss is final. See [09-roguelite-run-structure.md](09-roguelite-run-structure.md).

## Where the game actually is

Combat is **fully automatic** (see [04-battle-system.md](04-battle-system.md)) — the player watches it resolve. So the game the player actually plays is the map and the build:

- **Routing** — which nodes to take, given paths compete for the same slots.
- **Team breadth vs. level** — wild nodes widen the party, trainer nodes level it, and a finite shared XP pool means a wider team is a shallower one.
- **Loadout** — which of the 3 offered Pokémon to take, which moves to teach into the 3 open slots, which items to hold, how abilities combine.

Every battle then asks one question: is that build strong enough for this encounter?

## Ramp across the run

The player starts with 1 Pokémon and grows to the cap of 6 over roughly the first three maps, with every map guaranteeing at least 2 wild nodes on any path. Gym leader team size climbs alongside it — 3 at gym 1, a full 6 by map 3 — so the player's party and the boss's team stay roughly in step. See [05-team-management.md](05-team-management.md) and [08-gym-leader-bosses.md](08-gym-leader-bosses.md) for the curve.

## Open questions

- Roughly how many nodes make up a typical map?
- What happens after all 8 gyms are cleared — does the run just end in victory, or does something else kick in?
