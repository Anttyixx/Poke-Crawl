---
title: Gym Leader Bosses — Basic Pass
status: basic pass
---

# Gym Leader Bosses

Status: 🟡 basic pass — see [00-index.md](00-index.md)

## Decided

- There are **8 Gym Leader bosses** total, one at the end of each map's path, faced in a **fixed order**.
- Gym leaders are **type-themed, mainline-style** — each one specializes in a single Pokémon type.
- **Gym 1 fields 3 Pokémon.** Leader team size **increases over the run and reaches a full 6 by map 3**, staying there afterward.
- Beating one grants **daycare access** before the player moves on to the next map.
- Losing a boss fight is one of only two ways a run can end (the other being a regular trainer battle), since wild nodes involve no combat — see [09-roguelite-run-structure.md](09-roguelite-run-structure.md). Boss fights cannot be fled.

## Design principle: team size should track, not tower

The player's party size and the leader's team size are meant to stay roughly in step. The player shouldn't face a full team of 6 while fielding 3, and shouldn't be fielding 6 against a leader's 3 either — a large numbers advantage in the early maps would flatten the difficulty curve just as badly as a large deficit would spike it.

**Working target curve** (not locked — see open questions):

| Gym | Leader team | Player party at that gym (floor → prioritized) |
|---|---|---|
| 1 | 3 | 3 → 4 |
| 2 | 5 | 5 → 6 |
| 3 | 6 | 6 |
| 4–8 | 6 | 6 |

A player taking only the guaranteed wild nodes lands exactly on the leader's team size at each of the first three gyms. A player who routes hard for Pokémon runs about one ahead — and pays for it in levels, since a wider party splits a finite XP pool more ways.

## Open questions for the detail pass

- Confirm the leader team sizes for gyms 2 and 4–8 (the working curve above assumes 5 at gym 2, then 6 throughout).
- What's the actual order of the 8 types/leaders, and does it ramp in a way that teaches the type chart?
- Do gym leaders scale in level relative to the player's team, or are they fixed per map?
- Is there a reward beyond daycare access — e.g. a badge effect, guaranteed item, or team-wide buff?
- Do gym leader Pokémon get signature moves the way the player's do?
