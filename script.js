// ===== Game State =====
const S = {
  px: 980, py: 3050, speed: 4, keys: {},
  ww: 2000, wh: 3200,
  loc: '', shrine: null, bellOn: false, darshan: false
};

const $ = id => document.getElementById(id);
const world = $('world'), player = $('player'), locName = $('location-name');
const timeDisp = $('time-display'), dOverlay = $('darshan-overlay');
const dDeity = $('darshan-deity'), dMantra = $('darshan-mantra');
const sky = $('sky'), sun = $('sun'), moon = $('moon'), stars = $('stars');

// ===== Audio =====
let actx = null;
function bell() {
  if (S.bellOn) return; S.bellOn = true;
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  const t = actx.currentTime, g = actx.createGain();
  g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.01, t + 2.5);
  [800, 1200, 1600].forEach(f => {
    const o = actx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.7, t + 2);
    o.connect(g); o.start(t); o.stop(t + 2.5);
  });
  g.connect(actx.destination);
  setTimeout(() => S.bellOn = false, 3000);
}

// ===== Darshan HTML for each god =====
function ddBase(cls, inner) {
  return `<div class="dd ${cls}"><div class="dd-halo"></div><div class="dd-glow"></div>${inner}<div class="dd-pedestal"></div></div>`;
}

const dHTML = {
  ganesha: ddBase('dd-ganesha', `
    <div class="dd-crown"><div class="dd-crown-gem"></div></div>
    <div class="dd-ear-big dd-ear-big-l"></div><div class="dd-ear-big dd-ear-big-r"></div>
    <div class="dd-head"><div class="dd-eyes"><div class="dd-eye"></div><div class="dd-eye"></div></div></div>
    <div class="dd-trunk"></div>
    <div class="dd-tusk dd-tusk-l"></div><div class="dd-tusk dd-tusk-r"></div>
    <div class="dd-body"><div class="dd-belly"></div></div>
    <div class="dd-arm dd-arm-l"></div><div class="dd-arm dd-arm-r"></div>
    <div class="dd-modak"></div>
    <div class="dd-earring dd-ear-l"></div><div class="dd-earring dd-ear-r"></div>
    <div class="dd-legs"><div class="dd-leg"></div><div class="dd-leg"></div></div>`),

  shiva: ddBase('dd-shiva', `
    <div class="dd-naga"></div>
    <div class="dd-lingam"><div class="dd-bilva"></div></div>
    <div class="dd-avudaiyar"></div><div class="dd-base"></div>`),

  venkateswara: ddBase('dd-venkat', `
    <div class="dd-kiritam"></div>
    <div class="dd-head"><div class="dd-namam"></div><div class="dd-eyes"><div class="dd-eye"></div><div class="dd-eye"></div></div></div>
    <div class="dd-earring dd-ear-l"></div><div class="dd-earring dd-ear-r"></div>
    <div class="dd-necklace"></div>
    <div class="dd-body"><div class="dd-haaram dd-haaram-1"></div><div class="dd-haaram dd-haaram-2"></div></div>
    <div class="dd-arm dd-arm-l"></div><div class="dd-arm dd-arm-r"></div>
    <div class="dd-shankha"></div><div class="dd-chakra"></div>
    <div class="dd-legs"><div class="dd-leg"></div><div class="dd-leg"></div></div>`),

  parvati: ddBase('dd-parvati', `
    <div class="dd-crown"><div class="dd-crown-gem"></div></div>
    <div class="dd-head"><div class="dd-bindi"></div><div class="dd-eyes"><div class="dd-eye"></div><div class="dd-eye"></div></div></div>
    <div class="dd-earring dd-ear-l"></div><div class="dd-earring dd-ear-r"></div>
    <div class="dd-necklace"></div>
    <div class="dd-body"></div>
    <div class="dd-arm dd-arm-l"></div><div class="dd-arm dd-arm-r"></div>
    <div class="dd-lotus"></div>
    <div class="dd-legs"><div class="dd-leg"></div><div class="dd-leg"></div></div>`),

  murugan: ddBase('dd-murugan', `
    <div class="dd-crown"><div class="dd-crown-gem"></div></div>
    <div class="dd-head"><div class="dd-eyes"><div class="dd-eye"></div><div class="dd-eye"></div></div></div>
    <div class="dd-earring dd-ear-l"></div><div class="dd-earring dd-ear-r"></div>
    <div class="dd-body"></div>
    <div class="dd-arm dd-arm-l"></div><div class="dd-arm dd-arm-r"></div>
    <div class="dd-vel"></div>
    <div class="dd-legs"><div class="dd-leg"></div><div class="dd-leg"></div></div>
    <div class="dd-peacock"><div class="dd-pk-body"></div><div class="dd-pk-head"></div>
    <div class="dd-pk-tail"><div class="dd-pk-feather"></div><div class="dd-pk-feather"></div><div class="dd-pk-feather"></div><div class="dd-pk-feather"></div></div></div>`),

  krishna: ddBase('dd-krishna', `
    <div class="dd-crown"><div class="dd-feather"></div></div>
    <div class="dd-head"><div class="dd-eyes"><div class="dd-eye"></div><div class="dd-eye"></div></div></div>
    <div class="dd-earring dd-ear-l"></div><div class="dd-earring dd-ear-r"></div>
    <div class="dd-necklace"></div>
    <div class="dd-body"></div>
    <div class="dd-arm dd-arm-l"></div><div class="dd-arm dd-arm-r"></div>
    <div class="dd-flute"></div>
    <div class="dd-legs"><div class="dd-leg"></div><div class="dd-leg"></div></div>`),

  rama: ddBase('dd-rama', `
    <div class="dd-crown"><div class="dd-crown-gem"></div></div>
    <div class="dd-head"><div class="dd-eyes"><div class="dd-eye"></div><div class="dd-eye"></div></div></div>
    <div class="dd-earring dd-ear-l"></div><div class="dd-earring dd-ear-r"></div>
    <div class="dd-necklace"></div>
    <div class="dd-body"></div>
    <div class="dd-arm dd-arm-l"></div><div class="dd-arm dd-arm-r"></div>
    <div class="dd-bow"></div><div class="dd-arrow"></div>
    <div class="dd-legs"><div class="dd-leg"></div><div class="dd-leg"></div></div>`),

  hanuman: ddBase('dd-hanuman', `
    <div class="dd-crown"><div class="dd-crown-gem"></div></div>
    <div class="dd-head"><div class="dd-eyes"><div class="dd-eye"></div><div class="dd-eye"></div></div></div>
    <div class="dd-body"></div>
    <div class="dd-arm dd-arm-l"></div><div class="dd-arm dd-arm-r"></div>
    <div class="dd-mace"></div><div class="dd-tail"></div>
    <div class="dd-legs"><div class="dd-leg"></div><div class="dd-leg"></div></div>`),

  durga: ddBase('dd-durga', `
    <div class="dd-crown"><div class="dd-crown-gem"></div></div>
    <div class="dd-head"><div class="dd-eyes"><div class="dd-eye"></div><div class="dd-eye"></div></div></div>
    <div class="dd-earring dd-ear-l"></div><div class="dd-earring dd-ear-r"></div>
    <div class="dd-necklace"></div>
    <div class="dd-body"></div>
    <div class="dd-arm dd-arm-l"></div><div class="dd-arm dd-arm-r"></div>
    <div class="dd-trishul"></div><div class="dd-lion"></div>
    <div class="dd-legs"><div class="dd-leg"></div><div class="dd-leg"></div></div>`),

  lakshmi: ddBase('dd-lakshmi', `
    <div class="dd-crown"><div class="dd-crown-gem"></div></div>
    <div class="dd-head"><div class="dd-eyes"><div class="dd-eye"></div><div class="dd-eye"></div></div></div>
    <div class="dd-earring dd-ear-l"></div><div class="dd-earring dd-ear-r"></div>
    <div class="dd-necklace"></div>
    <div class="dd-body"></div>
    <div class="dd-arm dd-arm-l"></div><div class="dd-arm dd-arm-r"></div>
    <div class="dd-coin dd-coin-1"></div><div class="dd-coin dd-coin-2"></div><div class="dd-coin dd-coin-3"></div>
    <div class="dd-lotus-seat"></div>
    <div class="dd-legs"><div class="dd-leg"></div><div class="dd-leg"></div></div>`),

  saraswati: ddBase('dd-saraswati', `
    <div class="dd-crown"></div>
    <div class="dd-head"><div class="dd-eyes"><div class="dd-eye"></div><div class="dd-eye"></div></div></div>
    <div class="dd-earring dd-ear-l"></div><div class="dd-earring dd-ear-r"></div>
    <div class="dd-body"></div>
    <div class="dd-arm dd-arm-l"></div><div class="dd-arm dd-arm-r"></div>
    <div class="dd-veena"></div><div class="dd-book"></div>
    <div class="dd-legs"><div class="dd-leg"></div><div class="dd-leg"></div></div>`),

  ayyappa: ddBase('dd-ayyappa', `
    <div class="dd-crown"></div>
    <div class="dd-head"><div class="dd-eyes"><div class="dd-eye"></div><div class="dd-eye"></div></div></div>
    <div class="dd-earring dd-ear-l"></div><div class="dd-earring dd-ear-r"></div>
    <div class="dd-body"></div>
    <div class="dd-arm dd-arm-l"></div><div class="dd-arm dd-arm-r"></div>
    <div class="dd-tiger"></div>
    <div class="dd-legs"><div class="dd-leg"></div><div class="dd-leg"></div></div>`),

  navagraha: `<div class="dd dd-navagraha">
    ${['Surya','Chandra','Mangal','Budha','Guru','Shukra','Shani','Rahu','Ketu'].map(n =>
      `<div class="dd-graha"><div class="dd-graha-stone"></div><div class="dd-graha-base"></div><div class="dd-graha-name">${n}</div></div>`).join('')}
    <div class="dd-platform"></div></div>`
};

// ===== Zones =====
const zones = [
  { id:'shiva-temple', name:'Shiva Temple - Garbhagriha', x:870,y:1350,w:220,h:230, did:'shiva-deity', bell:1, dk:'shiva', m:'Om Namah Shivaya' },
  { id:'ganesha-shrine', name:'Ganesha Shrine', x:900,y:2550,w:120,h:130, did:'ganesha-deity', bell:1, dk:'ganesha', m:'Om Gam Ganapataye Namaha' },
  { id:'rama-shrine', name:'Sri Rama Shrine', x:500,y:2550,w:120,h:130, did:'rama-deity', bell:1, dk:'rama', m:'Sri Ram Jai Ram Jai Jai Ram' },
  { id:'ayyappa-shrine', name:'Ayyappa Swamy Shrine', x:1400,y:2550,w:120,h:130, did:'ayyappa-deity', bell:1, dk:'ayyappa', m:'Swamiye Saranam Ayyappa' },
  { id:'krishna-shrine', name:'Sri Krishna Shrine', x:400,y:2050,w:120,h:130, did:'krishna-deity', bell:1, dk:'krishna', m:'Hare Krishna Hare Krishna' },
  { id:'hanuman-shrine', name:'Hanuman Shrine', x:1500,y:2050,w:120,h:130, did:'hanuman-deity', bell:1, dk:'hanuman', m:'Jai Hanuman Gyan Gun Sagar' },
  { id:'venkateswara-shrine', name:'Sri Venkateswara (Balaji)', x:900,y:2000,w:160,h:170, did:'venkateswara-deity', bell:1, dk:'venkateswara', m:'Om Namo Venkatesaya' },
  { id:'parvati-shrine', name:'Parvati (Ambal) Shrine', x:1400,y:1400,w:120,h:130, did:'parvati-deity', bell:1, dk:'parvati', m:'Om Parvati Deviye Namaha' },
  { id:'murugan-shrine', name:'Murugan Shrine', x:400,y:1400,w:120,h:130, did:'murugan-deity', bell:1, dk:'murugan', m:'Om Saravana Bhava' },
  { id:'durga-shrine', name:'Durga Devi Shrine', x:1400,y:800,w:120,h:130, did:'durga-deity', bell:1, dk:'durga', m:'Om Dum Durgaye Namaha' },
  { id:'lakshmi-shrine', name:'Lakshmi Devi Shrine', x:900,y:800,w:120,h:130, did:'lakshmi-deity', bell:1, dk:'lakshmi', m:'Om Shreem Mahalakshmiyei Namaha' },
  { id:'saraswati-shrine', name:'Saraswati Devi Shrine', x:400,y:800,w:120,h:130, did:'saraswati-deity', bell:1, dk:'saraswati', m:'Om Aim Saraswatyai Namaha' },
  { id:'navagraha-shrine', name:'Navagraha Shrine', x:880,y:400,w:160,h:150, did:'navagraha-deity', bell:1, dk:'navagraha', m:'Om Navagraha Devathabhyo Namaha' },
  { id:'nandi', name:'Nandi Statue', x:930,y:1650,w:60,h:50 },
  { id:'garuda', name:'Garuda Statue', x:960,y:2180,w:40,h:40 },
  { id:'gopuram', name:'Gopuram - Temple Entrance', x:910,y:2880,w:140,h:170 },
  { id:'pond', name:'Temple Tank (Kulam)', x:85,y:1485,w:230,h:190 },
];

// ===== Darshan =====
function openD(key, mantra) {
  if (S.darshan) return;
  S.darshan = true;
  dDeity.innerHTML = dHTML[key];
  dMantra.textContent = mantra;
  dOverlay.classList.remove('hidden');
  dOverlay.classList.add('visible');
}
function closeD() {
  if (!S.darshan) return;
  S.darshan = false;
  dOverlay.classList.remove('visible');
  dOverlay.classList.add('hidden');
}
dOverlay.addEventListener('click', closeD);

// ===== Input =====
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeD(); return; }
  S.keys[e.key] = true; e.preventDefault();
});
document.addEventListener('keyup', e => S.keys[e.key] = false);

// ===== Camera =====
function cam() {
  const vw = innerWidth, vh = innerHeight;
  let cx = S.px - vw / 2, cy = S.py - vh / 2;
  cx = Math.max(0, Math.min(cx, S.ww - vw));
  cy = Math.max(0, Math.min(cy, S.wh - vh));
  world.style.transform = `translate(${-cx}px,${-cy}px)`;
}

// ===== Movement =====
function move() {
  if (S.darshan) return;
  let dx = 0, dy = 0;
  if (S.keys.ArrowUp || S.keys.w || S.keys.W) dy = -S.speed;
  if (S.keys.ArrowDown || S.keys.s || S.keys.S) dy = S.speed;
  if (S.keys.ArrowLeft || S.keys.a || S.keys.A) dx = -S.speed;
  if (S.keys.ArrowRight || S.keys.d || S.keys.D) dx = S.speed;
  if (dx && dy) { dx *= 0.707; dy *= 0.707; }
  S.px = Math.max(20, Math.min(S.ww - 20, S.px + dx));
  S.py = Math.max(20, Math.min(S.wh - 20, S.py + dy));
  player.style.left = (S.px - 10) + 'px';
  player.style.top = (S.py - 13) + 'px';
}

// ===== Zone Check =====
function checkZ() {
  if (S.darshan) return;
  let hit = null;
  for (const z of zones) {
    const m = 30;
    if (S.px > z.x - m && S.px < z.x + z.w + m && S.py > z.y - m && S.py < z.y + z.h + m) { hit = z; break; }
  }
  if (hit) {
    locName.textContent = hit.name;
    if (hit.did) {
      const d = $(hit.did);
      if (d) { d.classList.remove('hidden'); d.classList.add('visible'); }
    }
    if (hit.id !== S.shrine && hit.bell) { bell(); S.shrine = hit.id; }
    if (hit.dk && hit.id !== S.loc) openD(hit.dk, hit.m);
    S.loc = hit.id;
  } else {
    if (S.loc) {
      zones.forEach(z => { if (z.did) { const d = $(z.did); if (d) { d.classList.remove('visible'); d.classList.add('hidden'); } } });
      closeD(); S.loc = ''; S.shrine = null;
    }
    if (S.py > 2700) locName.textContent = 'Near Temple Entrance';
    else if (S.py > 2300) locName.textContent = 'Temple Courtyard - South';
    else if (S.py > 1800) locName.textContent = 'Temple Courtyard - Mid South';
    else if (S.py > 1200) locName.textContent = 'Temple Courtyard - Central';
    else if (S.py > 600) locName.textContent = 'Temple Courtyard - North';
    else locName.textContent = 'Temple Courtyard - Far North';
  }
}

// ===== Day/Night Cycle =====
function generateStars() {
  let html = '';
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 100, y = Math.random() * 100;
    const s = 1 + Math.random() * 2;
    const d = Math.random() * 3;
    html += `<div style="position:absolute;left:${x}%;top:${y}%;width:${s}px;height:${s}px;background:#fff;border-radius:50%;animation:twinkle ${1.5+d}s ease-in-out infinite;opacity:0;"></div>`;
  }
  stars.innerHTML = html;
  const style = document.createElement('style');
  style.textContent = '@keyframes twinkle{0%,100%{opacity:0.2;}50%{opacity:1;}}';
  document.head.appendChild(style);
}

function updateSky() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  const t = h + m / 60;

  let phase, sunY, moonY, starOp;

  if (t >= 6 && t < 7) { phase = 'dawn'; }
  else if (t >= 7 && t < 17) { phase = 'day'; }
  else if (t >= 17 && t < 18.5) { phase = 'dusk'; }
  else { phase = 'night'; }

  sky.className = 'sky-' + phase;
  world.className = 'world-' + phase;

  // Sun position (arc from left to right, 6am to 6pm)
  if (t >= 5.5 && t < 18.5) {
    const sunProg = (t - 5.5) / 13;
    const sunX = 10 + sunProg * 80;
    sunY = 80 - Math.sin(sunProg * Math.PI) * 70;
    sun.style.left = sunX + '%';
    sun.style.top = sunY + '%';
    sun.style.opacity = phase === 'night' ? '0' : '1';
  } else {
    sun.style.opacity = '0';
  }

  // Moon position
  if (t >= 18 || t < 6) {
    const moonProg = t >= 18 ? (t - 18) / 12 : (t + 6) / 12;
    const moonX = 10 + moonProg * 80;
    moonY = 80 - Math.sin(moonProg * Math.PI) * 65;
    moon.style.left = moonX + '%';
    moon.style.top = moonY + '%';
    moon.style.opacity = '1';
  } else {
    moon.style.opacity = '0';
  }

  // Stars
  stars.style.opacity = (phase === 'night') ? '1' : (phase === 'dusk' ? '0.4' : '0');

  // Night mode for lamps
  if (phase === 'night' || phase === 'dusk') {
    document.body.classList.add('night-mode');
  } else {
    document.body.classList.remove('night-mode');
  }

  // Time display
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mStr = m < 10 ? '0' + m : m;
  const phaseName = { dawn: 'Dawn', day: 'Day', dusk: 'Dusk', night: 'Night' };
  timeDisp.textContent = `${h12}:${mStr} ${ampm} - ${phaseName[phase]}`;
}

// ===== Game Loop =====
let skyTimer = 0;
function loop() {
  move(); cam(); checkZ();
  if (++skyTimer % 60 === 0) updateSky();
  requestAnimationFrame(loop);
}

// ===== Init =====
function init() {
  player.style.left = (S.px - 10) + 'px';
  player.style.top = (S.py - 13) + 'px';
  generateStars();
  updateSky();
  cam();
  loop();
}
init();
