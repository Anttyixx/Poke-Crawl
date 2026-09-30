---
title: Map & Exploration — Basic Pass
status: basic pass
---

# Map & Exploration

Status: 🟡 basic pass — see [00-index.md](00-index.md)

## Decided

- Each map is a branching path from a start point to a Gym Leader boss at the far end.
- The **whole map is visible to the player from the start** (Slay the Spire style) — no fog of war on the layout.
- Branching paths **reconverge** at points before the boss, rather than staying fully separate the whole way.
- The player picks which path to take node by node, trading off which resources they want to prioritize for their team.

Because combat is fully automatic (see [04-battle-system.md](04-battle-system.md)), the map is where nearly all of the player's decision-making lives. Routing and loadout are the game.

## Node types

- **Wild node** — **no battle.** Offers a selection of **3 Pokémon** from that map's pool; the player picks one to add to their team. If the party is already at 6, the new Pokémon can still be taken but someone has to go to the daycare. This is the main way to add new Pokémon to a run (Legendary nodes are the other — see below). See [05-team-management.md](05-team-management.md).
- **Trainer battle node** — a fight against a CPU-controlled trainer. The only source of XP in the game, and also a source of currency (see [06-items.md](06-items.md)). Cannot be fled once started.
- **Item node** — pick up an item, which goes into the player's bag (see [06-items.md](06-items.md)).
- **Daycare node** — swap Pokémon between the active party and the daycare. (Replaces what was previously called a Computer node.)
- **Move Tutor node** — **teaches moves for currency.** Shows **5 moves**, each learnable right now by at least one Pokémon in the party (right line, high enough level, not already known). Teaching costs currency by the move's star rating, and the offer can be **re-rolled** for a fee that climbs with each re-roll. Full rules in [11-moves.md](11-moves.md#the-move-tutor).
- **Legendary node** — a battle against a legendary Pokémon's own team. Beating it **captures the legendary**, adding it to the roster the same way a wild node pick would (same daycare-overflow rule if the party's already at 6). Cannot be fled once started.
- **Boss node** — always the final node of the map; the Gym Leader fight (see [08-gym-leader-bosses.md](08-gym-leader-bosses.md)).

**Cut from the node list:** the **Event node** (undefined flavor moment) and the **Rest node** (had nothing left to restore once the party started fully healing after every battle) are both removed for now rather than reworked. They can come back later if a concrete purpose emerges.

## Wild node floor — every path guarantees a minimum

Every map guarantees the player **at least 2 wild nodes on any possible path through it**, so a player can never be starved of team members by routing badly. Beyond that floor, extra wild nodes exist as optional path choices for players who want to prioritize Pokémon over trainers or items.

**How the guarantee is enforced:** the generator lays the map out freely with nodes scattered, then **validates every possible path** through it against the minimum, regenerating or patching until it passes. The guarantee is invisible to the player and paths stay varied — there's no telltale "Pokémon row" or forced convergence node giving the structure away.

**Per-map wild node budget.** The floor has a ceiling to go with it, so a player who routes hard for Pokémon can't balloon far past the intended party curve (see [05-team-management.md](05-team-management.md)). Working target is **2 guaranteed, 3 maximum** per map.

## Routing tension

The core path decision is **breadth versus level**: wild nodes widen the team but give no XP, trainer nodes level the team but add no members. Item nodes compete for the same limited path slots. Since paths reconverge, the player is repeatedly choosing which of these to give up rather than committing to one lane for a whole map.

The Move Tutor adds a timing layer: because moves are gated by star rating, **a tutor reached after leveling offers better moves** than one reached early. Routing through trainers before the tutor can be worth more than hitting the tutor first.

## Open questions for the detail pass

- Roughly how many nodes make up a typical map, and where do Move Tutor / Legendary nodes fit into that count?
- Is 3 the right per-map ceiling on wild nodes, and does that ceiling change in later maps once the party is full?
- Are the 3 Pokémon at a wild node randomly drawn from the map pool each time, and can the player decline all 3?
- Can the player see which Pokémon/item/trainer a node holds before committing to that path, or only the node type? (For the Move Tutor, the offer is rolled on arrival, so it can't be previewed.)
- Are any other node types guaranteed per map (Wild nodes already are)?
- How many Legendary nodes exist per map, if any, and are they guaranteed, rare, or specific to certain maps?
