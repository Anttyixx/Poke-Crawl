"use strict";
const DATA = __DATA__;
const ITEMS_DATA = __ITEMS__;
const CANDY_SPR = '__CANDY__';
const TR_SPR = __TRS__;                                   // Technical Record sprite per move type

/* ================= data ================= */
const FORMS = DATA.forms, MOVES = DATA.moves, SPRITES = DATA.sprites;
const FORM = Object.fromEntries(FORMS.map(f => [f.id, f]));
const STAT_MAX = { hp: 255, atk: 255, spd: 255 };   // the highest any stat can naturally be; stat bars are drawn against this
const LEARN = {};
for (const [id, m] of Object.entries(MOVES)) for (const f of m.learnableBy) (LEARN[f] ||= []).push(id);
MOVES.struggle = { name:'Struggle', star:1, type:'none', kind:'off', shape:'single', power:20, pp:0, fx:'Used when every move is out of PP. The user takes 12% of its max HP.', role:'—', learnableBy:[] };
const LINES = {};
for (const f of FORMS) ((LINES[f.line] ||= {})[f.star] ||= []).push(f);
const LINE_IDS = Object.keys(LINES);
const STARTERS = ['bulbasaur', 'charmander', 'squirtle'];
const WILD_LINES = LINE_IDS.filter(l => !STARTERS.includes(l));
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
  taughtMax: 2, daycareSize: 10,
  candyExp: .25,                                     // an EXP Candy (left by a released Pokémon) is worth a quarter of a level
  hopSlow: .8,                                       // Pokémon slot-to-slot jumps run 25% faster than the original
  martStock: 4, martRerollStep: 20,
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
const typeColor = t => `var(--t-${t === 'none' || t === 'user' ? 'normal' : t})`;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l2.95 6.3 6.9.75-5.15 4.7 1.45 6.8L12 17.3l-6.15 3.45 1.45-6.8-5.15-4.7 6.9-.75z"/></svg>';
const HEART = '<svg class="heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.9 1.3 5.4 3.2 1.5-1.9 3.3-3.2 5.4-3.2 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z"/></svg>';

/* ================= pokemon + items ================= */
let uidN = 0;
const formFor = (line, star) => LINES[line][star][0].id;           // Gloom's split defaults to its first form (Vileplume)
const known = m => [FORM[m.form].sig, ...m.taught];
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
  m.star++; m.form = formFor(m.line, m.star);
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
function fly(src, start, toEl, { disc = false, slide = false, order = 0, dur } = {}){
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
    const h = Math.min(110, 34 + dist * .22);
    for (let i = 0; i <= 16; i++){
      const t = i / 16, sy = t < .15 ? 1 + .12 * (t / .15) : t > .85 ? 1 - .1 * ((t - .85) / .15) : 1.12 - .22 * ((t - .15) / .7), s = 1 + (sc - 1) * t;
      frames.push({ transform: `translate(${dx * t}px, ${dy * t - 4 * h * t * (1 - t)}px) scale(${s * (2 - sy)}, ${s * sy})`, offset: t });
    }
  }
  const duration = dur ?? (slide ? Math.min(420, 240 + dist * .25) : Math.min(620, 360 + dist * .35) / 1.1 * TUNE.hopSlow);
  return new Promise(res => {
    img.animate(frames, { duration, delay: order * 60, easing: slide ? 'cubic-bezier(.3,.7,.3,1)' : 'linear', fill: 'both' }).onfinish = () => {
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
  'S.offer': { holds:'mon', kind:'offer', preset:'offer', get: () => ST.offer, onTap: i => starterTap(i) },
  'S.pick':  { holds:'mon', kind:'pick', preset:'tpick', get: () => ST.pick, onTap: () => starterReturn() },
  'W.offer': { holds:'mon', kind:'offer', preset:'offer', get: () => W.offer, onTap: i => wildTap(i) },
  'W.pick':  { holds:'mon', kind:'pick', preset:'tpick', get: () => W.pick, onTap: () => wildReturn() },
  'W.party': { holds:'mon', kind:'party', preset:'party', get: () => R.party, onTap: i => W.phase === 'place' ? wildPlace(i) : W.phase === 'feed' ? feedCandy(i) : false },
  'I.bag':   { holds:'item', kind:'bag', preset:'bag', get: () => R.bag, locked: true },
  'M.party': { holds:'mon', kind:'party', preset:'hud', get: () => R.party, equip: true },
  'M.bag':   { holds:'item', kind:'bag', preset:'hud', get: () => R.bag, equip: true },
  'T.line':  { holds:'mon', kind:'offer', preset:'offer', get: () => TU.line, onTap: i => tutorLineTap(i) },
  'T.pick':  { holds:'mon', kind:'pick', preset:'tpick', get: () => TU.pickSlot, onTap: () => tutorReturn() },
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
  if (!A.equip || !mon?.item || A.onTap) return tapSlot(name, i);
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
  refresh(); flip(before);
}

/* ================= detail card ================= */
// a move's level as three stars, filled up to its star rating
const moveStars = n => `<span class="mv__stars" aria-label="${n} star move">${'<i class="on">★</i>'.repeat(n)}${'<i>★</i>'.repeat(3 - n)}</span>`;
function moveRow(k, sig, ppLeft){
  const m = MOVES[k];
  const hits = m.hits ? ` ×${m.hits[0]}${m.hits[1] !== m.hits[0] ? '–' + m.hits[1] : ''}` : '';
  const head = m.kind === 'sup'
    ? `Support, ${TARGET_NAME[m.target] || ''}${m.heal ? `, heals ${pct(m.heal)}` : ''}`
    : `${SHAPE_NAME[m.shape]}, ${m.power == null ? 'special' : `${m.power}% of Attack`}${hits}`;
  const pp = ppLeft == null ? `${m.pp} PP` : `${ppLeft}/${m.pp}`;
  return `<div class="mv${sig ? ' mv--sig' : ''}">
    <span class="mv__name">${sig ? '<i class="mv__sig">Signature</i>' : ''}${m.name} <span class="pill" style="--c:${typeColor(m.type)}">${cap(m.type)}</span>
    <small>${head}</small>${m.fx ? `<small class="mv__fx">${m.fx}</small>` : ''}${moveStars(m.star)}</span>
    <span class="mv__pp${ppLeft === 0 ? ' out' : ''}">${pp}</span></div>`;
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
  return Array.from({ length: TUNE.taughtMax }, (_, j) => {
    const k = m.taught[j];
    const row = k ? moveRow(k, false) : `<div class="mv mv--empty"><span class="mv__name">Empty move slot<small>Taught at a Move Tutor</small></span><span class="mv__pp"></span></div>`;
    return pickable ? `<button class="mvslot" data-slot="${j}" aria-label="Slot ${j + 1}: ${k ? 'replace ' + MOVES[k].name : 'empty'}">${row}</button>` : row;
  }).join('');
}
function monDetail(m, opts = {}){
  const f = FORM[m.form];
  const exp = m.star >= 3 ? 'max' : pct(m.exp);
  return `<div class="dt__head"><span class="dt__name">${f.name}</span><span class="pill" style="--c:${typeColor(f.type)}">${f.type}</span>
      <span class="dt__stars">${'★'.repeat(m.star)}<i>${'★'.repeat(3 - m.star)}</i></span></div>
    <div class="dt__stats"><div><b>${f.hp}</b><span>HP</span></div><div><b>${f.atk}</b><span>Attack</span></div><div><b>${f.spd}</b><span>Speed</span></div><div><b>${exp}</b><span>EXP</span></div></div>
    <div class="mvlist${opts.pickable ? ' mvlist--pick' : ''}">${opts.slots ? moveRow(f.sig, true) + taughtSlotsHTML(m, opts.pickable) : known(m).map((k, i) => moveRow(k, i === 0)).join('')}</div>
    ${m.item ? `<div class="dt__item"><img src="${ITEM[m.item.id].spr}" alt=""><div><b>${ITEM[m.item.id].name}</b><br>${ITEM[m.item.id].fx}</div></div>` : ''}
    <div class="dt__ability"><b>${f.ability.name}.</b> ${f.ability.fx} <i>Abilities aren't active in battle yet.</i></div>`;
}
/* ---------- info slot layout: stats left of the big slot, ability right, moves underneath ----------
   no card around it; every metric sits in its own small container */
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;   // types are shown capitalised
const INFO_AREA = { starter: 'S.pick', wild: 'W.pick', tutor: 'T.pick' };
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
addEventListener('resize', () => ['starter', 'wild', 'tutor'].forEach(k => fitName($(`#${k}-left`))));
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
function refresh(){ RENDER[screen]?.(); updateMapHud(); alignCoins(); }
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
  opt.after?.();
}
const toMap = () => wipeTo('scr-map', null, { color: 'var(--glow-selected)', mark: markHTML('🗺️', `Map ${R.mapNo}`), after: scrollMapToCurrent });

/* ---------- your team and bag on the map ----------
   the party sits bottom-left and the bag 2 by 2 bottom-right. Tap a slot to see it in a popup in the middle
   of the screen; tap another slot to move, swap or hand over an item. Tap it again, the popup, or the map to close. */
function updateMapHud(){
  const on = !wiping && screen === 'scr-map' && !!R.party;
  $('#mapteam').hidden = $('#mapbag').hidden = !on;
  if (on){ renderArea('M.party'); renderArea('M.bag'); }
  const sel = on ? UI.sel : null, c = sel && AREAS[sel.area]?.get()[sel.i], pop = $('#mappop');
  if (c){
    const it = sel.held ? c.item : AREAS[sel.area].holds === 'item' ? c : null;
    const sig = it ? it.uid : `${c.uid}|${c.form}|${c.star}|${c.exp}|${c.item?.uid}`;
    if (pop.dataset.sig !== sig){ pop.dataset.sig = sig; $('#mappop-card').innerHTML = it ? itemDetail(it) : monDetail(c); }
  } else delete pop.dataset.sig;
  setShown('mappop', pop, !!c);
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

/* ================= starter ================= */
// three offers on top, one big slot in the middle; tapping an offer hops it into the slot,
// and its stats appear once it lands. Choose puts it in the front-middle party slot.
const ST = { offer: [], pick: [null], home: -1, landed: false, chosen: false, token: 0 };
function openStarter(){ newRun(); Object.assign(ST, { offer: STARTERS.map(l => makeMon(l, 1)), pick: [null], home: -1, landed: false, chosen: false }); }
async function starterMove(change){
  const before = snapshot(), token = ++ST.token;
  change(); ST.landed = false; refresh();
  await flip(before);
  if (token !== ST.token) return;
  ST.landed = !!ST.pick[0]; refresh();
  if (ST.landed){ revealInfo('starter'); fitName($('#starter-left')); }
}
function starterTap(i){
  if (ST.chosen || wiping || !ST.offer[i]) return;
  starterMove(() => {
    if (ST.pick[0]) ST.offer[ST.home] = ST.pick[0];       // the one in the slot hops back home
    ST.pick[0] = ST.offer[i]; ST.offer[i] = null; ST.home = i;
  });
}
function starterReturn(){
  if (ST.chosen || wiping || !ST.pick[0]) return;
  $('#scr-starter').scrollTop = 0;                      // the offers live mid-screen at the top of the page
  starterMove(() => { ST.offer[ST.home] = ST.pick[0]; ST.pick[0] = null; ST.home = -1; });
}
RENDER['scr-starter'] = () => {
  renderArea('S.offer'); renderArea('S.pick');
  $('#starter-line').classList.toggle('is-away', !!ST.pick[0]);   // picking hides the offers; emptying the slot brings them back
  const c = ST.landed ? ST.pick[0] : null;
  renderInfo('starter', c);                              // stats only appear once a starter has landed
  const go = $('#starter-go');
  go.disabled = !c || ST.chosen;
  setShown('starter-go', go, !!c);                       // only shows once it can be pressed, fading in and out
  go.textContent = 'I Choose You!!';
};
$('#starter-go').addEventListener('click', () => {
  if (!ST.landed || !ST.pick[0] || ST.chosen) return;
  ST.chosen = true; R.party[1] = ST.pick[0];              // front row, middle lane
  const el = AREAS['S.pick'].els[0]?.el; if (el){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  refresh();
  setTimeout(toMap, 450);
});

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
    lines.push({ cls, html: `<line class="${cls}" x1="${n.x}" y1="${n.y}" x2="${b.x}" y2="${b.y}"/>` });
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
function scrollMapToCurrent(){
  const b = document.querySelector(`#nodes .node[data-id="${R.at}"]`), scr = $('#scr-map');
  if (!b) return;
  const r = b.getBoundingClientRect(), sr = scr.getBoundingClientRect();
  scr.scrollTo({ top: scr.scrollTop + r.top - sr.top - sr.height * .62, behavior: REDUCED ? 'auto' : 'smooth' });
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
  if (t === 'wild') return wipeTo('scr-wild', openWild, opt);
  if (t === 'item') return wipeTo('scr-item', openItem, opt);
  if (t === 'tutor') return wipeTo('scr-tutor', openTutor, opt);
  if (t === 'daycare') return wipeTo('scr-daycare', () => openDaycare(false), opt);
  if (t === 'trainer' || t === 'boss' || t === 'legendary') return enterBattle(t, opt);
}

/* ================= wild ================= */
// same layout as the starter screen: three offers, one big slot, a button under it.
// pick phase: tap an offer to hop it into the big slot; the button reads Skip until one has landed, then Choose.
// place phase: the other offers and the info panel fade out, your party fades in where the info was;
// tap a party slot to put the new Pokémon there, or press Send to daycare.
const W = { offer: [], pick: [null], home: -1, landed: false, token: 0, phase: 'pick', done: false };
function openWild(){
  const star = clamp(Math.floor(partyLevel() + .25), 1, 3);   // deliberately at or a touch behind your party
  Object.assign(W, { offer: shuffle([...WILD_LINES]).slice(0, 3).map(l => makeMon(l, star, star < 3 ? Math.random() * .4 : 1)),
    pick: [null], home: -1, landed: false, phase: 'pick', done: false, candy: false, leveled: null });
}
async function wildMove(change){
  const before = snapshot(), token = ++W.token;
  change(); W.landed = false; refresh();
  await flip(before);
  if (token !== W.token) return;
  W.landed = !!W.pick[0]; refresh();
  if (W.landed){ revealInfo('wild'); fitName($('#wild-left')); }
}
function wildTap(i){
  if (W.phase !== 'pick' || wiping || !W.offer[i]) return;
  wildMove(() => { if (W.pick[0]) W.offer[W.home] = W.pick[0]; W.pick[0] = W.offer[i]; W.offer[i] = null; W.home = i; });
}
function wildReturn(){
  if (W.phase !== 'pick' || wiping || !W.pick[0]) return;
  $('#scr-wild').scrollTop = 0;
  wildMove(() => { W.offer[W.home] = W.pick[0]; W.pick[0] = null; W.home = -1; });
}
function wildPlace(i){
  if (W.phase !== 'place' || wiping || !W.pick[0]) return;
  const mon = W.pick[0], here = R.party[i], before = snapshot();
  let msg = `${nm(mon)} joined your party.`;
  if (here){
    const e = firstEmpty(R.party);
    if (e >= 0){ R.party[e] = here; msg += ` ${nm(here)} moved over to make room.`; }
    else if (depositDaycare(here)) msg += ` ${nm(here)} went to the daycare.`;
    else { shake('W.party', i); UI.notice = { text: 'Your party and daycare are both full, so nobody can make room. You can release it instead.' }; return refresh(); }
  }
  R.party[i] = mon; W.pick[0] = null; W.phase = 'done'; W.done = true;
  UI.notice = { ok: true, text: msg };
  refresh(); flip(before);
}
function wildToDaycare(){
  const mon = W.pick[0];
  if (!mon) return;
  const el = AREAS['W.pick'].els[0]?.el, img = el?.querySelector('.slot__sprite img'), box = el && spriteBox(el);
  if (!depositDaycare(mon)){ UI.notice = { text: `The daycare is full (${TUNE.daycareSize} of ${TUNE.daycareSize}). Tap a party slot instead.` }; return refresh(); }
  W.pick[0] = null; W.phase = 'leaving'; W.done = true;
  UI.notice = { ok: true, text: `${nm(mon)} went to the daycare.` };
  if (el){ el.classList.add('depart'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('depart'))); }
  refresh();
  if (el) crossfadeLeave(el, `var(--t-${FORM[mon.form].type})`);
  // it jumps off the screen, then it's straight back to the map
  (el ? jumpOff(img.src, box) : Promise.resolve()).then(() => sleep(REDUCED ? 0 : 120)).then(toMap);
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
  const mon = W.pick[0], el = AREAS['W.pick'].els[0]?.el;
  if (!mon || !el) return;
  const src = el.querySelector('.slot__sprite img').src, box = spriteBox(el);
  W.pick[0] = null; W.candy = true; W.phase = 'feed';
  UI.notice = { ok: true, text: `${nm(mon)} was released. It left an EXP Candy behind: tap a Pokémon to feed it.` };
  el.classList.add('depart'); void el.offsetWidth;
  refresh();
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('depart')));
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  jumpOff(src, box);
}
function feedCandy(i){
  if (W.phase !== 'feed' || wiping) return;
  const m = R.party[i], el = AREAS['W.party'].els[i]?.el, from = AREAS['W.pick'].els[0]?.el;
  if (!m){ shake('W.party', i); UI.notice = { text: 'Tap a Pokémon to feed it the EXP Candy.' }; return refresh(); }
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
  W.candy = false; W.phase = 'done'; W.done = true; UI.notice = { ok: true, text: msg };
  from.classList.add('depart'); void from.offsetWidth;
  refresh();
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
async function wildChoose(){
  if (!W.landed || !W.pick[0] || W.phase !== 'pick') return;
  W.phase = 'fading'; refresh();                       // fade out the info panel and the other offers
  $('#scr-wild').scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });   // bring the header back into view
  await sleep(REDUCED ? 0 : 220);
  if (W.phase !== 'fading') return;
  W.phase = 'place'; refresh();                        // then the party appears where the info was
}
$('#wild-leave').addEventListener('click', toMap);
$('#wild-go').addEventListener('click', () => {
  if (W.phase === 'pick') return W.landed && W.pick[0] ? wildChoose() : null;
  if (W.phase === 'place') return mustRelease() ? wildRelease() : wildToDaycare();
  if (W.phase === 'leaving') return;
  if (W.phase === 'done') return toMap();
});
RENDER['scr-wild'] = () => {
  renderArea('W.offer'); renderArea('W.pick'); renderArea('W.party');
  if (W.candy){       // the released Pokémon's EXP Candy sits in the big slot until it's fed to someone
    const el = AREAS['W.pick'].els[0].el;
    renderSlot(el, PRESET.pick, { key: 'candy', sprite: CANDY_SPR, type: 'held', name: 'EXP Candy' }, { interactive: false });
    if (!el._hold) slotLabel(el).textContent = 'EXP Candy';
  }
  const root = $('#wild-root'), placing = W.phase !== 'pick';
  root.classList.toggle('wild--fading', W.phase === 'fading');
  $('#wild-line').classList.toggle('is-away', !!W.pick[0] || W.phase !== 'pick');   // only the pick phase shows the offers
  root.classList.toggle('wild--placing', ['place', 'feed', 'done', 'leaving'].includes(W.phase));
  const c = W.landed ? W.pick[0] : null;
  if (W.phase === 'pick') renderInfo('wild', c);
  else if (W.phase !== 'fading') renderInfo('wild', null);   // the party takes over once chosen
  const party = $('#wild-party'), showParty = ['place', 'feed', 'done', 'leaving'].includes(W.phase);
  if (showParty && party.hidden){ party.hidden = false; party.classList.remove('reveal'); void party.offsetWidth; party.classList.add('reveal'); }
  if (!showParty) party.hidden = true;
  if (W.phase === 'place' || W.phase === 'feed') AREAS['W.party'].els.forEach(({ el }, i) => el.toggleAttribute('data-target', W.phase === 'place' || !!R.party[i]));
  $('#wild-count').textContent = `${partyCount()} of 6`;
  $('#wild-day').textContent = `Daycare ${daycareCount()} of ${TUNE.daycareSize}`;
  renderNotice('wild-notice');
  const go = $('#wild-go');
  go.classList.remove('btn--release');
  setShown('wild-go', go, W.phase === 'pick' ? !!c : W.phase !== 'done');   // fades in and out like the info boxes
  if (W.phase === 'pick'){ go.textContent = 'I Choose You!!'; go.disabled = !c; go.classList.add('btn--go'); }
  else if (W.phase === 'fading'){ go.disabled = true; }
  else if (W.phase === 'place' && mustRelease()){ go.textContent = 'Release'; go.disabled = false; go.classList.remove('btn--go'); go.classList.add('btn--release'); }
  else if (W.phase === 'place'){ go.textContent = 'Send to daycare'; go.disabled = daycareFull(); go.classList.remove('btn--go'); }
  else if (W.phase === 'feed'){ go.textContent = 'Feed a Pokémon'; go.disabled = true; go.classList.remove('btn--go'); }
  else if (W.phase === 'leaving'){ go.disabled = true; }
  $('#wild-leave').hidden = W.phase !== 'done';
};

/* ================= poké mart ================= */
const MT = { stock: [], sold: new Set(), rerolls: 0 };
const itemPrice = id => TUNE.itemPrice[id] ?? 80;
const martRerollFee = () => TUNE.martRerollStep * (MT.rerolls + 1);
function rollMart(){ MT.stock = shuffle([...ITEM_IDS]).slice(0, TUNE.martStock); MT.sold = new Set(); }
function openItem(){ MT.rerolls = 0; rollMart(); }
function buy(i){
  const id = MT.stock[i], cost = itemPrice(id), slot = R.bag.indexOf(null);
  if (MT.sold.has(i)) return;
  if (R.coins < cost){ UI.notice = { text: `You need ${cost} coins for the ${ITEM[id].name}.` }; return refresh(); }
  if (slot < 0){ UI.notice = { text: 'Your bag is full. Give an item to a Pokémon on the map first.' }; return refresh(); }
  const img = document.querySelector(`#mart-stock .mcard[data-i="${i}"] img`), r = img.getBoundingClientRect();
  const start = { x: r.left, y: r.top, size: r.width };
  const el = AREAS['I.bag'].els[slot]?.el, prev = el && { args: el._last, label: slotLabel(el)?.textContent ?? '' };
  R.coins -= cost; R.bag[slot] = makeItem(id); MT.sold.add(i);
  UI.notice = { ok: true, text: `Bought the ${ITEM[id].name}. It's in your bag.` };
  refresh();
  if (el && !REDUCED){ holdSlot(el, prev.args, prev.label); el.classList.add('arriving'); fly(img.src, start, el, { slide: true }); }
}
RENDER['scr-item'] = () => {
  $('#mart-coins').textContent = `${R.coins} coins`;
  const bagFull = R.bag.indexOf(null) < 0;
  $('#mart-stock').innerHTML = MT.stock.map((id, i) => {
    const it = ITEM[id], cost = itemPrice(id), sold = MT.sold.has(i);
    const why = sold ? 'Sold' : R.coins < cost ? 'Not enough coins' : bagFull ? 'Bag full' : '';
    return `<div class="mvcard mcard" data-i="${i}"${sold ? ' data-sold' : ''}>
      <img src="${it.spr}" alt="">
      <span class="mcard__name">${it.name}</span>
      <span class="mcard__buy"><b>${cost}</b><button class="btn btn--go" data-buy="${i}"${why ? ' disabled' : ''}>${sold ? 'Sold' : 'Buy'}</button></span>
      <span class="mcard__fx">${it.fx}</span></div>`;
  }).join('');
  $('#mart-stock').querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => buy(+b.dataset.buy)));
  renderArea('I.bag');
  $('#item-count').textContent = `${R.bag.filter(Boolean).length} of ${TUNE.bagSize}`;
  renderNotice('item-notice');
  const rr = $('#mart-reroll');
  rr.textContent = `New stock for ${martRerollFee()} coins`;
  rr.disabled = R.coins < martRerollFee();
};
$('#mart-reroll').addEventListener('click', () => {
  if (R.coins < martRerollFee()) return;
  R.coins -= martRerollFee(); MT.rerolls++; rollMart(); UI.notice = null; refresh();
});
$('#mart-leave').addEventListener('click', toMap);

/* ================= move tutor ================= */
// starter layout: your party across the top, one big slot in the middle. Tap a Pokémon to hop it into the
// slot; once it lands its stats and moves appear, and under them the tutor's moves it can learn.
// Teach one, then pick which of its 2 taught slots it goes into. The tutor still offers 5 moves per visit,
// each learnable by someone in the party, and the offer can be rerolled.
const TU = { offer: [], rerolls: 0, line: [], pickSlot: [null], home: -1, landed: false, token: 0, teaching: null, taught: new Map() };
const canLearn = (m, k) => learnable(m).includes(k);
const price = k => TUNE.tutorPrice[MOVES[k].star];
const rerollFee = () => TUNE.rerollStep * (TU.rerolls + 1);
function rollTutor(){
  const party = partyMons(), offered = [];
  let universal = 0;
  const ok = k => !offered.includes(k) && (MOVES[k].role !== 'universal' || universal < 1);
  for (let s = 0; s < 5; s++){
    const who = shuffle(party.filter(m => learnable(m).some(ok)));
    if (!who.length) break;
    const k = pick(learnable(who[0]).filter(ok));
    if (MOVES[k].role === 'universal') universal++;
    offered.push(k);
  }
  TU.offer = offered; TU.teaching = null; TU.taught = new Map();
}
function openTutor(){
  TU.rerolls = 0; rollTutor();
  Object.assign(TU, { line: partyMons(), pickSlot: [null], home: -1, landed: false, teaching: null });
}
const tutorMon = () => TU.landed ? TU.pickSlot[0] : null;
async function tutorMove(change){
  const before = snapshot(), token = ++TU.token;
  change(); TU.landed = false; TU.teaching = null; refresh();
  await flip(before);
  if (token !== TU.token) return;
  TU.landed = !!TU.pickSlot[0]; refresh();
  if (TU.landed){ revealInfo('tutor'); fitName($('#tutor-left')); }
  if (TU.landed) for (const id of ['#tutor-learn']){ const d = $(id); d.classList.remove('reveal'); void d.offsetWidth; d.classList.add('reveal'); }
}
function tutorLineTap(i){
  if (wiping || !TU.line[i]) return;
  UI.notice = null;
  tutorMove(() => { if (TU.pickSlot[0]) TU.line[TU.home] = TU.pickSlot[0]; TU.pickSlot[0] = TU.line[i]; TU.line[i] = null; TU.home = i; });
}
function tutorReturn(){
  if (wiping || !TU.pickSlot[0] || TU.busy) return;
  UI.notice = null;
  $('#scr-tutor').scrollTop = 0;                        // the party row lives mid-screen at the top of the page
  tutorMove(() => { TU.line[TU.home] = TU.pickSlot[0]; TU.pickSlot[0] = null; TU.home = -1; });
}
function startTeach(k){
  const m = tutorMon(); if (!m || TU.busy) return;
  if (R.coins < price(k)){ UI.notice = { text: `You need ${price(k)} coins to teach ${MOVES[k].name}.` }; return refresh(); }
  TU.teaching = TU.teaching === k ? null : k;
  UI.notice = null;                                      // the glowing slots say it all; no instruction line
  refresh();
  if (TU.teaching) $('#tutor-detail .mvslot')?.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
}
// Teaching with a TR, in four beats:
//  1. lift-off  - the disc pops up out of its slot, the move card starts folding away, the other slot stops glowing
//  2. flight    - it arcs over to the chosen move, spinning and shrinking to 60%, leaving a trail of type-coloured sparks
//  3. arrival   - it spins down and fades into the row while a ring bursts out; the old move fades out underneath
//  4. learned   - the new move fades in with a shine sweeping across it and the coins count down
function sendTR(m, k, slot, target){
  if (TU.busy) return;
  const card = document.querySelector(`#tutor-moves .trcard[data-k="${k}"]`), src = card?.querySelector('.slot');
  if (!src || REDUCED) return teach(m, k, slot);
  TU.busy = true;
  const mv = MOVES[k], col = typeColor(mv.type);
  const detail = $('#tutor-detail'), row = target.querySelector('.mv') || target;
  // only the chosen slot keeps glowing
  detail.querySelectorAll('.mvslot').forEach(b => b.classList.toggle('mvslot--chosen', b === target));
  detail.classList.add('is-sending');

  const img = src.querySelector('.slot__sprite img'), from = spriteBox(src), to = row.getBoundingClientRect();
  src.classList.add('depart'); void src.offsetWidth; src.dataset.state = 'empty';           // the TR leaves its slot
  const fl = document.createElement('img'); fl.className = 'hopper tr-flyer'; fl.src = img.src; fl.alt = '';
  fl.style.setProperty('--tc', col);
  Object.assign(fl.style, { left: from.x + 'px', top: from.y + 'px', width: from.size + 'px', height: from.size + 'px' });
  document.body.append(fl);

  // the arc: a quadratic curve from the slot to the middle of the move row, bowed upward
  const sx = from.x + from.size / 2, sy = from.y + from.size / 2;
  const tx = to.left + Math.min(to.width / 2, 70), ty = to.top + to.height / 2;              // lands near the move's name
  const dx = tx - sx, dy = ty - sy, dist = Math.hypot(dx, dy);
  const cx = dx * .5 + (dx >= 0 ? -1 : 1) * Math.min(90, dist * .18), cy = dy * .5 - Math.min(140, 50 + dist * .25);
  const LIFT = 130, FLY = Math.round(Math.min(720, 420 + dist * .35)), LAND = 260, total = LIFT + FLY + LAND;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;              // easeInOutCubic
  const frames = [
    { offset: 0,             transform: 'translate(0,0) rotate(0deg) scale(1)',        opacity: 1 },
    { offset: LIFT / total,  transform: 'translate(0,-10px) rotate(-12deg) scale(1.18)', opacity: 1 }
  ];
  const N = 14;
  for (let s = 1; s <= N; s++){
    const u = ease(s / N), x = 2 * (1 - u) * u * cx + u * u * dx, y = 2 * (1 - u) * u * cy + u * u * dy - 10 * (1 - u);
    frames.push({ offset: (LIFT + FLY * s / N) / total,
      transform: `translate(${x}px, ${y}px) rotate(${-12 + 552 * u}deg) scale(${1.18 - .58 * u})`, opacity: 1 });
  }
  frames.push({ offset: 1, transform: `translate(${dx}px, ${dy}px) rotate(760deg) scale(.6)`, opacity: 0 });
  const anim = fl.animate(frames, { duration: total, easing: 'linear', fill: 'forwards' });

  // the card folds away while the disc is in the air, so the list closes up instead of jumping
  const h = card.getBoundingClientRect().height;
  card.animate([{ height: h + 'px', opacity: 1, marginBottom: '0px' }, { height: '0px', opacity: 0, marginBottom: '-12px', paddingTop: '0px', paddingBottom: '0px' }],
    { duration: 420, delay: LIFT + 220, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
  card.style.overflow = 'hidden';

  // sparks trail behind the disc during the flight
  const t0 = performance.now(); let last = 0;
  const trail = now => {
    const t = now - t0;
    if (t > LIFT + FLY) return;
    if (t > LIFT && now - last > 34){
      last = now;
      const r = fl.getBoundingClientRect(), s = document.createElement('i');
      s.className = 'tr-spark'; s.style.setProperty('--tc', col);
      const sz = 4 + Math.random() * 5;
      Object.assign(s.style, { left: r.left + r.width / 2 - sz / 2 + (Math.random() - .5) * 8 + 'px', top: r.top + r.height / 2 - sz / 2 + (Math.random() - .5) * 8 + 'px', width: sz + 'px', height: sz + 'px' });
      document.body.append(s);
      s.animate([{ opacity: .9, transform: 'scale(1)' }, { opacity: 0, transform: `translate(${(Math.random() - .5) * 14}px, ${6 + Math.random() * 10}px) scale(.2)` }],
        { duration: 420, easing: 'ease-out' }).finished.then(() => s.remove());
    }
    requestAnimationFrame(trail);
  };
  requestAnimationFrame(trail);

  // arrival: a ring bursts from the landing point and the old move fades out under the disc
  setTimeout(() => {
    const ring = document.createElement('i'); ring.className = 'tr-burst'; ring.style.setProperty('--tc', col);
    Object.assign(ring.style, { left: tx - 28 + 'px', top: ty - 28 + 'px' });
    document.body.append(ring);
    ring.animate([{ transform: 'scale(.3)', opacity: .95 }, { transform: 'scale(2.4)', opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)' }).finished.then(() => ring.remove());
    row.classList.add('mv--receiving'); row.style.setProperty('--tc', col);
    for (const c of row.children) c.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-3px)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
  }, LIFT + FLY - 40);

  anim.finished.then(() => {
    fl.remove(); TU.busy = false;
    const coinsBefore = R.coins, oldH = row.getBoundingClientRect().height, rr = $('#tutor-reroll'), rrTop = rr.getBoundingClientRect().top;
    detail.classList.remove('is-sending');
    teach(m, k, slot);                                   // the move only changes once the TR is gone
    const nrow = $('#tutor-detail').querySelectorAll('.mv')[slot + 1];
    if (nrow){
      nrow.style.setProperty('--tc', col); nrow.classList.add('mv--learned');
      for (const c of nrow.children) c.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
      // the new move may be taller or shorter than the old one: ease the row to its new height so nothing below jumps
      const newH = nrow.getBoundingClientRect().height;
      if (Math.abs(newH - oldH) > 1) nrow.animate([{ height: oldH + 'px' }, { height: newH + 'px' }], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
      setTimeout(() => nrow.classList.remove('mv--learned'), 1100);
    }
    // whatever is left of the TR list glides from where it was rather than snapping (the folded card is gone now)
    const shift = rrTop - rr.getBoundingClientRect().top;
    if (Math.abs(shift) > 1) $('#tutor-learn').animate([{ transform: `translateY(${shift}px)` }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
    countCoins($('#tutor-coins'), coinsBefore, R.coins);
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
function teach(m, k, slot){
  R.coins -= price(k);
  let msg = `${nm(m)} learned ${MOVES[k].name}.`;
  if (m.taught[slot]){ msg = `${nm(m)} forgot ${MOVES[m.taught[slot]].name} and learned ${MOVES[k].name}.`; m.taught[slot] = k; }
  else m.taught.push(k);                     // empty slots always sit at the end, so this fills the one picked
  (TU.taught.get(k) || TU.taught.set(k, []).get(k)).push(m.uid);
  TU.teaching = null; UI.notice = null;                // no learned / forgot line
  refresh();
  const el = AREAS['T.pick'].els[0]?.el; if (el){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
}
function moveMeta(m){
  return m.kind === 'sup' ? `Support, ${TARGET_NAME[m.target]}${m.heal ? `, heals ${pct(m.heal)}` : ''}`
    : `${SHAPE_NAME[m.shape]}, ${m.power == null ? 'special' : m.power + '% of Attack'}${m.hits ? `, ×${m.hits[0]}${m.hits[1] !== m.hits[0] ? '–' + m.hits[1] : ''}` : ''}`;
}
RENDER['scr-tutor'] = () => {
  $('#tutor-coins').textContent = `${R.coins} coins`;
  // phones: 5-6 Pokémon wrap into two rows of 3 so the slots keep their full size
  const line = $('[data-area="T.line"]'), n = Math.max(1, TU.line.length);
  line.style.setProperty('--n', innerWidth <= 520 && n > 4 ? 3 : n);
  renderArea('T.line'); renderArea('T.pick');
  // a Pokémon in the big slot (landed or on its way) hides the party row; emptying it brings the row back
  $('#tutor-line').classList.toggle('is-away', !!TU.pickSlot[0]);
  const m = tutorMon();
  renderInfo('tutor', m, { pickable: !!TU.teaching }); const d = $('#tutor-detail');
  if (m && TU.teaching) d.querySelectorAll('.mvslot').forEach(b => b.addEventListener('click', () => sendTR(m, TU.teaching, +b.dataset.slot, b)));
  const learn = $('#tutor-learn');
  if (m){ cancelFade('tutor-learn', [learn]); learn.hidden = false; } else fadeOutGroup('tutor-learn', [learn], false);
  if (m){
    const list = TU.offer.filter(k => canLearn(m, k));
    const vest = m.item?.id === 'assault-vest' && TU.offer.some(k => MOVES[k].kind === 'sup' && !known(m).includes(k));
    $('#tutor-learn-title').textContent = `Moves ${nm(m)} can learn`;
    $('#tutor-learn-sub').textContent = `${TUNE.taughtMax - m.taught.length} of ${TUNE.taughtMax} taught slots open`;
    const box = $('#tutor-moves');
    box.innerHTML = list.length ? list.map(k => {
      const mv = MOVES[k], afford = R.coins >= price(k);
      return `<div class="mvcard trcard" data-k="${k}" aria-pressed="${TU.teaching === k}">
        <div class="trcard__slot"></div>
        <div class="trcard__body">
          <span class="mvcard__name">${mv.name} <span class="pill" style="--c:${typeColor(mv.type)}">${cap(mv.type)}</span></span>
          <span class="mvcard__meta">${moveMeta(mv)}, ${mv.pp} PP${mv.fx ? `. ${mv.fx}` : ''}</span>
        </div>
        <span class="mvcard__price">${price(k)}<small>${afford ? 'coins' : 'need more'}</small></span>
      </div>`;
    }).join('') : `<p class="detail__empty">None of today's moves suit ${nm(m)}${vest ? ' (its Assault Vest blocks support moves)' : ''}. Try another Pokémon, or reroll for new moves.</p>`;
    // each move gets a dynamic slot holding its type's TR; tapping it (or the card) picks the move
    box.querySelectorAll('.trcard').forEach(card => {
      const k = card.dataset.k, mv = MOVES[k];
      const slot = createSlot(e => { e.stopPropagation(); startTeach(k); });
      slot.tabIndex = 0; slot.setAttribute('role', 'button'); slot.setAttribute('aria-label', `${mv.name} TR`);
      card.querySelector('.trcard__slot').append(slot);
      renderSlot(slot, PRESET.tr, { key: 'tr-' + k, sprite: TR_SPR[mv.type] || TR_SPR.normal, type: mv.type, stars: mv.star, name: mv.name + ' TR' }, { interactive: true });
      slot.toggleAttribute('data-selected', TU.teaching === k);
      card.addEventListener('click', () => startTeach(k));
    });
    const rr = $('#tutor-reroll');
    rr.textContent = `New moves for ${rerollFee()} coins`;
    rr.disabled = R.coins < rerollFee();
  }
  renderNotice('tutor-notice');
};
$('#tutor-reroll').addEventListener('click', () => {
  if (R.coins < rerollFee()) return;
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
    + `Tap a Pokémon, then another slot to move or swap. The daycare holds ${TUNE.daycareSize}, and its Pokémon earn half as much EXP as your party.`;
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
