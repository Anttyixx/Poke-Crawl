---
title: UI Components
status: unit tile + battle variant + empty slot locked; alt health-bar badge in comparison against the ring
---

# UI Components

Reusable interface elements and the rules they follow. Live reference: [Crawler Unit Tile](https://claude.ai/artifact/QyzoGqVFH27rnVv4tcjVnU).

1. [Pokemon Unit — base tile](#1-pokemon-unit--base-tile)
2. [Pokemon Unit — battle variant](#2-pokemon-unit--battle-variant)
3. [Health indicator — ring](#3-health-indicator--ring)
4. [Empty party slot](#4-empty-party-slot)
5. [Health indicator — bar (alternative, not yet chosen)](#5-health-indicator--bar-alternative-not-yet-chosen)

## The scaling rule (applies to every component)

**A component takes exactly one input: its size.** Every internal measurement — borders, radii, padding, shadows, glows, the health indicator and its badge — is written in `cqw`, a share of the component's own width, never in pixels. The component declares `container-type: inline-size` so this works whether it's given an explicit width or stretched by a grid.

The practical result: a tile at 56px on a phone and 200px on a desktop are the same drawing at different scales, with no breakpoints and no second set of numbers to maintain. **This holds for every variant below**, ring or bar — the badge, its masking, and its offset from the corner are all proportional, so nothing drifts or changes weight relative to the tile.

The one exception is SVG geometry, which can't take `cqw`. That's handled by giving the SVG a `viewBox` whose 100 units equal the ring's diameter, so it scales with the element regardless.

---

## 1. Pokemon Unit — base tile

**Locked.** A square holding a Pokemon sprite, type-coloured border, soft type-coloured glow. **No information overlay.** Used anywhere a Pokemon is shown without stats.

### Tokens

| Property | Value | At 84px |
|---|---|---|
| Size | `--unit-size: 84px` | 84px |
| Corner radius | `--radius: 16cqw` | 13.4px |
| Border | `--border-n: 4.6` (cqw) solid `--type` | 3.9px |
| Sprite box | `70.75cqw` square | 59.4px |
| Gap, sprite to border | derived | 8.4px |
| Inner shadow | `inset 0 0 3cqw` @ 45%, `inset 0 0 8cqw` @ 40%, pure black | 2.5 / 6.7px |
| Sprite glow | `0 0 4.5cqw` @ 26%, `0 0 11cqw` @ 13%, `0 0 18cqw` @ 6%, in `--type` | 3.8 / 9.2 / 15.1px |

84px is the reference size, not a constraint — it's simply where the proportions were tuned.

### Markup

```html
<div class="unit" style="--type: var(--t-grass)">
  <div class="unit__frame">
    <div class="unit__sprite"><img src="bulbasaur.png" alt=""></div>
  </div>
</div>
```

### CSS

```css
.unit{
  --unit-size: 84px;
  --type: var(--t-grass);                    /* the Pokemon's type colour */
  --border-n: 4.6;                           /* border thickness in cqw, unitless
                                                so the health indicator can derive from it */
  --border-w: calc(var(--border-n) * 1cqw);
  --radius: 16cqw;
  width: var(--unit-size);
  aspect-ratio: 1/1;
  container-type: inline-size;
  max-width: 100%;
  position: relative;
}

.unit__frame{
  border-radius: var(--radius);
  border: var(--border-w) solid var(--type);
  width: 100%;
  height: 100%;
  background: var(--tile);
  box-shadow:                                /* recesses the interior */
    inset 0 0 3cqw rgba(0,0,0,.45),
    inset 0 0 8cqw rgba(0,0,0,.40);
  display: grid;
  place-items: center;
}

.unit__sprite{
  width: 70.75cqw;
  height: 70.75cqw;
  display: grid;
  place-items: center;
}

.unit__sprite img{
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
  display: block;
  filter:                                    /* glow follows the silhouette */
    drop-shadow(0 0 4.5cqw color-mix(in srgb, var(--type) 26%, transparent))
    drop-shadow(0 0 11cqw  color-mix(in srgb, var(--type) 13%, transparent))
    drop-shadow(0 0 18cqw  color-mix(in srgb, var(--type) 6%, transparent));
}
```

### Why these choices

- **`drop-shadow`, not `box-shadow`, for the glow.** It follows the sprite's alpha channel, so the colour radiates from the Pokemon's silhouette rather than from a square. Both offsets are `0 0`, which centres it on the sprite instead of casting it to one side.
- **Three glow layers rather than one wide one.** A single large blur reads as a hard ring with a gap; stacked stops give a smooth falloff.
- **Inner shadow is pure black, not tinted.** It reads as depth on every type colour instead of going muddy on the darker ones like Ghost and Dark.
- **`image-rendering: pixelated`.** Without it sprites blur the moment the tile scales past their native size, which is most of the time.
- **`object-fit: contain`, not `width: auto`.** An `auto` image renders at its intrinsic size and only ever shrinks, so the sprite ignores its box entirely.

---

## 2. Pokemon Unit — battle variant

**Locked.** The base tile plus a health indicator on the top-left corner. Used on the battlefield, where every Pokemon needs its health readable at a glance.

Everything from the base tile carries over unchanged. The variant adds one class and, depending on which indicator design is used, a small set of extra elements — the ring (section 3, locked) or the bar (section 5, still being compared against it).

### Markup (ring)

```html
<div class="unit unit--battle" data-hp="ok"
     style="--type: var(--t-water); --hp: .68">
  <div class="unit__frame">
    <div class="unit__sprite"><img src="squirtle.png" alt=""></div>
  </div>
  <div class="unit__hpmask"></div>
  <div class="unit__hp">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle class="unit__hptrack" cx="50" cy="50" r="41.907"></circle>
      <circle class="unit__hpfill"  cx="50" cy="50" r="41.907"></circle>
    </svg>
  </div>
</div>
```

Two inputs drive it: **`--hp`** as a number from 0 to 1, and **`data-hp`** as `ok` / `warn` / `low` for the colour tier. Game code sets both together. This is the same contract the bar design in section 5 uses, so swapping which indicator a unit renders is a markup change only — the inputs don't change.

**The badge elements are siblings of `.unit__frame`, not children.** They have to sit above the border and extend past the tile's edge, which they can't do from inside the frame.

---

## 3. Health indicator — ring

**Locked.** A ring on the top-left corner of a battle unit. It fills the whole circle at full health and empties clockwise from twelve o'clock as health drops.

### Geometry

| Property | Value | At 84px |
|---|---|---|
| Ring outer diameter | `--hp-n: 27` (cqw) | 22.7px |
| Ring thickness | `--border-n × 0.95` = 4.37cqw | 3.7px |
| Masking band | `--hp-gap: 3cqw` | 2.5px |
| Badge disc | `--hp-size + gap × 2` = 33cqw | 27.7px |
| Centre position | `--radius / 2` in from the corner point | 6.7px, 6.7px |
| Inner glow | `inset 0 0 (26% of ring diameter)` @ 26% of ring colour | 5.9px |

**The ring is 5% thinner than the unit's border, deliberately.** It reads as related to the border without competing with it. Both derive from `--border-n`, so adjusting the border keeps them in step.

**The centre sits at half the corner radius**, so the badge straddles the rounded corner rather than the square corner point or the arc's centre. At an 84px tile it overhangs the tile edge by roughly 4.6px.

### Colour

| Tier | Token | Value | Range |
|---|---|---|---|
| Healthy | `--hp-green` | `#6ddc6d` | above 50% |
| Hurt | `--hp-yellow` | `#f7cf4a` | 20% to 50% |
| Critical | `--hp-red` | `#ff6b5e` | below 20% |
| Depleted arc | `--hp-track` | `rgba(255,255,255,.13)` | — |

The tier comes from the `data-hp` attribute, not from `--hp`, because CSS can't branch on a number. Game code sets the attribute alongside the value, which keeps the thresholds in the logic rather than buried in a stylesheet. The inner glow reads from the same `--hp-ring` token, so it shifts colour with the tier automatically. **This colour system — three tiers via `data-hp`, `--hp` as 0 to 1 — is shared with the bar design in section 5.**

### Fainting

**A fainted Pokemon drains to zero and is then removed from the field**, so there is no resting "fainted" appearance to design — the unit is gone. Whatever the indicator would look like at 0 HP only exists for the moment between the drain finishing and the unit leaving.

That moment is the only thing to watch. The ring animates over 0.35s, and a zero-length dash with round caps draws a small dot rather than nothing (see the gotchas). If removal is triggered the instant health reaches zero, the dot never appears. If there's any pause — a faint animation, a beat before the lane compacts — hide the fill circle so a coloured dot doesn't linger on an empty tile.

### The masking band

The badge sits on top of the type-coloured border, which would otherwise cut straight through it. A solid disc in the tile colour, `--hp-gap` larger than the ring on every side, hides the border behind it.

**That band is clipped to the tile's shape.** Where the badge overhangs the tile there is no border to hide, so drawing the band there would just put a dark crescent on the page background. Clipping is done with a separate `.unit__hpmask` element carrying the tile's `border-radius` and `overflow: hidden`; the ring itself is drawn unclipped on top, so it reads identically on and off the tile.

A gradient band was tried and rejected — flat colour reads better and is one token instead of a set of stops to retune whenever the tile colour or ring size changes.

### CSS

```css
.unit--battle{
  --hp: 1;                                  /* 0 to 1 */
  --hp-ring: var(--hp-green);               /* data-hp shifts the tier */
  --hp-n: 27;                               /* ring outer diameter, in cqw */
  --ring-n: calc(var(--border-n) * .95);    /* 5% thinner than the unit border */
  --hp-size: calc(var(--hp-n) * 1cqw);
  --hp-gap: 3cqw;                           /* band outside the ring */
  --hp-disc: calc(var(--hp-size) + var(--hp-gap) * 2);
  --hp-inset: calc(var(--radius) / 2);      /* centre, in from the corner point */
  --hp-band: var(--tile);                   /* solid band behind the ring */

  /* svg user units: 100 across equals --hp-size.
     Resolved numbers, not calc chains - see the gotcha below.
       stroke = 100 * ring-n / hp-n = 100 * 4.37 / 27 = 16.185
       r      = 50 - stroke / 2                       = 41.907
       circ   = 2 * PI * r                            = 263.31   */
  --sw: 16.185;
  --circ: 263.31;
}
.unit--battle[data-hp="warn"]{ --hp-ring: var(--hp-yellow); }
.unit--battle[data-hp="low"] { --hp-ring: var(--hp-red); }

/* band, clipped to the tile so it only covers the border */
.unit--battle .unit__hpmask{
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
}
.unit--battle .unit__hpmask::before{
  content: "";
  position: absolute;
  top:  calc(var(--hp-inset) - var(--hp-disc) / 2);
  left: calc(var(--hp-inset) - var(--hp-disc) / 2);
  width:  var(--hp-disc);
  height: var(--hp-disc);
  border-radius: 50%;
  background: var(--hp-band);
}

/* solid centre with a faint inner glow in the ring colour */
.unit--battle .unit__hp{
  position: absolute;
  top:  calc(var(--hp-inset) - var(--hp-size) / 2);
  left: calc(var(--hp-inset) - var(--hp-size) / 2);
  width:  var(--hp-size);
  height: var(--hp-size);
  border-radius: 50%;
  background: var(--tile);
  box-shadow: inset 0 0 calc(var(--hp-size) * .26)
              color-mix(in srgb, var(--hp-ring) 26%, transparent);
  z-index: 3;
}

/* the arc - svg, so the ends can be rounded */
.unit--battle .unit__hp svg{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform: rotate(-90deg);                /* start at twelve o'clock */
}
.unit--battle .unit__hp circle{
  fill: none;
  stroke-width: var(--sw);
  stroke-linecap: round;
}
.unit--battle .unit__hptrack{ stroke: var(--hp-track); }
.unit--battle .unit__hpfill{
  stroke: var(--hp-ring);
  /* arc runs from (1 - hp) round to twelve, so it empties clockwise */
  stroke-dasharray:  calc(var(--hp) * var(--circ)) var(--circ);
  stroke-dashoffset: calc((var(--hp) - 1) * var(--circ));
  transition: stroke-dasharray .35s ease, stroke-dashoffset .35s ease;
}
```

### Why SVG and not a conic gradient

The first build used `conic-gradient` with a radial mask. It works, but it can't produce rounded ends, and a custom property inside a gradient angle **doesn't animate** — the browser treats it as an unparsed string, so the ring would snap between values instead of sweeping. Registering `@property` fixes that, but SVG avoids the problem entirely: `stroke-dashoffset` is a real animatable property, so the depletion transitions smoothly with one line of CSS. With automatic combat the player is watching rather than driving, and a ring that jumps is much harder to read than one that drains.

### Two gotchas worth keeping

- **Don't compute SVG geometry with chained `calc()`.** `r` and `stroke-width` were originally derived by dividing one custom property by another. The chain failed to resolve, and an invalid value for `r` computes to **0** rather than falling back to the markup attribute — so the ring vanished completely with no error. The resolved numbers are in the CSS above with their derivation in a comment.
- **At exactly 0 HP, round caps draw a dot.** A zero-length dash with `stroke-linecap: round` renders as a small circle rather than nothing. Mostly moot since fainted units are removed, but it matters if anything delays that removal — see Fainting above.

### Still open

- Whether status effects (burn, poison) need a second indicator, and where it would sit — the other three corners are all free.
- Which health indicator design wins — see section 5.

---

## 4. Empty party slot

**Locked.** The tile shown for a party or box slot with no Pokemon in it — an empty starter selection, a Daycare slot, a gap in the team roster. Same square, same corner radius as every other unit, so it lines up in a row of real units without throwing off the grid.

### Markup

```html
<div class="unit unit--empty">
  <div class="unit__frame">
    <div class="unit__empty-icon">+</div>
  </div>
</div>
```

No `--type` is set — an empty slot has no Pokemon and therefore no type colour to borrow.

### CSS

```css
.unit--empty .unit__frame{
  border: var(--border-w) dashed var(--slot-empty);
  box-shadow: none;
}
.unit--empty .unit__empty-icon{
  font-size: 34cqw;
  font-weight: 300;
  line-height: 1;
  color: var(--slot-empty);
  user-select: none;
}
```

```css
/* token, alongside the other root colours */
--slot-empty: #454b5c;   /* empty-slot border/icon, deliberately muted */
```

### Why these choices

- **Dashed border, not solid.** A solid border in any colour still reads as "a Pokemon lives here" at a glance, since that's what every other tile's solid border means. Dashed is a state real tiles never use, so it's unambiguous even before the eye reaches the icon in the middle.
- **A dedicated `--slot-empty` token, not a reused gray.** It's deliberately darker and lower-contrast than the bar indicator's `--hp-bar-gray` (`#454b5c` vs `#8b93a6`). The bar's gray is an active readout competing for attention on a full-health unit; this one needs to recede, since its whole job is to say "nothing to look at here."
- **No inner shadow, no glow.** Both exist elsewhere to give a real Pokemon's sprite depth and presence. An empty slot has neither, so it stays flat — one more small signal that this tile isn't a unit, it's an absence of one.
- **A plain `+` rather than an icon asset.** Cheapest possible placeholder for a prototype; reads as "add something here" without committing to icon art before the team-management flow (where you'd tap this slot to do exactly that) is designed.

### Still open

- Whether the empty slot needs a different look depending on context — a tappable "add a Pokemon" affordance in team management is a different interaction than a battlefield slot that's just permanently vacant (a fainted-and-removed Pokemon, in the current no-attrition-within-a-run design, only ever empties a *box*/Daycare slot, never a mid-battle field slot — see [04-battle-system.md](04-battle-system.md)). If that distinction matters visually, this section will need two variants instead of one.
- The `+` glyph itself hasn't been compared against alternatives (an outline Poke Ball, a blank silhouette).

---

## 5. Health indicator — bar (alternative, not yet chosen)

**Not locked — a candidate, sitting side by side with the ring (section 3) in the live reference for comparison.** Same job as the ring — show remaining health on the top-left-ish corner of a battle unit — drawn instead as a small pill-shaped bar with a gray border, positioned toward the top-right corner and nudged inward from it.

Whichever of the two reads better on an actual battlefield (multiple units, at speed, at phone size) is the one that becomes "the" health indicator; the other gets cut from this doc. Until that call is made, both are documented so neither design is lost.

### Markup

```html
<div class="unit unit--battle-bar" data-hp="ok"
     style="--type: var(--t-water); --hp: .68">
  <div class="unit__frame">
    <div class="unit__sprite"><img src="squirtle.png" alt=""></div>
  </div>
  <div class="unit__hpbarmask"></div>
  <div class="unit__hpbar">
    <div class="unit__hpbar__track">
      <div class="unit__hpbar__fill"></div>
    </div>
  </div>
</div>
```

Same two inputs as the ring: **`--hp`** (0 to 1) and **`data-hp`** (`ok` / `warn` / `low`), and the same three colour tokens (`--hp-green` / `--hp-yellow` / `--hp-red`). Only the badge markup and its class differ.

### Geometry and position

| Property | Value | At 84px |
|---|---|---|
| Pill size | `--bar-w: 46cqw` × `--bar-h: 15cqw` | 38.6 × 12.6px |
| Border | `--bar-border-n: 2.736` (cqw), gray | 2.3px |
| Inner padding, border to track | `--bar-pad: 2.2cqw`, equal on all sides | 1.8px |
| Gap, pill to tile border | `--bar-gap: 3cqw` | 2.5px |
| Corner reference | `--hp-inset: --radius / 2`, same point the ring uses | 6.7px, 6.7px |
| Offset from that corner | right `25%` of the pill's own width, up `40%` of its own height | — |

**Anchored to the top-right corner, not the top-left.** Tried on the same (top-left) side as the ring first; moved to the right side and preferred there. The CSS mirrors the ring's positioning logic exactly, just measured with `right` instead of `left`.

**The offset is deliberate, not centred on the corner.** Unlike the ring, which sits centred on `--hp-inset`, the bar is pushed further right and up from that point — the net result of several small nudges (right 25%, up 50%, then down 5% twice more, landing at up 40%). At the current size that puts most of the pill hanging off the tile's top and right edges, with only its bottom-left corner overlapping the tile itself.

**The fill drains right-to-left.** `.unit__hpbar__fill` is anchored `left: 0` with `width: calc(var(--hp) * 100%)`, so it stays pinned to the track's left edge and its right edge retreats as HP drops — the classic "HP bar" behaviour, as opposed to the ring's clockwise sweep.

**Padding to the track is uniform by construction.** `.unit__hpbar` sets `padding: var(--bar-pad)` (one value, all four sides) with `box-sizing: border-box`, and the track is `width: 100%; height: 100%` of what's left after the border and that padding are subtracted. There's no per-side value to get out of sync.

### CSS

```css
.unit--battle-bar{
  --hp: 1;
  --hp-ring: var(--hp-green);
  --hp-inset: calc(var(--radius) / 2);   /* same corner reference as the ring badge */

  --bar-w: 46cqw;
  --bar-h: 15cqw;
  --bar-border-n: 2.736;                 /* gray pill border, in cqw */
  --bar-border-w: calc(var(--bar-border-n) * 1cqw);
  --bar-pad: 2.2cqw;                     /* gap between border and the bar itself */
  --bar-gap: 3cqw;                       /* breathing room between the pill and the corner cutout edge */

  --bar-off-x: calc(var(--bar-w) * .25);   /* shifted 25% of the pill's own width toward the tile's centre */
  --bar-off-y: calc(var(--bar-h) * .4);    /* net: up 50%, then down 5% twice more => up 40% of the pill's own height */
}
.unit--battle-bar[data-hp="warn"]{ --hp-ring: var(--hp-yellow); }
.unit--battle-bar[data-hp="low"] { --hp-ring: var(--hp-red); }

/* dark band clipped to the tile, same trick as the ring: hides the coloured
   border only where the badge actually sits over it */
.unit--battle-bar .unit__hpbarmask{
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
}
.unit--battle-bar .unit__hpbarmask::before{
  /* a pill-shaped halo that hugs the health bar itself with an equal
     --bar-gap on every edge, so the tile border reappears at a consistent
     distance from the pill's own border on every side. At the pill's current
     size and position it's already bigger than the frame's own corner
     radius, so it fully swallows the rounded-corner curve too with no
     separate patch needed. (If the pill is later shrunk or moved somewhere
     that no longer holds, re-check the corner for a stray sliver of border
     colour - see the gotcha below.) */
  content: "";
  position: absolute;
  top:    calc(var(--hp-inset) - var(--bar-h) / 2 - var(--bar-off-y) - var(--bar-gap));
  right:  calc(var(--hp-inset) - var(--bar-w) / 2 + var(--bar-off-x) - var(--bar-gap));
  width:  calc(var(--bar-w) + var(--bar-gap) * 2);
  height: calc(var(--bar-h) + var(--bar-gap) * 2);
  border-radius: 999px;
  background: var(--tile);
}

/* the pill: a gray border, padded, around the actual health track/fill */
.unit--battle-bar .unit__hpbar{
  position: absolute;
  top:   calc(var(--hp-inset) - var(--bar-h) / 2 - var(--bar-off-y));
  right: calc(var(--hp-inset) - var(--bar-w) / 2 + var(--bar-off-x));
  width:  var(--bar-w);
  height: var(--bar-h);
  box-sizing: border-box;
  border-radius: 999px;
  border: var(--bar-border-w) solid var(--hp-bar-gray);
  background: var(--tile);
  padding: var(--bar-pad);
  z-index: 3;
}
.unit--battle-bar .unit__hpbar__track{
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: var(--hp-track);
  overflow: hidden;
  position: relative;
}
/* anchored left, so it drains right-to-left as hp drops */
.unit--battle-bar .unit__hpbar__fill{
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  width: calc(var(--hp) * 100%);
  border-radius: 999px;
  background: var(--hp-ring);
  transition: width .35s ease;
}
```

```css
/* token, alongside the other root colours */
--hp-bar-gray: #8b93a6;   /* pill border, bar-style indicator only */
```

### The masking gotcha (worth keeping — this took three attempts)

The ring's masking band (section 3) is a simple disc, always the same size relative to the ring, always centred on the same corner point — one shape, one position, done. The bar badge doesn't get that for free, because it isn't circular and, per the offset above, doesn't actually sit centred on the corner. Three approaches were tried, in order:

1. **One rectangle, `width`/`height` each `max(--radius, reach + gap)`.** Guarantees the frame's rounded-corner curve is always fully covered (that curve's bounding box is exactly `--radius` square, and anything smaller can slice partway through it, leaving a stray sliver of border colour where the curve resumes uncovered). Worked, but wherever the pill's own reach was *less* than `--radius` — which happened on the bottom edge once the bar was nudged down — the mask was forced out to the full radius anyway, leaving a visibly oversized gap on just that side.
2. **A fixed `--radius`-square corner patch, plus a separate pill-shaped halo hugging the badge.** Tried to fix #1 by only forcing the full radius where it was actually needed. It didn't: since the two patches are independent, the *union* of a flat square and a pill can have a straight edge on one side (from the square) and a rounder, tighter edge on the other (from the halo), producing an inconsistent, faintly stair-stepped gap around the badge instead of an even one.
3. **One pill-shaped halo only, sized to the badge plus a uniform `--bar-gap` on every edge — no separate corner patch.** This is what's in the CSS above. It works *because*, at this pill's current size, that halo's own bounding box already exceeds `--radius` in both directions, so it happens to swallow the corner curve completely on its own. Confirmed by rendering with the corner patch removed and pixel-sampling the result: no sliver, and a consistent ~3cqw gap on every side, measured against the previous versions where it wasn't.

The catch, left as a comment in the CSS: **this only holds at the current size and offset.** If the pill is shrunk substantially, or moved further from the corner, its halo could stop being big enough to cover the curve on its own, and approach 1's problem (with a smaller, more localized fix — matching the halo to the curve only where they actually overlap, rather than forcing full-radius coverage everywhere) would need revisiting.

### Still open

- Which of section 3 (ring) or this bar wins, and this section gets promoted to "Locked" (or deleted) once that's decided.
- If the bar wins: the exact offset (right 25%, up 40%) was tuned by feel through several one-off nudges, not derived from a rule the way the ring's "centred on `--hp-inset`" is. Worth deciding whether that's fine as a fixed magic number or whether it should be expressed as some ratio of the corner geometry, the way the rest of this system tries to be.
