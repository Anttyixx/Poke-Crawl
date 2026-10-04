"use strict";
const DATA = __DATA__;
const ITEMS_DATA = __ITEMS__;
const CANDY_SPR = '__CANDY__';
const ROTOMDEX_SPR = '__ROTOMDEX__';                      // Rotom Pokédex, the Pokédex's icon
const TR_SPR = __TRS__;                                   // Technical Record sprite per move type
const VERSION = '__VERSION__';                            // from the VERSION file; dev builds add "-dev (commit)"
const CHANGELOG = __CHANGELOG__;                          // CHANGELOG.md as HTML, for the title screen's release notes

/* ================= data ================= */
const FORMS = DATA.forms, MOVES = DATA.moves, SPRITES = DATA.sprites;
const FORM = Object.fromEntries(FORMS.map(f => [f.id, f]));
const STAT_MAX = { hp: 255, atk: 255, spd: 255 };   // the highest any stat can naturally be; stat bars are drawn against this
const LINES = {};
for (const f of FORMS) ((LINES[f.line] ||= {})[f.star] ||= []).push(f);
const LINE_IDS = Object.keys(LINES);
/* Moves come in three kinds (MOVES[k].cat): 'sig', a shared signature move, learned by leveling and never taught;
   'unique', a signature only one line has; 'tutor', taught at the Move Tutor. Who can be taught what comes from move
   pools: each pool is a list of tutor moves plus a rule (every Pokémon, one type, or a ★1 stat at or above a bar).
   Type pools follow the current species' type; stat pools check the line's ★1 stats so they never change. */
const POOLS = DATA.pools;
const poolFits = (p, f) => p.rule.all || p.rule.type === f.type || (p.rule.stat && LINES[f.line][1][0][p.rule.stat] >= p.rule.min);
const LEARN = {};
for (const f of FORMS) LEARN[f.id] = [...new Set(POOLS.filter(p => poolFits(p, f)).flatMap(p => p.moves))].filter(k => k !== f.sig);
for (const m of Object.values(MOVES)) m.learnableBy = [];
for (const [id, ks] of Object.entries(LEARN)) for (const k of ks) MOVES[k].learnableBy.push(id);
const SPECIES_N = new Set(FORMS.map(f => f.name)).size;     // Raticate at ★2 and ★3 is one Pokémon
const UNIVERSAL = new Set(POOLS.filter(p => p.rule.all).flatMap(p => p.moves));
MOVES.struggle = { name:'Struggle', star:1, type:'none', kind:'off', shape:'single', power:20, weight:0, fx:'Used once a Pokémon has used up its move limit for the battle. The user takes 12% of its max HP.', cat:'none', learnableBy:[] };
const STARTERS = ['bulbasaur', 'charmander', 'squirtle'];
// legendaries come only from Legendary nodes: never in wild offers or on trainers' and gym leaders' teams
const LEGEND_LINES = LINE_IDS.filter(l => LINES[l][1][0].legendary);
const TEAM_LINES = LINE_IDS.filter(l => !LEGEND_LINES.includes(l));
const WILD_LINES = TEAM_LINES.filter(l => !STARTERS.includes(l));
const ITEM = Object.fromEntries(ITEMS_DATA.map(i => [i.id, i]));
const ITEM_IDS = ITEMS_DATA.map(i => i.id);

/* every balance number for the prototype lives here */
const TUNE = {
  lives: 3, startCoins: 100,
  pay: { trainer: 60, boss: 150, legendary: 80 },
  xp: { trainer: .1, boss: .15, legendary: .1 },   // share of a level EVERY party Pokémon earns per win (not split)
  daycareRate: .5,
  enemyMul: { trainer: .85, boss: .9, legendary: .85 }, perMap: .02,
  trainerDrop: .3,                                   // chance each trainer Pokémon is one level below the one it mirrors
  tutorPrice: { 1: 40, 2: 80, 3: 150 }, rerollStep: 20,
  moveLimit: 12, moveLimitStep: 2,                   // moves a Pokémon can use per battle at ★1, and how much each star adds
  taughtMax: 1,                                      // moves besides its signature: every Pokémon knows 2 moves in all
  daycareSize: 10,
  candyExp: .25,                                     // an EXP Candy (left by a released Pokémon) is worth a quarter of a level
  hopSlow: .8,                                       // Pokémon slot-to-slot jumps run 25% faster than the original
  martStock: 4, martRerollStep: 20,
  sellRate: .5,                                      // a Poké Mart buys items back for this share of their price
  bagSize: 4,                                        // held items the player can carry, shown 2 by 2 on the map
  itemPrice: { 'choice-band':120, 'choice-specs':100, 'choice-scarf':120, 'life-orb':120, 'weakness-policy':100,
    'leftovers':90, 'focus-sash':90, 'assault-vest':90, 'safety-goggles':90,
    'rocky-helmet':60, 'protective-pads':60, 'heavy-duty-boots':70 },
};
const FILL = [1, 0, 2, 4, 3, 5];     // front middle first, then front, then back
const GYMS = [
  { type:'bug', name:'Leader Wren' }, { type:'normal', name:'Leader Hal' }, { type:'grass', name:'Leader Ivy' },
  { type:'poison', name:'Leader Nox' }, { type:'electric', name:'Leader Volta' }, { type:'fire', name:'Leader Cinder' },
  { type:'water', name:'Leader Marin' }, { type:'ground', name:'Leader Dune' },
];
const TRAINERS = ['Youngster Pip', 'Lass Mina', 'Camper Theo', 'Bug Catcher Rudi', 'Picnicker Ava', 'Hiker Dale', 'Swimmer Kai', 'Ace Trainer Rhea', 'Fisher Bo', 'Scout Lena'];
const SHAPE_NAME = { single:'Single', pierce:'Pierce', splash:'Splash', row:'Full front row', back:'Back row', field:'Full field' };
const SHAPE_LABEL = { single:'', pierce:'pierce', splash:'splash', row:'front row', back:'back row', field:'full field' };
const TARGET_NAME = { self:'self', team:'whole team', lowest:'lowest-HP ally', front:'own front row', ahead:'teammate ahead' };

/* ================= utils ================= */
const $ = s => document.querySelector(s);
const rndInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pct = x => `${Math.round(x * 100)}%`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const typeColor = t => `var(--t-${t === 'none' ? 'normal' : t})`;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l2.95 6.3 6.9.75-5.15 4.7 1.45 6.8L12 17.3l-6.15 3.45 1.45-6.8-5.15-4.7 6.9-.75z"/></svg>';
const HEART = '<svg class="heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.9 1.3 5.4 3.2 1.5-1.9 3.3-3.2 5.4-3.2 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z"/></svg>';

/* ================= pokemon + items ================= */
let uidN = 0;
// the form a line takes at a level. Where a line splits (Eevee, Slowpoke, Tyrogue, Scyther at ★2; Oddish, Poliwag at ★3)
// the branch is picked at random; after that a Pokémon stays on its branch as it levels.
function formFor(line, star, prev){
  const opts = LINES[line][star], b = prev && FORM[prev].branch;
  return ((b && opts.find(f => f.branch === b)) || pick(opts)).id;
}
const known = m => [FORM[m.form].sig, ...m.taught];
/* ---------- move odds ----------
   Every move has a weight. Each time a Pokémon acts it picks one of its moves at random, in proportion to their weights;
   nothing is used up, so the odds stay the same all battle. A Pokémon's info shows each move's chance as a percentage.
   A held item can scale the weight of some of its moves: ITEM[id].odds = { kind: 'off' | 'sup' (or any move), mul }. */
const ODDS_NAME = 'Weight';                              // what the move's number is called in the game (placeholder)
// how many moves a Pokémon can use in one battle (a move that happens costs one); then it Struggles. Grows with its stars
const moveLimit = star => TUNE.moveLimit + TUNE.moveLimitStep * (star - 1);
const limitHTML = star => `<b>${moveLimit(star)} moves per battle</b>, then it Struggles${star < 3 ? `. +${TUNE.moveLimitStep} at each star` : ''}.`;
function moveWeight(k, item){
  const m = MOVES[k], o = item && ITEM[item]?.odds;
  return (m.weight ?? 0) * (o && (!o.kind || o.kind === m.kind) ? o.mul : 1);
}
// each move's chance to be picked, in whole percents that add up to 100
function moveOdds(moves, item){
  const w = moves.map(k => moveWeight(k, item)), t = w.reduce((a, b) => a + b, 0);
  if (!t) return moves.map(() => 0);
  const raw = w.map(x => x / t * 100), out = raw.map(Math.floor);
  let left = 100 - out.reduce((a, b) => a + b, 0);
  raw.map((x, i) => [x - out[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0){ out[i]++; left--; } });
  return out;
}
// a party Pokémon's odds for each move it knows, as { move: percent }
function monOdds(m){ const ks = known(m), o = moveOdds(ks, m.item?.id); return Object.fromEntries(ks.map((k, i) => [k, o[i]])); }
const nm = m => FORM[m.form].name;
function learnable(m){
  const have = new Set(known(m));
  return (LEARN[m.form] || []).filter(k => !have.has(k) && MOVES[k].star <= m.star && !(m.item?.id === 'assault-vest' && MOVES[k].kind === 'sup'));
}
function makeMon(line, star = 1, exp = 0){
  const m = { uid: 'm' + (++uidN), line, star, form: formFor(line, star), exp: star >= 3 ? 1 : exp, taught: [], item: null };
  const opts = learnable(m), off = opts.filter(k => MOVES[k].kind === 'off');
  if (opts.length) m.taught.push(pick(off.length ? off : opts));       // arrives knowing one move besides its signature
  return m;
}
const makeItem = id => ({ uid: 'i' + (++uidN), id });
function levelUp(m){
  const from = nm(m);
  m.star++; m.form = formFor(m.line, m.star, m.form);
  const sig = FORM[m.form].sig;
  m.taught = m.taught.filter(k => k !== sig);
  return { from, to: nm(m) };
}

/* ================= MAP GENERATION (from World Map Test: 7 columns, 10 floors, 6 routes) ================= */
function mulberry32(seed){ let v = seed >>> 0; return () => { v += 0x6D2B79F5; let t = v; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function createRng(seed){ const next = mulberry32(seed); return { float: next, int: (a, b) => a + Math.floor(next() * (b - a + 1)), pick: a => a[Math.floor(next() * a.length)] }; }
const deriveSeed = (seed, n) => (Math.imul(seed ^ 0x9E3779B9, 0x85EBCA6B) + Math.imul(n + 1, 0xC2B2AE35)) >>> 0;
const GEN = { width: 7, floors: 10, pathPasses: 6, minStarts: 2, maxStarts: 4, wildMin: 2, wildMax: 3, legendaryMaxPerPath: 1,
  legendaryUnlock: .4, tutorUnlockFloor: 1, daycareFloor: 5,
  weights: { trainer: 52, item: 13, tutor: 12, legendary: 6 }, candidates: 4, extraWilds: 2 };
const SPECIAL = new Set(['tutor', 'legendary']);
const ICON = { start:'🚩', wild:'🌿', trainer:'⚔️', item:'🛒', tutor:'💿', daycare:'🏡', legendary:'✨', boss:'🏆' };
const LABEL = { start:'Start', wild:'Wild Pokémon', trainer:'Trainer battle', item:'Poké Mart', tutor:'Move Tutor', daycare:'Daycare', legendary:'Legendary', boss:'Gym' };
const fixedFloors = cfg => ({ daycare: cfg.daycareFloor });
const edgesCross = (a, b, c, d) => (a - c) * (b - d) < 0;

function generateTopology(rng, cfg){
  const nodes = new Map();
  const ensure = (c, r) => { const id = `${c},${r}`; if (!nodes.has(id)) nodes.set(id, { id, c, r, type: null, kids: new Set(), pars: new Set() }); return nodes.get(id); };
  const link = (a, b) => { a.kids.add(b.id); b.pars.add(a.id); };
  const wouldCross = (from, to, r) => {
    for (const n of nodes.values()){
      if (n.r !== r || n.c === from) continue;
      for (const k of n.kids){ const t = nodes.get(k); if (t.r === r + 1 && edgesCross(n.c, t.c, from, to)) return true; }
    }
    return false;
  };
  const used = new Set();
  for (let p = 0; p < cfg.pathPasses; p++){
    const all = [...Array(cfg.width).keys()];
    const start = p < 2 ? rng.pick(all.filter(x => !used.has(x))) : used.size >= cfg.maxStarts ? rng.pick([...used]) : rng.pick(all);
    used.add(start);
    let placed = false;
    for (let tries = 0; tries < 8 && !placed; tries++){
      const steps = []; let c = start, stuck = false;
      for (let r = 0; r < cfg.floors - 1; r++){
        const legal = [c - 1, c, c + 1].filter(x => x >= 0 && x < cfg.width)
          .filter(x => !wouldCross(c, x, r) && !steps.some(s => s.r === r && edgesCross(s.from, s.to, c, x)));
        if (!legal.length){ stuck = true; break; }
        const nx = rng.pick(legal); steps.push({ r, from: c, to: nx }); c = nx;
      }
      if (stuck) continue;
      ensure(start, 0);
      steps.forEach(s => link(ensure(s.from, s.r), ensure(s.to, s.r + 1)));
      placed = true;
    }
    if (!placed) return null;
  }
  // the middle floor collapses into one daycare every route passes through
  const D = { id:'D', c:(cfg.width - 1) / 2, r:cfg.daycareFloor, type:'daycare', kids:new Set(), pars:new Set() };
  for (const m of [...nodes.values()].filter(n => n.r === cfg.daycareFloor)){
    for (const p of m.pars){ const pn = nodes.get(p); pn.kids.delete(m.id); pn.kids.add('D'); D.pars.add(p); }
    for (const k of m.kids){ const kn = nodes.get(k); kn.pars.delete(m.id); kn.pars.add('D'); D.kids.add(k); }
    nodes.delete(m.id);
  }
  nodes.set('D', D);
  const S = { id:'S', c:(cfg.width - 1) / 2, r:-1, type:'start', kids:new Set(), pars:new Set() };
  const B = { id:'B', c:(cfg.width - 1) / 2, r:cfg.floors, type:'boss', kids:new Set(), pars:new Set() };
  for (const n of nodes.values()){ if (n.r === 0) link(S, n); if (n.r === cfg.floors - 1) link(n, B); }
  nodes.set('S', S); nodes.set('B', B);
  return { nodes, cfg };
}
function wildCounts(map, W){
  const order = [...map.nodes.values()].sort((a, b) => a.r - b.r), pre = {}, suf = {};
  for (const n of order){
    const w = W.has(n.id) ? 1 : 0;
    if (!n.pars.size) pre[n.id] = { min: w, max: w, from: null, fromMax: null };
    else { const s = { min: Infinity, max: -Infinity };
      for (const p of n.pars){ if (pre[p].min + w < s.min){ s.min = pre[p].min + w; s.from = p; } if (pre[p].max + w > s.max){ s.max = pre[p].max + w; s.fromMax = p; } }
      pre[n.id] = s; }
  }
  for (const n of order.reverse()){ const w = W.has(n.id) ? 1 : 0; suf[n.id] = n.kids.size ? w + Math.max(...[...n.kids].map(k => suf[k])) : w; }
  return { pre, suf };
}
function placeWilds(map, rng){ for (let t = 0; t < 12; t++) if (tryPlaceWilds(map, rng)) return true; return false; }
function tryPlaceWilds(map, rng){
  const cfg = map.cfg, fx = fixedFloors(cfg), W = new Set();
  const node = id => map.nodes.get(id);
  const siblingsOf = n => { const out = new Set(); n.pars.forEach(p => node(p).kids.forEach(k => k !== n.id && out.add(k))); return out; };
  const eligible = n => n.r >= 0 && n.r < cfg.floors && n.r !== fx.daycare && !W.has(n.id)
    && ![...n.pars, ...n.kids, ...siblingsOf(n)].some(id => W.has(id));
  const trace = (pre, key) => { const out = []; let id = 'B'; while (id){ out.push(node(id)); id = pre[id][key]; } return out; };
  const fits = (c, n) => c.pre[n.id].max + c.suf[n.id] + 1 <= cfg.wildMax;
  let extras = cfg.extraWilds;
  for (let i = 0; i < 300; i++){
    const c = wildCounts(map, W);
    if (c.pre.B.max > cfg.wildMax){ const on = trace(c.pre, 'fromMax').filter(n => W.has(n.id)); W.delete(rng.pick(on).id); continue; }
    if (c.pre.B.min < cfg.wildMin){
      const opts = trace(c.pre, 'from').filter(n => eligible(n) && fits(c, n));
      if (!opts.length) return false;
      W.add(rng.pick(opts).id); continue;
    }
    if (extras-- > 0){ const opts = [...map.nodes.values()].filter(n => eligible(n) && fits(c, n)); if (opts.length) W.add(rng.pick(opts).id); continue; }
    W.forEach(id => node(id).type = 'wild');
    return true;
  }
  return false;
}
function prefix(map, n){
  let wMin = Infinity, wMax = -Infinity, lMax = -Infinity;
  for (const p of n.pars){ const q = map.nodes.get(p).pre; wMin = Math.min(wMin, q.wMin); wMax = Math.max(wMax, q.wMax); lMax = Math.max(lMax, q.lMax); }
  return { wMin, wMax, lMax };
}
function setPrefix(map, n){
  const w = n.type === 'wild' ? 1 : 0, l = n.type === 'legendary' ? 1 : 0;
  if (n.id === 'S'){ n.pre = { wMin: 0, wMax: 0, lMax: 0 }; return; }
  const p = prefix(map, n); n.pre = { wMin: p.wMin + w, wMax: p.wMax + w, lMax: p.lMax + l };
}
function isLegal(map, n, t, siblings){
  const cfg = map.cfg, fx = fixedFloors(cfg), frac = n.r / (cfg.floors - 1);
  if (siblings.has(t)) return false;
  if (n.r === fx.daycare) return false;
  if (t === 'legendary' && frac < cfg.legendaryUnlock) return false;
  if (t === 'tutor' && n.r + 1 < cfg.tutorUnlockFloor) return false;
  const parents = [...n.pars].map(id => map.nodes.get(id));
  if (SPECIAL.has(t) && parents.some(p => SPECIAL.has(p.type))) return false;
  const pre = prefix(map, n);
  if (t === 'legendary' && pre.lMax + 1 > cfg.legendaryMaxPerPath) return false;
  return true;
}
const weightsFor = map => Object.entries(map.cfg.weights).map(([type, weight]) => ({ type, weight }));
function weightedOrder(rng, entries){
  const pool = [...entries], out = [];
  while (pool.length){
    let roll = rng.float() * pool.reduce((s, e) => s + e.weight, 0), i = 0;
    for (; i < pool.length - 1; i++){ roll -= pool[i].weight; if (roll < 0) break; }
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}
function assignGroup(map, rng, kids, i = 0, taken = new Set()){
  if (i >= kids.length) return true;
  const n = kids[i];
  if (n.type){ const had = taken.has(n.type); taken.add(n.type); if (assignGroup(map, rng, kids, i + 1, taken)) return true; if (!had) taken.delete(n.type); return false; }
  for (const opt of weightedOrder(rng, weightsFor(map).filter(e => isLegal(map, n, e.type, taken)))){
    n.type = opt.type; taken.add(opt.type);
    if (assignGroup(map, rng, kids, i + 1, taken)) return true;
    n.type = null; taken.delete(opt.type);
  }
  return false;
}
function assignRooms(map, rng){
  const cfg = map.cfg, fx = fixedFloors(cfg);
  const byFloor = r => [...map.nodes.values()].filter(n => n.r === r).sort((a, b) => a.c - b.c);

  setPrefix(map, map.nodes.get('S'));
  if (!assignGroup(map, rng, byFloor(0))) return false;
  for (let r = 0; r < cfg.floors; r++){
    const floor = byFloor(r);
    for (const n of floor) if (!n.type){
      const opt = weightedOrder(rng, weightsFor(map).filter(e => isLegal(map, n, e.type, new Set())))[0];
      if (!opt) return false; n.type = opt.type;
    }
    floor.forEach(n => setPrefix(map, n));
    if (r === cfg.floors - 1) break;
    for (const p of floor){
      const kids = [...p.kids].map(id => map.nodes.get(id)).sort((a, b) => a.c - b.c);
      if (kids.length > 1 && p.id !== 'D' && !assignGroup(map, rng, kids)) return false;
    }
  }
  setPrefix(map, map.nodes.get('B'));
  return true;
}
function pathStats(map){
  const order = [...map.nodes.values()].sort((a, b) => a.r - b.r), st = {};
  for (const n of order){
    const w = n.type === 'wild' ? 1 : 0, l = n.type === 'legendary' ? 1 : 0;
    if (!n.pars.size){ st[n.id] = { min: w, max: w, lMax: l, count: 1 }; continue; }
    const s = { min: Infinity, max: -Infinity, lMax: -Infinity, count: 0 };
    for (const p of n.pars){ const q = st[p]; s.min = Math.min(s.min, q.min + w); s.max = Math.max(s.max, q.max + w); s.lMax = Math.max(s.lMax, q.lMax + l); s.count += q.count; }
    st[n.id] = s;
  }
  return st;
}
function validateMap(map){
  const cfg = map.cfg, fx = fixedFloors(cfg), errors = [];
  const regular = [...map.nodes.values()].filter(n => n.r >= 0 && n.r < cfg.floors);
  const starts = regular.filter(n => n.r === 0).length;
  if (starts < cfg.minStarts || starts > cfg.maxStarts) errors.push('starts');
  for (let r = 0; r < cfg.floors - 1; r++){
    const e = [];
    regular.filter(n => n.r === r).forEach(n => n.kids.forEach(k => { const t = map.nodes.get(k); if (t.r !== r + 1) errors.push('edge'); else e.push([n.c, t.c]); }));
    for (let i = 0; i < e.length; i++) for (let j = i + 1; j < e.length; j++) if (edgesCross(e[i][0], e[i][1], e[j][0], e[j][1])) errors.push('cross');
  }
  for (const n of regular){
    const frac = n.r / (cfg.floors - 1);
    if (!n.type) errors.push('unassigned');
    if (n.r === fx.daycare && n.type !== 'daycare') errors.push('daycare floor');
    if (n.type === 'daycare' && n.id !== 'D') errors.push('extra daycare');
    if (n.type === 'legendary' && frac < cfg.legendaryUnlock) errors.push('early legendary');
    for (const p of n.pars){
      const pt = map.nodes.get(p).type;
      if (SPECIAL.has(pt) && SPECIAL.has(n.type)) errors.push('special chain');
      if (pt === 'wild' && n.type === 'wild') errors.push('wild chain');
    }
    const kids = n.id === 'D' ? [] : [...n.kids].map(k => map.nodes.get(k)).filter(k => k.r < cfg.floors && k.r !== fx.daycare);
    if (new Set(kids.map(k => k.type)).size !== kids.length) errors.push('dup branch');
  }
  const st = pathStats(map).B;
  if (st.min < cfg.wildMin || st.max > cfg.wildMax) errors.push('wild per path');
  if (st.lMax > cfg.legendaryMaxPerPath) errors.push('legendaries');
  return errors;
}
function scoreMap(map){
  const reg = [...map.nodes.values()].filter(n => n.r >= 0 && n.r < map.cfg.floors);
  return new Set(reg.map(n => n.c)).size * 6 + reg.filter(n => n.kids.size > 1).length * 2 + reg.filter(n => n.r === 0).length * 3;
}
function buildValidMap(seed, attempt, cfg){
  const rng = createRng(deriveSeed(seed, attempt));
  const map = generateTopology(rng, cfg);
  if (!map) return null;
  const starts = [...map.nodes.values()].filter(n => n.r === 0).length;
  if (starts < cfg.minStarts || starts > cfg.maxStarts) return null;
  if (!placeWilds(map, rng) || !assignRooms(map, rng) || validateMap(map).length) return null;
  return map;
}
let genN = 0;
function generateMap(seed, cfg = GEN){
  const found = [];
  for (let attempt = 0; attempt < 600 && found.length < cfg.candidates; attempt++){ const m = buildValidMap(seed, attempt, cfg); if (m) found.push(m); }
  if (!found.length) return generateMap(seed + 1, cfg);
  const map = found.reduce((best, m) => scoreMap(m) > scoreMap(best) ? m : best);
  map.seed = seed; map.gen = ++genN;
  const rows = cfg.floors + 2;
  for (const n of map.nodes.values()){ n.x = (n.c + .5) / cfg.width * 100; n.y = 100 - (n.r + 1.5) / rows * 100; }
  return map;
}
const randomSeed = () => Math.floor(Math.random() * 1e9);

/* ================= run state ================= */
const R = {};
function newRun(){
  Object.assign(R, { mapNo: 1, lives: TUNE.lives, coins: TUNE.startCoins, party: Array(6).fill(null), bag: Array(TUNE.bagSize).fill(null),
    daycare: Array(TUNE.daycareSize).fill(null), at: 'S', trail: ['S'], gymsBeaten: 0, map: generateMap(randomSeed()) });
}
const partyMons = () => R.party.filter(Boolean);
const partyCount = () => partyMons().length;
const firstEmpty = arr => { for (const i of FILL) if (!arr[i]) return i; return -1; };
function padDaycare(){ while (R.daycare.length < TUNE.daycareSize) R.daycare.push(null); }
const daycareCount = () => R.daycare.filter(Boolean).length;
const daycareFull = () => daycareCount() >= TUNE.daycareSize;
function depositDaycare(mon){ const i = R.daycare.indexOf(null); if (i < 0) return false; R.daycare[i] = mon; return true; }
function partyLevel(){ const p = partyMons(); return p.reduce((s, m) => s + m.star, 0) / p.length; }
function partyMaxStar(){ return Math.max(1, ...partyMons().map(m => m.star)); }

/* ================= THE DYNAMIC SLOT ================= */
const CORNERS = (tr, br) => ({ tl:{ stat:'none', style:'ring' }, tr, bl:{ stat:'none', style:'ring' }, br });
const PRESET = {
  party:  { borderStyle:'type', shade:true, hideEmpty:false, stars:true, selectable:true, corners: CORNERS({ stat:'exp', style:'bar' }, { stat:'held', style:'ring' }) },
  offer:  { borderStyle:'type', shade:true, hideEmpty:true, stars:true, selectable:true, corners: CORNERS({ stat:'none', style:'bar' }, { stat:'held', style:'ring' }) },
  found:  { borderStyle:'type', shade:true, hideEmpty:true, stars:false, selectable:true, corners: CORNERS({ stat:'none', style:'bar' }, { stat:'none', style:'bar' }) },
  pick:   { borderStyle:'type', shade:true, hideEmpty:false, stars:true, selectable:false, corners: CORNERS({ stat:'none', style:'bar' }, { stat:'none', style:'ring' }) },
  tpick:  { borderStyle:'type', shade:true, hideEmpty:true, stars:true, selectable:false, corners: CORNERS({ stat:'none', style:'bar' }, { stat:'none', style:'ring' }) },
  tr:     { borderStyle:'type', shade:true, hideEmpty:false, stars:true, selectable:true, corners: CORNERS({ stat:'none', style:'bar' }, { stat:'none', style:'bar' }) },
  shop:   { borderStyle:'type', shade:true, hideEmpty:false, stars:false, selectable:true, corners: CORNERS({ stat:'none', style:'bar' }, { stat:'none', style:'bar' }) },
  bag:    { borderStyle:'type', shade:true, hideEmpty:false, stars:false, selectable:true, corners: CORNERS({ stat:'none', style:'bar' }, { stat:'none', style:'bar' }) },
  hud:    { borderStyle:'type', shade:true, hideEmpty:false, stars:false, selectable:true, corners: CORNERS({ stat:'exp', style:'bar' }, { stat:'held', style:'ring' }) },
  battle: { borderStyle:'battle', shade:true, hideEmpty:true, stars:true, selectable:false, corners: CORNERS({ stat:'hp', style:'bar' }, { stat:'held', style:'ring' }) },
  result: { borderStyle:'type', shade:true, hideEmpty:false, stars:true, selectable:false, corners: CORNERS({ stat:'exp', style:'bar' }, { stat:'held', style:'ring' }) },
};
function createSlot(onTap, onHeld){
  const el = document.createElement('div');
  el.className = 'slot'; el.dataset.state = 'empty';
  el.innerHTML = `
    <div class="slot__frame"><div class="slot__empty">+</div><div class="slot__sprite"><img alt=""></div></div>
    <div class="stars__mask"></div><div class="stars" aria-hidden="true">${STAR_SVG.repeat(3)}</div>
    ${['tl','tr','bl','br'].map(c => `
    <div class="g g--${c}" data-corner="${c}" data-stat="none" data-style="ring">
      <div class="g__mask"></div>
      <div class="g__ring"><svg viewBox="0 0 100 100" aria-hidden="true">
        <circle class="track" cx="50" cy="50" r="41.907"></circle><circle class="fill" cx="50" cy="50" r="41.907"></circle></svg>
        <span class="g__lvl"></span></div>
      <div class="g__held"><img alt=""></div>
      <div class="g__bar"><div class="track"><div class="fill"></div></div></div>
    </div>`).join('')}`;
  if (onTap){
    el.addEventListener('click', onTap);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); onTap(e); } });
  }
  if (onHeld) el.querySelectorAll('.g__held').forEach(h => h.addEventListener('click', e => { e.stopPropagation(); onHeld(e); }));
  el.addEventListener('animationend', e => { el.classList.remove('pop', 'land', 'seat', 'reject', 'lvlup'); });
  return el;
}
/* view = { key, sprite, type, stars, hp, exp, held, heldKey, name } or null */
function renderSlot(el, flags, v, o = {}){
  if (el._hold && !o.force){ el._hold.args = [flags, v, o]; return; }   // a hopper is still on its way: keep the old look
  el._last = [flags, v, o];
  const filled = !!v, img = el.querySelector('.slot__sprite img');
  el.dataset.key = filled ? v.key : '';
  if (filled && img.dataset.src !== v.sprite){ img.src = v.sprite; img.dataset.src = v.sprite; }
  el.dataset.state = filled ? 'filled' : 'empty';
  el.style.setProperty('--type', filled ? `var(--t-${v.type})` : 'var(--slot-empty)');
  const hp = filled && v.hp != null ? v.hp : 1;
  el.style.setProperty('--hp', hp);
  el.dataset.hp = hp > .5 ? 'ok' : hp >= .2 ? 'warn' : 'low';
  el.style.setProperty('--exp', filled && v.exp != null ? v.exp : 0);
  el.dataset.border = flags.borderStyle;
  el.toggleAttribute('data-f-shade', !!flags.shade);
  el.toggleAttribute('data-f-hide', !!flags.hideEmpty);
  el.toggleAttribute('data-f-stars', !!flags.stars && filled && !!v.stars);
  el.toggleAttribute('data-f-select', !!flags.selectable);
  el.dataset.stars = filled && v.stars ? v.stars : 0;
  const held = filled && v.held ? v.held : null;
  if (held){ el.dataset.heldKey = v.heldKey; el.querySelectorAll('.g__held img').forEach(i => { if (i.dataset.src !== held){ i.src = held; i.dataset.src = held; } }); }
  else delete el.dataset.heldKey;
  el.querySelectorAll('.g').forEach(g => {
    const cfg = flags.corners[g.dataset.corner];
    let stat = cfg.stat;
    if (stat === 'held' && !held) stat = 'none';
    if (stat === 'hp' && (!filled || v.hp == null)) stat = 'none';
    if (stat === 'exp' && (!filled || v.exp == null)) stat = 'none';
    g.dataset.stat = stat;
    g.dataset.style = cfg.stat === 'held' ? 'ring' : cfg.style;
  });
  el.toggleAttribute('data-selected', !!o.selected);
  el.toggleAttribute('data-held-selected', !!o.heldSelected);
  el.toggleAttribute('data-target', !!o.target);
  el.toggleAttribute('data-dim', !!o.dim);
  if (o.turn) el.dataset.turn = o.turn; else delete el.dataset.turn;
  const tappable = !!o.interactive && (filled || o.target);
  el.tabIndex = tappable ? 0 : -1;
  el.setAttribute('role', tappable ? 'button' : 'img');
  el.setAttribute('aria-label', filled ? (o.label || `${v.name}${v.stars ? `, ${v.stars} star` : ''}`) : 'Empty slot');
}
function monView(m, ov){
  if (!m) return null;
  const s = ov || m, f = FORM[s.form];
  return { key: m.uid, sprite: SPRITES[f.spr], type: f.type, stars: s.star, exp: s.exp, name: f.name,
    held: m.item ? ITEM[m.item.id].spr : null, heldKey: m.item?.uid };
}
const itemView = it => it ? { key: it.uid, sprite: ITEM[it.id].spr, type: 'held', name: ITEM[it.id].name } : null;

/* ---------- hop / slide: content that changes slot flies from its old box to its new one ---------- */
function spriteBox(el){ const r = el.getBoundingClientRect(), s = r.width * .7075; return { x: r.left + (r.width - s) / 2, y: r.top + (r.height - s) / 2, size: s }; }
function discBox(el){
  let d = el.querySelector('.g[data-stat="held"] .g__held'), g = null, was;
  // a slot about to receive an item still shows its old look, with the disc hidden (and measuring as a zero box at the
  // screen's corner), so turn the disc on just long enough to measure where it will be
  if (!d){ g = el.querySelector('.g--br'); was = g.dataset.stat; g.dataset.stat = 'held'; d = g.querySelector('.g__held'); }
  const r = d.getBoundingClientRect(), s = r.width * .72;
  if (g) g.dataset.stat = was;
  return { x: r.left + (r.width - s) / 2, y: r.top + (r.height - s) / 2, size: s };
}
/* ---------- a destination slot keeps showing what it showed before until everything flying into it has landed ---------- */
const slotLabel = el => el.parentElement?.querySelector('.slotname');
function holdSlot(el, prevArgs, prevLabel){
  if (el._hold){ el._hold.n++; return; }
  el._hold = { n: 1, args: el._last, label: slotLabel(el)?.textContent ?? '' };
  if (prevArgs){ const [f, v, o] = prevArgs; renderSlot(el, f, v, { ...o, force: true }); }
  const lab = slotLabel(el); if (lab) lab.textContent = prevLabel ?? '';
}
// an empty slot receiving a Pokémon or item: the dashed empty frame fades out while the filled frame fades in
function crossfadeEmpty(el){
  if (REDUCED || el.hasAttribute('data-f-hide')) return;   // hidden slots never show an empty frame, so nothing to fade out
  const d = CROSSFADE_MS;
  const ghost = document.createElement('div'); ghost.className = 'slot__ghost'; ghost.innerHTML = '<span>+</span>';
  el.append(ghost);
  ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: d, easing: 'ease-out', fill: 'forwards' }).onfinish = () => ghost.remove();
  const frame = el.querySelector('.slot__frame');
  frame.animate([{ borderColor: 'transparent', boxShadow: 'none' }, {}], { duration: d, easing: 'ease-in' });
  const plus = el.querySelector('.slot__empty'); plus.style.transition = 'none'; void plus.offsetWidth; plus.style.transition = '';
}
// the reverse, when a Pokémon or item leaves: its filled frame fades out while the dashed empty frame fades in.
// The sprite itself is already gone (the hopper carries it), so only the frame crossfades.
function crossfadeLeave(el, color){
  if (REDUCED) return;
  const d = CROSSFADE_MS, hidden = el.hasAttribute('data-f-hide');
  const ghost = document.createElement('div'); ghost.className = 'slot__ghost slot__ghost--filled'; ghost.style.borderColor = color;
  el.append(ghost);
  ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: d, easing: 'ease-out', fill: 'forwards' }).onfinish = () => ghost.remove();
  if (hidden){
    // a hidden slot just fades its filled frame away; the dashed empty frame must never show
    const frame = el.querySelector('.slot__frame');
    frame.style.transition = 'none'; void frame.offsetWidth; frame.style.transition = '';
    return;
  }
  el.querySelector('.slot__frame').animate([{ borderColor: 'transparent' }, {}], { duration: d, easing: 'ease-in' });
  el.querySelector('.slot__empty').animate([{ opacity: 0 }, { opacity: 1 }], { duration: d, easing: 'ease-in' });
}
const CROSSFADE_MS = Math.round(380 / 1.2 / 1.5);    // 20% faster, then another 50% faster (about 0.21s)
function releaseSlot(el){
  const h = el._hold; if (!h || --h.n > 0) return;
  el._hold = null;
  const wasEmpty = el.dataset.state === 'empty';
  if (h.args){ const [f, v, o] = h.args; renderSlot(el, f, v, { ...o, force: false }); }
  if (wasEmpty && el.dataset.state === 'filled') crossfadeEmpty(el);
  const lab = slotLabel(el); if (lab) lab.textContent = h.label;
}
function fly(src, start, toEl, { disc = false, slide = false, order = 0, dur, keep = false } = {}){
  const end = disc ? discBox(toEl) : spriteBox(toEl);
  const img = document.createElement('img');
  img.className = 'hopper'; img.src = src; img.alt = '';
  Object.assign(img.style, { left: start.x + 'px', top: start.y + 'px', width: start.size + 'px', height: start.size + 'px' });
  document.body.append(img);
  // centre to centre: the hopper scales about its centre, so aiming corners would miss whenever the size changes
  const dx = (end.x + end.size / 2) - (start.x + start.size / 2), dy = (end.y + end.size / 2) - (start.y + start.size / 2), dist = Math.hypot(dx, dy), sc = end.size / start.size;
  const frames = [];
  if (slide){
    frames.push({ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx}px, ${dy}px) scale(${sc})` });
  } else {
    const h = Math.min(110, 34 + dist * .22), air = keep ? .72 : 1;   // a kept hop spends its last 28% landing
    for (let i = 0; i <= 16; i++){
      const t = i / 16, sy = t < .15 ? 1 + .12 * (t / .15) : t > .85 ? 1 - .1 * ((t - .85) / .15) : 1.12 - .22 * ((t - .15) / .7), s = 1 + (sc - 1) * t;
      frames.push({ transform: `translate(${dx * t}px, ${dy * t - 4 * h * t * (1 - t)}px) scale(${s * (2 - sy)}, ${s * sy})`, offset: t * air });
    }
    // the landing is part of the same animation (squash, rebound, still), since whatever waits for the hop to finish
    // may run late on a busy phone and would otherwise leave the sprite frozen mid-squash
    if (keep){
      const at = `translate(${dx}px, ${dy}px)`;
      frames.push({ transform: `${at} scale(${sc * 1.12}, ${sc * .84})`, offset: .8 }, { transform: `${at} scale(${sc * .96}, ${sc * 1.05})`, offset: .9 },
        { transform: `${at} scale(${sc})`, offset: 1 });
    }
  }
  const duration = dur ?? (slide ? Math.min(420, 240 + dist * .25) : Math.min(620, 360 + dist * .35) / 1.1 * TUNE.hopSlow);
  return new Promise(res => {
    img.animate(frames, { duration, delay: order * 60, easing: slide ? 'cubic-bezier(.3,.7,.3,1)' : 'linear', fill: 'both' }).onfinish = () => {
      if (keep) return res(img);
      img.remove(); releaseSlot(toEl); toEl.classList.remove(disc ? 'arriving-held' : 'arriving');
      if (!disc){ toEl.classList.remove('land', 'seat'); void toEl.offsetWidth; toEl.classList.add(slide ? 'seat' : 'land'); }
      res();
    };
  });
}

/* ================= areas: every grid of slots on a screen ================= */
const UI = { sel: null, notice: null };
const AREAS = {};
const AREA_CFG = {
  'S.offer': { holds:'mon', kind:'offer', preset:'offer', get: () => ST.offer, onTap: i => { if (performance.now() - ST.pressed > 700) starterTap(i); } },
  'W.offer': { holds:'mon', kind:'offer', preset:'offer', get: () => W.offer.map((m, i) => W.arrived[i] ? m : null), onTap: i => { if (performance.now() - W.pressed > 700) wildTap(i); } },
  // the party and bag in the bottom corners, on the map and at the Move Tutor (where, with a move picked, tapping a
  // Pokémon teaches it; otherwise both work as on the map)
  'M.party': { holds:'mon', kind:'party', preset:'hud', get: () => R.party, equip: true,
    onTap: i => screen === 'scr-tutor' && TU.teaching ? tutorTeachTo(i) : screen === 'scr-wild' ? wildPartyTap(i)
      : (screen === 'scr-item' && MT.picked != null && (MT.picked = null), false) },
  // at the Poké Mart, with an item picked, tapping an empty bag slot buys it into that slot
  'M.bag':   { holds:'item', kind:'bag', preset:'hud', get: () => R.bag, equip: true,
    onTap: i => screen === 'scr-item' && MT.picked != null ? martPlace(i) : (screen === 'scr-tutor' && TU.teaching && (TU.teaching = null, refresh()), false) },
  'D.party': { holds:'mon', kind:'party', preset:'party', get: () => R.party },
  'D.day':   { holds:'mon', kind:'daycare', preset:'party', get: () => R.daycare },
};
function mountAreas(){
  document.querySelectorAll('[data-area]').forEach(grid => {
    const name = grid.dataset.area;
    const A = AREAS[name] ||= { name, ...AREA_CFG[name], grids: [], els: [], n: -1 };
    A.grids.push({ grid, part: grid.dataset.part || 'all' });
  });
}
function ensureArea(A){
  const n = A.get().length;
  if (A.n === n) return;
  A.n = n; A.els = [];
  for (const g of A.grids){
    g.grid.innerHTML = '';
    const idx = g.part === 'front' ? [0, 1, 2] : g.part === 'back' ? [3, 4, 5] : [...Array(n).keys()];
    for (const i of idx){
      const wrap = document.createElement('div'); wrap.className = 'slotwrap';
      const el = createSlot(() => tapSlot(A.name, i), () => tapHeld(A.name, i));
      const name = document.createElement('div'); name.className = 'slotname';
      wrap.append(el, name); g.grid.append(wrap);
      A.els[i] = { el, name };
    }
  }
}
const isVisible = A => !!A.grids[0].grid.offsetParent;
function renderArea(name){
  const A = AREAS[name]; ensureArea(A);
  const arr = A.get(), sel = UI.sel;
  A.els.forEach(({ el, name: label }, i) => {
    const c = arr[i] || null;
    const isSel = !!sel && sel.area === name && sel.i === i;
    const v = A.holds === 'mon' ? monView(c) : itemView(c);
    renderSlot(el, PRESET[A.preset], v, {
      selected: isSel && !sel.held, heldSelected: isSel && sel.held,
      target: !!sel && !isSel && !A.locked && dropOK(sel, A, c),
      dim: A.dim ? A.dim(c, i) : false, interactive: !A.locked,
    });
    const text = c ? (A.holds === 'mon' ? nm(c) : ITEM[c.id].name) : '';
    if (el._hold) el._hold.label = text; else label.textContent = text;
  });
}
function dropOK(sel, A, here){
  const S = AREAS[sel.area], selKind = sel.held ? 'item' : S.holds;
  if (A.onTap) return false;
  if (selKind === 'item') return A.holds === 'mon' ? !!here && !!A.equip && S.kind !== 'found' : A.kind === 'bag';
  if (A.holds === 'item') return !!(S.equip && A.equip);
  return !monRule(S, A, S.get()[sel.i], here);
}
function monRule(S, A, mon, here){
  if (A.kind === 'offer') return 'Offered Pokémon stay put until you pick one.';
  if (S.kind === 'offer' && A.kind !== 'party') return 'New Pokémon join your party.';
  if (S.kind === 'party' && A.kind === 'daycare' && !here && partyCount() === 1) return 'Your party needs at least one Pokémon.';
  return null;
}
const canSelect = A => !A.locked && !(A.kind === 'offer' && W.done && A.name === 'W.offer');
function snapshot(){
  const m = new Map(); m.look = new Map();
  for (const A of Object.values(AREAS)){
    if (!isVisible(A)) continue;
    for (const s of A.els){
      if (!s) continue; const el = s.el;
      m.look.set(el, { args: el._hold ? el._hold.args : el._last, label: el._hold ? el._hold.label : (slotLabel(el)?.textContent ?? '') });
      const v = (el._hold ? el._hold.args : el._last)?.[1];      // what the slot really holds, even mid-flight
      if (v?.key) m.set(v.key, { el, box: spriteBox(el), src: v.sprite, disc: false });
      if (v?.heldKey) m.set(v.heldKey, { el, box: discBox(el), src: v.held, disc: true, owner: v.key });
    }
  }
  return m;
}
function flip(before){
  if (REDUCED) return Promise.resolve();
  const after = snapshot(); let n = 0; const all = [];
  const movedAway = (key, el) => key && before.get(key)?.el === el && after.get(key)?.el !== el;
  const held = new Set();
  for (const [k, a] of after){
    const b = before.get(k);
    if (!b || (b.el === a.el && b.disc === a.disc)) continue;
    // an item that stays on the same Pokémon travels with it: it leaves with the old slot and shows up when the Pokémon lands
    if (a.disc && b.disc && a.owner === b.owner) continue;
    if (!held.has(a.el) && before.look.has(a.el)){
      // show the destination as it was, minus anything that has just left it, until the hopper lands
      const look = before.look.get(a.el), [f, v, o] = look.args || [PRESET.party, null, {}];
      let hv = v && movedAway(v.key, a.el) ? null : v;
      if (hv && movedAway(hv.heldKey, a.el)) hv = { ...hv, held: null, heldKey: null };
      holdSlot(a.el, [f, hv, o], hv ? look.label : '');
      held.add(a.el);
    } else if (held.has(a.el)) a.el._hold.n++;
    else holdSlot(a.el, null, null);
    // the slot it left snaps empty instead of fading, so no ghost is left behind while the hopper flies
    if (!a.disc && b.el !== a.el && b.el.dataset.key !== k){
      b.el.classList.add('depart'); void b.el.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => b.el.classList.remove('depart')));
      const was = before.look.get(b.el)?.args, nowEmpty = b.el.dataset.state === 'empty';
      if (was?.[1] && nowEmpty) crossfadeLeave(b.el, was[0].borderStyle === 'type' ? `var(--t-${was[1].type})` : 'var(--slot-neutral)');
    }
    a.el.classList.add(a.disc ? 'arriving-held' : 'arriving');
    all.push(fly(a.src, b.box, a.el, { disc: a.disc, slide: k.startsWith('i'), order: n++ }));
  }
  return Promise.all(all);
}
function shake(name, i){ const el = AREAS[name].els[i]?.el; if (!el) return; el.classList.remove('reject'); void el.offsetWidth; el.classList.add('reject'); }
function rejectOrSwitch(name, i, why){
  const A = AREAS[name], here = A.get()[i];
  if (here && canSelect(A) && !A.onTap){ UI.sel = { area: name, i }; UI.notice = null; return refresh(); }
  shake(name, i); UI.notice = { text: why }; refresh();
}
function tapHeld(name, i){
  const A = AREAS[name], mon = A.get()[i];
  if (A.onTap && A.onTap(i) !== false) return;           // the area handled it (an onTap that returns false lets it through)
  if (!A.equip || !mon?.item) return tapSlot(name, i);
  if (!UI.sel){ UI.sel = { area: name, i, held: true }; UI.notice = null; return refresh(); }
  if (UI.sel.area === name && UI.sel.i === i && UI.sel.held){ UI.sel = null; return refresh(); }
  tapSlot(name, i);
}
function tapSlot(name, i){
  const A = AREAS[name];
  if (A.onTap && A.onTap(i) !== false) return;      // an onTap that returns false falls through to normal tapping
  if (A.locked || wiping) return;
  const arr = A.get(), here = arr[i] || null, sel = UI.sel;
  if (!sel){
    UI.notice = null;
    if (here && canSelect(A)) UI.sel = { area: name, i };
    return refresh();
  }
  if (sel.area === name && sel.i === i && !sel.held){ UI.sel = null; UI.notice = null; return refresh(); }
  const S = AREAS[sel.area], src = S.get();
  const before = snapshot();
  let msg = null;
  if (sel.held || S.holds === 'item'){
    const item = sel.held ? src[sel.i].item : src[sel.i];
    const iname = ITEM[item.id].name;
    if (A.holds === 'mon'){
      if (!here) return rejectOrSwitch(name, i, 'Tap a Pokémon to give it this item.');
      if (!A.equip) return rejectOrSwitch(name, i, 'Give items to your Pokémon on the map.');
      if (S.kind === 'found') return rejectOrSwitch(name, i, 'Put it in your bag first.');
      if (sel.held){
        const owner = src[sel.i];
        if (owner === here){ UI.sel = null; return refresh(); }
        [owner.item, here.item] = [here.item, owner.item];
        msg = `${nm(here)} now holds the ${iname}.` + (owner.item ? ` ${nm(owner)} took the ${ITEM[owner.item.id].name}.` : '');
      } else {
        const old = here.item; here.item = item; src[sel.i] = old;
        msg = `${nm(here)} now holds the ${iname}.` + (old ? ` The ${ITEM[old.id].name} went back in the bag.` : '');
      }
    } else if (sel.held){
      const owner = src[sel.i], old = here;
      arr[i] = owner.item; owner.item = old;
      msg = old ? `${nm(owner)} swapped the ${iname} for the ${ITEM[old.id].name}.` : `The ${iname} went back in the bag.`;
    } else if (A.kind === 'found'){
      return rejectOrSwitch(name, i, 'Bag items stay in the bag.');
    } else if (S.kind === 'found'){
      const old = here; arr[i] = item; src[sel.i] = null;
      msg = old ? `The ${iname} is in your bag. You left the ${ITEM[old.id].name} behind.` : `The ${iname} is in your bag.`;
    } else {
      [src[sel.i], arr[i]] = [here, item];
    }
  } else {
    const mon = src[sel.i];
    if (A.holds === 'item'){
      if (!(S.equip && A.equip)) return rejectOrSwitch(name, i, 'Manage held items on the map.');
      const old = here, had = mon.item;
      arr[i] = had; mon.item = old;
      msg = old ? `${nm(mon)} now holds the ${ITEM[old.id].name}.` + (had ? ` The ${ITEM[had.id].name} went back in the bag.` : '')
        : had ? `The ${ITEM[had.id].name} went back in the bag.` : null;
    } else {
      const why = monRule(S, A, mon, here);
      if (why) return rejectOrSwitch(name, i, why);
      if (S.kind === 'offer'){
        msg = `${nm(mon)} joined your party.`;
        if (here){
          const e = firstEmpty(arr);
          if (e >= 0){ arr[e] = here; msg += ` ${nm(here)} moved over to make room.`; }
          else if (depositDaycare(here)) msg += ` ${nm(here)} went to the daycare.`;
          else { shake(name, i); UI.notice = { text: 'Your party and daycare are both full. Skip this one, or make room at a daycare first.' }; return refresh(); }
        }
        arr[i] = mon; src[sel.i] = null;
        W.done = true;
        setTimeout(() => { W.offer = W.offer.map(() => null); refresh(); }, 380);
      } else {
        [src[sel.i], arr[i]] = [here, mon];
        if (S.kind === 'daycare' || A.kind === 'daycare') padDaycare();
      }
    }
  }
  UI.sel = null; UI.notice = msg ? { ok: true, text: msg } : null;
  // on the screens with your party and bag in the corners, the message pops up over where it happened instead
  const hudToast = msg && (A.name === 'M.party' || A.name === 'M.bag') && !$('#mapteam').hidden;
  if (hudToast) UI.notice = null;
  refresh(); flip(before);
  if (hudToast) toast(A.name === 'M.bag' ? 'bag' : 'party', msg);
}

/* ================= detail card ================= */
// a move's level as three stars, filled up to its star rating
const moveStars = n => `<span class="mv__stars" aria-label="${n} star move">${'<i class="on">★</i>'.repeat(n)}${'<i>★</i>'.repeat(3 - n)}</span>`;
// chance: this Pokémon's percent chance to pick it; without one, the move's weight is shown instead
function moveRow(k, sig, chance){
  const m = MOVES[k];
  const hits = m.hits ? ` ×${m.hits[0]}${m.hits[1] !== m.hits[0] ? '–' + m.hits[1] : ''}` : '';
  const head = m.kind === 'sup'
    ? `Support, ${TARGET_NAME[m.target] || ''}${m.heal ? `, heals ${pct(m.heal)}` : ''}`
    : `${SHAPE_NAME[m.shape]}, ${m.power == null ? 'special' : m.power === 0 ? 'no damage' : `${m.power}% of Attack`}${hits}`;
  const odds = chance == null ? (m.weight ? `${ODDS_NAME} ${m.weight}` : '') : `${chance}%`;
  const title = chance == null ? `${ODDS_NAME}: the higher it is, the more often a Pokémon picks this move` : `Picked ${chance}% of the time`;
  return `<div class="mv${sig ? ' mv--sig' : ''}">
    <span class="mv__name">${sig ? '<i class="mv__sig">Signature</i>' : ''}${m.name} <span class="pill" style="--c:${typeColor(m.type)}">${cap(m.type)}</span>
    <small>${head}</small>${m.fx ? `<small class="mv__fx">${m.fx}</small>` : ''}${moveStars(m.star)}</span>
    <span class="mv__pp${chance === 0 ? ' out' : ''}${chance == null ? '' : ' mv__pp--pct'}" title="${title}">${odds}</span></div>`;
}
function moveChip(k, sig){
  const m = MOVES[k];
  return `<span class="chip${sig ? ' chip--sig' : ''}" style="--c:${typeColor(m.type)}" title="${m.name}: ${m.kind === 'sup' ? 'support' : SHAPE_NAME[m.shape]}">${sig ? '<b>★</b>' : ''}${m.name}</span>`;
}
function rosterHTML(mons){
  if (!mons.length) return '';
  return `<div class="roster">${mons.map(m => {
    const k = known(m), empty = TUNE.taughtMax - m.taught.length;
    return `<div class="roster__row"><img src="${SPRITES[FORM[m.form].spr]}" alt=""><span class="roster__name">${nm(m)}</span>
      <span class="roster__moves">${k.map((x, i) => moveChip(x, i === 0)).join('')}${'<span class="chip chip--empty">Empty slot</span>'.repeat(Math.max(0, empty))}</span></div>`;
  }).join('')}</div>`;
}
const formationMons = () => R.party.filter(Boolean);   // front row left to right, then back row
// opts.slots: list every taught slot (empty ones too); opts.pickable: those slots glow and can be tapped (data-slot)
function taughtSlotsHTML(m, pickable){
  const odds = monOdds(m);
  return Array.from({ length: TUNE.taughtMax }, (_, j) => {
    const k = m.taught[j];
    const row = k ? moveRow(k, false, odds[k]) : `<div class="mv mv--empty"><span class="mv__name">Empty move slot<small>Taught at a Move Tutor</small></span><span class="mv__pp"></span></div>`;
    return pickable ? `<button class="mvslot" data-slot="${j}" aria-label="Slot ${j + 1}: ${k ? 'replace ' + MOVES[k].name : 'empty'}">${row}</button>` : row;
  }).join('');
}
function monDetail(m, opts = {}){
  const f = FORM[m.form];
  const exp = m.star >= 3 ? 'max' : pct(m.exp);
  return `<div class="dt__head"><span class="dt__name">${f.name}</span><span class="pill" style="--c:${typeColor(f.type)}">${f.type}</span>
      <span class="dt__stars">${'★'.repeat(m.star)}<i>${'★'.repeat(3 - m.star)}</i></span></div>
    <div class="dt__stats"><div><b>${f.hp}</b><span>HP</span></div><div><b>${f.atk}</b><span>Attack</span></div><div><b>${f.spd}</b><span>Speed</span></div><div><b>${exp}</b><span>EXP</span></div></div>
    <div class="mvlist${opts.pickable ? ' mvlist--pick' : ''}">${opts.slots ? moveRow(f.sig, true, monOdds(m)[f.sig]) + taughtSlotsHTML(m, opts.pickable) : known(m).map((k, i) => moveRow(k, i === 0, monOdds(m)[k])).join('')}</div>
    ${m.item ? `<div class="dt__item"><img src="${ITEM[m.item.id].spr}" alt=""><div><b>${ITEM[m.item.id].name}</b><br>${ITEM[m.item.id].fx}</div></div>` : ''}
    <div class="dt__ability"><b>${f.ability.name}.</b> ${f.ability.fx} <i>Abilities aren't active in battle yet.</i></div>`;
}
/* ---------- info slot layout: stats left of the big slot, ability right, moves underneath ----------
   no card around it; every metric sits in its own small container */
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;   // types are shown capitalised
const INFO_AREA = {};
// fade a group of elements out, then hide and clear them; showing them again cancels the fade
const FADE_OUT_MS = 200, fading = new Map();
function fadeOutGroup(key, els, clear = true){
  const shown = els.filter(e => !e.hidden);
  if (!shown.length || fading.has(key)) return;
  const done = () => { fading.delete(key); for (const e of els){ e.getAnimations().forEach(x => x.cancel()); if (clear){ e.innerHTML = ''; delete e.dataset.sig; } e.hidden = true; } };
  if (REDUCED) return done();
  const token = {}; fading.set(key, token);
  for (const e of shown){ e.classList.remove('reveal'); e.animate([{ opacity: getComputedStyle(e).opacity }, { opacity: 0 }], { duration: FADE_OUT_MS, easing: 'ease-out', fill: 'forwards' }); }
  setTimeout(() => { if (fading.get(key) === token) done(); }, FADE_OUT_MS);
}
function cancelFade(key, els){
  if (!fading.has(key)) return;
  fading.delete(key);
  for (const e of els) e.getAnimations().forEach(x => x.cancel());
}
// show/hide one element with the same fades as the info boxes
function setShown(key, el, show){
  if (!show) return fadeOutGroup(key, [el], false);
  const appearing = el.hidden || fading.has(key);
  cancelFade(key, [el]); el.hidden = false;
  if (appearing && !REDUCED) el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'ease' });
}
function renderInfo(key, m, opts = {}){
  const L = $(`#${key}-left`), Rt = $(`#${key}-right`), M = $(`#${key}-detail`);
  if (!m) return fadeOutGroup(key, [L, Rt, M]);           // stats fade out rather than vanish
  cancelFade(key, [L, Rt, M]);
  const f = FORM[m.form], exp = m.star >= 3 ? 'max' : pct(m.exp);
  // name + EXP on top, then HP / Attack / Speed as three tall boxes
  // stats on the right: the name + type, then one slim row per stat with its bar (against STAT_MAX)
  const stat = (label, key, v) => `<div class="ibox srow" data-stat="${key}" title="${label} ${v} of ${STAT_MAX[key]} (the natural maximum)">
    <span class="srow__k">${label}</span><b class="srow__v">${v}</b><div class="sbar"><div class="sbar__fill" style="width:${Math.max(3, Math.round(v / STAT_MAX[key] * 100))}%"></div></div></div>`;
  // only rebuild when the Pokémon itself changed; a plain refresh (teaching a move, picking one) must not
  // replay the stat bars' fill animation
  if (Rt.dataset.sig !== m.form){
    Rt.dataset.sig = m.form;
    Rt.innerHTML = `<div class="ibox ibox--name"><b>${f.name}</b><span class="pill" style="--c:${typeColor(f.type)}">${cap(f.type)}</span></div>
      ${stat('HP', 'hp', f.hp)}${stat('Attack', 'atk', f.atk)}${stat('Speed', 'spd', f.spd)}`;
  }
  // the ability on the left, stretched to the stats column's height
  if (L.dataset.sig !== m.form){
    L.dataset.sig = m.form;
    L.innerHTML = `<div class="ibox ibox--ability" title="Abilities aren't active in battle yet."><span>Ability</span><b>${f.ability.name}</b><p>${f.ability.fx}</p></div>`;
  }
  // a held item gets its own row above the moves, so the ability box can match the stats' height exactly
  M.innerHTML = `${m.item ? `<div class="ibox ibox--item ibox--held"><img src="${ITEM[m.item.id].spr}" alt=""><div><span>Holding</span><b>${ITEM[m.item.id].name}</b><p>${ITEM[m.item.id].fx}</p></div></div>` : ''}<div class="mvlist${opts.pickable ? ' mvlist--pick' : ''}">${moveRow(f.sig, true)}${taughtSlotsHTML(m, opts.pickable)}</div>`;
  for (const e of [L, Rt, M]) e.hidden = false;
  fitName(L);
}
// shrink the name until it fits beside its type pill (never below 9px)
function fitName(L){
  const b = L?.parentElement?.querySelector('.ibox--name b'); if (!b || !b.clientWidth) return;
  const range = document.createRange(); range.selectNodeContents(b);
  const textW = () => range.getBoundingClientRect().width;              // the text's real (fractional) width
  let px = innerWidth <= 520 ? 13 : 15;
  b.style.fontSize = px + 'px';
  while (textW() > b.getBoundingClientRect().width - .5 && px > 9){ px -= .5; b.style.fontSize = px + 'px'; }
}
addEventListener('resize', () => ['wild', 'tutor'].forEach(k => fitName($(`#${k}-left`))));
function revealInfo(key){
  for (const id of [`#${key}-left`, `#${key}-right`, `#${key}-detail`]){ const d = $(id); d.classList.remove('reveal'); void d.offsetWidth; d.classList.add('reveal'); }
}
const itemDetail = it => `<div class="dt__item" style="margin:0;padding:0;border:0"><img src="${ITEM[it.id].spr}" alt=""><div><b>${ITEM[it.id].name}</b><br>${ITEM[it.id].fx}</div></div>`;
function renderDetail(elId, empty){
  const box = $('#' + elId), sel = UI.sel;
  if (!sel){ box.innerHTML = `<p class="detail__empty">${empty}</p>`; return; }
  const c = AREAS[sel.area].get()[sel.i];
  if (!c){ box.innerHTML = `<p class="detail__empty">${empty}</p>`; return; }
  box.innerHTML = sel.held ? itemDetail(c.item) : AREAS[sel.area].holds === 'mon' ? monDetail(c) : itemDetail(c);
}
function renderNotice(elId){ const n = $('#' + elId); n.textContent = UI.notice?.text || ''; n.classList.toggle('ok', !!UI.notice?.ok); }
// a little speech bubble over your party (bottom left) or bag (bottom right) saying what just landed there or left:
// "Pikachu joined your party.", "Bought the Leftovers." It sits above everything else and fades after a few seconds;
// a new one in the same corner replaces it.
const TOASTS = {};
function toast(where, text){
  const hud = $(where === 'bag' ? '#mapbag' : '#mapteam');
  TOASTS[where]?.remove();
  if (!text || hud.hidden) return;
  const r = hud.getBoundingClientRect(), t = document.createElement('div');
  t.className = 'toast toast--' + where; t.setAttribute('role', 'status'); t.textContent = text;
  t.style.bottom = (innerHeight - r.top + 12) + 'px';
  if (where === 'bag') t.style.right = (innerWidth - r.right) + 'px'; else t.style.left = r.left + 'px';
  document.body.append(t); TOASTS[where] = t;
  const out = () => { if (TOASTS[where] === t) delete TOASTS[where]; t.remove(); };
  if (REDUCED){ setTimeout(out, 3200); return; }
  t.animate([{ opacity: 0, transform: 'translateY(8px) scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
  t.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 400, delay: 3000, easing: 'ease-in', fill: 'forwards' }).finished.then(out, () => {});
}
// a price's small label ("too expensive", "no room") grows, turns red and shakes, then settles back
function nope(el){ if (!el) return; el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); }

/* ================= screens + the wipe ================= */
let screen = null, wiping = false;
const RENDER = {};
// corner coin readout: vertically centred on the screen's header row
function alignCoins(){
  const scr = screen && document.getElementById(screen), c = scr?.querySelector('.screen__coins'), head = scr?.querySelector('.scr__head');
  if (!c || !head) return;
  const top = head.getBoundingClientRect().top - scr.getBoundingClientRect().top + scr.scrollTop;
  c.style.top = `${Math.round(top + (head.offsetHeight - c.offsetHeight) / 2)}px`;
}
addEventListener("resize", alignCoins);
document.fonts?.ready.then(alignCoins);
function refresh(){ RENDER[screen]?.(); updateMapHud(); alignCoins(); syncSelScan(); }
function show(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('is-active', s.id === id));
  screen = id; $('#' + id).scrollTop = 0; hideTip();
}
const markHTML = (icon, label, type) => `<div class="wipe__icon">${icon}</div><div class="wipe__label">${label}</div>`;
const NODE_COLOR = t => `var(--n-${t})`;
function wipeAnim(el, from, to, dur){
  return el.animate([{ transform: `translateX(${from}) skewX(-14deg)` }, { transform: `translateX(${to}) skewX(-14deg)` }],
    { duration: dur, easing: 'cubic-bezier(.75,0,.25,1)', fill: 'forwards' }).finished;
}
async function wipeTo(id, prepare, opt = {}){
  if (wiping) return;
  wiping = true; updateMapHud(); hideTip();
  if (DEX.open) closeDex(true);
  RD_BTN.classList.add('is-wiping'); rdSync();
  const W_ = $('#wipe'), band = W_.querySelector('.wipe__band'), panel = W_.querySelector('.wipe__panel');
  W_.style.setProperty('--wipe-c', opt.color || 'var(--glow-selected)');
  $('#wipe-mark').innerHTML = opt.mark || '';
  W_.classList.add('on');
  if (REDUCED){
    W_.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: 'forwards' });
    band.style.transform = panel.style.transform = 'translateX(0) skewX(-14deg)';
    await sleep(170);
  } else {
    await Promise.all([wipeAnim(band, '-150%', '0%', 380), wipeAnim(panel, '-160%', '0%', 440)]);
  }
  UI.sel = null; UI.notice = null;
  prepare?.();
  show(id); refresh();
  await sleep(opt.hold ?? 260);
  if (REDUCED){
    await W_.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }).finished;
    W_.getAnimations().forEach(a => a.cancel());
  } else {
    await Promise.all([wipeAnim(panel, '0%', '160%', 440), sleep(90).then(() => wipeAnim(band, '0%', '150%', 400))]);
  }
  band.getAnimations().forEach(a => a.cancel()); panel.getAnimations().forEach(a => a.cancel());
  band.style.transform = panel.style.transform = '';
  W_.classList.remove('on');
  wiping = false; updateMapHud();
  RD_BTN.classList.remove('is-wiping'); rdSync();
  opt.after?.();
}
const toMap = () => wipeTo('scr-map', null, { color: 'var(--glow-selected)', mark: markHTML('🗺️', `Map ${R.mapNo}`), after: scrollMapToCurrent });

/* ---------- your team and bag on the map ----------
   the party sits bottom-left and the bag 2 by 2 bottom-right. Tap a slot to see it in a popup in the middle
   of the screen; tap another slot to move, swap or hand over an item. Tap it again, the popup, or the map to close. */
let mapIntro = false;     // the starter-to-map intro is playing: input stays locked but the party and bag show
function updateMapHud(){
  const on = (!wiping || mapIntro) && ['scr-map', 'scr-tutor', 'scr-wild', 'scr-item'].includes(screen) && !!R.party;
  $('#mapteam').hidden = $('#mapbag').hidden = !on;
  if (on){ renderArea('M.party'); renderArea('M.bag'); hudMarkParty(); }
  const sel = on ? UI.sel : null, c = sel && AREAS[sel.area]?.get()[sel.i], pop = $('#mappop');
  if (c){
    const it = sel.held ? c.item : AREAS[sel.area].holds === 'item' ? c : null;
    const sig = it ? it.uid : `${c.uid}|${c.form}|${c.star}|${c.exp}|${c.item?.uid}`;
    if (pop.dataset.sig !== sig){
      pop.dataset.sig = sig;
      const card = $('#mappop-card');
      card.innerHTML = it ? mapItemHTML(it) : mapMonHTML(c);
      dexReveal(card.firstElementChild);                  // the entry builds up piece by piece, as in the Pokédex
    }
  } else delete pop.dataset.sig;
  pop.hidden = true;                                       // the RotomDex scans what you tap instead (syncSelScan)
}
// the popup's entries use the Pokédex layout, filled in with this Pokémon's own stars, EXP, held item and moves
function mapMonHTML(m){
  const f = FORM[m.form], maxed = m.star >= 3;
  const stat = (label, k, v) => `<div class="dstat" data-stat="${k}"><span>${label}</span><b>${v}</b><i class="dstat__bar"><i style="width:${Math.max(3, Math.round(v / STAT_MAX[k] * 100))}%"></i></i></div>`;
  const exp = `<div class="dstat" data-stat="exp"><span>EXP</span><b>${maxed ? 'Max' : pct(m.exp)}</b><i class="dstat__bar"><i style="width:${maxed ? 100 : Math.max(3, Math.round(m.exp * 100))}%"></i></i></div>`;
  const it = m.item && ITEM[m.item.id];
  return `<div class="dexmon" data-form="${f.id}" style="--t:${typeColor(f.type)}">
    <div class="dexmon__side"><div class="dexmon__pic"><img src="${formSprite(f)}" alt=""></div>${typePill(f.type)}</div>
    <div class="dexmon__main">
      <div class="dexmon__head"><b>${f.name}</b>${starRow(m.star)}</div>
      ${f.primary ? `<div class="dexmon__roles">${cap(f.primary)}${f.secondary ? ` · ${cap(f.secondary)}` : ''}</div>` : ''}
      <div class="dstats dstats--4">${stat('HP', 'hp', f.hp)}${stat('Attack', 'atk', f.atk)}${stat('Speed', 'spd', f.spd)}${exp}</div>
    </div>
    <div class="dexmon__more">
      <div class="dexkv"><span>Ability</span><p><b>${f.ability.name}.</b> ${f.ability.fx}</p></div>
      ${it ? `<div class="dexkv"><span>Holding</span><div class="dexheld"><img src="${spriteURL(it.spr)}" alt=""><p><b>${it.name}.</b> ${it.fx}</p></div></div>` : ''}
      <div class="dexkv"><span>Move limit</span><p>${limitHTML(f.star)}</p></div>
      <div class="dexkv"><span>Signature move</span><div class="mvlist">${moveRow(f.sig, true, monOdds(m)[f.sig])}</div></div>
      <div class="dexkv"><span>Moves</span><div class="mvlist">${taughtSlotsHTML(m, false)}</div></div>
    </div>
  </div>`;
}
// sell: at the Poké Mart, a Sell button under the price (on the item you have selected)
function mapItemHTML(it, sell){
  const d = ITEM[it.id], price = TUNE.itemPrice[it.id];
  return `<div class="dexmon dexmon--item" style="--t:var(--t-held)">
    <div class="dexmon__side"><div class="dexmon__pic"><img src="${spriteURL(d.spr)}" alt=""></div></div>
    <div class="dexmon__main">
      <div class="dexmon__head"><b>${d.name}</b><span class="pill" style="--c:var(--t-held)">Held item</span></div>
      ${price != null ? `<div class="dexmon__roles">${price} coins at Poké Marts, which buy it back for ${sellPrice(it.id)}</div>` : ''}
      ${sell ? `<button class="btn btn--go dexsell" type="button" data-sell>Sell for ${sellPrice(it.id)} coins</button>` : ''}
    </div>
    <div class="dexmon__more"><div class="dexkv"><span>Effect</span><p>${d.fx}</p></div>
      <div class="dexkv"><span>How to use</span><p>Tap it, then tap a Pokémon to have it hold it. Held items work automatically in battle.</p></div></div>
  </div>`;
}
function closeMapPop(){ if (UI.sel && screen === 'scr-map'){ UI.sel = null; UI.notice = null; refresh(); } }
$('#mappop').addEventListener('click', closeMapPop);
// a tap anywhere on the map closes it, except on a node you can travel to. Pointer events (not click) so a tap
// on a locked node counts too, since disabled buttons get no clicks; a drag that scrolls the map does not close it.
let mapDown = null;
$('#scr-map').addEventListener('pointerdown', e => { mapDown = { x: e.clientX, y: e.clientY }; });
$('#scr-map').addEventListener('pointerup', e => {
  const d = mapDown; mapDown = null;
  if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10 && !e.target.closest('.node:not(:disabled)')) closeMapPop();
});

/* ================= Pokédex ================= */
// every Pokémon, move and held item in the game, in three sections switched by tabs that stay pinned at the top.
// Opened from the map's top bar or the title screen; Close goes back to wherever it was opened from.
// while Rotom is scanning one Pokémon (see openScan) the popup shows only that Pokémon: tab 'scan', no tab bar
const dexTabList = () => ['mons', 'moves', 'items'];
const DEX = { tab: 'mons', html: {}, token: 0, open: false, busy: false, anim: 0, scan: null };
// sprites are long data URIs and the Pokédex shows hundreds of them, so each one becomes a short blob URL, once
const blobURLs = new Map();
function spriteURL(uri){
  let u = blobURLs.get(uri); if (u) return u;
  try {
    const [head, b64] = uri.split(','), bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    u = URL.createObjectURL(new Blob([bytes], { type: head.slice(5).split(';')[0] }));
  } catch { u = uri; }
  blobURLs.set(uri, u); return u;
}
const formSprite = f => spriteURL(SPRITES[f.spr]);
const typePill = t => `<span class="pill" style="--c:${typeColor(t)}">${cap(t)}</span>`;
const starRow = n => `<span class="dt__stars" aria-label="${n} star">${'★'.repeat(n)}<i>${'★'.repeat(3 - n)}</i></span>`;
// what a form can actually be taught: tutor moves at or below its star level, not counting its signature move
const tutorMoves = f => (LEARN[f.id] || []).filter(k => k !== f.sig && MOVES[k].star <= f.star)
  .sort((a, b) => MOVES[a].star - MOVES[b].star || MOVES[a].name.localeCompare(MOVES[b].name));
const poolText = p => p.rule.all ? 'Every Pokémon' : p.rule.type ? `${cap(p.rule.type)}-type Pokémon` : `Pokémon with ${p.rule.min}+ ${{ hp:'HP', atk:'Attack', spd:'Speed' }[p.rule.stat]} at ★1`;
const dexMini = f => `<button class="dexmini" type="button" data-form="${f.id}" title="${f.name}" aria-label="${f.name}: show its Pokédex entry"><img src="${formSprite(f)}" alt="" loading="lazy"></button>`;

// tutor moves in an entry are buttons: tapping one opens its details under the chips, with a link to the Moves section
const dexChipHTML = k => `<button class="chip dexchip" type="button" data-move="${k}" aria-expanded="false" style="--c:${typeColor(MOVES[k].type)}">${MOVES[k].name}</button>`;
const dexGoHTML = k => `<button class="dexgo" type="button" data-move="${k}">See who else learns it in Moves<span aria-hidden="true"> ›</span></button>`;
async function dexPeek(chip){
  const kv = chip.closest('.dexkv'), panel = kv.querySelector('.dexpeek'), k = chip.dataset.move;
  const closing = panel.dataset.move === k, from = panel.hidden ? 0 : panel.offsetHeight, token = (panel._tok = (panel._tok || 0) + 1);
  kv.querySelectorAll('.dexchip').forEach(c => c.setAttribute('aria-expanded', !closing && c === chip));
  if (closing){
    delete panel.dataset.move;
    await dexResize(panel, from, 0);
    if (panel._tok === token){ panel.hidden = true; panel.innerHTML = ''; }
    return;
  }
  panel.dataset.move = k; panel.hidden = false;
  panel.innerHTML = `<div class="mvlist">${moveRow(k, false)}</div>${dexGoHTML(k)}`;
  if (!REDUCED) panel.firstElementChild.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: DEX_EASE });
  await dexResize(panel, from, panel.offsetHeight);
}
// over to the Moves section, scrolled to that move, which flashes so it's easy to spot
async function dexJumpMove(k){
  await dexShow('moves', true);
  const row = document.querySelector(`.dexmove[data-move="${k}"]`), scr = $('#dex-scroll'); if (!row) return;
  const y = scr.scrollTop + row.getBoundingClientRect().top - scr.getBoundingClientRect().top - 16;
  scr.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
  row.classList.remove('dexflash'); void row.offsetWidth; row.classList.add('dexflash');
}
function dexMonHTML(f){
  const stat = (label, k, v) => `<div class="dstat" data-stat="${k}"><span>${label}</span><b>${v}</b><i class="dstat__bar"><i style="width:${Math.max(3, Math.round(v / STAT_MAX[k] * 100))}%"></i></i></div>`;
  const tutor = tutorMoves(f), sigs = [...new Set(speciesForms(f).map(x => x.sig))];
  return `<div class="dexmon" data-form="${f.id}" style="--t:${typeColor(f.type)}">
    <div class="dexmon__side"><div class="dexmon__pic"><img src="${formSprite(f)}" alt="" loading="lazy"></div>${typePill(f.type)}</div>
    <div class="dexmon__main">
      <div class="dexmon__head"><b>${f.name}</b></div>
      ${f.primary ? `<div class="dexmon__roles">${cap(f.primary)}${f.secondary ? ` · ${cap(f.secondary)}` : ''}</div>` : ''}
      <div class="dstats">${stat('HP', 'hp', f.hp)}${stat('Attack', 'atk', f.atk)}${stat('Speed', 'spd', f.spd)}</div>
    </div>
    <div class="dexmon__more">
      <div class="dexkv"><span>Ability</span><p><b>${f.ability.name}.</b> ${f.ability.fx}</p></div>
      <div class="dexkv"><span>Move limit</span><p>${limitHTML(f.star)}</p></div>
      <div class="dexkv"><span>${sigs.length > 1 ? 'Signature moves' : 'Signature move'}</span><div>${sigs.length > 1 ? '<p class="dexnote">Its signature move changes as it levels up:</p>' : ''}<div class="mvlist">${sigs.map(k => moveRow(k, true)).join('')}</div>${dexGoHTML(f.sig)}</div></div>
      <div class="dexkv"><span>Tutor moves</span><div>${tutor.length
        ? `<div class="chips">${tutor.map(dexChipHTML).join('')}</div><div class="dexpeek" hidden></div>`
        : '<i class="dexnone">None</i>'}</div></div>
    </div>
  </div>`;
}
// the evolution path, one column per evolution stage: each species appears once, however many levels it spans
// (Raticate is ★2 and ★3 but shows once), and stands for its most-leveled form (its full stats). A stage with
// many branches (Eevee's eight) is a grid. Tapping a Pokémon opens its info under the path (see dexOpen).
const EVO_ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// every form of the same species on the same line (one per level it spans), lowest level first
const speciesForms = f => FORMS.filter(x => x.line === f.line && x.name === f.name).sort((a, b) => a.star - b.star);
function dexStages(fs){
  const seen = new Set(), cols = [];
  for (const n of [1, 2, 3]){
    const col = [];
    for (const f of fs.filter(x => x.star === n)) if (!seen.has(f.name)){ seen.add(f.name); col.push(speciesForms(f).at(-1)); }
    if (col.length) cols.push(col);
  }
  return cols;
}
function dexEvoHTML(fs){
  const cols = dexStages(fs);
  return `<div class="dexevo">
    <div class="dexevo__bar"><span class="dexevo__label">${fs[0].name} line</span><span class="dexevo__hint">Tap a Pokémon for its info</span></div>
    <div class="dexevo__path" role="group" aria-label="Evolution path">${cols.map((c, i) => (i ? `<span class="dexevo__arrow">${EVO_ARROW}</span>` : '')
      + `<div class="dexevo__col${c.length > 3 ? ' dexevo__col--grid' : ''}">${c.map(f => `<button class="dexevo__mon" type="button" data-form="${f.id}" aria-pressed="false" aria-expanded="false" style="--t:${typeColor(f.type)}">
          <span class="dexevo__pic"><img src="${formSprite(f)}" alt="" loading="lazy"></span><span class="dexevo__name">${f.name}</span></button>`).join('')}</div>`).join('')}</div>
  </div>`;
}
/* ---------- a Pokémon's info opens inside its line's card ----------
   Opening: the tapped sprite hops, the card grows to fit, then the entry builds up piece by piece (the sprite
   pops in, the text rises, the stat bars fill). Another stage of the same line slides the old entry out toward
   the side the new one is on and the new one in; tapping the open one again folds the card shut. */
const DEX_EASE = 'cubic-bezier(.2,.8,.2,1)';
function dexReveal(entry){
  if (REDUCED) return;
  const parts = [entry.querySelector('.dexmon__head'), entry.querySelector('.dexmon__roles'), entry.querySelector('.dstats'), ...entry.querySelectorAll('.dexkv')].filter(Boolean);
  entry.querySelector('.dexmon__pic')?.animate([{ opacity: 0, transform: 'scale(.55) rotate(-8deg)' }, { opacity: 1, transform: 'scale(1.08)', offset: .7 }, { opacity: 1, transform: 'none' }],
    { duration: 420, easing: 'ease-out', fill: 'backwards' });
  parts.forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
    { duration: 340, delay: 70 + i * 55, easing: DEX_EASE, fill: 'backwards' }));
  entry.querySelectorAll('.dstat__bar i').forEach((bar, i) => bar.animate([{ width: '0%' }, { width: bar.style.width }],
    { duration: 650, delay: 200 + i * 80, easing: DEX_EASE, fill: 'backwards' }));
}
function dexHop(btn){
  if (REDUCED || !btn) return;
  btn.querySelector('.dexevo__pic img').animate([{ transform: 'none' }, { transform: 'translateY(-22%) scale(1.06)', offset: .4 }, { transform: 'translateY(3%) scale(1.04, .94)', offset: .75 }, { transform: 'none' }],
    { duration: 420, easing: 'ease-out' });
}
// grow or shrink the info box from its current height to whatever its new content needs
function dexResize(box, from, to){
  if (REDUCED || from === to) return Promise.resolve();
  box.getAnimations().filter(x => x.id === 'size').forEach(x => x.cancel());
  return box.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: 380, easing: DEX_EASE, id: 'size' }).finished.catch(() => {});
}
async function dexOpen(card, id, toggle = true){
  const box = card.querySelector('.dexdetail'), cur = card.dataset.only, token = (card._tok = (card._tok || 0) + 1);
  if (toggle && cur === id) id = '';
  card.dataset.only = id;
  card.querySelectorAll('.dexevo__mon').forEach(b => { b.setAttribute('aria-pressed', b.dataset.form === id); b.setAttribute('aria-expanded', b.dataset.form === id); });
  if (id && id !== cur) dexHop(card.querySelector(`.dexevo__mon[data-form="${id}"]`));
  const old = box.querySelector('.dexmon'), from = box.hidden ? 0 : box.offsetHeight;
  // closing: the entry fades as the card folds shut
  if (!id){
    if (old && !REDUCED) old.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
    await dexResize(box, from, 0);
    if (card._tok === token){ box.hidden = true; box.innerHTML = ''; }
    return;
  }
  // switching stages: the old entry slides out toward the side the new one comes from
  const order = [...card.querySelectorAll('.dexevo__mon')].map(b => b.dataset.form), dir = Math.sign(order.indexOf(id) - order.indexOf(cur)) || 1;
  if (old && !REDUCED){
    await old.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * 36}px)` }], { duration: 160, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
    if (card._tok !== token) return;
  }
  box.hidden = false;
  box.innerHTML = dexMonHTML(FORM[id]);
  const entry = box.querySelector('.dexmon'), to = box.offsetHeight;
  if (old && !REDUCED) entry.animate([{ opacity: 0, transform: `translateX(${dir * 36}px)` }, { opacity: 1, transform: 'none' }], { duration: 300, easing: DEX_EASE });
  else dexReveal(entry);
  await dexResize(box, from, to);
}
// from a sprite in the Moves section: open that Pokémon's line with its info showing, and scroll it into view
async function dexJump(id){
  const f = FORM[id]; if (!f) return;
  await dexShow('mons', true);
  const card = document.querySelector(`.dexline[data-line="${f.line}"]`), scr = $('#dex-scroll'); if (!card) return;
  dexOpen(card, speciesForms(f).at(-1).id, false);       // the species' button stands for all its levels
  const y = scr.scrollTop + card.getBoundingClientRect().top - scr.getBoundingClientRect().top - 12;
  scr.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
}
$('#dex-body').addEventListener('click', e => {
  const evo = e.target.closest('.dexevo__mon'); if (evo) return dexOpen(evo.closest('.dexline'), evo.dataset.form);
  const mini = e.target.closest('.dexmini'); if (mini) return dexJump(mini.dataset.form);
  const chip = e.target.closest('.dexchip'); if (chip) return dexPeek(chip);
  const go = e.target.closest('.dexgo'); if (go) return dexJumpMove(go.dataset.move);
});
const DEX_BUILD = {
  mons: () => `<p class="dexintro">${SPECIES_N} Pokémon in ${LINE_IDS.length} evolution lines. Tap any Pokémon to see its stats, signature move, ability and the moves it can be taught.</p>`
    + LINE_IDS.map(l => {
      const fs = FORMS.filter(f => f.line === l).sort((a, b) => a.star - b.star);
      return `<article class="dexline" data-line="${l}" data-only="">${dexEvoHTML(fs)}<div class="dexdetail" hidden></div></article>`;
    }).join(''),
  moves: () => {
    const ids = Object.keys(MOVES), types = [...new Set(ids.map(k => MOVES[k].type))].sort((a, b) => (a === 'none') - (b === 'none') || a.localeCompare(b));
    return `<p class="dexintro">${ids.length} moves. Every Pokémon knows 2: its signature move, which it learns by leveling and changes as it evolves, and one move taught at a Move Tutor. Signature moves are never taught; a few are unique to one Pokémon.</p>`
      + types.map(t => {
        const ks = ids.filter(k => MOVES[k].type === t).sort((a, b) => MOVES[a].star - MOVES[b].star || MOVES[a].name.localeCompare(MOVES[b].name));
        return `<h2 class="dextype" style="--c:${typeColor(t)}">${t === 'none' ? 'Other' : cap(t)} <small>${ks.length} ${ks.length === 1 ? 'move' : 'moves'}</small></h2>`
          + ks.map(k => {
            const m = MOVES[k], sigOf = FORMS.filter((f, i, all) => f.sig === k && all.findIndex(x => x.sig === k && x.name === f.name) === i), pools = POOLS.filter(p => p.moves.includes(k));
            const learn = (sigOf.length ? `<div class="dexlearn"><span>${m.cat === 'unique' ? 'Unique signature of' : 'Signature of'}</span><div class="dexminis">${sigOf.map(dexMini).join('')}</div></div>` : '')
              + (pools.length ? `<div class="dexlearn"><span>Taught to</span><div class="dexpools">${pools.map(poolText).join('<br>')} <small>(★${m.star} and up)</small></div></div>` : '')
              ;
            return `<article class="dexmove" data-move="${k}">${moveRow(k, false)}${learn}</article>`;
          }).join('');
      }).join('');
  },
  // everything about the one Pokémon Rotom is scanning: its stars and EXP, stats, ability, held item and moves
  // a scanned Pokémon, or an item (anything without a form)
  scan: () => { const s = DEX.scan?.mon; if (!s) return '';
    return `<article class="dexline dexscan" data-only="${s.form || ''}"><div class="dexdetail">${s.form ? mapMonHTML(s) : mapItemHTML(s, DEX.scan.sel && martSellable()?.it === s)}</div></article>`; },
  items: () => `<p class="dexintro">${ITEMS_DATA.length} held items. Buy them at Poké Marts; each Pokémon can hold one, and it works automatically in battle.</p>`
    + ITEMS_DATA.map(i => `<article class="dexitem"><div class="dexitem__pic"><img src="${spriteURL(i.spr)}" alt=""></div>
      <div class="dexitem__main"><div class="dexitem__head"><b>${i.name}</b>${TUNE.itemPrice[i.id] != null ? `<span class="dexprice">${TUNE.itemPrice[i.id]} coins</span>` : ''}</div><p>${i.fx}</p></div></article>`).join(''),
};
function dexTabs(tab){
  const list = dexTabList(), bar = $('.dextabs');
  bar.style.setProperty('--n', list.length); bar.style.setProperty('--i', Math.max(0, list.indexOf(tab)));
  document.querySelectorAll('.dextab').forEach(b => { const on = b.dataset.tab === tab; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
}
// switching sections: the old list slides out toward the side you came from, the page jumps back to the top,
// and the new list slides in from the other side
async function dexShow(tab, animate){
  const body = $('#dex-body'), scr = $('#dex-scroll'), html = tab === 'scan' ? DEX_BUILD.scan() : (DEX.html[tab] ||= DEX_BUILD[tab]());
  const list = dexTabList(), dir = Math.sign(list.indexOf(tab) - list.indexOf(DEX.tab)) || 1;
  if (animate && tab === DEX.tab) return scr.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
  DEX.tab = tab; dexTabs(tab);
  const token = ++DEX.token;
  body.getAnimations().forEach(a => a.cancel());
  if (animate && !REDUCED){
    await body.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * 32}px)` }], { duration: 150, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
    if (token !== DEX.token) return;
  }
  body.innerHTML = html; scr.scrollTop = 0;
  body.getAnimations().forEach(a => a.cancel());
  if (animate && !REDUCED) body.animate([{ opacity: 0, transform: `translateX(${dir * 32}px)` }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
}
$('#dex-body').addEventListener('click', e => { if (e.target.closest('[data-sell]') && !DEX.busy) sell(); });
document.querySelectorAll('img.dexicon').forEach(i => i.src = ROTOMDEX_SPR);
/* ---------- the RotomDex: a sprite in the top-right corner that opens the Pokédex as a popup ----------
   Opening: Rotom crouches, hops, dips down and back up to its perch on the popup's top edge (overlapping it, a little
   by the top-left corner, 25% bigger than in the corner), landing with a little squash. As it lands the popup's panel opens out from Rotom to fill the screen, then the
   header, tabs and list fade up into it one after another. Closing runs the other way: the contents fade, the panel
   folds back into Rotom, and Rotom hops home to the corner.
   Every hop is aimed centre to centre (the sprite changes size on the way), so Rotom ends exactly where the perched
   sprite is and the hand-over can't jump. Tapping the perched Rotom closes the popup. */
const DEXPOP = $('#dexpop'), DEXCARD = $('#scr-dex'), DEXSCROLL = $('#dex-scroll'), DEXSHELL = $('.dexpop__shell'), DEXVEIL = DEXPOP.firstElementChild, RD_BTN = $('#rotomdex');
const rdHome = () => RD_BTN.querySelector('img'), rdSpot = () => $('#dex-rotom');
// RotomDex timings in ms (the numbers in comments are from before the last 25% speed-up of the panel)
const RD_MS = { swoop: 600, land: 240, fade: 75 /* 100 */, fold: 160 /* 209 */,
  open: 205 /* 273 */, item: 160 /* 206 */, stagger: 24 /* 32 */,
  home: 600,                                        // both corner flights take 0.6s
  hop: [240, 400],                                  // a hop between perches: quicker the shorter it is
  glide: [480, 620] };                              // scan to scan: the swoop from one Pokémon to the next
// resolves a little before a flight ends: when the panel, opening out from Rotom's perch, would finish just as Rotom lands
const rdArrive = flight => {
  const left = (flight.arrive ?? flight.effect.getComputedTiming().duration) - (flight.currentTime || 0), lead = Math.min(rdPanel('open') * .9, left * .35);
  return new Promise(r => setTimeout(r, Math.max(0, left - lead)));
};
// the panel's own timings (opening out, folding, its contents fading): the scan popup runs them 80% faster
const RD_SCAN_SPEED = 1.8;
const rdPanel = k => RD_MS[k] / (DEX.scan ? RD_SCAN_SPEED : 1);
const rdDist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
// how much a flight of this length bends and dips into the screen: short hops barely curve, long ones fully
const rdReach = (a, b) => Math.min(1, Math.max(.15, rdDist(a, b) / 520));
const rdHopMs = (a, b) => Math.round(RD_MS.hop[0] + (RD_MS.hop[1] - RD_MS.hop[0]) * Math.min(1, rdDist(a, b) / 520));
// the dip a hop makes: a shallow curve below both ends, flatter the shorter the hop
const rdDip = (a, b, depth) => {
  const low = Math.max(a.y, b.y) + Math.min(innerHeight * .2, 170) * depth * rdReach(a, b);
  return [{ x: a.x + (b.x - a.x) * .3, y: low }, { x: a.x + (b.x - a.x) * .75, y: low }];
};
// THE Rotom: one sprite, always the one on screen. It rests over an anchor (the corner button's icon, or the perch on
// the RotomDex's edge; both are invisible, they only take the taps and say where Rotom sits) and flies between them,
// so nothing is ever swapped for a copy mid-move. Its wrapper (RD.el) is placed and flown with transforms alone, from
// RD.base: the translate and scale that put it on the anchor it set off from. The image inside floats gently at rest.
const RD_SIZE = 65;                                  // the sprite's own size (the perch's); the corner shows it smaller
const RD = { el: null, img: null, base: { tx: 0, ty: 0, s: 1 }, flying: false };
function rdSprite(){
  if (!RD.el){
    RD.el = document.createElement('div'); RD.el.className = 'rd-sprite'; RD.el.setAttribute('aria-hidden', 'true');
    RD.el.innerHTML = `<img alt="" src="${ROTOMDEX_SPR}">`; RD.img = RD.el.firstElementChild;
    document.body.appendChild(RD.el);
  }
  return RD.el;
}
const rdRestFor = r => ({ tx: r.left + r.width / 2 - RD_SIZE / 2, ty: r.top + r.height / 2 - RD_SIZE / 2, s: r.width / RD_SIZE });
// sit Rotom on an anchor (no animation; it is already there, or nothing is moving)
function rdPlace(anchor){
  const el = rdSprite();
  el.getAnimations().forEach(x => x.cancel());
  RD.flying = false; RD.base = rdRestFor(anchor.getBoundingClientRect());
  el.style.transform = `translate(${RD.base.tx}px, ${RD.base.ty}px) scale(${RD.base.s})`;
}
// where Rotom rests right now: on the RotomDex's edge while it is open, otherwise the corner; hidden in screen wipes
function rdSync(){
  rdSprite().classList.toggle('is-away', RD_BTN.classList.contains('is-wiping') && !DEX.open);
  if (!RD.flying && !DEX.busy) rdPlace(DEX.open ? rdSpot() : rdHome());
}
// a flight starts from where Rotom is now (box: its anchor there)
const rdFlyer = box => { const el = rdSprite(); rdPlace({ getBoundingClientRect: () => box }); RD.flying = true; return el; };
// a flight is over: Rotom rests on the anchor it landed on
const rdFlyerDone = anchor => rdPlace(anchor);
// the Rotom it took off from goes once the flyer is on screen (the frame its flight starts), so there is never a
// frame with no Rotom at all
const rdTakeOff = (flight, hide) => flight.ready.then(hide, () => {});
// One flight, start to finish, as one animation: the path (frames over dur ms) and then the landing squash at its end
// point (dx, dy, scale sc), so nothing has to be handed over between them as Rotom touches down. flight.arrive is when
// it reaches its spot; flight.finished, when it has settled.
function rdFly(fl, frames, dur, dx, dy, sc){
  const land = RD_MS.land, total = dur + land, f = dur / total;
  const kf = frames.map(fr => ({ ...fr, offset: fr.offset * f }));
  kf[kf.length - 1].easing = 'cubic-bezier(.37,0,.63,1)';
  kf.push({ transform: rdT(dx, dy, 0, sc * 1.06, sc * .93), opacity: 1, offset: (dur + land * .35) / total, easing: 'cubic-bezier(.37,0,.63,1)' },
    { transform: rdT(dx, dy, 0, sc * .985, sc * 1.02), opacity: 1, offset: (dur + land * .7) / total, easing: 'cubic-bezier(.37,0,.63,1)' },
    { transform: rdT(dx, dy, 0, sc), opacity: 1, offset: 1 });
  const flight = fl.animate(kf, { duration: total, fill: 'forwards' });
  flight.arrive = dur;
  return flight;
}
// how solid Rotom looks at depth d (0 on the glass): further in, it fades into the dark behind it. Only transform and
// opacity are animated in flight, which phones run on the GPU, so the flight stays smooth
const rdFx = d => +(1 - .7 * d).toFixed(3);
// Rotom floats gently while it waits (corner and perch); it holds still at rest while it flies, so every
// hand-over between the flyer and the real sprite measures and lands on its resting spot
const rdStill = on => document.body.classList.toggle('rd-flying', on);
// where the float has Rotom right now (sprite el), so a flight can set off from there rather than snap to rest first
const rdPose = el => { const cs = getComputedStyle(el), t = cs.translate === 'none' ? [] : cs.translate.split(' ').map(parseFloat);
  return { y: t[1] || 0, rot: parseFloat(cs.rotate) || 0 }; };
const rdMid = r => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
const easeInOut = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
// a transform for Rotom in flight, x and y (px) and the scales relative to where it set off (RD.base)
const rdT = (x, y, rot, sx, sy = sx) => { const B = RD.base;
  return `translate(${x + B.tx}px, ${y + B.ty}px) rotate(${rot}deg) scale(${sx * B.s}, ${sy * B.s})`; };
// a crouch and a small hop straight up, then one curve (through control points c1 and c2) into place at b, all centre
// to centre. To feel alive rather than glide on rails, Rotom:
// - leans back into the crouch, away from where it is heading, then banks into the curve and stretches at speed
// - dives away into the screen early in the flight (smaller, dimmer, hazier) and swoops back out to land,
//   deeper the longer the flight
// - flutters as it flies, a small weave across its path that dies down as it slows
// - carries a little past its spot and drifts back into it
// - flies each trip slightly differently (depth, flutter and lean vary a little)
// A short hop has a smaller spring, less curve, depth and flutter.
// With fly set it skips the crouch and spring and sets off at once, easing by fly.ease (k -> progress u), and dives
// into the screen only fly.depth (0 to 1) as far as usual.
function rdSwoop(a, b, c1, c2, sc, pose = { y: 0, rot: 0 }, fly = null){
  const reach = rdReach(a, b), vary = () => .85 + Math.random() * .3;
  const far = .5 * Math.max(.55, reach) * vary() * (fly?.depth ?? 1);  // how deep it dives, as a share of its size
  const up = fly ? { x: a.x, y: a.y + pose.y } : { x: a.x, y: a.y - 22 * (.45 + .55 * reach) };
  const ease = fly ? fly.ease : easeInOut;
  const pt = u => { const v = 1 - u; return { x: v*v*v*up.x + 3*v*v*u*c1.x + 3*v*u*u*c2.x + u*u*u*b.x, y: v*v*v*up.y + 3*v*v*u*c1.y + 3*v*u*u*c2.y + u*u*u*b.y }; };
  const len = rdDist(a, b) || 1, nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len;      // across the path
  const ax = (b.x - c2.x), ay = (b.y - c2.y), al = Math.hypot(ax, ay) || 1;          // the way it comes in to land
  const weave = (2 + 4 * reach) * vary(), phase = Math.random() * Math.PI * 2, over = 7 * reach * vary();
  const lean = -Math.sign(b.x - a.x || 1) * 7 * vary();
  const hop = fly ? 0 : .18, n = 36, lit = rdFx(0), frames = [{ transform: rdT(0, pose.y, pose.rot, 1), opacity: lit, offset: 0 }];
  if (!fly) frames.push({ transform: rdT(0, 2, lean, 1.12, .86), opacity: lit, offset: .06 },     // crouch, leaning back
    { transform: rdT(0, up.y - a.y, -lean * .4, .95, 1.07), opacity: lit, offset: hop });         // and spring up
  let prev = pt(0);
  for (let i = 1; i <= n; i++){
    const k = i / n, u = ease(k), p = pt(u), arc = Math.sin(Math.PI * k);
    const z = Math.sin(Math.PI * k ** .75) ** 1.2;                                  // depth: deepest a little before halfway
    const w = weave * Math.sin(4 * Math.PI * k + phase) * arc;                     // the flutter across its path
    const o = k > .72 ? over * Math.sin(Math.PI * (k - .72) / .28) : 0;              // past the spot and back
    const x = p.x + nx * w + ax / al * o, y = p.y + ny * w + ay / al * o;
    const s = (1 + (sc - 1) * u) * (1 - far * z);
    const tilt = Math.max(-26, Math.min(26, (x - prev.x) * .5)) * arc;
    const st = 1 + .07 * arc;
    frames.push({ transform: rdT(x - a.x, y - a.y, +tilt.toFixed(2), s / st, s * st), opacity: rdFx(far * z),
      offset: i === n ? 1 : hop + (1 - hop) * k });
    prev = { x, y };
  }
  return frames;
}
// a squash-and-settle on landing, at the flyer's final place and size
// (eased in and out, so it grows out of the landing rather than kicking in)
const rdLand = (fl, dx, dy, sc) => fl.animate([{ transform: rdT(dx, dy, 0, sc) }, { transform: rdT(dx, dy, 0, sc * 1.06, sc * .93), offset: .35 },
  { transform: rdT(dx, dy, 0, sc * .985, sc * 1.02), offset: .7 }, { transform: rdT(dx, dy, 0, sc) }],
  { duration: RD_MS.land, easing: 'cubic-bezier(.37,0,.63,1)', fill: 'forwards' }).finished;
// the panel's outline: a Rotom-sized rounded square around its spot, or the whole card
function dexInset(open){
  const c = DEXSHELL.getBoundingClientRect(), r = rdMid(rdSpot().getBoundingClientRect()), s = 24;
  const x = Math.min(c.width - s, Math.max(s, r.x - c.left)), y = Math.min(c.height - s, Math.max(s, r.y - c.top));   // Rotom straddles an edge: start just inside it
  return open ? 'inset(0px 0px 0px 0px round 18px)' : `inset(${y - s}px ${c.width - x - s}px ${c.height - y - s}px ${x - s}px round ${s}px)`;
}
// what fades up into the opened panel, top to bottom: the title, Close, the tabs, then the list's first screenful
function dexParts(){
  const list = [...$('#dex-body').children].filter(el => el.getBoundingClientRect().top < innerHeight).slice(0, 8);
  return [$('.dexhead__top .title'), $('#dex-close'), $('.dextabs'), ...list, ...(DEX.scan ? [$('#dex-act')] : [])];
}
async function openDex(){
  if (wiping || DEX.open || DEX.busy) return;
  DEX.open = DEX.busy = true; hideTip();
  const tok = ++DEX.anim, live = () => tok === DEX.anim;   // a screen wipe can cut the animation short
  dexShow(DEX.tab, false);
  DEXPOP.hidden = false; DEXSCROLL.scrollTop = 0;
  dexLayout();
  if (REDUCED){ RD_BTN.classList.add('is-out'); DEX.busy = false; rdSync(); return $('#dex-close').focus({ preventScroll: true }); }
  const pose = rdPose(RD.img); rdStill(true);
  const spot = rdSpot(), from = rdHome().getBoundingClientRect(), to = spot.getBoundingClientRect();
  DEXSHELL.style.visibility = 'hidden'; DEXVEIL.style.opacity = 0; spot.style.visibility = 'hidden';
  const fl = rdFlyer(from), a = rdMid(from), b = rdMid(to), sc = to.width / from.width;
  // the path, centre to centre: a small hop straight up, then a shallow dip down and back up into place
  const frames = rdSwoop(a, b, ...rdDip(a, b, 1), sc, pose);
  const flight = rdFly(fl, frames, RD_MS.swoop, b.x - a.x, b.y - a.y, sc);
  rdTakeOff(flight, () => { if (live()) RD_BTN.classList.add('is-out'); });
  // the backdrop dims over the last part of the flight
  DEXVEIL.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RD_MS.swoop * .45, delay: RD_MS.swoop * .55, easing: 'ease-out', fill: 'forwards' });
  await rdArrive(flight);
  if (!live()) return;
  if (!await dexUnfold(fl, b.x - a.x, b.y - a.y, sc, live, flight)) return;
  DEXVEIL.getAnimations().forEach(x => x.cancel()); DEXVEIL.style.opacity = '';
  DEX.busy = false; rdStill(false);
  $('#dex-close').focus({ preventScroll: true });
}
// Rotom lands (the flyer at offset dx, dy and scale sc from where it set off); the panel opens out from it as it
// settles, then the contents fade up in turn. Resolves false if a screen wipe cut it short.
// With a flight given (rdFly, which ends in Rotom's landing squash), the panel starts opening a little before Rotom
// gets there (rdArrive).
async function dexUnfold(fl, dx, dy, sc, live, flight = null){
  const spot = rdSpot(), landed = flight ? flight.finished.catch(() => {}) : rdLand(fl, dx, dy, sc);
  DEXSHELL.style.visibility = '';
  const parts = dexParts();
  dexUnfade(); parts.forEach(el => el.getAnimations().forEach(x => x.cancel()));      // clear any fade-out left by a fold
  parts.forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
    { duration: rdPanel('item'), delay: rdPanel('open') * .7 + i * rdPanel('stagger'), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
  const opened = DEXSHELL.animate([{ clipPath: dexInset(false) }, { clipPath: dexInset(true) }], { duration: rdPanel('open'), easing: 'cubic-bezier(.25,.85,.3,1)' }).finished;
  await Promise.all([landed, opened, ...parts.map(el => el.getAnimations().at(-1)?.finished)]);
  if (!live()) return false;
  DEXSHELL.getAnimations().forEach(x => x.cancel());
  spot.style.visibility = ''; rdFlyerDone(spot);
  return true;
}
// the contents fade, then the panel folds back into Rotom (it stays perched)
// The fades are kept (DEX.folds) and cancelled by hand when the panel next opens or closes: Chrome can lose track of a
// finished fade in getAnimations() and leave its element invisible for good.
const dexUnfade = () => { (DEX.folds || []).forEach(x => x.cancel()); DEX.folds = []; };
async function dexFold(){
  const parts = dexParts();
  dexUnfade();
  DEX.folds = parts.map(el => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: rdPanel('fade'), easing: 'ease-in', fill: 'forwards' }));
  await Promise.all(DEX.folds.map(x => x.finished.catch(() => {})));
  const shut = DEXSHELL.animate([{ clipPath: dexInset(true) }, { clipPath: dexInset(false) }], { duration: rdPanel('fold'), easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' });
  DEX.folds.push(shut);
  await shut.finished.catch(() => {});
  return parts;
}
async function closeDex(now = false){
  if (!DEX.open || (DEX.busy && !now)) return;
  DEX.busy = true;
  if (!now && !REDUCED){
    const spot = rdSpot();
    DEXVEIL.animate([{ opacity: 1 }, { opacity: 0 }], { duration: RD_MS.fade + RD_MS.fold + RD_MS.home * .5, easing: 'ease-in', fill: 'forwards' });
    const parts = await dexFold();
    // then Rotom hops home, setting off from wherever its float has it
    const pose = rdPose(RD.img); rdStill(true);
    const from = spot.getBoundingClientRect(), fl = rdFlyer(from);
    const to = rdHome().getBoundingClientRect(), a = rdMid(from), b = rdMid(to), dx = b.x - a.x, dy = b.y - a.y, sc = to.width / from.width;
    // the same hop as on the way out, then a shallower dip down and back up to the corner
    const home = rdSwoop(a, b, ...rdDip(a, b, .9), sc, pose);              // the way home dips 10% less
    const flight = rdFly(fl, home, RD_MS.home, dx, dy, sc);
    rdTakeOff(flight, () => { spot.style.visibility = 'hidden'; DEXSHELL.style.visibility = 'hidden'; });
    // the real button fades back in under the flyer as it lands, so it is there when the flyer goes
    setTimeout(() => RD_BTN.classList.remove('is-out'), flight.arrive);
    await flight.finished.catch(() => {});
    rdFlyerDone(rdHome()); spot.style.visibility = '';
    parts.forEach(el => el.getAnimations().forEach(x => x.cancel()));
  }
  dexUnfade();
  DEX.anim++;
  RD.flying = false; rdSpot().style.visibility = '';
  DEXPOP.hidden = true;
  DEXSHELL.style.visibility = '';
  DEXSHELL.getAnimations().forEach(x => x.cancel()); DEXVEIL.getAnimations().forEach(x => x.cancel());
  RD_BTN.classList.remove('is-out');
  DEX.open = DEX.busy = false; rdStill(false);
  if (DEX.scan){ endScan(); DEX.tab = DEX.tabBefore || 'mons'; dexTabs(DEX.tab); dexLayout(); $('#dex-act').hidden = true; }
  rdSync();
}
/* ---------- scanning what you tap on the map and at the daycare ----------
   Tapping a Pokémon, an item in the bag or a held item there selects it (to move or swap it with the next tap); the
   RotomDex scans whatever is selected, flying over from one to the next, and puts itself away when nothing is.
   Closing the scan (tapping outside it, or Rotom) keeps the selection, so the next tap can still move it, even to a
   slot the scan was covering; it isn't scanned again until something else is selected. */
const SEL_SCAN_SCREENS = ['scr-map', 'scr-daycare', 'scr-tutor', 'scr-wild', 'scr-item'];
const SELSCAN = { running: false, again: false, dismissed: null };
const selKey = sel => sel ? `${sel.area}|${sel.i}|${!!sel.held}` : null;
function selScanWant(){
  const sel = UI.sel;
  if (selKey(sel) !== SELSCAN.dismissed) SELSCAN.dismissed = null;
  if (!sel || wiping || !SEL_SCAN_SCREENS.includes(screen) || SELSCAN.dismissed) return null;
  const A = AREAS[sel.area], c = A?.get()[sel.i], el = A?.els[sel.i]?.el;
  if (!c || !el) return null;
  return { el, subject: sel.held ? c.item : c };
}
async function syncSelScan(){
  if (SELSCAN.running){ SELSCAN.again = true; return; }
  SELSCAN.running = true;
  try {
    do {
      SELSCAN.again = false;
      while (DEX.busy) await sleep(30);
      const want = selScanWant(), cur = DEX.open && DEX.scan?.sel ? DEX.scan : null;
      if (want && !(cur && cur.mon === want.subject && cur.slot === want.el)){
        if (DEX.open && !DEX.scan) break;                      // the full RotomDex is open: leave it be
        await openScan(want.el, want.subject, { sel: true, onClose: () => { SELSCAN.dismissed = selKey(UI.sel); } });
      } else if (!want && cur) await closeDex();
    } while (SELSCAN.again);
  } finally { SELSCAN.running = false; }
}

/* ---------- scanning one Pokémon ----------
   Rotom flies to a Pokémon on the screen and opens a small RotomDex popup next to it showing just that Pokémon: below
   it, or above it if there is more room there, and only as tall as its contents. Rotom perches on the popup's edge
   right at the Pokémon's slot, overlapping the slot's corner and the popup's border: the border rises in a smooth
   bump to meet it (on the top edge for a popup below, the bottom edge for one above), so Rotom needs no padding
   inside. The Pokémon stays in view; tapping another one makes Rotom hop over and scan that one instead. "Full
   RotomDex", pinned to the popup's top right, turns it into the full RotomDex (which has the same bump in its top edge
   for Rotom, near the left corner). opts.reserve keeps that many pixels free at the bottom of the screen for the
   page's own buttons (the starter screen's "I Choose You!!"); opts.onClose runs when the scan ends. */
const SCAN = { gap: 22, margin: 10, maxW: 520, rdp: 65, bump: 30, top: 74, slope: 26, r: 18 };
// the outline: a rounded rectangle from y0 to y1 with a bump around x reaching up (or down) to the shell's edge
function scanOutline(w, h, x, down){
  const { bump: B, top: T, slope: S, r } = SCAN, a = x - T / 2, b = x + T / 2;
  const y0 = down ? B : 0, y1 = down ? h : h - B, e = down ? 0 : h;          // e: the bump's far edge
  const bumpPath = x === null ? '' : down
    ? `L${a - S},${y0} C${a - S / 2},${y0} ${a - S / 2},${e} ${a},${e} L${b},${e} C${b + S / 2},${e} ${b + S / 2},${y0} ${b + S},${y0}`
    : `L${b + S},${y1} C${b + S / 2},${y1} ${b + S / 2},${e} ${b},${e} L${a},${e} C${a - S / 2},${e} ${a - S / 2},${y1} ${a - S},${y1}`;
  return down
    ? `M${r},${y0} ${bumpPath} L${w - r},${y0} Q${w},${y0} ${w},${y0 + r} L${w},${y1 - r} Q${w},${y1} ${w - r},${y1} L${r},${y1} Q0,${y1} 0,${y1 - r} L0,${y0 + r} Q0,${y0} ${r},${y0} Z`
    : `M${r},${y0} L${w - r},${y0} Q${w},${y0} ${w},${y0 + r} L${w},${y1 - r} Q${w},${y1} ${w - r},${y1} ${bumpPath} L${r},${y1} Q0,${y1} 0,${y1 - r} L0,${y0 + r} Q0,${y0} ${r},${y0} Z`;
}
// where a scan popup for the Pokémon at slot goes: which side, its width, the room there is, Rotom's spot along its
// edge (x, under or over the Pokémon's middle), and at(h) its left and top for a height h
function dexPlace(slot, reserve = 0){
  const S = slot.getBoundingClientRect(), { gap, margin } = SCAN, top0 = margin + 6;
  const edge = SCAN.top / 2 + SCAN.slope + SCAN.r + 4;        // how far the bump's middle must stay from a corner
  const below = innerHeight - reserve - S.bottom - gap - margin, above = S.top - gap - top0, down = below >= above;
  const w = Math.min(innerWidth - margin * 2, SCAN.maxW);
  const left = Math.min(innerWidth - margin - w, Math.max(margin, S.left + S.width / 2 - w / 2));
  const x = Math.min(w - edge, Math.max(edge, S.left + S.width / 2 - left));
  return { down, w, x, room: Math.max(200, down ? below : above), at: h => ({ left, top: down ? S.bottom + gap : S.top - gap - h }) };
}
// where the popup goes and how big it is: the frame's box (left/top only while scanning), the bump's x along its
// width, and whether Rotom perches on the top edge (down) or the bottom one
function dexGeom(){
  const frame = $('.dexpop__frame'), { bump: B } = SCAN;
  const edge = SCAN.top / 2 + SCAN.slope + SCAN.r + 4;        // how far the bump's middle must stay from a corner
  DEXPOP.classList.toggle('dexpop--scan', !!DEX.scan);
  let w, h, x, down = true;
  if (!DEX.scan){
    // the full RotomDex: the screen-filling frame, Rotom on its top edge near the left corner
    frame.removeAttribute('style');
    const fr = frame.getBoundingClientRect(); w = fr.width; h = fr.height; x = edge;
  } else {
    const pl = dexPlace(DEX.scan.slot, DEX.scan.reserve);
    w = pl.w; down = pl.down;
    // as tall as the Pokémon's info and the buttons need, up to the room there is (then it scrolls)
    frame.style.width = w + 'px';
    h = Math.min(pl.room, $('#dex-body').scrollHeight + B + 2);     // (the Full RotomDex button floats over the info)
    return { ...pl.at(h), w, h, x: pl.x, down };
  }
  return { w, h, x, down };
}
function dexLayout(){ const g = dexGeom(); dexApply(g); return g; }
// just the bump, as its own small svg on the frame's edge at g.x (for sliding it along the edge): its outline, and a
// fill that covers the body's straight edge where the bump rises from it
// put the popup, its outline and Rotom's perch at geometry g
function dexApply(g){
  const { w, h, x, down } = g, frame = $('.dexpop__frame'), { bump: B } = SCAN, r = SCAN.rdp / 2;
  if (g.left !== undefined) Object.assign(frame.style, { left: g.left + 'px', top: g.top + 'px', width: w + 'px', height: h + 'px' });
  DEXPOP.classList.toggle('dexpop--perch-bottom', !down);
  Object.assign(DEXCARD.style, { top: (down ? B : 0) + 'px', height: (h - B) + 'px' });
  Object.assign(rdSpot().style, { left: (x - r) + 'px', top: ((down ? 0 : h) - r) + 'px' });   // keeps its visibility as set
  const svg = $('.dexpop__outline');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.setAttribute('width', w); svg.setAttribute('height', h);
  svg.firstElementChild.setAttribute('d', scanOutline(w, h, x, down));
  if (DEX.open && !DEX.busy && !RD.flying) rdPlace(rdSpot());
}
function dexActions(){
  const bar = $('#dex-act'), acts = DEX.scan ? [{ label: 'Full RotomDex', run: dexToFull }] : [];
  bar.hidden = !acts.length;
  bar.innerHTML = acts.map((a, i) => `<button class="btn ${a.go ? 'btn--go' : ''}" type="button" data-act="${i}">${a.label}</button>`).join('');
  bar._acts = acts;
}
$('#dex-act').addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && !DEX.busy) $('#dex-act')._acts?.[+b.dataset.act]?.run(); });
// the scan is over (closed, or turned into the full RotomDex)
function endScan(){ const s = DEX.scan; DEX.scan = null; s?.onClose?.(); }
async function openScan(slot, mon, opts = {}){
  const { reserve = 0 } = opts;
  if (wiping || DEX.busy) return;
  if (DEX.open && !DEX.scan) return;                          // the full RotomDex is open
  if (DEX.open && DEX.scan.mon === mon) return closeDex();    // tapping the scanned Pokémon again puts Rotom away
  if (!DEX.open){
    DEX.tabBefore = DEX.tab; DEX.scan = { ...opts, slot, mon, reserve }; DEX.tab = 'scan';
    dexActions();
    return openDex();
  }
  // already scanning another Pokémon: the popup folds away, Rotom flies over, and it opens again there
  await rdHopScan(slot, reserve, () => { DEX.scan = { ...opts, slot, mon, reserve }; dexActions(); dexShow('scan', false); });
}
// scan to scan: the old info fades, Rotom hops to its new perch while the popup slides and resizes under it (its
// bump following Rotom along the edge), and the new info fades up as Rotom comes in to land. If the popup has to flip to the
// other side of the Pokémon, it folds and reopens instead.
// scan to scan: Rotom flies straight off to the new Pokémon (no hop, from the very first frame) while the popup folds
// away into its old perch; the new info goes in while nothing shows, and the popup opens out of Rotom again as it
// lands. Rotom's new perch doesn't depend on the new info (it is the edge facing the Pokémon), so nothing waits on it.
async function rdHopScan(slot, reserve, change){
  if (REDUCED){ DEX.busy = true; change(); DEXSCROLL.scrollTop = 0; dexLayout(); DEX.busy = false; rdSync(); return; }
  DEX.busy = true; hideTip();
  const tok = ++DEX.anim, live = () => tok === DEX.anim;
  const spot = rdSpot(), pl = dexPlace(slot, reserve), at = pl.at(0);
  const pose = rdPose(RD.img); rdStill(true);
  const from = spot.getBoundingClientRect(), fl = rdFlyer(from);
  const a = rdMid(from), b = { x: at.left + pl.x, y: at.top }, sc = 1;
  // a concave swoop: down through a clear dip and back up into its new perch, the dip deeper the further it goes.
  // It sets off at once, gathering speed smoothly from rest, and eases in to land
  const d = rdDist(a, b), sag = 20 + d * .35, low = Math.max(a.y, b.y) + sag;
  const dip = [{ x: a.x + (b.x - a.x) * .2, y: low }, { x: a.x + (b.x - a.x) * .8, y: low }];
  const ease = k => (1 - Math.cos(Math.PI * k)) / 2;      // eases off its perch from rest and eases in to land: no jolt either end
  const dur = Math.round(RD_MS.glide[0] + (RD_MS.glide[1] - RD_MS.glide[0]) * Math.min(1, d / 400));
  // a short hop (to the next Pokémon along) just moves across, staying on the glass; only a long way dives in
  const depth = Math.min(1, Math.max(0, (d - 220) / 220));
  const flight = rdFly(fl, rdSwoop(a, b, ...dip, sc, pose, { ease, depth }), dur, b.x - a.x, b.y - a.y, sc);
  rdTakeOff(flight, () => { if (live()) spot.style.visibility = 'hidden'; });
  await dexFold();
  if (!live()) return;
  DEXSHELL.style.visibility = 'hidden';
  change(); DEXSCROLL.scrollTop = 0; dexLayout();
  DEXSHELL.getAnimations().forEach(x => x.cancel());
  await rdArrive(flight);
  if (!live()) return;
  if (await dexUnfold(fl, b.x - a.x, b.y - a.y, sc, live, flight)){ DEX.busy = false; rdStill(false); }
}
// the popup's current bump position and side, read back from Rotom's perch
function dexGeomNow(){
  const frame = $('.dexpop__frame').getBoundingClientRect(), s = rdSpot().getBoundingClientRect();
  return { x: s.left + s.width / 2 - frame.left, down: !DEXPOP.classList.contains('dexpop--perch-bottom') };
}
// fold the panel into Rotom, change what the popup shows (and where), hop Rotom to its new perch, open again
async function rdRelocate(change, dip){
  DEX.busy = true; hideTip();
  const tok = ++DEX.anim, live = () => tok === DEX.anim;
  if (!REDUCED) await dexFold();
  if (!live()) return;
  const pose = rdPose(RD.img); rdStill(true);
  const spot = rdSpot(), from = spot.getBoundingClientRect(), fl = REDUCED ? null : rdFlyer(from);
  spot.style.visibility = 'hidden'; DEXSHELL.style.visibility = 'hidden';            // (the panel is folded and the flyer on screen already)
  change(); DEXSCROLL.scrollTop = 0; dexLayout();
  DEXSHELL.getAnimations().forEach(x => x.cancel());
  if (REDUCED){ spot.style.visibility = DEXSHELL.style.visibility = ''; DEX.busy = false; rdStill(false); rdSync(); return; }
  const to = rdSpot().getBoundingClientRect(), a = rdMid(from), b = rdMid(to), sc = to.width / from.width;
  const flight = rdFly(fl, rdSwoop(a, b, ...rdDip(a, b, dip), sc, pose), rdHopMs(a, b), b.x - a.x, b.y - a.y, sc);
  await rdArrive(flight);
  if (!live()) return;
  if (await dexUnfold(fl, b.x - a.x, b.y - a.y, sc, live, flight)){ DEX.busy = false; rdStill(false); }
}
// "Full RotomDex": Rotom leaves the Pokémon, the page dims, and it opens the full RotomDex on the Pokémon section
async function dexToFull(){
  DEXVEIL.style.opacity = 0;
  await rdRelocate(() => {
    endScan(); DEX.tab = DEX.tabBefore || 'mons'; dexActions(); dexShow(DEX.tab, false); dexTabs(DEX.tab);
    DEXVEIL.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RD_MS.home, easing: 'ease-out', fill: 'forwards' });
  }, .6);
  DEXVEIL.getAnimations().forEach(x => x.cancel()); DEXVEIL.style.opacity = '';
}
// while scanning, the page behind stays usable: a tap outside the popup (that isn't on another Pokémon to scan) closes it
addEventListener('pointerdown', e => {
  if (DEX.open && DEX.scan && !DEX.busy && !e.target.closest('.dexpop__frame, .slot, .pageact')) closeDex();
}, true);
addEventListener('resize', () => { if (DEX.open) dexLayout(); rdSync(); });
RD_BTN.addEventListener('click', openDex);
// Rotom takes its place in the corner once the page is laid out
requestAnimationFrame(() => rdSync()); addEventListener('load', () => rdSync());
DEXVEIL.addEventListener('click', () => closeDex());
rdSpot().addEventListener('click', () => closeDex());
$('#dex-close').addEventListener('click', () => closeDex());
addEventListener('keydown', e => { if (e.key === 'Escape') closeDex(); });
document.querySelectorAll('.dextab').forEach(b => b.addEventListener('click', () => dexShow(b.dataset.tab, true)));
// arrow keys move between the tabs, like any tab list
$('.dextabs').addEventListener('keydown', e => {
  const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!step) return;
  const L = dexTabList(), t = L[(L.indexOf(DEX.tab) + step + L.length) % L.length];
  dexShow(t, true); document.querySelector(`.dextab[data-tab="${t}"]`).focus();
});
$('#dex-n-mons').textContent = SPECIES_N; $('#dex-n-moves').textContent = Object.keys(MOVES).length; $('#dex-n-items').textContent = ITEMS_DATA.length;
dexTabs(DEX.tab);

/* ================= title ================= */
// the backdrop is a real generated map (nodes coloured by type), drifting slowly behind the logo; the three
// starters bob on discs in their type colour. Start goes to the starter screen.
function buildTitle(){
  const { nodes } = generateMap(randomSeed()), lines = [];
  for (const n of nodes.values()) for (const k of n.kids){ const b = nodes.get(k); lines.push(`<line x1="${n.x}" y1="${n.y}" x2="${b.x}" y2="${b.y}"/>`); }
  $('#title-map').innerHTML = `<svg class="edges" viewBox="0 0 100 100" preserveAspectRatio="none">${lines.join('')}</svg>
    <div class="tbg__nodes">${[...nodes.values()].map(n => `<span class="tnode" data-type="${n.type}" style="left:${n.x}%;top:${n.y}%">${ICON[n.type]}</span>`).join('')}</div>`;
  $('#title-version').textContent = 'v' + VERSION;
  $('#title-mons').innerHTML = STARTERS.map((l, i) => {
    const f = LINES[l][1][0];
    return `<div class="tmon" style="--t:var(--t-${f.type}); --i:${i}"><img src="${SPRITES[f.spr]}" alt="${f.name}"></div>`;
  }).join('');
}
$('#title-start').addEventListener('click', () => wipeTo('scr-starter', openStarter, { mark: markHTML('🚩', 'New run') }));
// release notes: a popup over the title screen listing what changed in each version, newest first
const NOTES = $('#notes');
function openNotes(){
  if (wiping || !NOTES.hidden) return;
  $('#notes-body').innerHTML = CHANGELOG; $('#notes-body').scrollTop = 0;
  NOTES.hidden = false; $('#notes-close').focus({ preventScroll: true });
  if (!REDUCED) NOTES.querySelector('.notes__card').animate([{ opacity: 0, transform: 'translateY(14px) scale(.97)' }, { opacity: 1, transform: 'none' }],
    { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
}
function closeNotes(){ if (NOTES.hidden) return; NOTES.hidden = true; $('#title-notes').focus({ preventScroll: true }); }
$('#title-notes').addEventListener('click', openNotes);
$('#notes-close').addEventListener('click', closeNotes);
NOTES.querySelector('.notes__veil').addEventListener('click', closeNotes);
addEventListener('keydown', e => { if (e.key === 'Escape') closeNotes(); });

/* ================= starter ================= */
// three starters across the middle of the screen. Tapping one sends Rotom to scan it (openScan): the RotomDex opens
// beside it on the Scan tab, with "I Choose You!!" at the bottom. Choosing it puts Rotom away and starts the run.
const ST = { offer: [], home: -1, chosen: false, pressed: -1e9 };
function openStarter(){ newRun(); Object.assign(ST, { offer: STARTERS.map(l => makeMon(l, 1)), home: -1, chosen: false }); $('#starter-act').hidden = true; }
function starterTap(i){
  if (ST.chosen || wiping || !ST.offer[i] || DEX.busy) return;
  const act = $('#starter-act'), same = DEX.open && DEX.scan?.mon === ST.offer[i];
  ST.home = same ? -1 : i;
  setShown('starter-act', act, !same);
  openScan(AREAS['S.offer'].els[i].el, ST.offer[i], { reserve: act.offsetHeight + 12 || 88,
    onClose: () => { if (!ST.chosen) setShown('starter-act', act, false); } });
}
async function chooseStarter(){
  const i = ST.home;
  if (ST.chosen || i < 0 || !ST.offer[i] || DEX.busy) return;
  ST.chosen = true; R.party[1] = ST.offer[i];              // front row, middle lane
  setShown('starter-act', $('#starter-act'), false);
  await closeDex();                                         // Rotom folds the popup away and flies home first
  startRun();
}
$('#starter-go').addEventListener('click', chooseStarter);
// a starter reacts the moment it is pressed rather than when the finger lifts (a click), so Rotom sets off at once;
// the click that follows the press is then skipped (keyboard Enter and Space still go through the click path)
$('[data-area="S.offer"]').addEventListener('pointerdown', e => {
  if (e.button) return;
  const i = AREAS['S.offer'].els.findIndex(s => s.el === e.target.closest('.slot'));
  if (i < 0) return;
  ST.pressed = performance.now(); starterTap(i);
});
RENDER['scr-starter'] = () => renderArea('S.offer');

/* ---------- from the starter screen straight into the first map, no wipe ----------
   One step after another: the chosen Pokémon jumps at once toward the front-middle party slot (the starter screen fades
   out under it) and lands; then the party and bag slots fade and pop in around it; then it moves into its slot; then
   the top bar slides in and the map generates from the bottom row to the top, one node at a time, each path appearing
   with the node it leads to. */
const INTRO = { hop: 780, fade: 260, step: 30, slots: 45 };
async function startRun(){
  if (REDUCED) return toMap();
  wiping = mapIntro = true; hideTip();
  const pick = AREAS['S.offer'].els[ST.home].el, from = spriteBox(pick), src = SPRITES[FORM[R.party[1].form].spr];
  // lay the party slots out (invisible, over the starter screen) so the jump knows where it is headed
  const team = $('#mapteam'), bag = $('#mapbag');
  team.style.opacity = bag.style.opacity = '0';
  team.hidden = bag.hidden = false;
  renderArea('M.party'); renderArea('M.bag');
  const target = AREAS['M.party'].els[1].el;
  target.classList.add('arriving');                       // its sprite stays hidden until the jumper is handed over
  pick.querySelector('.slot__sprite img').style.visibility = 'hidden';
  const hop = fly(src, from, target, { dur: INTRO.hop, keep: true });

  // the starter screen fades out under the jump; then the map takes its place, still hidden
  await $('#scr-starter').animate([{ opacity: 1 }, { opacity: 0 }], { duration: INTRO.fade, easing: 'ease-out', fill: 'forwards' }).finished;
  const map = $('#scr-map');
  map.classList.add('intro');
  UI.sel = null; UI.notice = null;
  show('scr-map'); refresh(); scrollMapToCurrent(true);
  $('#scr-starter').getAnimations().forEach(x => x.cancel());
  pick.querySelector('.slot__sprite img').style.visibility = '';

  // 1. the jump, landing included: it ends with the starter still and at full shape on its spot
  const jumper = await hop;

  // 2. then the party and bag slots fade and pop in around it
  const ease = 'cubic-bezier(.3,1.4,.5,1)';
  const slots = [...team.querySelectorAll('.slotwrap'), ...bag.querySelectorAll('.slotwrap')];
  [team, bag].forEach(el => { el.style.opacity = ''; el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' }); });
  await Promise.all(slots.map((w, i) => w.animate([{ opacity: 0, transform: 'scale(.55)' }, { opacity: 1, transform: 'none' }],
    { duration: 360, delay: i * INTRO.slots, easing: ease, fill: 'backwards' }).finished.catch(() => {})));

  // 3. the starter moves into its slot (same place, same size, so nothing visibly changes; no extra landing bounce)
  jumper.remove(); target.classList.remove('arriving');

  // 4. then the rest: the top bar slides in and the map generates from the bottom row up, one node at a time
  map.querySelector('.hud').animate([{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
  const nodes = [...document.querySelectorAll('#nodes .node')].map(b => ({ b, n: R.map.nodes.get(b.dataset.id) }))
    .sort((p, q) => p.n.r - q.n.r || p.n.c - q.n.c);
  const lines = [...document.querySelectorAll('#edges line')];
  const built = nodes.map(({ b, n }, i) => {
    const delay = 80 + i * INTRO.step;
    lines.filter(l => l.dataset.to === n.id).forEach(l => l.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: delay - 40, easing: 'ease-out', fill: 'backwards' }));
    if (n.id === R.at) $('#you').animate([{ opacity: 0, transform: 'translate(-50%, -90%)' }, { opacity: 1, transform: 'translate(-50%, -128%)' }], { duration: 360, delay: delay + 100, easing: ease, fill: 'backwards' });
    return b.animate([{ opacity: 0, scale: .3 }, { opacity: 1, scale: 1.14, offset: .65 }, { opacity: 1, scale: 1 }], { duration: 380, delay, easing: 'ease-out', fill: 'backwards' });
  });
  map.classList.remove('intro');                          // every piece now holds itself hidden until its turn
  await Promise.all(built.map(x => x.finished.catch(() => {})));
  wiping = mapIntro = false;
  refresh();
}

/* ================= map ================= */
function renderHud(){
  $('#hud-map').innerHTML = `Map ${R.mapNo} of 8<small>Gym ${R.mapNo}: ${GYMS[R.mapNo - 1].name}, ${cap(GYMS[R.mapNo - 1].type)} type</small>`;
  $('#hud-hearts').innerHTML = Array.from({ length: TUNE.lives }, (_, i) => HEART.replace('class="heart"', `class="heart${i < R.lives ? '' : ' lost'}"`)).join('');
  $('#hud-hearts').setAttribute('aria-label', `${R.lives} of ${TUNE.lives} lives`);
  $('#hud-coins').textContent = `${R.coins} coins`;
}
function renderMap(){
  const { nodes, cfg } = R.map;
  $('#map').style.setProperty('--rows', cfg.floors + 2);
  const at = R.at, nextIds = at === 'B' ? new Set() : nodes.get(at).kids;
  const walked = new Set(R.trail.slice(1).map((id, i) => R.trail[i] + '>' + id));
  const rank = c => c === 'walked' ? 2 : c === 'next' ? 1 : 0;
  const lines = [];
  for (const n of nodes.values()) for (const k of n.kids){
    const b = nodes.get(k), e = n.id + '>' + k;
    const cls = walked.has(e) ? 'walked' : (n.id === at && nextIds.has(k)) ? 'next' : '';
    lines.push({ cls, html: `<line class="${cls}" data-to="${k}" x1="${n.x}" y1="${n.y}" x2="${b.x}" y2="${b.y}"/>` });
  }
  $('#edges').innerHTML = lines.sort((p, q) => rank(p.cls) - rank(q.cls)).map(p => p.html).join('');
  const box = $('#nodes');
  if (box.dataset.map !== String(R.map.gen)){
    box.dataset.map = String(R.map.gen); box.innerHTML = '';
    for (const n of nodes.values()){
      const b = document.createElement('button');
      b.className = 'node'; b.dataset.id = n.id; b.dataset.type = n.type;
      b.style.left = n.x + '%'; b.style.top = n.y + '%';
      b.innerHTML = `<span>${ICON[n.type]}</span>`;
      b.addEventListener('click', () => goTo(n.id));
      box.append(b);
    }
    const you = document.createElement('div'); you.id = 'you'; you.innerHTML = '<img alt="">';
    box.append(you);
  }
  const reachable = new Set(), stack = [at];
  while (stack.length){ const id = stack.pop(); for (const k of nodes.get(id).kids) if (!reachable.has(k)){ reachable.add(k); stack.push(k); } }
  box.querySelectorAll('.node').forEach(b => {
    const id = b.dataset.id, n = nodes.get(id);
    const s = id === at ? 'current' : nextIds.has(id) ? 'next' : R.trail.includes(id) ? 'visited' : reachable.has(id) ? 'open' : 'locked';
    b.dataset.state = s; b.disabled = s !== 'next';
    const label = n.type === 'boss' ? `Gym ${R.mapNo}` : LABEL[n.type];
    b.setAttribute('aria-label', `${label}${s === 'current' ? ', you are here' : s === 'next' ? ', go here' : ''}`);
    b.title = label;
  });
  const you = $('#you'), lead = R.party[FILL.find(i => R.party[i])];
  if (lead){ you.style.display = ''; you.querySelector('img').src = SPRITES[FORM[lead.form].spr]; const n = nodes.get(at); you.style.left = n.x + '%'; you.style.top = n.y + '%'; }
  else you.style.display = 'none';
}
RENDER['scr-map'] = () => { renderHud(); renderMap(); };
function scrollMapToCurrent(instant = false){
  const b = document.querySelector(`#nodes .node[data-id="${R.at}"]`), scr = $('#scr-map');
  if (!b) return;
  const r = b.getBoundingClientRect(), sr = scr.getBoundingClientRect();
  scr.scrollTo({ top: scr.scrollTop + r.top - sr.top - sr.height * .62, behavior: REDUCED || instant ? 'auto' : 'smooth' });
}
function goTo(id){
  if (wiping || screen !== 'scr-map') return;
  if (!R.map.nodes.get(R.at).kids.has(id)) return;
  R.at = id; R.trail.push(id);
  UI.sel = null; refresh();
  const t = R.map.nodes.get(id).type;
  setTimeout(() => openNode(t), REDUCED ? 60 : 420);
}
function openNode(t){
  const mark = markHTML(ICON[t], t === 'boss' ? `Gym ${R.mapNo}` : LABEL[t]);
  const opt = { color: NODE_COLOR(t), mark };
  if (t === 'wild') return wipeTo('scr-wild', openWild, { ...opt, after: wildEntrance });
  if (t === 'item') return wipeTo('scr-item', openItem, opt);
  if (t === 'tutor') return wipeTo('scr-tutor', openTutor, opt);
  if (t === 'daycare') return wipeTo('scr-daycare', () => openDaycare(false), opt);
  if (t === 'trainer' || t === 'boss' || t === 'legendary') return enterBattle(t, opt);
}

/* ================= wild ================= */
// The starter screen's layout: three wild Pokémon at the top, and your party and bag in the bottom corners as on the
// map. Phases:
//  pick  - tap a wild Pokémon and the RotomDex scans it; "I Choose You!!" (pinned under the scan) chooses it
//  place - the other two leave; the chosen one waits, glowing, and your party slots glow: tap one to put it there
//          (a Pokémon already there moves over, or to the daycare). Or send it to the daycare, or (party and
//          daycare both full) release it for an EXP Candy
//  feed  - the candy waits where the released Pokémon was; tap a Pokémon in your party to feed it
//  done  - back to the map
const W = { offer: [], home: -1, token: 0, phase: 'pick', done: false, arrived: [], entering: false, scanning: -1, pressed: -1e9, candy: false, leveled: null };
function openWild(){
  const star = clamp(Math.floor(partyLevel() + .25), 1, 3);   // deliberately at or a touch behind your party
  Object.assign(W, { offer: shuffle([...WILD_LINES]).slice(0, 3).map(l => makeMon(l, star, star < 3 ? Math.random() * .4 : 1)),
    home: -1, phase: 'pick', done: false, candy: false, leveled: null, scanning: -1 });
  $('#wild-act').hidden = true;
  const all = REDUCED;                                      // reduced motion: they are simply there
  Object.assign(W, { arrived: W.offer.map(() => all), entering: !all });
}
const wildSlot = i => AREAS['W.offer'].els[i]?.el;
/* ---------- the wild Pokémon leap in from the edges of the screen ----------
   Once the screen is in, the three slots start empty and the Pokémon leap in from random spots along the edges of
   the top half of the screen (the left edge, the top, the right edge), in a random order and at uneven intervals, so
   they neither march in one after another nor arrive all at once. Picking waits until all three have landed. */
const rand = (a, b) => a + Math.random() * (b - a);
// a spot just off screen, at fraction u (0..1) along the top half's edge: up the left side, across the top, down the right
function topHalfEdge(u, size){
  const m = 24, half = innerHeight / 2, len = half * 2 + innerWidth;
  let d = u * len;
  if (d < half) return { x: -size - m, y: half - d - size / 2, size };
  d -= half;
  if (d < innerWidth) return { x: d - size / 2, y: -size - m, size };
  return { x: innerWidth + m, y: d - innerWidth - size / 2, size };
}
async function wildEntrance(){
  if (!W.entering) return;
  const tok = W.enterTok = (W.enterTok || 0) + 1, live = () => W.enterTok === tok && screen === 'scr-wild';
  const landings = [];
  await sleep(rand(0, 160));
  // left to right, each slot's Pokémon comes from its own third of the edge (so they all come from different places,
  // and their paths don't cross), at a random spot within it
  const order = shuffle([0, 1, 2]).filter(i => W.offer[i]);
  for (const [k, i] of order.entries()){
    if (!live()) break;
    const slot = AREAS['W.offer'].els[i].el, empty = slot._last;
    W.arrived[i] = true; refresh();
    holdSlot(slot, empty, '');                                  // the slot stays empty until the Pokémon lands
    slot.classList.add('arriving');
    const end = spriteBox(slot), start = topHalfEdge((i + rand(.1, .9)) / 3, end.size);
    landings.push(fly(SPRITES[FORM[W.offer[i].form].spr], start, slot, { dur: rand(580, 720) }));
    if (k < order.length - 1) await sleep(rand(160, 520));      // never together, never in lockstep
  }
  await Promise.all(landings);
  if (W.enterTok !== tok) return;
  W.arrived = W.offer.map(() => true); W.entering = false;
  refresh();
}
// tap a wild Pokémon and the RotomDex scans it, as on the starter screen; "I Choose You!!" (pinned under the scan)
// then sends it to the big slot and straight on to placing it in your party
// tap a wild Pokémon and the RotomDex scans it, as on the starter screen; "I Choose You!!" (pinned under the scan)
// chooses it
function wildTap(i){
  if (W.phase !== 'pick' || wiping || W.entering || !W.offer[i] || DEX.busy) return;
  UI.sel = null;                                        // (a party Pokémon being scanned gives way to the wild one)
  const act = $('#wild-act'), same = DEX.open && DEX.scan?.mon === W.offer[i];
  W.scanning = same ? -1 : i;
  setShown('wild-act', act, !same);
  openScan(wildSlot(i), W.offer[i], { reserve: act.offsetHeight + 12 || 88,
    onClose: () => { if (W.phase === 'pick') setShown('wild-act', act, false); } });
}
// "I Choose You!!": the scan closes, the other two leave, and your party lights up for you to pick a slot
async function wildChoose(){
  const i = W.scanning;
  if (W.phase !== 'pick' || i < 0 || !W.offer[i] || DEX.busy) return;
  W.phase = 'choosing'; W.home = i; W.scanning = -1;
  setShown('wild-act', $('#wild-act'), false);
  await closeDex();
  const others = W.offer.map((m, j) => j !== i && m ? wildSlot(j) : null).filter(Boolean);
  if (!REDUCED) await Promise.all(others.map(el => el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px) scale(.9)' }],
    { duration: 240, easing: 'ease-in', fill: 'forwards' }).finished));
  W.offer = W.offer.map((m, j) => j === i ? m : null);
  others.forEach(el => el.getAnimations().forEach(x => x.cancel()));
  W.phase = 'place'; UI.sel = null; refresh();
}
$('#wild-choose').addEventListener('click', wildChoose);
// like the starters, a wild Pokémon reacts the moment it is pressed (the click that follows is skipped)
$('[data-area="W.offer"]').addEventListener('pointerdown', e => {
  if (e.button) return;
  const i = AREAS['W.offer'].els.findIndex(s => s.el === e.target.closest('.slot'));
  if (i < 0) return;
  W.pressed = performance.now(); wildTap(i);
});
// a tap on your party (bottom left) while the wild Pokémon waits to be placed, or while the candy waits to be eaten
function wildPartyTap(i){
  if (W.phase === 'place') return wildPlace(i);
  if (W.phase === 'feed') return feedCandy(i);
  return false;
}
function wildPlace(i){
  const mon = W.offer[W.home];
  if (W.phase !== 'place' || wiping || !mon) return;
  const here = R.party[i], before = snapshot();
  let msg = `${nm(mon)} joined your party.`;
  if (here){
    const e = firstEmpty(R.party);
    if (e >= 0){ R.party[e] = here; msg += ` ${nm(here)} moved over to make room.`; }
    else if (depositDaycare(here)) msg += ` ${nm(here)} went to the daycare.`;
    else { shake('M.party', i); UI.notice = { text: 'Your party and daycare are both full, so nobody can make room. You can release it instead.' }; return refresh(); }
  }
  R.party[i] = mon; W.offer[W.home] = null; W.phase = 'done'; W.done = true;
  UI.notice = null;
  refresh(); flip(before); toast('party', msg);
}
function wildToDaycare(){
  const mon = W.offer[W.home], el = wildSlot(W.home);
  if (!mon) return;
  const img = el?.querySelector('.slot__sprite img'), box = el && spriteBox(el);
  if (!depositDaycare(mon)){ UI.notice = { text: `The daycare is full (${TUNE.daycareSize} of ${TUNE.daycareSize}). Tap a party slot instead.` }; return refresh(); }
  const src = img?.src;
  W.offer[W.home] = null; W.phase = 'leaving'; W.done = true;
  UI.notice = { ok: true, text: `${nm(mon)} went to the daycare.` };
  refresh();
  // it jumps off the screen, then it's straight back to the map
  (src ? jumpOff(src, box) : Promise.resolve()).then(() => sleep(REDUCED ? 0 : 120)).then(toMap);
}
const mustRelease = () => daycareFull() && partyCount() >= 6;
// the Pokémon jumps up and off the edge of the screen
function jumpOff(src, box){
  if (REDUCED) return Promise.resolve();
  const img = document.createElement('img'); img.className = 'hopper'; img.src = src; img.alt = '';
  Object.assign(img.style, { left: box.x + 'px', top: box.y + 'px', width: box.size + 'px', height: box.size + 'px' });
  document.body.append(img);
  const dx = innerWidth - box.x + box.size, dy = -(box.y + box.size * 1.5), frames = [];
  for (let i = 0; i <= 16; i++){ const t = i / 16; frames.push({ transform: `translate(${dx * t}px, ${dy * t - 260 * t * (1 - t)}px) rotate(${t * 200}deg)`, offset: t }); }
  return img.animate(frames, { duration: 650, easing: 'cubic-bezier(.45,0,.8,.6)', fill: 'both' }).finished.then(() => img.remove());
}
function wildRelease(){
  const mon = W.offer[W.home], el = wildSlot(W.home);
  if (!mon || !el) return;
  const src = el.querySelector('.slot__sprite img').src, box = spriteBox(el);
  W.offer[W.home] = null; W.candy = true; W.phase = 'feed';
  UI.notice = { ok: true, text: `${nm(mon)} was released. It left an EXP Candy behind: tap a Pokémon to feed it.` };
  refresh();
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  jumpOff(src, box);
}
function feedCandy(i){
  if (W.phase !== 'feed' || wiping) return;
  const m = R.party[i], el = AREAS['M.party'].els[i]?.el, from = wildSlot(W.home);
  if (!m){ shake('M.party', i); UI.notice = { text: 'Tap a Pokémon to feed it the EXP Candy.' }; return refresh(); }
  const prev = el._last, label = slotLabel(el)?.textContent ?? '', box = spriteBox(from);
  let msg;
  if (m.star >= 3){ msg = `${nm(m)} ate the EXP Candy, but it's already at ★3.`; }
  else {
    const before = nm(m), evo = [];
    m.exp += TUNE.candyExp;
    while (m.exp >= 1 && m.star < 3){ m.exp -= 1; evo.push(levelUp(m)); }
    if (m.star >= 3) m.exp = 1;
    msg = !evo.length ? `${before} ate the EXP Candy and gained ${pct(TUNE.candyExp)} of a level.`
      : before !== nm(m) ? `${before} ate the EXP Candy, reached ★${m.star} and evolved into ${nm(m)}!` : `${before} ate the EXP Candy and reached ★${m.star}!`;
    W.leveled = evo.length ? m.uid : null;
  }
  W.candy = false; W.phase = 'done'; W.done = true; UI.notice = null;
  from.classList.add('depart'); void from.offsetWidth;
  refresh(); toast('party', msg);
  requestAnimationFrame(() => requestAnimationFrame(() => from.classList.remove('depart')));
  crossfadeLeave(from, 'var(--t-held)');
  if (REDUCED) return;
  holdSlot(el, prev, label);
  el.classList.add('arriving-held');
  fly(CANDY_SPR, box, el, { slide: true }).then(() => {
    el.classList.remove('arriving-held', 'seat');
    if (W.leveled === m.uid){ el.classList.remove('lvlup', 'pop'); void el.offsetWidth; el.classList.add('lvlup', 'pop'); }
  });
}
$('#wild-go').addEventListener('click', () => {
  if (W.phase === 'place') return mustRelease() ? wildRelease() : wildToDaycare();
  if (W.phase === 'done') return toMap();
});
RENDER['scr-wild'] = () => {
  renderArea('W.offer');
  if (W.candy){       // the released Pokémon's EXP Candy waits where it was until it's fed to someone
    const el = wildSlot(W.home);
    renderSlot(el, PRESET.offer, { key: 'candy', sprite: CANDY_SPR, type: 'held', name: 'EXP Candy' }, { interactive: false });
  }
  // the chosen Pokémon glows while it waits for a slot
  AREAS['W.offer'].els.forEach(({ el }, i) => el.toggleAttribute('data-selected', W.phase === 'place' && i === W.home));
  const mon = W.offer[W.home];
  $('#wild-hint').textContent = W.phase === 'pick' || W.phase === 'choosing' ? 'Tap a Pokémon to scan it with the RotomDex.'
    : W.phase === 'place' ? `Tap a slot in your party to put ${nm(mon)} there.`
    : W.phase === 'feed' ? 'Tap a Pokémon in your party to feed it the EXP Candy.' : '';
  renderNotice('wild-notice');
  const go = $('#wild-go');
  go.hidden = !['place', 'done', 'leaving'].includes(W.phase);
  go.classList.remove('btn--release', 'btn--go');
  if (W.phase === 'place' && mustRelease()){ go.textContent = 'Release'; go.disabled = false; go.classList.add('btn--release'); }
  else if (W.phase === 'place'){ go.textContent = 'Send to daycare'; go.disabled = daycareFull(); }
  else if (W.phase === 'leaving'){ go.disabled = true; }
  else if (W.phase === 'done'){ go.textContent = 'Back to map'; go.disabled = false; go.classList.add('btn--go'); }
};

/* ================= poké mart ================= */
// Tap an item in the stock to pick it: the empty slots in your bag (bottom right) glow, and tapping one buys the item
// into it. Items you can't afford, or can't fit with a full bag, are greyed out. Tap an item in your bag (or one a
// Pokémon holds) and its scan has a Sell button: the Mart buys it back for part of its price. While an item is picked,
// "Back to map" turns into a Buy button that puts it in the first empty bag slot (greyed out if you can't afford it or
// have no room); put the item back and it's "Back to map" again.
const MT = { stock: [], sold: new Set(), rerolls: 0, picked: null };
const itemPrice = id => TUNE.itemPrice[id] ?? 80;
const sellPrice = id => Math.round(itemPrice(id) * TUNE.sellRate);
// why an item in the stock can't be bought right now, or '' if it can
const martBlock = i => MT.sold.has(i) ? 'sold' : R.coins < itemPrice(MT.stock[i]) ? 'poor' : R.bag.indexOf(null) < 0 ? 'full' : '';
const martRerollFee = () => TUNE.martRerollStep * (MT.rerolls + 1);
function rollMart(){ MT.stock = shuffle([...ITEM_IDS]).slice(0, TUNE.martStock); MT.sold = new Set(); }
function openItem(){ MT.rerolls = 0; MT.picked = null; rollMart(); }
// tap an item in the stock: pick it (or put it back), so the empty bag slots light up and the Buy button shows. An
// item you can't buy yet can still be picked (its label shakes and the Buy button stays greyed out).
function martPick(i){
  if (wiping || MT.sold.has(i)) return;
  const why = martBlock(i);
  UI.sel = null;
  MT.picked = MT.picked === i ? null : i;
  UI.notice = MT.picked != null && why === 'full' ? { text: 'No room: your bag is full. Give an item to a Pokémon, or sell one (tap it in your bag), first.' } : null;
  refresh();
  if (MT.picked != null && why) nope(document.querySelector(`#mart-stock .shopcard[data-i="${i}"] .mvcard__price small`));
}
// tap a bag slot with an item picked: buy it into that slot if it's empty
function martPlace(slot){
  const i = MT.picked;
  if (martBlock(i)){ nope(document.querySelector(`#mart-stock .shopcard[data-i="${i}"] .mvcard__price small`)); return; }
  if (R.bag[slot]){ shake('M.bag', slot); UI.notice = { text: `That slot is taken. Tap a glowing empty slot to buy the ${ITEM[MT.stock[i]].name}.` }; return refresh(); }
  buy(i, slot);
}
function buy(i, slot){
  const id = MT.stock[i], cost = itemPrice(id);
  MT.picked = null;
  if (martBlock(i) || R.bag[slot]) return refresh();
  const src = document.querySelector(`#mart-stock .shopcard[data-i="${i}"] .slot`), img = src?.querySelector('.slot__sprite img');
  const start = src && spriteBox(src);
  UI.sel = null;
  const el = AREAS['M.bag'].els[slot]?.el, prev = el && { args: el._last, label: slotLabel(el)?.textContent ?? '' };
  R.coins -= cost; R.bag[slot] = makeItem(id); MT.sold.add(i);
  UI.notice = null;
  const coins = R.coins + cost;
  refresh(); toast('bag', `Bought the ${ITEM[id].name}.`);
  countCoins($('#mart-coins'), coins, R.coins);
  if (el && img && !REDUCED){ holdSlot(el, prev.args, prev.label); el.classList.add('arriving'); fly(img.src, start, el, { slide: true }); }
}
// sell what's selected: an item in the bag, or one a party Pokémon holds
function martSellable(){
  const sel = UI.sel;
  if (screen !== 'scr-item' || !sel || (sel.area !== 'M.bag' && !(sel.area === 'M.party' && sel.held))) return null;
  const c = AREAS[sel.area].get()[sel.i], it = sel.held ? c?.item : c;
  return it ? { sel, it } : null;
}
function sell(){
  const s = martSellable(); if (!s) return;
  const { sel, it } = s, gain = sellPrice(it.id), coins = R.coins, el = AREAS[sel.area].els[sel.i]?.el;
  if (sel.held) R.party[sel.i].item = null; else R.bag[sel.i] = null;
  R.coins += gain; UI.sel = null; MT.picked = null;
  UI.notice = null;
  refresh(); toast(sel.held ? 'party' : 'bag', `Sold the ${ITEM[it.id].name} for ${gain} coins.`);
  countCoins($('#mart-coins'), coins, R.coins);
  if (el && !REDUCED){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
}
RENDER['scr-item'] = () => {
  $('#mart-coins').textContent = `${R.coins} coins`;
  if (MT.picked != null && MT.sold.has(MT.picked)) MT.picked = null;
  // the Move Tutor's list: each item in a slot, its name and effect, its price; tap it to pick it, then a bag slot
  const box = $('#mart-stock');
  box.innerHTML = MT.stock.map((id, i) => {
    const it = ITEM[id], cost = itemPrice(id), why = martBlock(i);
    const note = { sold: 'sold', poor: 'too expensive', full: 'no room' }[why] || 'coins';
    return `<div class="mvcard trcard shopcard" data-i="${i}" role="button" tabindex="${why === 'sold' ? -1 : 0}" aria-pressed="${MT.picked === i}"${why ? ` data-block="${why}" aria-disabled="true"` : ''} aria-label="${it.name}, ${cost} coins${why ? ', ' + note : ''}">
      <div class="trcard__slot"></div>
      <div class="trcard__body">
        <span class="mvcard__name">${it.name}</span>
        <span class="mvcard__meta">${it.fx}</span>
      </div>
      <span class="mvcard__price">${cost}<small>${note}</small></span>
    </div>`;
  }).join('');
  box.querySelectorAll('.shopcard').forEach(card => {
    const i = +card.dataset.i, it = ITEM[MT.stock[i]], sold = MT.sold.has(i);
    const slot = createSlot(e => { e.stopPropagation(); martPick(i); });
    slot.tabIndex = -1; slot.setAttribute('aria-hidden', 'true');
    card.querySelector('.trcard__slot').append(slot);
    renderSlot(slot, PRESET.shop, sold ? null : { key: 'shop-' + i, sprite: it.spr, type: 'held', name: it.name }, { interactive: !sold });
    slot.toggleAttribute('data-selected', MT.picked === i);
    if (!sold){
      card.addEventListener('click', () => martPick(i));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); martPick(i); } });
    }
  });
  renderNotice('item-notice');
  const rr = $('#mart-reroll');
  rr.textContent = `New stock for ${martRerollFee()} coins`;
  rr.disabled = R.coins < martRerollFee();
  // with an item picked, "Back to map" becomes its Buy button
  const go = $('#mart-leave'), p = MT.picked;
  go.textContent = p != null ? `Buy for ${itemPrice(MT.stock[p])} coins` : 'Back to map';
  go.classList.toggle('btn--go', p != null);
  go.disabled = p != null && !!martBlock(p);
};
$('#mart-reroll').addEventListener('click', () => {
  if (R.coins < martRerollFee()) return;
  R.coins -= martRerollFee(); MT.rerolls++; MT.picked = null; rollMart(); UI.notice = null; refresh();
});
$('#mart-leave').addEventListener('click', () => {
  if (MT.picked == null) return toMap();
  if (!martBlock(MT.picked)) buy(MT.picked, R.bag.indexOf(null));
});

/* ================= move tutor ================= */
// The tutor offers 5 moves per visit, each learnable by someone in the party, and the offer can be rerolled. Your
// party and bag sit in the bottom corners as on the map. Tap a move (its TR) and the party Pokémon that can learn it
// glow while the rest dim; tap one of them and the TR flies over and teaches it. A Pokémon has one taught move
// (TUNE.taughtMax), so a new one replaces the old. With no move picked, the party and bag work as on the map.
const TU = { offer: [], rerolls: 0, teaching: null, busy: false };
const canLearn = (m, k) => learnable(m).includes(k);
const price = k => TUNE.tutorPrice[MOVES[k].star];
const rerollFee = () => TUNE.rerollStep * (TU.rerolls + 1);
function rollTutor(){
  const party = partyMons(), offered = [];
  let universal = 0;
  const ok = k => !offered.includes(k) && (!UNIVERSAL.has(k) || universal < 1);
  for (let s = 0; s < 5; s++){
    const who = shuffle(party.filter(m => learnable(m).some(ok)));
    if (!who.length) break;
    const k = pick(learnable(who[0]).filter(ok));
    if (UNIVERSAL.has(k)) universal++;
    offered.push(k);
  }
  TU.offer = offered; TU.teaching = null;
}
function openTutor(){ TU.rerolls = 0; TU.busy = false; rollTutor(); }
// tap a move: pick it (or put it back); the party lights up with who can learn it
function pickTutorMove(k){
  if (TU.busy || wiping) return;
  UI.sel = null;
  if (TU.teaching === k){ TU.teaching = null; UI.notice = null; return refresh(); }
  const mv = MOVES[k];
  if (R.coins < price(k)){ TU.teaching = null; UI.notice = null; refresh(); return nope(document.querySelector(`#tutor-moves .trcard[data-k="${k}"] .mvcard__price small`)); }
  if (!partyMons().some(m => canLearn(m, k))){ TU.teaching = null; UI.notice = { text: `Nobody in your party can learn ${mv.name} right now.` }; return refresh(); }
  TU.teaching = k; UI.notice = null; refresh();
}
// tap a party Pokémon while a move is picked: teach it, if it can learn it
function tutorTeachTo(i){
  if (TU.busy) return;
  const m = R.party[i], k = TU.teaching;
  if (!m || !canLearn(m, k)){
    shake('M.party', i);
    UI.notice = { text: m ? `${nm(m)} can't learn ${MOVES[k].name}.` : `Tap a glowing Pokémon to teach it ${MOVES[k].name}.` };
    return refresh();
  }
  sendTR(m, k, i);
}
// the TR lifts out of its card, arcs over to the Pokémon spinning and shrinking with a trail of type-coloured sparks,
// and bursts into it; then the Pokémon has learned the move
function sendTR(m, k, i){
  const card = document.querySelector(`#tutor-moves .trcard[data-k="${k}"]`), src = card?.querySelector('.slot'), dest = AREAS['M.party'].els[i]?.el;
  if (!src || !dest || REDUCED) return teach(m, k, i);
  TU.busy = true;
  const col = typeColor(MOVES[k].type), img = src.querySelector('.slot__sprite img'), from = spriteBox(src), to = spriteBox(dest);
  const fl = document.createElement('img'); fl.className = 'hopper tr-flyer'; fl.src = img.src; fl.alt = '';
  fl.style.setProperty('--tc', col);
  Object.assign(fl.style, { left: from.x + 'px', top: from.y + 'px', width: from.size + 'px', height: from.size + 'px' });
  document.body.append(fl);
  const sx = from.x + from.size / 2, sy = from.y + from.size / 2, tx = to.x + to.size / 2, ty = to.y + to.size / 2;
  const dx = tx - sx, dy = ty - sy, dist = Math.hypot(dx, dy);
  const cx = dx * .5 + (dx >= 0 ? -1 : 1) * Math.min(90, dist * .18), cy = dy * .5 - Math.min(140, 50 + dist * .25);
  const LIFT = 120, FLY = Math.round(Math.min(680, 380 + dist * .3)), total = LIFT + FLY;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const end = to.size / from.size;
  const frames = [{ offset: 0, transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
    { offset: LIFT / total, transform: 'translate(0,-10px) rotate(-12deg) scale(1.15)', opacity: 1 }];
  for (let s = 1; s <= 14; s++){
    const u = ease(s / 14), x = 2 * (1 - u) * u * cx + u * u * dx, y = 2 * (1 - u) * u * cy + u * u * dy - 10 * (1 - u);
    frames.push({ offset: (LIFT + FLY * s / 14) / total, transform: `translate(${x}px, ${y}px) rotate(${-12 + 552 * u}deg) scale(${1.15 + (end * .7 - 1.15) * u})`, opacity: s === 14 ? 0 : 1 });
  }
  src.classList.add('depart');
  const anim = fl.animate(frames, { duration: total, easing: 'linear', fill: 'forwards' });
  const t0 = performance.now(); let last = 0;
  const trail = now => {
    if (now - t0 > total) return;
    if (now - t0 > LIFT && now - last > 34){
      last = now;
      const r = fl.getBoundingClientRect(), sp = document.createElement('i'), sz = 4 + Math.random() * 5;
      sp.className = 'tr-spark'; sp.style.setProperty('--tc', col);
      Object.assign(sp.style, { left: r.left + r.width / 2 - sz / 2 + (Math.random() - .5) * 8 + 'px', top: r.top + r.height / 2 - sz / 2 + (Math.random() - .5) * 8 + 'px', width: sz + 'px', height: sz + 'px' });
      document.body.append(sp);
      sp.animate([{ opacity: .9, transform: 'scale(1)' }, { opacity: 0, transform: `translate(${(Math.random() - .5) * 14}px, ${6 + Math.random() * 10}px) scale(.2)` }],
        { duration: 420, easing: 'ease-out' }).finished.then(() => sp.remove());
    }
    requestAnimationFrame(trail);
  };
  requestAnimationFrame(trail);
  anim.finished.then(() => {
    fl.remove();
    const ring = document.createElement('i'); ring.className = 'tr-burst'; ring.style.setProperty('--tc', col);
    Object.assign(ring.style, { left: tx - 28 + 'px', top: ty - 28 + 'px' });
    document.body.append(ring);
    ring.animate([{ transform: 'scale(.3)', opacity: .95 }, { transform: 'scale(2.4)', opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)' }).finished.then(() => ring.remove());
    TU.busy = false;
    teach(m, k, i);
  });
}
// tick a coin readout from one value to another
function countCoins(el, a, b){
  if (!el || a === b || REDUCED) return;
  const t0 = performance.now(), D = 420;
  el.classList.add('coins--spend');
  const step = now => {
    const u = Math.min(1, (now - t0) / D), v = Math.round(a + (b - a) * (1 - Math.pow(1 - u, 3)));
    el.textContent = `${v} coins`;
    if (u < 1) requestAnimationFrame(step); else setTimeout(() => el.classList.remove('coins--spend'), 250);
  };
  requestAnimationFrame(step);
}
function teach(m, k, i){
  const coins = R.coins, old = m.taught.length >= TUNE.taughtMax ? m.taught.at(-1) : null;
  R.coins -= price(k);
  if (old) m.taught[m.taught.length - 1] = k; else m.taught.push(k);
  UI.notice = null;
  TU.teaching = null;
  refresh(); toast('party', old ? `${nm(m)} forgot ${MOVES[old].name} and learned ${MOVES[k].name}.` : `${nm(m)} learned ${MOVES[k].name}.`);
  countCoins($('#tutor-coins'), coins, R.coins);
  const el = AREAS['M.party'].els[i]?.el; if (el){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
}
function moveMeta(m){
  return m.kind === 'sup' ? `Support, ${TARGET_NAME[m.target]}${m.heal ? `, heals ${pct(m.heal)}` : ''}`
    : `${SHAPE_NAME[m.shape]}, ${m.power == null ? 'special' : m.power === 0 ? 'no damage' : m.power + '% of Attack'}${m.hits ? `, ×${m.hits[0]}${m.hits[1] !== m.hits[0] ? '–' + m.hits[1] : ''}` : ''}`;
}
// the party in the bottom corner, while a move is picked: who can learn it glows, everyone else dims
// the party in the bottom corner lights up where a tap does something: with a move picked at the Move Tutor, who can
// learn it (the rest dim); placing a wild Pokémon, every slot; feeding a candy, every Pokémon
function hudMarkParty(){
  // at the Poké Mart, with an item picked, the empty bag slots glow and the full ones dim
  const pick = screen === 'scr-item' && MT.picked != null && !martBlock(MT.picked);
  AREAS['M.bag']?.els.forEach(({ el }, i) => {
    el.toggleAttribute('data-learn', pick && !R.bag[i]);
    el.toggleAttribute('data-nolearn', pick && !!R.bag[i]);
  });
  const k = screen === 'scr-tutor' ? TU.teaching : null, place = screen === 'scr-wild' && W.phase === 'place', feed = screen === 'scr-wild' && W.phase === 'feed';
  AREAS['M.party']?.els.forEach(({ el }, i) => {
    const m = R.party[i], can = k ? !!(m && canLearn(m, k)) : place || (feed && !!m);
    el.toggleAttribute('data-learn', can);
    el.toggleAttribute('data-nolearn', (!!k || feed) && !can && !!m);
  });
}
RENDER['scr-tutor'] = () => {
  $('#tutor-coins').textContent = `${R.coins} coins`;
  const box = $('#tutor-moves'), party = partyMons();
  box.innerHTML = TU.offer.length ? TU.offer.map(k => {
    const mv = MOVES[k], afford = R.coins >= price(k), who = party.filter(m => canLearn(m, k)), knows = party.filter(m => known(m).includes(k));
    const none = knows.length ? `${knows.map(nm).join(' and ')} already know${knows.length > 1 ? '' : 's'} it` : 'Nobody in your party can learn it yet';
    return `<div class="mvcard trcard" data-k="${k}" aria-pressed="${TU.teaching === k}" role="button" tabindex="0"${afford ? '' : ' data-block="poor" aria-disabled="true"'}>
      <div class="trcard__slot"></div>
      <div class="trcard__body">
        <span class="mvcard__name">${mv.name} <span class="pill" style="--c:${typeColor(mv.type)}">${cap(mv.type)}</span></span>
        <span class="mvcard__meta">${moveMeta(mv)}, ${ODDS_NAME.toLowerCase()} ${mv.weight}${mv.fx ? `. ${mv.fx}` : ''}</span>
        <span class="mvcard__who">${who.length ? who.map(m => `<img src="${formSprite(FORM[m.form])}" alt="${nm(m)}" title="${nm(m)}">`).join('') : none}</span>
      </div>
      <span class="mvcard__price">${price(k)}<small>${afford ? 'coins' : 'too expensive'}</small></span>
    </div>`;
  }).join('') : `<p class="detail__empty">The tutor has nothing new for your party today. Reroll for new moves.</p>`;
  // each move gets a dynamic slot holding its type's TR; tapping it (or the card) picks the move
  box.querySelectorAll('.trcard').forEach(card => {
    const k = card.dataset.k, mv = MOVES[k];
    const slot = createSlot(e => { e.stopPropagation(); pickTutorMove(k); });
    slot.tabIndex = -1; slot.setAttribute('aria-hidden', 'true');
    card.querySelector('.trcard__slot').append(slot);
    renderSlot(slot, PRESET.tr, { key: 'tr-' + k, sprite: TR_SPR[mv.type] || TR_SPR.normal, type: mv.type, stars: mv.star, name: mv.name + ' TR' }, { interactive: true });
    slot.toggleAttribute('data-selected', TU.teaching === k);
    card.addEventListener('click', () => pickTutorMove(k));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pickTutorMove(k); } });
  });
  const rr = $('#tutor-reroll');
  rr.textContent = `New moves for ${rerollFee()} coins`;
  rr.disabled = R.coins < rerollFee() || TU.busy;
  renderNotice('tutor-notice');
};
$('#tutor-reroll').addEventListener('click', () => {
  if (R.coins < rerollFee() || TU.busy) return;
  R.coins -= rerollFee(); TU.rerolls++; rollTutor(); UI.notice = null; refresh();
});
$('#tutor-leave').addEventListener('click', toMap);

/* ================= daycare ================= */
const DC = { postGym: false };
function openDaycare(postGym){ DC.postGym = postGym; padDaycare(); }
RENDER['scr-daycare'] = () => {
  padDaycare();
  renderArea('D.party'); renderArea('D.day');
  $('#day-title').textContent = DC.postGym ? `Gym ${R.mapNo} cleared` : 'Daycare';
  $('#day-sub').textContent = (DC.postGym ? 'The daycare is open before you head out. ' : '')
    + `Tap a Pokémon to scan it, then another slot to move or swap. The daycare holds ${TUNE.daycareSize}, and its Pokémon earn half as much EXP as your party.`;
  $('#day-count').textContent = `${partyCount()} of 6`;
  $('#day-count2').textContent = `${daycareCount()} of ${TUNE.daycareSize}`;
  renderDetail('day-detail', 'Tap a Pokémon to see its stats and moves.');
  renderNotice('day-notice');
  $('#day-go').textContent = DC.postGym ? `Continue to map ${R.mapNo + 1}` : 'Back to map';
};
$('#day-go').addEventListener('click', () => {
  if (!DC.postGym) return toMap();
  R.mapNo++; R.map = generateMap(randomSeed()); R.at = 'S'; R.trail = ['S'];
  toMap();
});

/* ================= end of run ================= */
function openEnd(won){
  wipeTo('scr-end', () => {
    const party = partyMons().map(m => `<img src="${SPRITES[FORM[m.form].spr]}" alt="${nm(m)}" title="${nm(m)}">`).join('');
    $('#end-body').innerHTML = won
      ? `<h1 class="title">All eight gyms cleared</h1><p class="sub">You finished the run with ${R.lives} ${R.lives === 1 ? 'life' : 'lives'} to spare.</p><div class="endparty">${party}</div><div class="actions"><button class="btn btn--go" id="end-new">Start a new run</button></div>`
      : `<h1 class="title">Out of lives</h1><p class="sub">You made it to map ${R.mapNo} and cleared ${R.gymsBeaten} ${R.gymsBeaten === 1 ? 'gym' : 'gyms'}. Nothing carries over, so the next run starts fresh.</p><div class="endparty">${party}</div><div class="actions"><button class="btn btn--go" id="end-new">Start a new run</button></div>`;
    $('#end-new').addEventListener('click', () => wipeTo('scr-starter', openStarter, { mark: markHTML('🚩', 'New run') }));
  }, { color: won ? 'var(--star-gold)' : 'var(--hp-red)', mark: markHTML(won ? '🏆' : '💔', won ? 'Run complete' : 'Run over') });
}
