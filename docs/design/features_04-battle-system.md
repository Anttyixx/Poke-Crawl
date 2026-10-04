---
title: Battle System — Combat Basics
status: basics decided, specifics deferred
---

# Battle System

Status: 🟡 basics decided, specifics deferred — see [00-index.md](00-index.md)

## Combat is fully automatic

**All of the player's decisions happen before the battle starts.** Which Pokémon are in the party, where they stand, what moves they've been taught, what items they hold, what abilities they bring — that's the game. Once the fight begins it resolves on its own and the player watches.

## The field

Both sides field their **entire party at once** across 6 positions: a **front row of 3** and a **back row of 3**, arranged in three **lanes**.

| | lane L | lane M | lane R |
|---|---|---|---|
| **Their back** | J | K | L |
| **Their front** | G | H | I |
| ─── | ─── | ─── | ─── |
| **Your front** | A | B | C |
| **Your back** | D | E | F |

Positions are identified by **lane and row**. A sequential 1-6 index isn't needed — lane and row carry all the meaning.

The two front rows are **adjacent** to each other. Nothing else across the divide is.

## Turn structure

- Combat runs in **rounds**.
- Every living Pokémon on both sides acts **once per round**, in **Speed order**, fastest first.
- **The battle ends the instant one side has no Pokémon left**, mid-round if that's when it happens.

## How an action resolves

1. **Draw a move** from the marble bag.
2. **If the move is offensive and the Pokémon is in the back row → it fails.** The back row is not adjacent to anything on the enemy side, so **no target can be selected**, and a move with no target fails. The turn is spent; the marble goes back in the bag. This holds for *every* offensive move regardless of shape — even a field-wide one.
3. **If the move is offensive and the Pokémon is in the front row**, pick a **center** in this order:
   - **Directly ahead.** If the enemy front slot in the same lane is occupied, that's the center.
   - **Otherwise scan left.** First occupied enemy front slot to the left, continuing past empty lanes rather than stopping at the first gap.
   - **Otherwise scan right.** Same, in the other direction.
4. **The move's shape radiates from that center** (see below). A plain single-target move just hits the center.
5. **If the move is a support move**, any teammate on the field is a legal target — any lane, either row, from either row. **Which teammate it picks is defined by the move itself**; there's no global rule, so a heal doesn't automatically go to whoever is lowest.

Support moves are the back row's whole contribution. A back-liner that draws an offensive move does nothing that turn even if its own front-liner is standing right there with enemies in reach.

### Confirmed single-target cases

Worked through and agreed — these double as a test suite for the targeting function:

| # | Situation | Acting | Result |
|---|---|---|---|
| 1 | All alive | A | hits G — directly ahead |
| 2 | Their left lane gone | A | hits H — nothing left, falls through to the right |
| 3 | Their middle lane gone | B | hits G — left is checked before right |
| 4 | Their left and middle gone | B | hits I — right, once left comes up empty |
| 5 | Their right lane gone | C | hits H — left |
| 6 | Their middle and right gone | C | hits G — scanning continues past the empty middle |
| 7 | All alive, offensive move | D | fails, no legal target, marble refunded |
| 8 | All alive, support move | E | can target C — any teammate is legal |
| 9 | All alive, support move | A | can target F — front row can support too |
| 10 | Only G left; A, B and C all attack | A, B, C | all three converge on G; battle ends the moment G falls |

## Area moves — the shape radiates from the center

Every offensive move selects a center the same way, then applies its shape to the board around it. All of these are confirmed in scope:

| Shape | What it hits |
|---|---|
| **Single** | The center only. The default. |
| **Pierce** | The center, plus the enemy directly behind it in the same lane. |
| **Splash** | The center, plus the enemy front-liners in the lanes either side of it. |
| **Full front row** | All three enemy front-liners, wherever the center landed. |
| **Back row** | The enemy back row, reaching over the front line — the center's own row is left untouched. |
| **Full field** | All six enemies at once. |

Separately from shape, a move can land **repeat hits** — striking 2 to 5 times in a single action, mainline Fury Attack style. That's an independent property, so a move could in principle be both multi-hit and multi-target.

### What area moves do to positioning

This is what gives the positional layer real depth. Stacking a lane is the only way to protect a Pokémon from ordinary attacks — and **back-row moves are the direct counter to stacking**, since a Pokémon sheltered behind a healthy front-liner is exactly what they punish. Meanwhile splash and full-row moves punish the opposite arrangement, a wide front line with everyone exposed.

So placement becomes a genuine read: **stack deep against single-target damage, spread wide against area damage**, and weigh which shapes the opponent is likely to be carrying.

Full-field moves swing a fight enormously, so they presumably want very low weight — a one-or-two-use bomb rather than something firing every other round.

## Compaction — everyone pushes forward

**Before every action, all Pokémon are pushed as far forward in their lane as possible.** If a lane's front position is empty and someone is standing behind it, they move up immediately. This applies at the start of the battle too — a Pokémon placed in D with A left empty slides into A before the first attack.

- **A lane is either occupied at the front or completely empty.** There's never a gap in the front row with someone waiting behind it.
- **Nobody slides sideways.** If a lane's front-liner falls with nobody behind them in that lane, **that lane is gone for the rest of the battle**.

The only way to keep a Pokémon in the back row is to **stack it behind a living teammate in the same lane**. Three Pokémon in A, D and B leaves one shielded; the same three in A, B and C leaves none.

## What the lane rules produce

**Damage spreads rather than focusing.** With full teams and single-target moves, each front-liner fights the enemy opposite it — three parallel duels rather than everyone piling onto one victim.

**Losing lanes concentrates the fight.** As an enemy lane empties, your attacker there retargets to whatever's left, so the side with more surviving lanes lands multiple attacks on the same defender. A numbers advantage compounds and fights accelerate toward the end.

**Left is favored.** With a gap ahead and enemies on both sides, the left-hand enemy is always chosen. An arbitrary but fixed convention — it means the enemy's left lane statistically eats the overflow damage.

## Move selection — signature by default, taught move by chance

(This replaced the marble bag, and then PP, where every use removed a marble: the odds kept shifting during a fight and were hard to read.)

- A Pokémon's **signature move is its default**. Its **taught move** has a **chance** (10–25%, per move): each action, roll it; if it comes up, the Pokémon uses the taught move, otherwise the signature.
- **Only moves that would work are used.** If the move it lands on would fail from where it stands (an offensive move from the back row, a shape that would hit nobody, Counter before it has been hit, a charging move in round 1), it uses the other move instead. A back-row Pokémon with an attacking signature and a healing taught move always heals. If neither would work, it waits.
- **The odds never change** during a battle; the Pokémon's info shows them as percentages (signature 80%, taught 20%).
- **Move limit.** Each Pokémon can use a set number of moves per battle: 12 at ★1, +2 per star (14 at ★2, 16 at ★3). Each move that happens uses one (waiting doesn't). At 0 it uses **Struggle** from then on, which hits anything and hurts the user, so stalled fights (healers, immunities) still end.
- **Held items** can scale a taught move's chance (an item's `odds: { kind, mul }`). **Single-use items** that raise a move's chance or the move limit are planned. Choice items still lock the Pokémon into its first move.

### Worked example

Bulbasaur knows Vine Whip (signature) and Rollout (taught, 20%). Each action it uses Rollout 20% of the time and Vine Whip 80%, all battle. Moved to the back row, both attacks would fail, so it waits. After 12 moves it Struggles.

## What the build layer controls

- **Which lanes you occupy**, and **how deep you stack them** — depth protects against single-target damage and exposes you to back-row moves.
- **Who stands behind whom** — a back-liner inherits the front position in its lane.
- **Offensive versus support loadout by position** — an attacker parked in the back row is a wasted slot every round it stays there.
- **Move shapes** — coverage against spread formations versus stacked ones.
- **Move weights** — reliable and long-lasting versus rare spikes.
- **Speed** — where a Pokémon lands in the round order.

## Note on the early run

On map 1 the player has 1-3 Pokémon and gym leader 1 fields 3, so those fights barely use the back row. **Map 1 exercises little of the positional system**, which matters when deciding what the prototype needs to test.

## Still needed — structural

- **What happens when an area move's shape lands on nothing?** A back-row move used against an enemy with no back row selects a valid center but hits nobody. Does it fail and refund like an untargetable move, or resolve into empty air and spend the marble?
- **Do area shapes exist on the support side too** — a heal covering your whole front row, or a buff hitting a lane?
- **Are shapes fixed per move,** or can abilities or held items change a move's shape?
- **Is Speed order recalculated each round,** or fixed at battle start? And how are ties broken?
- **Do enough support moves exist** to make the back row worth using? Each one also needs its own target-selection rule written.
- **Do abilities interact with position** — front-only effects, back-only effects, on-advance triggers?
- **Are there moves that damage your own teammates?**
- **Can a support move target the user itself,** or only other teammates?

## Deferred — specifics

- Damage formula, given there's no Defense stat.
- Full 18-type chart or a trimmed set.
- Typical weight values, and a target total weight per Pokémon. Area and full-field moves need their own weight conventions.
- Struggle's exact damage and self-damage.
- Whether status conditions exist within a battle.
- How opponent teams are constructed and placed.
- Battle pacing, animation, and whether the player can speed up or skip a fight.
- How the fight stays legible, since the player can't intervene.
