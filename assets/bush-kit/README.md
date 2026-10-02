# Bush Kit

Shaking-grass animation for HTML canvas games. One file, no dependencies.

## What's inside

| File | What it is |
| --- | --- |
| `bush-kit.js` | The library. All sprites are embedded, so this is the only file your game needs. |
| `demo.html` | Working example: tap the bush that keeps shaking, or use the Poké Radar button. |
| `sprites/bush.png` | The grass bush, 32×32. |
| `sprites/bush_shake_strip.png` | 7 shake frames, 32×32 each. The top of the bush leans −3, −2, −1, 0, +1, +2, +3 px (frame 3 is upright). |
| `sprites/rustle_leaves_strip.png` | 3 rustling-leaf frames, 32×32 each, already lined up to sit on the bush tile. |
| `sprites/rustle_leaves_1-3.png` | The same leaf frames as separate files. |
| `sprites/ground.png` | Plain ground tile used in the demo. |

All sprites are 32×32 and share the same origin, so you just draw them at the tile's top-left corner.

## Quick start

```html
<script src="bush-kit.js"></script>
<script>
(async () => {
  const kit = await BushKit.load();
  const bush = kit.createBush(64, 96);   // tile top-left in game pixels

  bush.shake('vigorous');                // 'normal' | 'vigorous' | 'shiny'

  let last = performance.now();
  function loop(now) {
    kit.update(now - last); last = now;  // advances every bush
    bush.draw(ctx, { scale: 3 });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
</script>
```

With a bundler (Vite, webpack, esbuild) you can `import BushKit from './bush-kit.js'`. Without one, load it with a plain `<script>` tag and use `window.BushKit`.

## API

`BushKit.load()` returns a promise for the kit.

**Kit**
- `kit.createBush(x, y)` makes a bush and tracks it.
- `kit.update(dtMs)` advances all tracked bushes. Call once per frame.
- `kit.bushAt(gx, gy)` returns the bush under a point (game pixels), or `null`.
- `kit.removeBush(bush)`
- `kit.drawGround(ctx, x, y, view)`
- `kit.createBushElement({ scale })` returns `{ el, bush, destroy }`, a self-animating `<canvas>` for DOM or React UIs.

**Bush**
- `bush.shake(type, { loop, gapMs, onDone })`. `loop: true` keeps it shaking (good for "a Pokémon is hiding here"), with `gapMs` of stillness between shakes (default 600). `onDone` fires when a non-looping shake ends.
- `bush.stop()`
- `bush.isShaking`
- `bush.draw(ctx, view)`, or `bush.drawBase()` then `bush.drawLeaves()` if you want leaves drawn above the player or neighbouring bushes.
- `view` is optional: `{ scale, offsetX, offsetY }`, where offset is your camera position in game pixels.

## Shake types

Timing matches Pokémon Essentials: 20 ticks per second (50 ms each).

- **normal**: one leaf burst, small sway. About 0.45 s.
- **vigorous**: leaves burst three times with a strong sway. About 0.95 s.
- **shiny**: like vigorous but the leaves use additive blending (`globalCompositeOperation = 'lighter'`) so they glow. About 0.7 s.

You can edit or add presets in `BushKit.PRESETS`. Each one is a `leaves` array (leaf frame 0–2, or −1 for none) and a `lean` array (−3 to 3), one entry per tick.

## Tips

- Keep `imageSmoothingEnabled = false` and integer scales so the pixels stay crisp. The kit sets this for its own draws.
- Draw all bush bases first, then all leaves, so leaves aren't covered by the next bush over.

## Credits

Bush, ground and leaf art come from Pokémon Essentials v21.1. If you release your game, credit Pokémon Essentials and its graphics contributors as its credits list asks. The shake frames are sheared versions of the Essentials bush tile.
