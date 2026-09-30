---
title: Team Management (Party, Daycare, Moves) — Basic Pass
status: basic pass
---

# Team Management

Status: 🟡 basic pass — see [00-index.md](00-index.md)

## What a Pokémon is

Every Pokémon in the game carries:

- **HP, Attack, Speed** — the only three stats (see [04-battle-system.md](04-battle-system.md)).
- **An Ability** — affects how battle works or how other parts of the game work. Ability list TBD.
- **4 move slots** — one locked signature move, three open (see Moves below).
- **A held item**, optionally (see [06-items.md](06-items.md)).

Since combat is fully automatic, all four of those are **build decisions made on the map**, not choices made during a fight.

## Party and the daycare

- The player's active party holds up to **6 Pokémon**.
- New Pokémon come from **Wild nodes**, which involve no battle: the node offers **3 Pokémon** from that map's pool and the player picks one.
- Every map guarantees **at least 2 wild nodes on any path**, with a working ceiling of 3, so the party grows on a predictable curve no matter how the player routes (see [03-map-exploration.md](03-map-exploration.md)).
- Any Pokémon beyond the 6 party slots live in the **Daycare** (this replaces the box/PC concept entirely).
- **Daycare Pokémon gain XP at a reduced rate** compared to the active party — they keep developing slowly while deposited, so a benched Pokémon stays worth swapping back in without ever being as good as one you actually used.
- The daycare is accessed at **Daycare nodes** on the map, and automatically **after beating a boss**, before moving on to the next map.
- The daycare holds **Pokémon only**. Items live in the player's bag, carried at all times.

## Party growth curve

The player starts a run with exactly 1 Pokémon (their starter) and grows toward the cap over the first three maps, deliberately tracking the gym leaders' team sizes (see [08-gym-leader-bosses.md](08-gym-leader-bosses.md)).

| | Start | End of map 1 | End of map 2 | End of map 3 | Maps 4–8 |
|---|---|---|---|---|---|
| Floor (guaranteed) | 1 | 3 | 5 | 6 | 6 |
| Prioritizing wild nodes | 1 | 4 | 6 | 6 | 6 |

Once the party is full, wild nodes become **upgrade and depth decisions** instead of growth: take the new Pokémon and send someone to the daycare, or skip the node for a trainer fight or item instead.

## XP

- **Trainer battles are the only source of XP.** Wild nodes give team members, not levels.
- **XP is a shared pool, split across the active party.** Each trainer battle awards a fixed amount divided among the party, so a wider team is a shallower one.
- Daycare Pokémon earn XP passively at a reduced rate.

This makes party width self-balancing. A player who takes every wild node arrives at the next gym with more Pokémon at lower levels; a player who skips wild nodes for trainer fights arrives with fewer, stronger ones. The numbers advantage is paid for in levels, so no extra cap on party width is needed beyond the per-map wild node ceiling.

## Moves

- Each Pokémon has **4 move slots**.
- **1 slot is locked** to a unique/signature move that cannot be removed or replaced. This move itself **levels up** as the Pokémon levels up, becoming stronger over the course of a run.
- The **other 3 slots** are filled by moves taught via **TMs and move tutors found on the map**.

How much those 3 open slots actually matter depends on how automatic combat picks which move to use each turn — an open question in [04-battle-system.md](04-battle-system.md).

## Between runs

Nothing here survives — no meta-progression means the party, the daycare, and all taught moves reset on a new run (see [09-roguelite-run-structure.md](09-roguelite-run-structure.md)).

## Open questions for the detail pass

- Daycare size limit — capped or unlimited?
- How much slower is daycare XP — a flat fraction of what the party earns (half?), or a fixed trickle per trainer battle?
- What level do Pokémon offered at wild nodes arrive at? Scaled to the player's current party, scaled to the map, or deliberately behind?
- Can the player release a Pokémon permanently, or only deposit it to the daycare?
- Can the 3 non-signature move slots be freely re-taught/swapped any time there's a TM available, or is there a cost/limit to replacing a learned move?
- What do signature moves actually look like per species — one shared scaling formula, or unique growth per Pokémon?
