// ===== Game State =====
const state = {
  playerX: 800,
  playerY: 2050,
  speed: 4,
  keys: {},
  worldWidth: 1600,
  worldHeight: 2200,
  currentLocation: '',
  activeShrine: null,
  bellPlaying: false,
  darshanOpen: false
};

// ===== DOM Elements =====
const world = document.getElementById('world');
const player = document.getElementById('player');
const viewport = document.getElementById('viewport');
const locationName = document.getElementById('location-name');
const darshanOverlay = document.getElementById('darshan-overlay');
const darshanDeityContainer = document.getElementById('darshan-deity-container');
const darshanMantra = document.getElementById('darshan-mantra');

// ===== Audio Context for Temple Bell =====
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTempleBell() {
  if (state.bellPlaying) return;
  state.bellPlaying = true;

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(800, now);
  osc1.frequency.exponentialRampToValueAtTime(600, now + 2);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1200, now);
  osc2.frequency.exponentialRampToValueAtTime(900, now + 2);

  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(1600, now);
  osc3.frequency.exponentialRampToValueAtTime(1100, now + 1.5);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

  osc1.connect(gain);
  osc2.connect(gain);
  osc3.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc3.start(now);
  osc1.stop(now + 2.5);
  osc2.stop(now + 2.5);
  osc3.stop(now + 2.5);

  setTimeout(() => { state.bellPlaying = false; }, 3000);
}

// ===== Darshan View HTML for each deity =====
const darshanHTML = {
  ganesha: `
    <div class="darshan-ganesha">
      <div class="d-halo"></div>
      <div class="d-crown"></div>
      <div class="d-ear d-ear-left"></div>
      <div class="d-ear d-ear-right"></div>
      <div class="d-head"></div>
      <div class="d-third-eye"></div>
      <div class="d-eyes"><div class="d-eye"></div><div class="d-eye"></div></div>
      <div class="d-trunk"></div>
      <div class="d-tusk-left"></div>
      <div class="d-tusk-right"></div>
      <div class="d-body">
        <div class="d-belly"></div>
        <div class="d-navel"></div>
      </div>
      <div class="d-upper-arm d-arm-ul"></div>
      <div class="d-upper-arm d-arm-ur"></div>
      <div class="d-upper-arm d-arm-ll"></div>
      <div class="d-upper-arm d-arm-lr"></div>
      <div class="d-modak"></div>
      <div class="d-legs">
        <div class="d-leg"></div>
        <div class="d-leg d-leg-crossed"></div>
      </div>
      <div class="d-pedestal"></div>
    </div>`,

  shiva: `
    <div class="darshan-shiva">
      <div class="d-halo"></div>
      <div class="d-glow"></div>
      <div class="d-naga-hood"></div>
      <div class="d-naga-body"></div>
      <div class="d-lingam">
        <div class="d-bilva"></div>
        <div class="d-vibhuti"></div>
      </div>
      <div class="d-avudaiyar"></div>
      <div class="d-base"></div>
    </div>`,

  parvati: `
    <div class="darshan-parvati">
      <div class="d-halo"></div>
      <div class="d-crown"></div>
      <div class="d-head">
        <div class="d-bindi"></div>
        <div class="d-eyes"><div class="d-eye"></div><div class="d-eye"></div></div>
      </div>
      <div class="d-earring d-earring-l"></div>
      <div class="d-earring d-earring-r"></div>
      <div class="d-necklace"></div>
      <div class="d-body">
        <div class="d-sari-drape"></div>
      </div>
      <div class="d-arm d-arm-l"></div>
      <div class="d-arm d-arm-r"></div>
      <div class="d-lotus"></div>
      <div class="d-legs">
        <div class="d-leg"></div>
        <div class="d-leg"></div>
      </div>
      <div class="d-pedestal"></div>
    </div>`,

  murugan: `
    <div class="darshan-murugan">
      <div class="d-halo"></div>
      <div class="d-crown"></div>
      <div class="d-head">
        <div class="d-eyes"><div class="d-eye"></div><div class="d-eye"></div></div>
      </div>
      <div class="d-body"></div>
      <div class="d-arm d-arm-l"></div>
      <div class="d-arm d-arm-r"></div>
      <div class="d-vel"></div>
      <div class="d-legs">
        <div class="d-leg"></div>
        <div class="d-leg"></div>
      </div>
      <div class="d-peacock">
        <div class="d-peacock-body"></div>
        <div class="d-peacock-neck"></div>
        <div class="d-peacock-head"></div>
        <div class="d-peacock-crest"></div>
        <div class="d-peacock-tail">
          <div class="d-peacock-feather"></div>
          <div class="d-peacock-feather"></div>
          <div class="d-peacock-feather"></div>
          <div class="d-peacock-feather"></div>
          <div class="d-peacock-feather"></div>
        </div>
      </div>
      <div class="d-pedestal"></div>
    </div>`
};

// ===== Darshan open/close =====
function openDarshan(deityKey, mantraText) {
  if (state.darshanOpen) return;
  state.darshanOpen = true;
  darshanDeityContainer.innerHTML = darshanHTML[deityKey];
  darshanMantra.textContent = mantraText;
  darshanOverlay.classList.remove('hidden');
  darshanOverlay.classList.add('visible');
}

function closeDarshan() {
  if (!state.darshanOpen) return;
  state.darshanOpen = false;
  darshanOverlay.classList.remove('visible');
  darshanOverlay.classList.add('hidden');
}

darshanOverlay.addEventListener('click', closeDarshan);

// ===== Shrine / Location Zones =====
const zones = [
  {
    id: 'shiva-temple',
    name: 'Shiva Temple - Garbhagriha',
    x: 700, y: 820, w: 200, h: 220,
    deityId: 'shiva-deity',
    hasBell: true,
    darshanKey: 'shiva',
    mantra: 'Om Namah Shivaya'
  },
  {
    id: 'ganesha-shrine',
    name: 'Ganesha Shrine',
    x: 500, y: 1700, w: 120, h: 130,
    deityId: 'ganesha-deity',
    hasBell: true,
    darshanKey: 'ganesha',
    mantra: 'Om Gam Ganapataye Namaha'
  },
  {
    id: 'parvati-shrine',
    name: 'Parvati (Ambal) Shrine',
    x: 1050, y: 850, w: 120, h: 130,
    deityId: 'parvati-deity',
    hasBell: true,
    darshanKey: 'parvati',
    mantra: 'Om Parvati Deviye Namaha'
  },
  {
    id: 'murugan-shrine',
    name: 'Murugan Shrine',
    x: 320, y: 850, w: 120, h: 130,
    deityId: 'murugan-deity',
    hasBell: true,
    darshanKey: 'murugan',
    mantra: 'Om Saravana Bhava'
  },
  {
    id: 'nandi',
    name: 'Nandi Statue',
    x: 760, y: 1100, w: 80, h: 80,
    deityId: null, hasBell: false, darshanKey: null, mantra: null
  },
  {
    id: 'gopuram',
    name: 'Gopuram - Temple Entrance',
    x: 730, y: 1900, w: 140, h: 170,
    deityId: null, hasBell: false, darshanKey: null, mantra: null
  },
  {
    id: 'pond',
    name: 'Temple Tank (Kulam)',
    x: 235, y: 1335, w: 230, h: 190,
    deityId: null, hasBell: false, darshanKey: null, mantra: null
  }
];

// ===== Input Handling =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDarshan();
    return;
  }
  state.keys[e.key] = true;
  e.preventDefault();
});

document.addEventListener('keyup', (e) => {
  state.keys[e.key] = false;
});

// ===== Camera =====
function updateCamera() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let camX = state.playerX - vw / 2;
  let camY = state.playerY - vh / 2;

  camX = Math.max(0, Math.min(camX, state.worldWidth - vw));
  camY = Math.max(0, Math.min(camY, state.worldHeight - vh));

  world.style.transform = `translate(${-camX}px, ${-camY}px)`;
}

// ===== Movement =====
function updatePlayer() {
  if (state.darshanOpen) return;

  let dx = 0;
  let dy = 0;

  if (state.keys['ArrowUp'] || state.keys['w'] || state.keys['W']) dy = -state.speed;
  if (state.keys['ArrowDown'] || state.keys['s'] || state.keys['S']) dy = state.speed;
  if (state.keys['ArrowLeft'] || state.keys['a'] || state.keys['A']) dx = -state.speed;
  if (state.keys['ArrowRight'] || state.keys['d'] || state.keys['D']) dx = state.speed;

  if (dx !== 0 && dy !== 0) {
    dx *= 0.707;
    dy *= 0.707;
  }

  state.playerX = Math.max(20, Math.min(state.worldWidth - 20, state.playerX + dx));
  state.playerY = Math.max(20, Math.min(state.worldHeight - 20, state.playerY + dy));

  player.style.left = (state.playerX - 10) + 'px';
  player.style.top = (state.playerY - 10) + 'px';
}

// ===== Zone Detection =====
function checkZones() {
  if (state.darshanOpen) return;

  const px = state.playerX;
  const py = state.playerY;
  let inZone = null;

  for (const zone of zones) {
    const margin = 30;
    if (px > zone.x - margin && px < zone.x + zone.w + margin &&
        py > zone.y - margin && py < zone.y + zone.h + margin) {
      inZone = zone;
      break;
    }
  }

  if (inZone) {
    locationName.textContent = inZone.name;

    if (inZone.deityId) {
      const deity = document.getElementById(inZone.deityId);
      if (deity) {
        deity.classList.remove('hidden');
        deity.classList.add('visible');
      }
    }

    if (inZone.id !== state.activeShrine && inZone.hasBell) {
      playTempleBell();
      state.activeShrine = inZone.id;
    }

    if (inZone.darshanKey && inZone.id !== state.currentLocation) {
      openDarshan(inZone.darshanKey, inZone.mantra);
    }

    state.currentLocation = inZone.id;
  } else {
    if (state.currentLocation) {
      for (const zone of zones) {
        if (zone.deityId) {
          const deity = document.getElementById(zone.deityId);
          if (deity) {
            deity.classList.remove('visible');
            deity.classList.add('hidden');
          }
        }
      }

      closeDarshan();
      state.currentLocation = '';
      state.activeShrine = null;
    }

    if (py > 1800) locationName.textContent = 'Near Temple Entrance';
    else if (py > 1400) locationName.textContent = 'Temple Courtyard - South';
    else if (py > 1000) locationName.textContent = 'Temple Courtyard - Central';
    else locationName.textContent = 'Temple Courtyard - North';
  }
}

// ===== Game Loop =====
function gameLoop() {
  updatePlayer();
  updateCamera();
  checkZones();
  requestAnimationFrame(gameLoop);
}

// ===== Initialize =====
function init() {
  player.style.left = (state.playerX - 10) + 'px';
  player.style.top = (state.playerY - 10) + 'px';
  updateCamera();
  gameLoop();
}

init();
