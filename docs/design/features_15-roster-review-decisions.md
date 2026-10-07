---
title: Roster Review Decisions (rounds 1 to 8)
status: living log, newer than 13-pokemon-roster-data.md, 11-moves.md and 00-index.md where they disagree
---

# Roster review decisions

This records the rules decided while curating the roster with the RotomDex review pages. Where it disagrees with the older docs (role tables with Speedster and Blaster, single type, and the PP rules in 00-index, 11-moves and 13-pokemon-roster-data), this log is newer. Items marked *proposed* are on the round 4 review or are placeholder numbers, and not yet confirmed. Rounds 3, 5, 6, 7 and 8 are applied. The roster JSON is rotomdex-roster-after-round8.json (747 rows; new fields `spawn_class` and `spawn_weight`) (field `id` is the unique Pokémon key, `sprite_file` the sprite, `mega_forms` the Mega sprites).

## Roles and tags
- Four roles only: **Striker, Tank, Support, All-Rounder**. No sub-roles. All-Rounder is for Pokémon that fit no category.
- Playstyle tags, any number per line: Self heal, Team heal, Team buff, Debuff, Lifesteal, Multi-hit, High HP, Fast. Attack shape: Single target and/or Splash. A gimmick flag with a description.
- Support Pokémon still have light attacks. Their job is the team.
- Evolution is per line, and a branch or regional form with different values gets its own entry.
- Round 3 role changes: Fennekin line Support, Totodile line Tank, Pansear and Shinx lines All-Rounder, Rhyhorn line and Stonjourner Striker (Rhyhorn: slightly higher than average HP, and slow).
- 8 new wild lines added: Vulpix, Alolan Vulpix, Delibird, Pachirisu, Magnemite, Snubbull, Swablu, and Azurill (Azurill's role is open).
- Taunt/Provoke (25% pick, 4 PP) added to Skarmory, Throh, Sableye and Pancham.

## Back row
- A back-row Pokémon cannot target opponents unless a move says it can. Heals and buffs from the back row are normal.
- Debuffing from the back row is rare and has no extra downside. Wild: only Cramorant. Legendary exceptions: Galarian Articuno, Uxie, Nihilego, Darkrai, Hoopa, Mewtwo.
- Other debuff Supports either debuff on a front-row attack, use a passive that needs no target, or lost their Debuff tag.
- Oddish and Gloom only attack the Pokémon straight ahead (Free Aim rejected for them).
- Vileplume: heals any party member. In the front row it can target any front-row enemy, or several with Splash debuffs.
- Klefki: Key Ring, every enemy holding an item loses 10% Speed.

## Legendaries and mythicals
- All are in the game. They are grouped by role and play style, not lore (9 groups). Members of a group play alike and differ by type, signature and at most one tweak tag.
- **Wild spawn rule (rewritten from the round 6 note):** Legendary-class Pokémon appear only on legendary nodes, never in the wild. Mythical-class Pokémon can appear in the wild but are very rare. The weaker legendaries classed Normal (Zeraora, Meltan, Melmetal, Kubfu, Urshifu, Zarude) also appear in the wild but are rare. Normal wild Pokémon are the most common. *Placeholder weights:* Normal 100, Paradox 40, rare (Normal-class legendaries) 10, Mythical 5, Legendary class 0 (nodes only). **Per-run caps:** at most 2 Legendary and 2 Mythical per run. A run is not guaranteed to reach the maximum. Guaranteed: 1 Legendary in the middle of map 6, and 1 Mythical on map 4 or 5. Assumed (not yet confirmed): the 6 Normal-class legendaries do not count toward either cap.
- Rarity classes: Legendary, Mythical or Normal (high-level wild). After round 3: 61 Legendary, 22 Mythical, 4 Normal lines. Celebi, Jirachi, Diancie and Hoopa are Mythical. Zeraora, Meltan, Kubfu and Zarude are Normal. Enamorus is Legendary. Tapu Lele and Tapu Bulu are still pending. No legendary at the start of a run.
- Players can switch a Pokémon's signature once it has learned another. Form-changers use the equipped signature.
- Calyrex is standalone with no fusion (Support: Heal, Life Dew).
- Deoxys: forme change set by the equipped signature (Option A, read from the accepted card).

## Run shape
- 1 starter per run (maybe a second from a special node). About 12 to 15 lines per map, about 150 lines per run.
- Plusle and Minun, and Lunatone and Solrock: if one is on the team the other can appear in wild nodes.

## Mega Evolution
- A Pokémon needs the **correct Mega Stone** to Mega Evolve. The stone is the holder's one held item.
- Megas evolve **at the start of battle**. **Only 1 Mega evolves per team per battle**, and the stone holder with the **highest Speed** evolves.
- **Each Mega has its own stat boosts** that match its identity (replaces the flat +25% Attack / +15% HP placeholder). The round 4 page proposes a number for every Mega.
- Charizard and Mewtwo have X and Y stones. Groudon and Kyogre use the Red and Blue Orbs.
- **Rayquaza needs no stone.** If Dragon Ascent is equipped, it Mega Evolves (*proposed:* it counts as the team's one Mega).
- *Proposed:* ties go to the Pokémon further left in the front row, then the back row left to right. Only pre-Mega Speed counts.

## Move choice and PP (replaces the PP rules in older docs)
- Each move has its own **pick %**, how often that move is chosen. The % does not change in battle except as below.
- Each move also has **PP**, a count of uses. PP does not influence which move is picked.
- A move at 0 PP stops being selected. The other moves' pick % scale up in proportion to total 100% (85/15: the 85% move runs out and the 15% move becomes 100%).
- A Pokémon with no moves left uses **Struggle**.
- Sketch keeps its own pick % and PP. Only the effect of the copied move is used.
- The older "pick weighted by PP remaining" rule, the refund-on-failed-move rule and "PP is the balance dial" in 11-moves.md no longer apply.

## Evolution
- Evolution stones are **one-time-use shop items**. A stone only appears in the shop if the Pokémon is in your party, and it can only be used on a ★2 or higher Pokémon.
- Nincada (*pending*): stays Nincada at ★2. A ★2 move, Shed Shell, is taught at the Move Tutor. At ★3 it becomes Shedinja if it knows Shed Shell and Ninjask if it does not.
- Shedinja's Wonder Guard: only super-effective moves damage it.

## Signatures decided
- Smeargle: Critique strips one random enemy's ability at battle start, and only one Critique is used per battle even with several Smeargle. Sketch copies the last move used and reverts after battle.
- Celebi: Time Warp makes a random ally use a move in Celebi's place.
- Shuckle: Juicer turns a held berry into a team heal at the start of its turn. Its signature can find a berry.
- Cleffa line: Follow Me. Foongus line: Decoy.
- Teddiursa line: Guts, +40% damage below half HP or while debuffed.

## Round 5: new sprite pack (applied)
- Added the Paldea starters: Sprigatito line (Striker, Fast), Fuecoco line (Tank, High HP), Quaxly line (All-Rounder, Fast).
- Added legendaries and mythicals: Koraidon, Miraidon, Wo-Chien, Chien-Pao, Ting-Lu, Chi-Yu, Gouging Fire, Raging Bolt, Iron Boulder, Iron Crown, Walking Wake, Iron Leaves, Terapagos (pending). Mythical class: Okidogi, Munkidori, Fezandipiti, Ogerpon (4 masks, equipped signature sets the mask), Blacephalon, Pecharunt, Manaphy.
- The Treasures of Ruin each have an aura gimmick at battle start (enemy front row: Wo-Chien -10% Attack, Chien-Pao +10% damage taken, Ting-Lu -10% Speed, Chi-Yu ignores 10% damage reduction).
- New lines with Megas (Z-A): Frigibax line (Baxcalibur), Falinks, Glimmet line (Glimmora), Capsakid line (Scovillain), Tatsugiri (3 forms, partner of Dondozo). 48 Mega Pokémon in total.
- Line extensions: Kingambit joins the Pawniard line (Bisharp holding Leader's Crest, shop item). Applin line gets a third branch: Dipplin (Syrupy Apple) then Hydrapple (★3 if it knows Dragon Cheer).
- No cosmetic forms in the game for now (Crowned Zacian, Therian Enamorus and the like are not added).

## Round 6: Paradox and Gen 9 gap fills (applied)
- Added all 14 remaining Paradox Pokémon, all Normal class: Great Tusk (Tank), Scream Tail (All-Rounder), Brute Bonnet (Tank), Flutter Mane (Striker), Slither Wing (All-Rounder), Sandy Shocks (Support), Roaring Moon (Striker), Iron Treads (All-Rounder), Iron Bundle (Support), Iron Hands (Tank), Iron Jugulis (Striker), Iron Moth (Support), Iron Thorns (All-Rounder), Iron Valiant (Striker). Sandy Shocks, Iron Bundle and Iron Moth are front-row debuffers.
- Added 9 gap-filling lines: Maschiff (Dark Tank), Nickit (Dark Support), Fidough (Fairy Tank, Well-Baked Body), Tinkatink (All-Rounder), Shroodle (Poison All-Rounder), Wattrel (Electric/Flying All-Rounder), Flittle (Psychic All-Rounder), Charcadet (Armarouge All-Rounder via Auspicious Armor, Ceruledge Striker via Malicious Armor), Klawf (Rock All-Rounder). Wild lines went from 215 to 238.
- Leader's Crest: a held item for the Pawniard line only, +15% damage while held. Bisharp must hold it when it levels up to Kingambit, and the Crest is kept.
- Terapagos is Legendary class (Tank, High HP, forms set by the equipped signature).
- Still thin: Fire Tank (2), Fighting Support (1), Dragon Tank and Support (3 each).
- Open: Charcadet has no signature before it evolves.
- Added the last 5 Mega lines that had sprites, as wild Normal lines (roles are my picks, no review card): Pidgey line (All-Rounder, Fast, Mega Pidgeot), Houndour line (Support, front-row debuffer, Mega Houndoom), Buneary line (Striker, Multi-hit, Fast, Mega Lopunny), Shuppet line (All-Rounder, Mega Banette), Heracross (Tank, High HP, Mega Heracross). Their Mega boosts follow the round 4 role table once it is confirmed.
- Roster is now 708 rows, 243 wild lines, 55 Pokémon with Megas (57 Mega forms). Z-A Megas for lines already in the roster need sprites, so none are added.

## Round 7: remaining Gen 9 lines (applied)
- Review pages now have a Replace status. It means: add this Pokémon, and if the roster needs room, a Pokémon already in the roster can be swapped out for it. The next round proposes which one to swap out.
- Added 15 lines (28 Pokémon): Tarountula (Bug Tank), Pawmi (Support, Team heal via Revival Blessing), Tandemaus (Striker, Multi-hit), Smoliv (Striker, Lifesteal), Tadbulb (Electric Tank, Splash), Bramblin (All-Rounder), Bombirdier (All-Rounder), Finizen (Zero to Hero form change, Palafin has a Hero sprite in `alt_forms`), Cyclizar (Dragon Support), Greavard (Last Respects), Flamigo (Fighting Support, Costar), Cetoddle (Ice Tank), Poltchageist (Sinistcha via Masterpiece Teacup), Gimmighoul (Gholdengo via Gimmighoul Coins, Good as Gold ignores the first debuff), and Archaludon (Duraludon with Metal Alloy).
- Left out: Lechonk, Nymble, Squawkabilly, Wiglett, Varoom, Orthworm.
- Replace (to be added in round 8, each with an optional swap-out): Nacli, Veluza, Mankey line (Annihilape, needs a gimmick), Girafarig line (Farigiraf), Dunsparce line (Dudunsparce, needs a gimmick), Wooper line (Clodsire). Toedscool and Rellor were not reviewed and are carried over.
- Not covered: leftover Galar lines in the new sprite pack (Blipbug, Impidimp, Eiscue, Morpeko, Mr. Rime, Obstagoon, Sirfetch'd, fossil Pokémon).

## Round 8: the Replace lines (applied)
- Added 5 of the 6 Replace lines: Nacli line (Rock Tank, High HP, Salt Cure), Mankey line with Annihilape (Fighting/Ghost Striker, Defiant gimmick, Close Combat), Girafarig line with Farigiraf (Normal/Psychic All-Rounder, Twin Beam), Dunsparce line with Dudunsparce (Normal Tank, High HP, Serene Grace gimmick, Headbutt), Wooper line with Clodsire (Water/Ground Tank, High HP, Mud Shot; Clodsire needs Poison Barb, a new shop item, at star 2).
- Only one swap: the Wooloo line (Wooloo, Dubwool) was removed to make room for the Dunsparce line. Both are Normal Tanks. Every other line was added with No swap.
- Rejected: Veluza, Toedscool line, Rellor line.
- Defiant: each time an enemy debuffs the holder, its Attack rises 20%, up to 3 times. Annihilape evolves from Primeape after it has been hit 20 times in one run (the count shows on its tile).
- Serene Grace: every chance-based effect on its signature is doubled (Headbutt's 20% Speed drop becomes 40%).
- Mankey's Close Combat is also Terrakion's signature name. Left for balance testing.
- Poison Barb joins the new shop items still missing from the items doc (Hisui Charm, Sun Shard, Moon Shard, Sweet Ribbon, Syrupy Apple, Masterpiece Teacup, Gimmighoul Coins, Metal Alloy, Auspicious and Malicious Armor, Leader's Crest).
- Roster is now 747 rows.
