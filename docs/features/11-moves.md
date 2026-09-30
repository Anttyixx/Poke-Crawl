---
title: Moves — Design, Learning & the Move Tutor
status: principles set; star ratings, move pools and Move Tutor drafted
---

# Moves

Status: 🟡 principles set, learning rules and Move Tutor drafted — see [00-index.md](00-index.md)

Combat resolution (how a center is picked, what each shape hits) lives in [04-battle-system.md](04-battle-system.md). The actual move list, star ratings, PP values and who learns what live in [13-pokemon-roster-data.md](13-pokemon-roster-data.md). This doc covers what a move *is*, how Pokémon get moves, and how moves get balanced against each other.

## What a move is made of

- **Type** — for effectiveness against the target's type.
- **Offensive or support** — offensive moves need an enemy center and fail outright from the back row; support moves can reach any teammate.
- **Shape** — single, pierce, splash, full front row, back row, or full field.
- **Power** — a percentage of the user's Attack (heals: a percentage of the target's max HP).
- **Repeat hits** — optionally strikes 2-5 times in one action, independent of shape.
- **PP** — how likely the move is to be picked, and how many times it can be used per battle.
- **Star rating (★1–★3)** — the minimum level a Pokémon must be to learn it.
- **Who can learn it** — a list of evolution lines, or **all** for a universal move.
- **Target rule** — support moves each define how they pick among legal teammates.
- **Effect** — damage, healing, buff, or whatever else.

## How a Pokémon gets its moves

A Pokémon knows **4 moves**: **1 signature** plus **3 taught**.

- **The signature is learned by leveling, and only by leveling.** It's replaced by a new one at each level (★1 → ★2 → ★3) and can never be removed. ★1 signatures are plain shared moves, ★2 are upgrades (sometimes unique), ★3 are always unique to the line.
- **The 3 taught moves come from the Move Tutor.** There are no TMs as items any more.

### Star ratings gate what can be taught

Every move has a star rating, and **a Pokémon can only be taught a move whose star is at or below its own level.** A ★1 Pokémon can learn ★1 moves; at ★2 it opens up ★2 moves; at ★3 it can learn everything its line allows.

- A move already known is **kept** when the Pokémon levels up.
- Ratings follow power: ★1 basic hits and simple buffs, ★2 mainline moves and area shapes, ★3 finishers and field-wide moves.
- This gives leveling a second reward beyond stats and the new signature: **a bigger tutor menu.** It also stops a fresh ★1 pick-up from being handed the best moves in the game on arrival.

### Who can learn what: move pools

Moves and learners are kept in two separate lists:

- **The master move list** says what every move is and does. It says nothing about who learns it.
- **Move pools** say who learns what. A pool is a named list of moves plus a **rule** for which Pokémon qualify. A move can sit in several pools.

A Pokémon can be taught **every move in every pool it qualifies for**, minus its own signatures, once its level reaches the move's star. Current pools:

- **Universal** — every Pokémon (Tackle, Defense Curl, Helping Hand, Focus Energy, Headbutt, Swift, Hyper Beam).
- **One pool per type** — Normal, Fire, Water, Grass, Electric, Poison, Ground, Bug, Flying, Fairy. Every Pokémon of that type qualifies.
- **Stat pools**, checked against **★1 stats** so membership never changes as a Pokémon levels:
  - **Swift** — Speed 40+ (Quick Attack, Agility, Aerial Ace, Double Kick, Tailwind, Extreme Speed).
  - **Power** — Attack 32+ (Karate Chop, Rock Throw, Bite, Brick Break, Rock Tomb, Take Down, Swords Dance, Iron Tail, Dragon Claw, Double-Edge).
  - **Sturdy** — HP 70+ (Harden, Rock Throw, Rollout, Reflect, Heal Pulse, Rest, Icy Wind, Confusion, Body Press).

More rule kinds can be added later without touching the move list: ability, body shape, habitat, or an explicit list of lines for one-off cases. Adding a Pokémon means giving it a type and stats; it joins its pools automatically. Full pool contents in [13-pokemon-roster-data.md](13-pokemon-roster-data.md#move-pools). "Move pool" is a working name.

## The Move Tutor

The Move Tutor node (see [03-map-exploration.md](03-map-exploration.md)) **teaches moves for currency.** It doesn't sell items.

**What it offers**

- Each visit shows **5 moves**, rolled fresh when the player arrives.
- **Every move shown can be learned right now by at least one Pokémon in the party**: it's in one of that Pokémon's pools, the Pokémon's level meets the move's star, and it doesn't already know it. Daycare Pokémon don't count.
- To spread the offer across the team, each of the 5 slots picks a random party member first, then a random move that member can learn, with no duplicates. At most 1 of the 5 comes from the Universal pool, so type and stat pool moves make up most of the offer.
- Each move shows **which party members can learn it.**

**Teaching**

- **Teaching costs currency, priced by star** (placeholder): ★1 **40**, ★2 **80**, ★3 **150**.
- The player can teach as many moves as they can afford in one visit, and the same move can be taught to more than one eligible Pokémon (paying each time).
- If the Pokémon already has 3 taught moves, the player picks one to **replace**. The replaced move is gone; getting it back means finding it at a tutor and paying again.

**Re-rolling**

- The player can **re-roll** the 5 moves for a fee: **20** for the first re-roll, **+20** for each further re-roll at the same visit (20, 40, 60…). The fee resets at the next tutor.
- A re-roll follows the same party-compatibility rules.

**Why it works this way**

- Offers always matter to the current team, so a tutor visit is never a dead node.
- Price by star makes ★3 moves a real spend, which pairs with their low PP: a strong move is expensive *and* uses up the Pokémon's action budget fast.
- Re-roll cost that climbs within a visit lets the player dig for one specific move, but not for free.

## PP is the balance dial, and it cuts twice

When a Pokémon acts, it picks one of its moves at random **weighted by PP remaining**, then spends 1 PP. So PP is **both the chance of picking a move and the number of times it can be used**. A 2-PP move fires at most twice per battle and rarely early.

There's a second effect that's easy to miss: **the sum of all four moves' PP is the Pokémon's action budget for the fight.** When everything is at 0 PP, it Struggles — small damage, plus damage to itself — every round for the rest of the battle.

So loading up on powerful rare moves has a real cost that needs no extra rules:

| Loadout | Total PP | Actions before Struggle |
|---|---|---|
| Four 2-PP finishers | 8 | 8 |
| Mixed 8 / 6 / 4 / 2 | 20 | 20 |
| Four 10-PP fillers | 40 | 40 |

A Pokémon built entirely around spike damage runs dry fast and spends the back half of a long fight hurting itself. A Pokémon built on reliable filler keeps swinging. **Power versus endurance, priced in PP** — and it matters most against gym leaders, where a full team of six makes for the longest fights in the game.

This also means PP can't be tuned purely as "how rare is this move." Dropping a strong move to 2 PP makes it rare *and* quietly shortens the carrier's stamina, which may be more of a nerf than intended.

## Design principle: moves that break the default rules must cost something

Moves that hit multiple Pokémon, hit one Pokémon several times, reach past the front line, or otherwise bend the standard combat rules are **strong by definition** — the default rules are what everything else is balanced against. Every such move needs either a real drawback or genuine scarcity, otherwise the optimal build is just "collect the rule-breakers."

### Levers available

- **Low PP** — rare and few uses, with the stamina cost described above.
- **High star rating** — can't be taught until ★3, and costs the most at the tutor.
- **Signature-only** — tie a powerful shape to one line's ★3 signature so it can't be spread across the team.
- **Narrow pool** — put it only in a pool few Pokémon qualify for, so getting it depends on who's in the party.
- **Reduced damage per target** — the standard tax on area moves.
- **Slot cost** — with only 3 taught slots, a situational bomb crowds out reliable damage.
- **Self-damage or recoil** — Struggle already establishes the precedent.
- **Charge-up / recharge** — costs a round before or after (Solar Beam, Hyper Beam, Blast Burn).
- **Positional requirement** — only usable from a particular row, or only when the user's lane is stacked.
- **Conditional effects** — full power only when some condition holds, reduced otherwise.

Combining scarcity *and* a drawback on the same move risks making it feel bad to find, so the general approach is probably one or the other per move, with the strongest effects (full field especially) getting both.

## Open questions

- **Tutor prices and re-roll fees** are placeholders. They only make sense once starting currency and battle payouts are set.
- **Should the tutor ever offer a move nobody can learn yet** (a ★2 move while the whole party is ★1), as a preview of what's coming? Currently no.
- **Is replacing a taught move free anywhere else,** or only at the tutor as part of teaching?
- **How much do area moves have their damage reduced,** and does that scale with how many targets the shape covers?
- **Which drawback levers are the standard ones** for this game, versus one-off flavor on specific moves?
- **Should the Universal pool grow**, or stay small so type and stat pools stay the interesting part of the offer?
- **Should stacking pools be capped?** Lines that clear several stat bars can be taught up to 30 moves; lines that clear none get 18.
- **Type pools vs. "teachable moves are never unique".** While a type has only one line in the roster, its whole pool belongs to that line. Accept until the roster grows, or add mixed pools?
