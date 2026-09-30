---
title: Held Items — Data Pass
status: draft content pass — adapts 12 classic held items to Poke-Crawl's mechanics
---

# Held Items

Status: 🟡 draft content, unblocks prototyping — see [00-index.md](00-index.md), [06-items.md](06-items.md) and [open-questions.md](open-questions.md)

[06-items.md](06-items.md) flags that the item model needs rework now that healing consumables have no job, and proposes held items, permanent boosters, evolution items, and TMs as the replacement categories. This is the **held items** half of that: 12 classic items (sprites already in the `pokesprite` sample set), each given a plain, reasonable effect built only from mechanics the battle system has already locked — HP / Attack / Speed, the marble-bag draw, lane compaction, and move shapes. No new systems invented to support these; if a system doesn't exist yet (weather, status conditions, entry hazards), the item's classic effect was re-pointed at something that does exist instead. Numbers are a first pass, not a balance pass.

One Pokémon holds one item for the whole battle; items don't run out mid-fight unless their own effect says so (Focus Sash).

| Item | Classic effect (for reference) | Effect in Poke-Crawl |
|---|---|---|
| **Choice Band** | +50% Attack, locks the holder into its first move | **+50% Attack for the whole battle.** After its first action, this Pokémon's next marble draw is skipped — it just keeps using that same move for the rest of the fight instead of drawing again. |
| **Choice Specs** | +50% Sp. Atk, same lock-in | There's no Sp. Atk split here, so Specs is re-aimed at the other half of the kit: **+50% effect on this Pokémon's Support moves** (heals heal for more, buffs are bigger), with the same first-move lock-in as Choice Band. |
| **Choice Scarf** | +50% Speed, same lock-in | **+50% Speed for the whole battle**, same lock-in as the other two Choice items. (A Pokémon can only hold one item, so Band/Specs/Scarf are mutually exclusive builds, same as mainline.) |
| **Life Orb** | +30% move power, holder loses 10% max HP per attack | **+30% damage on this Pokémon's offensive moves.** It loses 10% of its own max HP every time it uses one (support moves don't cost HP). |
| **Leftovers** | Heals 1/16 max HP every turn | **Heals 8% of this Pokémon's max HP at the end of every round** it's still on the field, whether or not it acted that round. |
| **Focus Sash** | Survive a lethal hit at 1 HP, if at full HP; single use | **If this Pokémon is at full HP and a single hit would knock it out, it survives with 1 HP instead.** Works once per battle, then the item is used up. |
| **Rocky Helmet** | Attacker takes 1/6 recoil on a contact hit | **Any enemy whose offensive move hits this Pokémon takes damage equal to 12% of its own max HP in return.** |
| **Protective Pads** | Immune to contact-based side effects (recoil, held-item retaliation, contact abilities) | **This Pokémon never triggers retaliation effects when it lands a hit** — e.g. it ignores an enemy's Rocky Helmet entirely. |
| **Weakness Policy** | Attack and Sp. Atk spike after being hit by a super-effective move | **The first time this Pokémon is hit by a move of a type it's weak to, its Attack rises 50% for the rest of the battle.** One-time trigger per battle. |
| **Assault Vest** | +50% Sp. Def, can't use status moves | Re-aimed at survivability without a Def stat: **+25% max HP**, but **this Pokémon cannot be taught Support moves** while holding it — every slot has to be offensive. |
| **Safety Goggles** | Immune to weather damage and powder moves | No weather or powder mechanics exist here, so this is re-pointed at the closest equivalent — indiscriminate, multi-target attacks: **this Pokémon is never a valid target for enemy area moves** (Splash, Full front row, Back row, Full field). It can still be hit by Single and Pierce moves aimed at it directly. |
| **Heavy-Duty Boots** | Immune to entry hazards on switch-in | No hazards exist here either, so this is re-pointed at the compaction rule instead: **this Pokémon is exempt from forced compaction** — normally a back-liner is pushed into an empty front slot before every action; this Pokémon's holder can choose to stay put in the back row instead. |

## Notes for the rebalance pass

- **Safety Goggles is the strongest guess here** — full immunity to every area shape is a big effect if the prototype's move pool ends up leaning heavily on Splash/Full-row/Full-field. Worth capping it (e.g. reduced damage instead of immunity) if early playtesting shows it's oppressive.
- **Choice Specs' support-boost reframing** only matters for Pokémon that actually carry Support moves — on a pure attacker it's currently a dead item. Fine for a first pass, but flag it if the prototype roster ends up support-move-light.
- **Heavy-Duty Boots' compaction exemption** is the one item here that changes a positioning rule rather than a number — it's the most interesting to playtest, since it directly answers "can a small party use the back row productively?" from [open-questions.md](open-questions.md).
