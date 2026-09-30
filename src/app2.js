
/* ================= BATTLE (engine from Battle System Testing, 04-battle-system.md) ================= */
const CHART = {
  normal:{rock:.5,ghost:0,steel:.5},
  fire:{fire:.5,water:.5,grass:2,ice:2,bug:2,rock:.5,dragon:.5,steel:2},
  water:{fire:2,water:.5,grass:.5,ground:2,rock:2,dragon:.5},
  electric:{water:2,electric:.5,grass:.5,ground:0,flying:2,dragon:.5},
  grass:{fire:.5,water:2,grass:.5,poison:.5,ground:2,flying:.5,bug:.5,rock:2,dragon:.5,steel:.5},
  ice:{fire:.5,water:.5,grass:2,ice:.5,ground:2,flying:2,dragon:2,steel:.5},
  fighting:{normal:2,ice:2,poison:.5,flying:.5,psychic:.5,bug:.5,rock:2,ghost:0,dark:2,steel:2,fairy:.5},
  poison:{grass:2,poison:.5,ground:.5,rock:.5,ghost:.5,steel:0,fairy:2},
  ground:{fire:2,electric:2,grass:.5,poison:2,flying:0,bug:.5,rock:2,steel:2},
  flying:{electric:.5,grass:2,fighting:2,bug:2,rock:.5,steel:.5},
  psychic:{fighting:2,poison:2,psychic:.5,dark:0,steel:.5},
  bug:{fire:.5,grass:2,fighting:.5,poison:.5,flying:.5,psychic:2,ghost:.5,dark:2,steel:.5,fairy:.5},
  rock:{fire:2,ice:2,fighting:.5,ground:.5,flying:2,bug:2,steel:.5},
  dark:{fighting:.5,psychic:2,ghost:2,dark:.5,fairy:.5},
  steel:{fire:.5,water:.5,electric:.5,ice:2,rock:2,steel:.5,fairy:2},
  dragon:{dragon:2,steel:.5,fairy:0},
  fairy:{fire:.5,fighting:2,poison:.5,dragon:2,dark:2,steel:.5},
};
const eff = (at, dt) => (CHART[at] && dt in CHART[at]) ? CHART[at][dt] : 1;
const FIRST_ROUND = new Set(['quick-attack','mach-punch']);
const ALWAYS_FIRST = new Set(['extreme-speed']);
const DRAIN = { 'draining-kiss':.5, 'leech-life':.5, 'absorb':.5, 'mega-drain':.5 };
const RECOIL = { 'take-down':.25, 'double-edge':.33, 'volt-tackle':.2 };
const RECHARGE = new Set(['hyper-beam','blast-burn']);
const IGNORE_GUARD = new Set(['brick-break','skyward-dive']);
const SPD_DROP = { 'mud-shot':.1, 'icy-wind':.1, 'string-shot':.15, 'rock-tomb':.15, 'mud-slap':.1, 'stun-spore':.15, 'sticky-web':.25 };
const ATK_DROP = { 'growl':.1 };
const DOTS = { 'smog':[5,5], 'poison-fang':[5,5], 'toxic':[5,10,15] };
const USER_TYPE = new Set(['hidden-power','tera-blast']);
const NO_METRONOME = new Set(['metronome','mirror-move','counter','last-resort','struggle']);
const CHOICE = new Set(['choice-band','choice-specs','choice-scarf']);
const AREA_SHAPES = new Set(['splash','row','back','field']);
const SIDE_MOVES = new Set(['reflect','light-screen','wide-guard','safeguard','wish']);

const SIDES = ['you','opp'];
let lineup = null, board = null, sideSt = null, round = 0, ctx = null, running = false, battleToken = 0, uidSeq = 0;
let speed = 2, speedPref = 2, countAbort = null;
const turnOf = new Map();
const B = { enc: null, slotEls: { you:[[],[]], opp:[[],[]] } };

/* ---------- encounters: the opponent always fields as many Pokémon as you do ---------- */
function enemyUnit(line, star, mul, nMoves, item, formId){
  const f = FORM[formId || pick(LINES[line][star]).id];
  const pool = (LEARN[f.id] || []).filter(k => k !== f.sig && MOVES[k].star <= star && !(item === 'assault-vest' && MOVES[k].kind === 'sup'));
  const off = shuffle(pool.filter(k => MOVES[k].kind === 'off')), sup = shuffle(pool.filter(k => MOVES[k].kind === 'sup'));
  const moves = [f.sig];
  while (moves.length < 1 + nMoves && (off.length || sup.length)) moves.push((off.length && (Math.random() < .75 || !sup.length)) ? off.pop() : sup.pop());
  return { form: f.id, moves, item, mul };
}
function buildEncounter(kind){
  // each opponent mirrors one of your Pokémon's levels, so a mixed-level party meets a mixed-level team
  const mons = partyMons(), n = mons.length, bonus = TUNE.perMap * (R.mapNo - 1);
  const stars = mons.map(m => m.star).sort((a, b) => b - a);
  const nMoves = extra => clamp(1 + Math.floor((R.mapNo - 1) / 3) + extra, 1, TUNE.taughtMax);
  const item = p => Math.random() < p ? pick(ITEM_IDS) : null;
  // on maps 1-2, trainers skip lines that hit your Pokémon super-effectively, so an unlucky
  // type matchup can't cost a life before you've had a chance to build
  const types = mons.map(m => FORM[m.form].type);
  const gentle = LINE_IDS.filter(l => !types.some(t => eff(LINES[l][1][0].type, t) > 1));
  const trainerLine = () => pick(R.mapNo <= 2 && gentle.length ? gentle : LINE_IDS);
  const enc = { kind, team: [] };
  if (kind === 'trainer'){
    enc.title = pick(TRAINERS); enc.sub = `Sends out ${n} Pokémon to match yours.`;
    for (let k = 0; k < n; k++){
      const s = Math.max(1, stars[k] - (Math.random() < TUNE.trainerDrop ? 1 : 0));
      enc.team.push(enemyUnit(trainerLine(), s, TUNE.enemyMul.trainer + bonus, nMoves(0), item(R.mapNo >= 3 ? .2 : 0)));
    }
  } else if (kind === 'boss'){
    const g = GYMS[R.mapNo - 1], typed = LINE_IDS.filter(l => LINES[l][1][0].type === g.type);
    enc.title = g.name; enc.sub = `Gym ${R.mapNo}, ${cap(g.type)} type. Sends out ${n} Pokémon to match yours.`;
    for (let k = 0; k < n; k++){
      const line = typed.length > 1 || Math.random() < .7 ? pick(typed) : pick(LINE_IDS);
      enc.team.push(enemyUnit(line, stars[k], TUNE.enemyMul.boss + bonus, nMoves(1), item(R.mapNo >= 3 ? .35 : 0)));
    }
  } else {
    const line = pick(WILD_LINES), ls = clamp(stars[0] + 1, 1, 3), form = formFor(line, ls);
    enc.legend = { line, star: ls };
    enc.title = `Legendary ${FORM[form].name}`; enc.sub = 'Beat its team to capture it. A stand-in until the roster has real legendaries.';
    enc.team.push(enemyUnit(line, ls, TUNE.enemyMul.legendary + bonus, nMoves(1), pick(ITEM_IDS), form));
    for (let k = 1; k < n; k++) enc.team.push(enemyUnit(pick(LINE_IDS), Math.max(1, stars[k] - 1), TUNE.enemyMul.trainer + bonus, nMoves(0), null));
  }
  return enc;
}

function freshStatus(){
  return { atkMod:0, spdMod:0, shields:[], protect:false, focus:false, skip:0, rage:0, rollout:0, used:new Set(),
    lastHit:null, hitThisRound:false, vuln:0, mist:false, dots:[], seed:null, lastMove:null, planned:null, lock:null, sashUsed:false, wpUsed:false };
}
function freshBoard(){
  board = {}; sideSt = {};
  for (const side of SIDES){
    board[side] = [[null,null,null],[null,null,null]];
    sideSt[side] = { reflect:0, screen:0, wideGuard:0, safeguard:false, fainted:false, wishes:[] };
    for (const { cell, unit } of lineup[side]){
      const f = FORM[unit.form], it = unit.item;
      const maxHp = Math.round(f.hp * unit.mul * (it === 'assault-vest' ? 1.25 : 1));
      const u = { ...unit, uid: ++uidSeq, name: f.name, type: f.type, level: f.star, maxHp, hp: maxHp,
        atk: f.atk * unit.mul * (it === 'choice-band' ? 1.5 : 1), spd: f.spd * (it === 'choice-scarf' ? 1.5 : 1), bag: [], st: freshStatus() };
      u.moves.forEach(m => { for (let i = 0; i < MOVES[m].pp; i++) u.bag.push(m); });
      board[side][Math.floor(cell / 3)][cell % 3] = u;
    }
  }
  turnOf.clear();
}
const living = side => board[side].flat().filter(Boolean);
function find(u){ for (let r = 0; r < 2; r++) for (let l = 0; l < 3; l++) if (board[u.side][r][l] === u) return { row:r, lane:l }; return null; }
const foe = side => side === 'you' ? 'opp' : 'you';
const effAtk = u => Math.max(1, u.atk * Math.max(.1, 1 + u.st.atkMod));
const effSpd = u => Math.max(1, u.spd * Math.max(.1, 1 + u.st.spdMod));

/* ---------- battlefield slots ---------- */
function buildField(){
  document.querySelectorAll('.bf__row').forEach(row => {
    const side = row.dataset.side, r = +row.dataset.row;
    for (let l = 0; l < 3; l++){
      const wrap = document.createElement('div'); wrap.className = 'slotwrap';
      const el = createSlot(); el.dataset.side = side;
      const name = document.createElement('div'); name.className = 'slotname';
      wrap.append(el, name); row.append(wrap);
      B.slotEls[side][r][l] = { el, name };
      el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') showTip(side, r, l); });
      el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hideTip(); });
      el.addEventListener('click', e => { e.stopPropagation(); tipAt && tipAt.el === el ? hideTip() : showTip(side, r, l); });
    }
  });
}
const unitView = u => u && { key: 'u' + u.uid, sprite: SPRITES[FORM[u.form].spr], type: u.type, stars: u.level, hp: Math.max(0, u.hp / u.maxHp),
  held: u.item ? ITEM[u.item].spr : null, heldKey: u.item ? 'h' + u.uid : undefined, name: u.name };
function renderBattle(){
  for (const side of SIDES) for (let r = 0; r < 2; r++) for (let l = 0; l < 3; l++){
    const u = board[side][r][l], s = B.slotEls[side][r][l];
    renderSlot(s.el, PRESET.battle, unitView(u), { turn: u ? turnOf.get(u.uid) : null, label: u ? `${u.name}, ${Math.max(0, u.hp)} of ${u.maxHp} HP` : '' });
    s.name.innerHTML = u ? `<small>${Math.max(0, u.hp)}/${u.maxHp}</small>` : '';   // HP only; no names under slots
  }
  refreshTip();
}
const render = renderBattle;
const elOf = u => { const p = find(u); return p ? B.slotEls[u.side][p.row][p.lane].el : null; };
function setTurn(u, t){ if (!u) return; if (t) turnOf.set(u.uid, t); else turnOf.delete(u.uid); const el = elOf(u); if (el){ if (t) el.dataset.turn = t; else delete el.dataset.turn; } }

/* ---------- tap / hover card ---------- */
const tip = $('#tip');
let tipAt = null;
function modLine(u){
  const s = u.st, out = [];
  if (s.atkMod) out.push(`Attack ${s.atkMod > 0 ? '+' : ''}${pct(s.atkMod)}`);
  if (s.spdMod) out.push(`Speed ${s.spdMod > 0 ? '+' : ''}${pct(s.spdMod)}`);
  const sh = s.shields.reduce((a, x) => a + x.n, 0); if (sh) out.push(`${sh} guarded hit${sh > 1 ? 's' : ''}`);
  if (s.protect) out.push('protected');
  if (s.focus) out.push('focused');
  if (s.skip) out.push(`recharging ${s.skip}`);
  if (s.dots.length || s.seed) out.push('losing HP each round');
  if (s.lock) out.push(`locked into ${MOVES[s.lock].name}`);
  return out.join(', ');
}
function tipHTML(u){
  const count = k => u.bag.filter(x => x === k).length;
  const mods = modLine(u);
  return `<div class="tip__head"><span class="tip__name">${u.name} <span class="dt__stars">${'★'.repeat(u.level)}</span></span>
      <span class="tip__side" style="color:var(--${u.side === 'you' ? 'you' : 'foe'})">${u.side === 'you' ? 'Yours' : 'Opponent'}</span></div>
    <span class="pill" style="--c:${typeColor(u.type)}">${u.type}</span>
    <div class="tip__stats"><div class="tip__stat"><b>${Math.max(0, u.hp)}/${u.maxHp}</b><span>HP</span></div>
      <div class="tip__stat"><b>${Math.round(effAtk(u))}</b><span>Attack</span></div><div class="tip__stat"><b>${Math.round(effSpd(u))}</b><span>Speed</span></div></div>
    ${mods ? `<div class="tip__mods">${mods}</div>` : ''}
    <div class="mvlist">${u.moves.map((k, i) => moveRow(k, i === 0, count(k))).join('')}</div>
    ${u.item ? `<div class="dt__item"><img src="${ITEM[u.item].spr}" alt=""><div><b>${ITEM[u.item].name}</b><br>${ITEM[u.item].fx}</div></div>` : ''}
    <div class="tip__foot">${u.bag.length} PP left${u.bag.length ? '' : ', using Struggle'}</div>`;
}
function placeTip(el){
  const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight, pad = 8;
  let x = r.right + 10, y = r.top + r.height / 2 - h / 2;
  if (x + w > innerWidth - pad) x = r.left - w - 10;
  if (x < pad){ x = Math.min(Math.max(pad, r.left + r.width / 2 - w / 2), innerWidth - w - pad); y = r.bottom + 10; if (y + h > innerHeight - pad) y = r.top - h - 10; }
  y = Math.min(Math.max(pad, y), innerHeight - h - pad);
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
function showTip(side, r, l){
  const u = board?.[side][r][l];
  if (!u) return hideTip();
  tipAt = { side, r, l, el: B.slotEls[side][r][l].el };
  tip.innerHTML = tipHTML(u); placeTip(tipAt.el); tip.classList.add('show');
}
function hideTip(){ tipAt = null; tip.classList.remove('show'); }
function refreshTip(){ if (tipAt) showTip(tipAt.side, tipAt.r, tipAt.l); }
document.addEventListener('click', hideTip);
$('#scr-battle').addEventListener('scroll', hideTip, { passive: true });

/* ---------- timing + feedback ---------- */
const instant = () => speed === 0;
const animOn = () => !instant() && !REDUCED;
const wait = ms => instant() ? Promise.resolve() : new Promise(r => setTimeout(r, ms / speed));
function flash(el, cls){ if (!el || instant()) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 500); }
function floatText(el, text, kind){
  if (!el || instant()) return;
  const f = document.createElement('div'); f.className = `float float--${kind}`; f.textContent = text;
  const dur = 900 / speed; f.style.setProperty('--fdur', dur + 'ms');
  el.append(f); setTimeout(() => f.remove(), dur + 50);
}
function mid(el){ const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
function showMoveTag(el, m, u){
  if (!animOn() || !el) return () => {};
  const t = document.createElement('div'); t.className = 'movetag'; t.textContent = m.name;
  t.style.setProperty('--c', typeColor(m.type === 'user' ? u.type : m.type)); el.append(t);
  return () => t.remove();
}
function dash(el, toEl){
  if (!animOn() || !toEl || !el) return;
  const a = mid(el), b = mid(toEl), dx = (b.x - a.x) * .32, dy = (b.y - a.y) * .32;
  el.querySelector('.slot__sprite').animate([{ transform:'none' }, { transform:`translate(${-dx * .15}px, ${-dy * .15}px) scale(.94)`, offset:.25 },
    { transform:`translate(${dx}px, ${dy}px) scale(1.12)`, offset:.55 }, { transform:'none' }], { duration: 460 / speed, easing:'ease-in-out' });
}
function shoot(fromEl, toEl, color){
  if (!animOn() || !toEl || !fromEl) return Promise.resolve();
  const a = mid(fromEl), b = mid(toEl);
  const o = document.createElement('div'); o.className = 'orb'; o.style.setProperty('--c', color);
  o.style.left = a.x + 'px'; o.style.top = a.y + 'px'; document.body.append(o);
  const dx = b.x - a.x, dy = b.y - a.y, arc = Math.min(40, Math.hypot(dx, dy) * .15), f = [];
  for (let i = 0; i <= 10; i++){ const t = i / 10; f.push({ transform:`translate(${dx * t}px, ${dy * t - 4 * arc * t * (1 - t)}px) scale(${.7 + .5 * t})` }); }
  return new Promise(res => { const an = o.animate(f, { duration: 260 / speed, easing:'ease-in' }); an.onfinish = () => { o.remove(); res(); }; });
}
function burst(el, color){ if (!animOn() || !el) return; const d = document.createElement('div'); d.className = 'burst'; d.style.setProperty('--c', color); el.append(d); setTimeout(() => d.remove(), 450); }
const hopDuration = () => Math.max(300, 560 / speed);

/* ---------- log ---------- */
function log(html, cls = ''){
  const list = $('#b-log'); list.querySelector('.bf__empty')?.remove();
  const d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = html;
  list.append(d); list.scrollTop = list.scrollHeight;
}
function clearLog(msg){ $('#b-log').innerHTML = `<div class="bf__empty">${msg}</div>`; }
const who = u => `<span class="lw ${u.side}"><i class="sd ${u.side}"></i>${u.name}</span>`;
const mvChip = (m, u) => `<span class="le-mv" style="--c:${typeColor(m.type === 'user' ? u.type : m.type)}">${m.name}</span>`;
const status = html => $('#b-status').innerHTML = html;

/* ---------- rules ---------- */
const staysBack = u => u.item === 'heavy-duty-boots' && u.bag.some(k => MOVES[k].kind === 'sup');
async function compact(){
  const moves = [];
  for (const side of SIDES) for (let l = 0; l < 3; l++){
    const u = board[side][1][l];
    if (!board[side][0][l] && u && !staysBack(u)){
      moves.push({ u, from: B.slotEls[side][1][l].el, to: B.slotEls[side][0][l].el });
      board[side][0][l] = u; board[side][1][l] = null;
    }
  }
  if (!moves.length) return;
  const anim = animOn(), starts = moves.map(m => spriteBox(m.from));
  if (anim) moves.forEach(m => m.to.classList.add('arriving'));
  render();
  moves.forEach(m => log(`↑ ${who(m.u)} moves up to the front`, 'le-sys'));
  if (anim){ moves.forEach((m, i) => fly(SPRITES[FORM[m.u.form].spr], starts[i], m.to, { dur: hopDuration() })); await sleep(hopDuration() + 60); }
}
function center(side, lane){
  const front = board[foe(side)][0];
  if (front[lane]) return lane;
  for (let l = lane - 1; l >= 0; l--) if (front[l]) return l;
  for (let l = lane + 1; l < 3; l++) if (front[l]) return l;
  return -1;
}
function shapeTargets(side, c, shape){
  const b = board[foe(side)];
  const list = shape === 'single' ? [b[0][c]] : shape === 'pierce' ? [b[0][c], b[1][c]] : shape === 'splash' ? [b[0][c - 1], b[0][c], b[0][c + 1]]
    : shape === 'row' ? b[0] : shape === 'back' ? b[1] : b.flat();
  return list.filter(t => t && !(AREA_SHAPES.has(shape) && t.item === 'safety-goggles'));
}
const lowestAlly = (side, except) => living(side).filter(x => x !== except).reduce((a, b) => (!a || b.hp / b.maxHp < a.hp / a.maxHp ? b : a), null);
const strongestAlly = (side, except) => living(side).filter(x => x !== except).reduce((a, b) => (!a || effAtk(b) > effAtk(a) ? b : a), null);
const over = () => !living('you').length || !living('opp').length;
function faint(u, why = ''){
  const p = find(u); if (!p) return;
  board[u.side][p.row][p.lane] = null; turnOf.delete(u.uid); sideSt[u.side].fainted = true;
  if (tipAt && tipAt.side === u.side && tipAt.r === p.row && tipAt.l === p.lane) hideTip();
  log(`✕ ${who(u)} fainted${why}`, 'le-faint');
}
function checkFaints(list){ for (const t of list) if (t.hp <= 0 && find(t)) faint(t); }
function lower(t, stat, amt){ if (t.st.mist || sideSt[t.side].safeguard) return 'blocked'; t.st[stat] -= amt; return true; }
function draw(u){
  if (u.st.lock){ const i = u.bag.indexOf(u.st.lock); return i >= 0 ? u.bag.splice(i, 1)[0] : 'struggle'; }
  if (!u.bag.length) return 'struggle';
  const lrOK = u.moves.filter(k => k !== 'last-resort').every(k => u.st.used.has(k));
  let idx = [...u.bag.keys()].filter(i => u.bag[i] !== 'last-resort' || lrOK);
  if (!idx.length) idx = [...u.bag.keys()];
  return u.bag.splice(pick(idx), 1)[0];
}

/* ---------- support moves ---------- */
function supportTargets(u, pos, key, m){
  const side = u.side;
  switch (m.target){
    case 'self': return [u];
    case 'team': return living(side);
    case 'front': return board[side][0].filter(Boolean);
    case 'lowest': { const t = lowestAlly(side, key === 'healing-wish' ? u : null); return t ? [t] : []; }
    case 'ahead': {
      const ahead = pos.row === 1 ? board[side][0][pos.lane] : null;
      if (key === 'after-you'){
        if (ahead && !ctx.acted.has(ahead.uid)) return [ahead];
        const rest = ctx.order.slice(ctx.idx + 1).filter(x => x.side === side && x !== u && find(x));
        return rest.length ? [rest.reduce((a, b) => effSpd(b) > effSpd(a) ? b : a)] : [];
      }
      if (ahead) return [ahead];
      if (key === 'floral-healing'){ const t = lowestAlly(side, null); return t ? [t] : []; }
      const t = strongestAlly(side, u); return t ? [t] : [];
    }
  }
  return [];
}
function applySupport(u, key, m, t){
  const mul = u.item === 'choice-specs' ? 1.5 : 1;       // Choice Specs: bigger heals and buffs
  const res = [];
  const heal = frac => { const a = Math.min(Math.round(t.maxHp * frac * mul), t.maxHp - t.hp); t.hp += a; res.push({ heal: a }); };
  const bf = (atk, spd, txt) => { if (atk) t.st.atkMod += atk * mul; if (spd) t.st.spdMod += spd * mul; res.push({ txt }); };
  const P = x => pct(x * mul);
  switch (key){
    case 'defense-curl': case 'harden': t.st.shields.push({ n:2, p:.5 }); res.push({ txt:'2 hits −50%' }); break;
    case 'stockpile': t.st.shields.push({ n:3, p:.25 }); res.push({ txt:'3 hits −25%' }); break;
    case 'bulk-up': bf(.15, 0, `Atk +${P(.15)}, 2 hits −25%`); t.st.shields.push({ n:2, p:.25 }); break;
    case 'focus-energy': t.st.focus = true; res.push({ txt:'next hit +50%' }); break;
    case 'protect': t.st.protect = true; res.push({ txt:'protected' }); break;
    case 'swords-dance': bf(.5, 0, `Atk +${P(.5)}`); break;
    case 'agility': bf(0, .3, `Spd +${P(.3)}`); break;
    case 'work-up': bf(.1, .1, `Atk/Spd +${P(.1)}`); break;
    case 'shell-smash': bf(.5, .5, `Atk/Spd +${P(.5)}, takes +25%`); t.st.vuln += .25; break;
    case 'tailwind': bf(0, .2, `Spd +${P(.2)}`); break;
    case 'quiver-wind': bf(.15, .25, `Atk +${P(.15)}, Spd +${P(.25)}`); break;
    case 'coaching': case 'howl': bf(.1, 0, `Atk +${P(.1)}`); break;
    case 'helping-hand': bf(.3, 0, `Atk +${P(.3)}`); break;
    case 'decorate': bf(.4, 0, `Atk +${P(.4)}`); break;
    case 'mist': t.st.mist = true; res.push({ txt:'stats locked' }); break;
    case 'rest': { const a = t.maxHp - t.hp; t.hp = t.maxHp; t.st.skip = 2; res.push({ heal:a, txt:'sleeps 2 turns' }); break; }
    case 'round-chorus': heal(.2); bf(.15, 0, `Atk +${P(.15)}`); break;
    case 'refresh': t.st.atkMod = Math.max(0, t.st.atkMod); t.st.spdMod = Math.max(0, t.st.spdMod); t.st.dots = []; t.st.seed = null; res.push({ txt:'cleansed' }); break;
    case 'healing-wish': { const a = t.maxHp - t.hp; t.hp = t.maxHp; res.push({ heal:a }); break; }
    default: if (m.heal) heal(m.heal);
  }
  return res;
}
function doSideSupport(u, key){
  const s = sideSt[u.side];
  if (key === 'reflect'){ s.reflect = 2; return 'front row −25% for 2 rounds'; }
  if (key === 'light-screen'){ s.screen = 2; return 'front row −25% vs area for 2 rounds'; }
  if (key === 'wide-guard'){ s.wideGuard = round + 1; return 'blocks area moves until end of next round'; }
  if (key === 'safeguard'){ s.safeguard = true; for (const t of living(u.side)){ t.st.dots = []; t.st.seed = null; } return 'no stat drops or damage over time'; }
  if (key === 'wish'){ s.wishes.push(round + 1); return 'heals the lowest-HP ally at end of next round'; }
  return '';
}
async function resolveSupport(u, pos, key, m, refund, el){
  const note = t => `<div class="le-top">${who(u)} ${mvChip(m, u)} <span class="le-note">${t}</span></div>`;
  if (SIDE_MOVES.has(key)){
    await wait(300);
    const txt = doSideSupport(u, key);
    const team = key === 'reflect' || key === 'light-screen' ? board[u.side][0].filter(Boolean) : living(u.side);
    team.forEach(t => { setTurn(t, t === u ? 'acting' : 'ally'); burst(elOf(t), typeColor(m.type)); });
    floatText(el, key === 'wish' ? 'wish' : 'team', 'info');
    log(note(txt), 'le');
    await wait(520); team.forEach(t => t !== u && setTurn(t, null));
    return true;
  }
  const targets = supportTargets(u, pos, key, m);
  status(`${who(u)} ${mvChip(m, u)} ${targets.length ? '→ ' + targets.map(who).join(', ') : ''}`);
  await wait(300);
  if (!targets.length){ refund(); flash(el, 'fizzle'); floatText(el, 'no target', 'info'); log(note('no one to target, PP returned'), 'le fail'); await wait(420); return false; }
  if (key === 'after-you'){
    const t = targets[0], i = ctx.order.indexOf(t);
    if (i > ctx.idx) ctx.order.splice(i, 1);
    ctx.order.splice(ctx.idx + 1, 0, t);
    setTurn(t, 'ally'); floatText(elOf(t), 'next!', 'info');
    log(`<div class="le-top">${who(u)} ${mvChip(m, u)}</div><div class="le-res"><div>${who(t)} acts next</div></div>`, 'le');
    await wait(520); setTurn(t, null); return true;
  }
  if (key === 'instruct'){
    const t = targets[0];
    if (!t.st.lastMove || t.st.lastMove === 'instruct'){ refund(); flash(el, 'fizzle'); floatText(el, 'nothing to repeat', 'info'); log(note(`${t.name} has no move to repeat, PP returned`), 'le fail'); await wait(420); return false; }
    log(`<div class="le-top">${who(u)} ${mvChip(m, u)}</div><div class="le-res"><div>${who(t)} repeats ${MOVES[t.st.lastMove].name}</div></div>`, 'le');
    await wait(300); setTurn(u, null);
    await act(t, { move: t.st.lastMove, noPP: true });
    return true;
  }
  targets.forEach(t => t !== u && setTurn(t, 'ally'));
  await wait(160);
  await Promise.all(targets.filter(t => t !== u).map(t => shoot(el, elOf(t), typeColor(m.type))));
  if (key === 'healing-wish') u.hp = 0;
  const lines = [];
  for (const t of targets){
    const res = applySupport(u, key, m, t), tel = elOf(t), healed = res.find(r => r.heal != null);
    if (healed){ flash(tel, 'healed'); floatText(tel, `+${healed.heal}`, 'heal'); } else floatText(tel, res[0]?.txt || m.name, 'buff');
    burst(tel, typeColor(m.type));
    lines.push(`<div>${t === u ? 'itself' : who(t)} ${healed ? `<b class="h">+${healed.heal}</b>` : ''} ${res.filter(r => r.txt).map(r => `<span class="le-fx">${r.txt}</span>`).join(' ')}</div>`);
  }
  render();
  log(`<div class="le-top">${who(u)} ${mvChip(m, u)}</div><div class="le-res">${lines.join('')}</div>`, 'le');
  if (key === 'healing-wish'){ await wait(300); faint(u, ' (Healing Wish)'); render(); }
  await wait(420);
  targets.forEach(t => t !== u && setTurn(t, null));
  return true;
}

/* ---------- offensive moves ---------- */
function movePower(u, key, m, t, h){
  let p = m.power;
  if (key === 'rage') p *= 1 + .1 * u.st.rage;
  if (key === 'rollout') p = 20 * Math.pow(2, Math.min(3, u.st.rollout));
  if (key === 'facade' && u.hp < u.maxHp / 2) p *= 2;
  if (key === 'retaliate' && sideSt[u.side].fainted) p *= 2;
  if (key === 'payback' && u.st.hitThisRound) p *= 2;
  if (key === 'venoshock' && (t.st.dots.length || t.st.seed)) p *= 2;
  if (key === 'electro-ball'){ const d = effSpd(u) - effSpd(t); if (d > 0) p = Math.min(120, 50 * (1 + .25 * Math.floor(d / 10))); }
  if (key === 'triple-axel') p = 20 * (h + 1);
  return p;
}
function moveType(u, key, m, t){
  if (USER_TYPE.has(key)) return u.type;
  if (key === 'toxic-bloom') return eff('poison', t.type) > eff('grass', t.type) ? 'poison' : 'grass';
  return m.type;
}
function hitDamage(u, key, m, t, h, multi){
  const ty = moveType(u, key, m, t), e = ty === 'none' ? 1 : eff(ty, t.type);
  let dmg;
  if (key === 'super-fang') dmg = Math.ceil(t.hp * .5);
  else if (key === 'body-press') dmg = u.maxHp * .2 * e;
  else if (key === 'heavy-slam') dmg = u.maxHp * .35 * e;
  else if (key === 'counter') dmg = (u.st.lastHit?.dmg || 0) * 1.5;
  else dmg = effAtk(u) * movePower(u, key, m, t, h) / 100 * e;
  if (!['super-fang','counter'].includes(key)){
    dmg *= (multi ? .75 : 1) * (.85 + Math.random() * .15);
    if (u.st.focus) dmg *= 1.5;
    if (u.item === 'life-orb') dmg *= 1.3;
  }
  return { dmg, e };
}
function guard(t, key, m, dmg, area){
  const s = sideSt[t.side], front = find(t)?.row === 0;
  if (t.st.protect){ t.st.protect = false; return { dmg:0, note:'protected' }; }
  if (area && s.wideGuard >= round) return { dmg:0, note:'wide guard' };
  const ignore = IGNORE_GUARD.has(key);
  if (!ignore && t.st.shields.length){ const sh = t.st.shields[0]; dmg *= 1 - sh.p; if (--sh.n <= 0) t.st.shields.shift(); }
  if (!ignore && front && s.reflect > 0) dmg *= .75;
  if (area && front && s.screen > 0) dmg *= .75;
  if (t.st.vuln) dmg *= 1 + t.st.vuln;
  return { dmg: Math.max(dmg > 0 ? 1 : 0, Math.round(dmg)), note:'' };
}
async function resolveOffense(u, pos, key, m, refund, el, origKey){
  const note = t => `<div class="le-top">${who(u)} ${mvChip(MOVES[origKey], u)}${origKey !== key ? ` → ${mvChip(m, u)}` : ''} <span class="le-note">${t}</span></div>`;
  if (pos.row === 1){
    status(`${who(u)} ${mvChip(m, u)}`); await wait(260);
    refund(); flash(el, 'fizzle'); floatText(el, 'back row', 'info');
    log(note('back row, no target, PP returned'), 'le fail'); await wait(420); return false;
  }
  if (key === 'counter' && !u.st.lastHit){ await wait(260); refund(); flash(el, 'fizzle'); floatText(el, 'not hit yet', 'info'); log(note("hasn't been hit yet, PP returned"), 'le fail'); await wait(420); return false; }
  const c = center(u.side, pos.lane);
  const targets = c < 0 ? [] : shapeTargets(u.side, c, m.shape);
  status(`${who(u)} ${mvChip(m, u)} ${targets.length ? '→ ' + targets.map(who).join(', ') : ''}`);
  if (!targets.length){ await wait(260); floatText(el, 'miss', 'info'); log(note(`${SHAPE_LABEL[m.shape] || 'the move'} hit nothing, PP spent`), 'le fail'); await wait(420); return true; }
  const tEls = targets.map(elOf);
  targets.forEach(t => setTurn(t, 'targeted'));
  await wait(340);
  const area = AREA_SHAPES.has(m.shape), multi = targets.length > 1;
  const hits = m.hits ? rndInt(m.hits[0], m.hits[1]) : 1;
  const tot = targets.map(() => ({ dmg:0, e:1, notes:[] }));
  const mainEl = elOf(board[foe(u.side)][0][c]) || tEls[0];
  const ty0 = moveType(u, key, m, targets[0]), color = typeColor(ty0 === 'none' ? 'normal' : ty0);
  const damaging = m.power !== 0;
  for (let h = 0; h < hits; h++){
    const live = targets.map((t, i) => [t, i]).filter(([t]) => t.hp > 0);
    if (!live.length) break;
    dash(el, mainEl);
    await wait(h ? 60 : 220);
    await Promise.all(live.map(([t, i]) => shoot(el, tEls[i], color)));
    for (const [t, i] of live){
      if (!damaging){ burst(tEls[i], color); continue; }
      const { dmg: raw, e } = hitDamage(u, key, m, t, h, multi);
      if (e === 0){ tot[i].e = 0; floatText(tEls[i], 'no effect', 'info'); continue; }
      let { dmg, note: gn } = guard(t, key, m, raw, area);
      if (t.item === 'focus-sash' && !t.st.sashUsed && t.hp === t.maxHp && dmg >= t.hp){ dmg = t.hp - 1; t.st.sashUsed = true; gn = 'held on with Focus Sash'; }
      if (gn && !tot[i].notes.includes(gn)) tot[i].notes.push(gn);
      t.hp -= dmg; tot[i].dmg += dmg; tot[i].e = e;
      if (dmg > 0){ t.st.lastHit = { dmg, move: key }; t.st.hitThisRound = true; }
      if (dmg > 0 && e > 1 && t.item === 'weakness-policy' && !t.st.wpUsed){ t.st.wpUsed = true; t.st.atkMod += .5; tot[i].notes.push('Weakness Policy, Atk +50%'); }
      flash(tEls[i], 'hit'); burst(tEls[i], color);
      floatText(tEls[i], dmg ? `-${dmg}` : gn, dmg ? (e > 1 ? 'super' : 'dmg') : 'info');
    }
    render();
    if (h < hits - 1) await wait(200);
  }
  u.st.focus = false;
  for (let i = 0; i < targets.length; i++){
    const t = targets[i], T = tot[i], tel = tEls[i];
    if (T.e === 0 || t.hp <= 0) continue;
    const add = (txt, kind = 'debuff') => { T.notes.push(txt); floatText(tel, txt, kind); };
    if (SPD_DROP[key]){ const r = lower(t, 'spdMod', SPD_DROP[key]); add(r === true ? `Spd −${pct(SPD_DROP[key])}` : 'drop blocked'); }
    if (ATK_DROP[key]){ const r = lower(t, 'atkMod', ATK_DROP[key]); add(r === true ? `Atk −${pct(ATK_DROP[key])}` : 'drop blocked'); }
    if (key === 'tri-attack'){ const st = Math.random() < .5 ? 'atkMod' : 'spdMod'; const r = lower(t, st, .1); add(r === true ? `${st === 'atkMod' ? 'Atk' : 'Spd'} −10%` : 'drop blocked'); }
    if (DOTS[key]){ if (sideSt[t.side].safeguard) add('safeguarded'); else { t.st.dots.push([...DOTS[key]]); add(key === 'toxic' ? 'badly poisoned' : 'poisoned'); } }
    if (key === 'leech-seed'){ if (sideSt[t.side].safeguard) add('safeguarded'); else { t.st.seed = u; add('seeded'); } }
  }
  const dealt = tot.reduce((a, x) => a + x.dmg, 0), selfNotes = [];
  const selfHurt = (frac, why, base = u.maxHp) => { const a = Math.max(1, Math.round(base * frac)); u.hp -= a; flash(el, 'hit'); floatText(el, `-${a}`, 'dmg'); selfNotes.push(`${why} <b class="d">−${a}</b>`); };
  if (DRAIN[key] && dealt){ const a = Math.min(Math.round(dealt * DRAIN[key]), u.maxHp - u.hp); u.hp += a; if (a){ floatText(el, `+${a}`, 'heal'); selfNotes.push(`drains <b class="h">+${a}</b>`); } }
  if (RECOIL[key] && dealt) selfHurt(RECOIL[key], 'recoil', dealt);
  if (u.item !== 'protective-pads') targets.forEach((t, i) => { if (t.item === 'rocky-helmet' && tot[i].dmg > 0) selfHurt(.12, `${t.name}'s Rocky Helmet`); });
  if (u.item === 'life-orb' && damaging) selfHurt(.1, 'Life Orb');
  if (key === 'rapid-spin'){ u.st.spdMod += .15; selfNotes.push('Spd +15%'); }
  if (RECHARGE.has(key)){ u.st.skip = 1; selfNotes.push('must recharge'); }
  if (key === 'rage') u.st.rage++;
  if (key === 'rollout') u.st.rollout++;
  if (key === 'struggle') selfHurt(.12, 'hurt by Struggle');
  render();
  const res = targets.map((t, i) => {
    const { dmg, e, notes } = tot[i];
    const tagE = e === 0 ? '<em class="nve">no effect</em>' : !damaging ? '' : e > 1 ? `<em class="sup">${e}× super</em>` : e < 1 ? `<em class="nve">${e}× resisted</em>` : '';
    return `<div>${who(t)} ${damaging && e ? `<b class="d">−${dmg}</b>` : ''}${tagE}${notes.map(n => ` <span class="le-fx">${n}</span>`).join('')}</div>`;
  }).join('');
  log(`<div class="le-top">${who(u)} ${mvChip(MOVES[origKey], u)}${origKey !== key ? ` → ${mvChip(m, u)}` : ''} ${SHAPE_LABEL[m.shape] ? `<span class="le-shape">${SHAPE_LABEL[m.shape]}</span>` : ''}${m.hits ? `<span class="le-shape">${hits} hit${hits > 1 ? 's' : ''}</span>` : ''}</div><div class="le-res">${res}${selfNotes.length ? `<div>${who(u)} ${selfNotes.join(', ')}</div>` : ''}</div>`, 'le');
  await wait(420);
  targets.forEach(t => setTurn(t, null));
  checkFaints([...targets, u]);
  render();
  return true;
}

/* ---------- one action ---------- */
async function act(u, forced){
  await compact();
  const pos = find(u); if (!pos) return;
  const el = elOf(u);
  u.st.protect = false;
  if (!forced && u.st.skip > 0){
    u.st.skip--; u.st.planned = null;
    setTurn(u, 'acting'); floatText(el, 'recharging', 'info');
    log(`<div class="le-top">${who(u)} <span class="le-note">is recharging</span></div>`, 'le fail');
    status(`${who(u)} is recharging`);
    await wait(420); setTurn(u, null); return;
  }
  const origKey = forced ? forced.move : (u.st.planned || draw(u));
  u.st.planned = null;
  const refund = () => { if (!forced?.noPP && origKey !== 'struggle') u.bag.push(origKey); };
  let key = origKey, m = MOVES[key];
  if (key === 'metronome'){ key = pick(Object.keys(MOVES).filter(k => MOVES[k].kind === 'off' && !NO_METRONOME.has(k))); m = MOVES[key]; }
  if (key === 'mirror-move'){
    if (!u.st.lastHit || NO_METRONOME.has(u.st.lastHit.move)){
      setTurn(u, 'acting'); await wait(260); refund(); flash(el, 'fizzle'); floatText(el, 'nothing to copy', 'info');
      log(`<div class="le-top">${who(u)} ${mvChip(m, u)} <span class="le-note">nothing has hit it yet, PP returned</span></div>`, 'le fail');
      await wait(420); setTurn(u, null); return;
    }
    key = u.st.lastHit.move; m = MOVES[key];
  }
  setTurn(u, 'acting');
  const dropTag = showMoveTag(el, m, u);
  await wait(120);
  const ok = m.kind === 'sup' ? await resolveSupport(u, pos, key, m, refund, el) : await resolveOffense(u, pos, key, m, refund, el, origKey);
  if (ok){
    u.st.used.add(origKey); u.st.lastMove = origKey;
    if (CHOICE.has(u.item) && !u.st.lock && origKey !== 'struggle'){ u.st.lock = origKey; log(`🔒 ${who(u)} is locked into ${MOVES[origKey].name} by its ${ITEM[u.item].name}`, 'le-sys'); }
  }
  await wait(140);
  dropTag(); setTurn(u, null);
}

/* ---------- end of round ---------- */
async function roundEnd(){
  let any = false;
  for (const side of SIDES){
    for (const t of living(side)){
      const s = t.st;
      if (sideSt[side].safeguard){ s.dots = []; s.seed = null; }
      if (s.dots.length){
        let total = 0;
        s.dots = s.dots.map(seq => { total += seq.shift(); return seq; }).filter(seq => seq.length);
        const a = Math.max(1, Math.round(t.maxHp * total / 100)); t.hp -= a; any = true;
        flash(elOf(t), 'hit'); floatText(elOf(t), `-${a}`, 'dmg');
        log(`<div class="le-top">${who(t)} <span class="le-note">poison</span></div><div class="le-res"><div>${who(t)} <b class="d">−${a}</b></div></div>`, 'le');
      }
      if (s.seed){
        const a = Math.max(1, Math.round(t.maxHp * .08)); t.hp -= a; any = true;
        flash(elOf(t), 'hit'); floatText(elOf(t), `-${a}`, 'dmg');
        let extra = '';
        if (find(s.seed)){ const h = Math.min(a, s.seed.maxHp - s.seed.hp); s.seed.hp += h; if (h){ floatText(elOf(s.seed), `+${h}`, 'heal'); extra = `<div>${who(s.seed)} <b class="h">+${h}</b></div>`; } }
        log(`<div class="le-top">${who(t)} <span class="le-note">leech seed</span></div><div class="le-res"><div>${who(t)} <b class="d">−${a}</b></div>${extra}</div>`, 'le');
      }
      if (t.item === 'leftovers' && t.hp > 0 && t.hp < t.maxHp){
        const a = Math.min(Math.max(1, Math.round(t.maxHp * .08)), t.maxHp - t.hp); t.hp += a; any = true;
        floatText(elOf(t), `+${a}`, 'heal');
        log(`<div class="le-top">${who(t)} <span class="le-note">Leftovers</span></div><div class="le-res"><div>${who(t)} <b class="h">+${a}</b></div></div>`, 'le');
      }
    }
    const S = sideSt[side];
    const due = S.wishes.filter(r => r <= round); S.wishes = S.wishes.filter(r => r > round);
    for (const _ of due){
      const t = lowestAlly(side, null); if (!t) continue;
      const a = Math.min(Math.round(t.maxHp * .5), t.maxHp - t.hp); t.hp += a; any = true;
      flash(elOf(t), 'healed'); floatText(elOf(t), `+${a}`, 'heal');
      log(`<div class="le-top">${who(t)} <span class="le-note">wish comes true</span></div><div class="le-res"><div>${who(t)} <b class="h">+${a}</b></div></div>`, 'le');
    }
    if (S.reflect > 0) S.reflect--;
    if (S.screen > 0) S.screen--;
  }
  if (any){ render(); await wait(500); }
  for (const side of SIDES) checkFaints(living(side));
  render();
}

function priority(u){
  const k = u.st.planned;
  if (!k) return 0;
  if (ALWAYS_FIRST.has(k)) return 2;
  if (round === 1 && FIRST_ROUND.has(k)) return 1;
  return 0;
}
const hpFrac = side => { const us = living(side); return us.reduce((s, u) => s + u.hp / u.maxHp, 0); };
async function runBattle(){
  const token = ++battleToken;
  running = true; round = 0; syncBattleButtons();
  $('#b-log').innerHTML = ''; status('Fighting…');
  while (!over() && round < 60){
    round++;
    log(`Round ${round}`, 'rnd');
    const all = [...living('you'), ...living('opp')];
    for (const u of all){ u.st.hitThisRound = false; u.st.planned = u.st.skip ? null : draw(u); }
    const order = all.map(u => ({ u, tie: Math.random() })).sort((a, b) => priority(b.u) - priority(a.u) || effSpd(b.u) - effSpd(a.u) || a.tie - b.tie).map(x => x.u);
    ctx = { order, idx: 0, acted: new Set() };
    for (ctx.idx = 0; ctx.idx < ctx.order.length; ctx.idx++){
      const u = ctx.order[ctx.idx];
      if (!find(u) || ctx.acted.has(u.uid)) continue;
      ctx.acted.add(u.uid);
      await act(u);
      if (token !== battleToken) return null;
      if (over()) break;
    }
    if (over()) break;
    await roundEnd();
    if (token !== battleToken) return null;
  }
  const y = living('you').length, o = living('opp').length;
  const outcome = !o && y ? 'win' : !y && o ? 'lose' : !y && !o ? 'draw' : (hpFrac('you') >= hpFrac('opp') ? 'win' : 'lose');
  const msg = outcome === 'draw' ? 'Both sides fell at once.' : outcome === 'win' ? `You won in ${round} round${round > 1 ? 's' : ''}.` : `You lost after ${round} round${round > 1 ? 's' : ''}.`;
  log(msg, 'le-end'); status(msg); render();
  running = false; syncBattleButtons();
  return outcome;
}
function abortBattle(){
  battleToken++; running = false;
  document.querySelectorAll('#scr-battle .slot').forEach(e => delete e.dataset.turn);
  turnOf.clear();
  document.querySelectorAll('.movetag, .orb, .burst, .float').forEach(e => e.remove());
}

/* ---------- battle screen flow ---------- */
function setupBattle(enc){
  abortBattle();
  B.enc = enc;
  lineup = {
    you: R.party.map((m, i) => m && { cell: i, unit: { side:'you', form: m.form, moves: known(m), item: m.item?.id || null, mul: 1 } }).filter(Boolean),
    opp: enc.team.map((u, k) => ({ cell: FILL[k], unit: { side:'opp', ...u } })),
  };
  freshBoard(); render(); clearLog('The battle log fills in as the fight plays out.');
  const icon = $('#b-icon'); icon.dataset.type = enc.kind; icon.textContent = ICON[enc.kind];
  $('#b-title').textContent = enc.title; $('#b-sub').textContent = enc.sub;
  $('#b-foe-label').textContent = enc.title;
  $('#b-result').classList.remove('show');
  speed = speedPref; syncBattleButtons(); status('');
}
function syncBattleButtons(){
  $('#b-speed').textContent = speed === 0 ? 'Skipping' : `${speed}×`;
  $('#b-speed').disabled = speed === 0;
  $('#b-skip').disabled = speed === 0 || (!running && !countAbort);
}
$('#b-speed').addEventListener('click', () => { if (speed === 0) return; speed = speed === 1 ? 2 : speed === 2 ? 4 : 1; speedPref = speed; syncBattleButtons(); });
$('#b-skip').addEventListener('click', () => {
  speed = 0; countAbort?.(); syncBattleButtons();
  document.querySelectorAll('.movetag, .orb, .burst').forEach(e => e.remove());
});
async function countdown(){
  const box = $('#b-count'), num = $('#b-count-num');
  box.classList.add('show');
  let aborted = false;
  const abortP = new Promise(r => countAbort = () => { aborted = true; r(); });
  syncBattleButtons();
  for (const n of ['3', '2', '1']){
    if (aborted || speed === 0) break;
    num.textContent = n; num.classList.remove('tick'); void num.offsetWidth; num.classList.add('tick');
    await Promise.race([sleep(750), abortP]);
  }
  countAbort = null;
  box.classList.remove('show');
}
async function enterBattle(kind, opt){
  const enc = buildEncounter(kind);
  await wipeTo('scr-battle', () => setupBattle(enc), opt);
  await countdown();
  const outcome = await runBattle();
  if (outcome) await finishBattle(outcome);
}

/* ---------- EXP: every Pokémon that fought shares the pool; the daycare gets half a share ---------- */
function awardXP(share){
  const party = partyMons(), list = [];
  const give = (m, amt, inParty) => {
    const before = { star: m.star, exp: m.exp, form: m.form }, evo = [];
    if (m.star < 3){
      m.exp += amt;
      while (m.exp >= 1 && m.star < 3){ m.exp -= 1; evo.push(levelUp(m)); }
      if (m.star >= 3) m.exp = 1;
    }
    list.push({ m, before, after: { star: m.star, exp: m.exp, form: m.form }, evo, inParty });
  };
  party.forEach(m => give(m, share, true));
  R.daycare.filter(Boolean).forEach(m => give(m, share * TUNE.daycareRate, false));
  return { share, list };
}
async function animateXP(xp, els){
  const party = xp.list.filter(x => x.inParty), ov = new Map(party.map(x => [x.m.uid, { ...x.before }]));
  const paint = () => { for (const x of party){ const el = els.get(x.m.uid); if (el) renderSlot(el, PRESET.result, monView(x.m, ov.get(x.m.uid))); } };
  paint(); await sleep(500);
  for (const x of party) ov.set(x.m.uid, x.evo.length ? { ...x.before, exp: 1 } : x.after);
  paint(); await sleep(560);
  const ups = party.filter(x => x.evo.length);
  if (!ups.length) return;
  ups.forEach(x => { els.get(x.m.uid)?.classList.add('snap'); ov.set(x.m.uid, { ...x.after, exp: 0 }); });
  paint();
  ups.forEach(x => { const el = els.get(x.m.uid); if (!el) return; void el.offsetWidth; el.classList.remove('snap', 'lvlup', 'pop'); void el.offsetWidth; el.classList.add('lvlup', 'pop'); });
  await sleep(60);
  ups.forEach(x => ov.set(x.m.uid, x.after));
  paint();
}
function resultParty(){
  const wrap = document.createElement('div'); wrap.className = 'game slotbox';
  const els = new Map();
  for (const part of [[0, 1, 2], [3, 4, 5]]){
    if (part[0] === 3 && !part.some(i => R.party[i])) continue;
    const grid = document.createElement('div'); grid.className = 'slots';
    for (const i of part){
      const w = document.createElement('div'); w.className = 'slotwrap';
      const el = createSlot(), m = R.party[i];
      const name = document.createElement('div'); name.className = 'slotname'; name.textContent = m ? nm(m) : '';
      renderSlot(el, PRESET.result, monView(m));
      w.append(el, name); grid.append(w);
      if (m) els.set(m.uid, el);
    }
    wrap.append(grid);
  }
  return { wrap, els };
}
async function finishBattle(outcome){
  await sleep(speed === 0 ? 200 : 800);
  hideTip();
  const enc = B.enc, won = outcome === 'win', card = $('#b-rcard');
  let button = null, action = null, xp = null, els = null;
  if (won){
    const pay = TUNE.pay[enc.kind]; R.coins += pay;
    xp = awardXP(TUNE.xp[enc.kind]);
    let captured = '';
    if (enc.kind === 'legendary'){
      const mon = makeMon(enc.legend.line, enc.legend.star), i = firstEmpty(R.party);
      if (i >= 0){ R.party[i] = mon; captured = `You captured ${nm(mon)}. It joined your party.`; }
      else if (depositDaycare(mon)) captured = `You captured ${nm(mon)}. Your party is full, so it went to the daycare.`;
      else captured = `${nm(mon)} got away: your party and daycare are both full.`;
    }
    if (enc.kind === 'boss') R.gymsBeaten++;
    const n = xp.list.filter(x => x.inParty).length;
    const notes = xp.list.filter(x => x.evo.length).map(x => {
      const from = x.evo[0].from, to = x.evo[x.evo.length - 1].to, where = x.inParty ? '' : ' in the daycare';
      return from !== to ? `<div><b>${from}</b> reached ★${x.m.star} and evolved into <b>${to}</b>${where}.</div>`
        : `<div><b>${to}</b> reached ★${x.m.star}${where}.</div>`;
    });
    if (captured) notes.push(`<div>${captured}</div>`);
    if (R.daycare.some(Boolean)) notes.push('<div>Daycare Pokémon earned half as much EXP.</div>');
    const title = enc.kind === 'boss' ? `Gym ${R.mapNo} cleared` : 'You won';
    card.innerHTML = `<h2 class="title win">${title}</h2>
      <p class="sub">+${pay} coins. ${n === 1 ? 'Your Pokémon earned' : `Each of your ${n} Pokémon earned`} ${pct(xp.share)} of a level.</p>
      <div id="r-party"></div><div class="rnotes">${notes.join('')}</div><div class="actions" id="r-actions"></div>`;
    const rp = resultParty(); els = rp.els;
    // start the tiles at their pre-battle values; animateXP fills them
    xp.list.filter(x => x.inParty).forEach(x => { const el = els.get(x.m.uid); if (el) renderSlot(el, PRESET.result, monView(x.m, x.before)); });
    card.querySelector('#r-party').append(rp.wrap);
    if (enc.kind === 'boss' && R.mapNo >= 8){ button = 'Finish the run'; action = () => openEnd(true); }
    else if (enc.kind === 'boss'){ button = 'Go to the daycare'; action = () => wipeTo('scr-daycare', () => openDaycare(true), { color: NODE_COLOR('daycare'), mark: markHTML(ICON.daycare, 'Daycare') }); }
    else { button = 'Back to map'; action = toMap; }
  } else {
    const before = R.lives; R.lives = Math.max(0, R.lives - 1);
    if (enc.kind === 'boss'){ R.trail.pop(); R.at = R.trail[R.trail.length - 1]; }
    const hearts = Array.from({ length: TUNE.lives }, (_, i) => HEART.replace('class="heart"', `class="heart${i < R.lives ? '' : i === before - 1 ? ' breaking' : ' lost'}"`)).join('');
    const out = R.lives === 0;
    const title = out ? 'Out of lives' : outcome === 'draw' ? 'Both sides fell' : 'You lost';
    const sub = out ? 'That was your last life, so the run ends here.'
      : `${R.lives} ${R.lives === 1 ? 'life' : 'lives'} left. No EXP or coins from this fight.` + (enc.kind === 'boss' ? " The gym will still be there when you're ready to try again." : '');
    card.innerHTML = `<h2 class="title lose">${title}</h2><div class="hearts">${hearts}</div><p class="sub">${sub}</p><div class="actions" id="r-actions"></div>`;
    if (out){ button = 'See how the run went'; action = () => openEnd(false); }
    else { button = 'Back to map'; action = toMap; }
  }
  const acts = card.querySelector('#r-actions');
  acts.innerHTML = `<button class="btn btn--go">${button}</button>`;
  acts.querySelector('button').addEventListener('click', e => { e.currentTarget.disabled = true; action(); });
  $('#b-result').classList.add('show');
  if (xp && els) animateXP(xp, els);
}

/* ================= init ================= */
mountAreas();
buildField();
$('#b-logbox').open = innerWidth > 760;
openStarter();
show('scr-starter'); refresh();
