---
title: Tech & Platform — Basic Pass
status: basic pass
---

# Tech & Platform

Status: 🟡 basic pass — see [00-index.md](00-index.md)

## Decided

- **Browser-based**, playable on both **phone and desktop**.
- **Responsive by requirement, not as an afterthought.** The layout and the size of game elements change based on screen width — a phone gets a different arrangement than a wide desktop screen, not just a scaled-down version of the same one.
- **Prototype roster: ~12-15 species**, enough to build and test map 1 end to end. The full roster target is deferred until the loop is proven.

## What responsive means for this game specifically

Two screens carry most of the game and both need real layouts at both sizes:

- **The map screen** — a branching node graph that has to stay readable and tappable on a phone. Long maps may need to scroll on narrow screens while fitting whole on wide ones.
- **The battle screen** — the field layout (still pending spec) has to work in portrait and landscape. This is the harder of the two, and it's a reason to settle the field format before building UI around it.

Worth carrying over from the auto-battler project: container-driven sizing via ResizeObserver rather than fixed breakpoints alone, which handled both window resizing and pane resizing cleanly.

## Open questions for the detail pass

- **Single self-contained page, or a real project structure?** One HTML file is fastest to iterate and share; a repo with React/TypeScript and separate JSON data files for species, moves, items, and map pools is much easier to rebalance and grow. Given the content volume this design implies, data files are probably worth it early — retrofitting them is miserable.
- Where does save state live — localStorage, a file, a backend? (Tied to whether a run can be paused and resumed.)
- Where do sprites and art come from? Existing sprite sets, original art, or placeholder shapes for the prototype. Worth settling before UI gets built around a particular asset size.
- Portrait and landscape both supported on phone, or portrait only?
- Sound and music scope, and how much battle animation — with automatic combat, how the fight *reads* to the player is doing a lot of work, so animation isn't purely cosmetic here.
