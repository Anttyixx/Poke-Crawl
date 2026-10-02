/*!
 * Bush Kit: shaking-grass / rustling-bush animation for HTML canvas games.
 * No dependencies. Sprites are embedded, so this one file is all you need.
 * Art: Pokémon Essentials v21.1 (Outside tileset + "Overworld dust and grass").
 *
 *   const kit = await BushKit.load();
 *   const bush = kit.createBush(64, 96);      // tile top-left, in game pixels
 *   bush.shake('vigorous');                    // 'normal' | 'vigorous' | 'shiny'
 *   // each frame:
 *   kit.update(dtMs);
 *   bush.draw(ctx);                            // or drawBase(ctx) + drawLeaves(ctx) for layering
 */
(function (root) {
  'use strict';

  var SPRITES = {
"bush": "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABoUlEQVR4nM1WLZqDMBSc7reiR0AiK5HIHqGyR6hEcgQkcuVKZI+wMhK5EskR6roimXwfE9JUbTIGyA8w896bvENnvp/YwbyuAICmqvam/fxjmQAAbdu9XBd7z8fu6D/ikzf6p+8yv11GAMDXvQMQKpF6TzkK8E+NGXcXHuvr5pnMFV6habADbW2vZrGP3bj5XjkKTL8GADBEmDHGHk0LAJjXZTNM5rfhvl1/ce/p7c3x2gMoSYHryTLqf2x2D+f9mFMJZc4Ykxnnm6q2+xxznxMO2RU4xJyQOUFlFKwWVgdjTwUI+gXB9eVWgUJ9QZ3OM5TYeh8QPIwbd36QXYFDOzZP4JWzLQDiSpjRXhl7zYXYWcB9+RU434cnEJ5uWud6CnqY7TqtAoUqlF8B+oAy1NNPEWS5VIGHKFScEwb9wAznbIlYB0jNC3MqXI4CqS53rl93Oh5uXHMo5g/lKBBlrvWv2R5RIjgFxSnnYnxAnTCVzTGne3e/h1MuuwI+B3xngym6GAizOWAec8QIsisQ9ITMeiJwRCLh8YT6gfYH2RX4A3Kk4q1xTAV4AAAAAElFTkSuQmCC",
"ground": "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAmElEQVR4nO2Wuw2AMAxEDWKAlB6D0RiJcSgzhks2gAIdRaJAPooMkl8TRSbKu2vIsGzrQYqMmpd3EWDHxI71BEqpFihNmvpevYGp9qDsQkR0p8IeKwjnIf9tAKSS5c7VGzABEzABEzABE8gW8CLk5fnP1lWgF5FAadLWZtQbiF5EM19vOKTCHisI57V8rwHwlqw1OVBvwARO7+0s3yr6ZlMAAAAASUVORK5CYII=",
"shake": "iVBORw0KGgoAAAANSUhEUgAAAOAAAAAgCAYAAAALxXRVAAADM0lEQVR4nO2crZbiQBCFb/ZEjFyJRK5ERvIISOTKkZE8QmQkEhnJI0S2jBwZiVyJY0WoJlS6YcymcrbvZ4b83ntOqKqmuidZ6U433OkuFwDAZrVCCDl+7RsAQFGUL8+L3acufmfyeaxv4UHrz+0hpJ+Sh1fPYQ4Pr76Lc3j4ETyTEDILeXe5+Ij8boR/7moAwPFcAphG/Lv7hPbRAz1YeHh17zk8sAISYki+Wa3gXB08+LHeP21LhGt8JmiqYUexHv66ftgsh+skA7Sja2UfPaTpocUzc3sIMacHVkBCDMmbLwf8LFBt98ETZDwLAMe+8dHeXXoURQnn6mEMfI/qz+r8uHg3us9h2PjYH7A9V7d2d8gAoPlyAIAqkkXG+gCATeH1x0iWedIfeRjra+ghXQ+CdEC9/naPTcDD8Vz633wAnuIBGFVN1+PqqkF/M/VwPOzg6pIVkBBLslDkh4h1dlw9bEs2e3SO1sN1kmnu418ZP0sFHM+9WHhYkn6KHpagD0znAOfywApIiCG5fNj/GsbSh7Z52hYk0mWMqztBgnR+/FhYZdxQ920pHqz1U/SwRP05PbACEmJILmNdjZ4D0WNd3wmSuQ3ZL3Meiqu77w/Mv1h7sNanh2XoW3hgBSTEkOzUt5EV4D2AeOTrbo9Euu7+aOQ61/zJAKCoN7f4SoJ/72EJ+sCr1RT/t4cl6APD99DCAysgIYZk23N106u59aoCverb457PC61sGKOzQrs7LEJ/fO+5Pfj9iepbPwNrfVZAQgzJSne66ciOzWkIk86O6vx4VGbQ57myW4Q+MM1uc3mQ3xCp6ls/A2t9VkBCDMmBR4emwxDx78a4E94dV5nhkVk6LEHf1kPq+p2xB1t9VkBCDMmB92916tb345H/7PWodW5CbE6klfsb61t6SF2/NfZgrc8KSIghWelON5ndn0R8bN5DIxkg0gWSTBCaA5IOlJUH/f4P6qelb/0dZAUkxJDJKoB3nZzYLP93r/eocTL1qZ+iPisgIYb4Cih8d5zrV33ryI+tBogw6RRRn/oJ6bMCEmLI5I1U+n390YzwZo2fEFtxEYP61E9JnxWQEEP+AstsK266UqrcAAAAAElFTkSuQmCC",
"leaves": "iVBORw0KGgoAAAANSUhEUgAAAGAAAAAgCAYAAADtwH1UAAAA7ElEQVR4nO3YsQ3CMBCF4QuiYAxGoWQMxmCEjMEYKRmFMdKZyhIissjZdzmj/F+FRGIi8Z4vsggAYK+G/GGax/T5xfV0H5aXw9oh+gH2rvgHTPOYvlsBezQg2GKft5oFzJR1aEAw81SW5sbaBrTe/29oQDB1qn7t7V4zpHW9Wo/XM4mI3M4Xl9+lAcGO1gtaJTS6OTn53mhAsOqzIO/rtbyS77X3ZzQgWHEG5ES1JnWr8ySrRtUmvvZtiQYEczsL0q7Xy3t/pk107eygAcG6O1+xboJ2vda3IO39NCBYdw2wsnXya9EAAAAABHgDfQyAKWgcG0cAAAAASUVORK5CYII="
};
  var TILE = 32;
  var TICK_MS = 50; // Essentials animations run at 20 frames per second

  // Shake frame index = lean + 3  (frames lean -3..+3 px at the top, 0 = upright)
  // leaves: index into the 3-frame leaf strip, or -1 for none
  var PRESETS = {
    normal: {
      leaves: [0,0,0, 1,1,1, 2,2,2],
      lean:   [2,2,2, -2,-2,-2, 1,1,1]
    },
    vigorous: {
      leaves: [0,0,0, 1,1, 0,0,0, 1,1, 0,0,0, 1,1,1, 2,2,2],
      lean:   [3,3,3, -3,-3,-3, 3,3,3, -3,-3,-3, 2,2,2, -2,-2,-2, 1]
    },
    shiny: {
      leaves: [0,0,0, 1,1, 0,0,0, 1,1,1, 2,2,2],
      lean:   [3,3,3, -3,-3,-3, 2,2,2, -2,-2,-2, 1,1],
      additive: true
    }
  };

  function loadImage(b64) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () { res(img); };
      img.onerror = rej;
      img.src = 'data:image/png;base64,' + b64;
    });
  }

  function Bush(kit, x, y, opts) {
    this.kit = kit;
    this.x = x; this.y = y;
    this.opts = opts || {};
    this.anim = null;     // current preset
    this.tick = 0;        // frame within the preset
    this.acc = 0;         // ms accumulator
    this.loop = false;
    this.gapMs = 0;       // pause between loops
    this.waiting = 0;
    this.onDone = null;
  }

  Bush.prototype.shake = function (type, options) {
    options = options || {};
    var p = PRESETS[type || 'normal'];
    if (!p) throw new Error('BushKit: unknown shake type "' + type + '"');
    this.type = type || 'normal';
    this.anim = p; this.tick = 0; this.acc = 0; this.waiting = 0;
    this.loop = !!options.loop;
    this.gapMs = options.gapMs != null ? options.gapMs : 600;
    this.onDone = options.onDone || null;
    return this;
  };

  Bush.prototype.stop = function () { this.anim = null; this.loop = false; this.waiting = 0; return this; };

  Object.defineProperty(Bush.prototype, 'isShaking', { get: function () { return !!this.anim; } });

  Bush.prototype.update = function (dt) {
    if (!this.anim) return;
    if (this.waiting > 0) { this.waiting -= dt; if (this.waiting <= 0) { this.tick = 0; this.acc = 0; } return; }
    this.acc += dt;
    while (this.acc >= TICK_MS && this.anim) {
      this.acc -= TICK_MS;
      this.tick++;
      if (this.tick >= this.anim.leaves.length) {
        if (this.loop) { this.waiting = this.gapMs; if (this.waiting <= 0) this.tick = 0; else return; }
        else { var cb = this.onDone; this.anim = null; if (cb) cb(this); }
      }
    }
  };

  Bush.prototype._lean = function () {
    if (!this.anim || this.waiting > 0) return 0;
    var l = this.anim.lean[this.tick]; return l == null ? 0 : l;
  };
  Bush.prototype._leaf = function () {
    if (!this.anim || this.waiting > 0) return -1;
    var f = this.anim.leaves[this.tick]; return f == null ? -1 : f;
  };

  // view: { scale, offsetX, offsetY } maps game pixels to canvas pixels (all optional)
  function place(bush, view) {
    view = view || {};
    var s = view.scale || 1;
    return { s: s, x: (bush.x - (view.offsetX || 0)) * s, y: (bush.y - (view.offsetY || 0)) * s };
  }

  Bush.prototype.drawBase = function (ctx, view) {
    var p = place(this, view), k = this.kit, lean = this._lean();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(k.images.shake, (lean + 3) * TILE, 0, TILE, TILE, p.x, p.y, TILE * p.s, TILE * p.s);
  };

  Bush.prototype.drawLeaves = function (ctx, view) {
    var f = this._leaf(); if (f < 0) return;
    var p = place(this, view), k = this.kit;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (this.anim.additive) ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(k.images.leaves, f * TILE, 0, TILE, TILE, p.x, p.y, TILE * p.s, TILE * p.s);
    ctx.restore();
  };

  Bush.prototype.draw = function (ctx, view) { this.drawBase(ctx, view); this.drawLeaves(ctx, view); };

  Bush.prototype.hitTest = function (gx, gy) {
    return gx >= this.x && gx < this.x + TILE && gy >= this.y && gy < this.y + TILE;
  };

  function Kit(images) {
    this.images = images;
    this.bushes = [];
    this.TILE = TILE;
  }
  Kit.prototype.createBush = function (x, y, opts) {
    var b = new Bush(this, x, y, opts); this.bushes.push(b); return b;
  };
  Kit.prototype.removeBush = function (b) {
    var i = this.bushes.indexOf(b); if (i >= 0) this.bushes.splice(i, 1);
  };
  Kit.prototype.update = function (dt) {
    for (var i = 0; i < this.bushes.length; i++) this.bushes[i].update(dt);
  };
  Kit.prototype.drawGround = function (ctx, x, y, view) {
    var s = (view && view.scale) || 1, ox = (view && view.offsetX) || 0, oy = (view && view.offsetY) || 0;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.images.ground, (x - ox) * s, (y - oy) * s, TILE * s, TILE * s);
  };
  Kit.prototype.bushAt = function (gx, gy) {
    for (var i = this.bushes.length - 1; i >= 0; i--) if (this.bushes[i].hitTest(gx, gy)) return this.bushes[i];
    return null;
  };

  // For DOM / React UIs: a self-running <canvas> showing one bush on a ground tile.
  Kit.prototype.createBushElement = function (opts) {
    opts = opts || {};
    var scale = opts.scale || 3, kit = this;
    var c = document.createElement('canvas');
    c.width = TILE * scale; c.height = TILE * scale;
    c.style.imageRendering = 'pixelated';
    var ctx = c.getContext('2d');
    var b = new Bush(this, 0, 0, opts), last = performance.now(), raf = 0;
    function frame(now) {
      b.update(Math.min(100, now - last)); last = now;
      ctx.clearRect(0, 0, c.width, c.height);
      if (opts.ground !== false) kit.drawGround(ctx, 0, 0, { scale: scale });
      b.draw(ctx, { scale: scale });
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return { el: c, bush: b, destroy: function () { cancelAnimationFrame(raf); } };
  };

  var BushKit = {
    TILE: TILE,
    TICK_MS: TICK_MS,
    PRESETS: PRESETS,
    load: function () {
      return Promise.all([
        loadImage(SPRITES.bush), loadImage(SPRITES.ground),
        loadImage(SPRITES.shake), loadImage(SPRITES.leaves)
      ]).then(function (r) {
        return new Kit({ bush: r[0], ground: r[1], shake: r[2], leaves: r[3] });
      });
    }
  };

  if (typeof module === 'object' && module.exports) module.exports = BushKit;
  root.BushKit = BushKit;
})(typeof window !== 'undefined' ? window : globalThis);
