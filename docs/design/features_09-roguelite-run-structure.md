---
title: Roguelite Run Structure — Basic Pass
status: basic pass
---

# Roguelite Run Structure

Status: 🟡 basic pass — see [00-index.md](00-index.md)

## Decided

- **No meta-progression, at all.** Every run is a completely clean slate — pure roguelike purity. Nothing carries over between runs: not the starter pool, not the daycare, not items, not evolutions. Replayability comes purely from in-run randomness and player skill.
- **Permadeath trigger: losing any battle ends the run.** Since the party is fully healed and revived after every fight, there's no attrition to whittle you down — each battle is an independent check, and the first one you lose is the last one you play.
- Because wild nodes involve no combat, the only places a run can end are **trainer battles and gym leader fights**.
- Since nothing carries over, the daycare, bag, and all evolutions are wiped clean at the start of every new run by definition.

## What this means for difficulty

With no attrition and automatic combat, the entire difficulty curve lives in **build strength versus encounter strength** at each node. The player can't be worn down over a map and can't play better in the moment to scrape through a fight they were underbuilt for. Every trainer node is a pass/fail check against the team they've assembled, which puts all the pressure on routing decisions and the level/breadth tradeoff.

This is worth keeping in mind when tuning: the margin between "my build handles this" and "my run just ended" is the only difficulty dial there is.

## Open questions for the detail pass

- Is a full run all 8 gyms in one sitting, or broken into save-able checkpoints (can a player pause and resume mid-run without losing progress)?
- Is there a "victory" state after all 8 gyms are cleared — does the run just end, or does something else happen (a harder repeat run, an ending sequence, etc.)?
- Does the player get any warning of an encounter's difficulty before committing to that node, given a single loss is fatal?
