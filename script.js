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
  bellPlaying: false
};

// ===== DOM Elements =====
const world = document.getElementById('world');
const player = document.getElementById('player');
const viewport = document.getElementById('viewport');
const locationName = document.getElementById('location-name');
const deityPopup = document.getElementById('deity-popup');
const deityPopupContent = document.getElementById('deity-popup-content');
const deityPopupName = document.getElementById('deity-popup-name');

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

  // Bell strike - metallic tone
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(800, now);
  osc1.frequency.exponentialRampToValueAtTime(600, now + 1.5);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1200, now);
  osc2.frequency.exponentialRampToValueAtTime(900, now + 1.5);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 2);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 2);
  osc2.stop(now + 2);

  setTimeout(() => { state.bellPlaying = false; }, 2500);
}

// ===== Shrine / Location Zones =====
const zones = [
  {
    id: 'shiva-temple',
    name: 'Shiva Temple - Garbhagriha',
    x: 700, y: 820, w: 200, h: 220,
    deityId: 'shiva-deity',
    hasBell: true,
    popupHTML: `
      <div class="shiva-lingam" style="display:flex;flex-direction:column;align-items:center;position:relative;">
        <div style="width:50px;height:15px;background:#666;border-radius:3px;border:1px solid #444;"></div>
        <div style="width:26px;height:36px;background:linear-gradient(to right,#333,#555,#333);border-radius:50% 50% 5px 5px;border:1px solid #222;margin-top:-3px;"></div>
      </div>`,
    popupName: 'Om Namah Shivaya'
  },
  {
    id: 'ganesha-shrine',
    name: 'Ganesha Shrine',
    x: 500, y: 1700, w: 120, h: 130,
    deityId: 'ganesha-deity',
    hasBell: true,
    popupHTML: `
      <div style="display:flex;flex-direction:column;align-items:center;position:relative;width:50px;height:60px;">
        <div style="width:28px;height:25px;background:#ff9966;border-radius:50%;border:1px solid #cc6633;z-index:2;"></div>
        <div style="width:7px;height:16px;background:#ff9966;border:1px solid #cc6633;border-radius:0 0 5px 5px;margin-top:-3px;margin-left:-10px;transform:rotate(10deg);z-index:3;"></div>
        <div style="width:34px;height:28px;background:#ff9966;border-radius:50%;border:1px solid #cc6633;margin-top:-8px;"></div>
      </div>`,
    popupName: 'Om Gam Ganapataye Namaha'
  },
  {
    id: 'parvati-shrine',
    name: 'Parvati (Ambal) Shrine',
    x: 1050, y: 850, w: 120, h: 130,
    deityId: 'parvati-deity',
    hasBell: true,
    popupHTML: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:20px;height:10px;background:#ffd700;border-radius:5px 5px 0 0;border:1px solid #daa520;"></div>
        <div style="width:18px;height:18px;background:#deb887;border-radius:50%;border:1px solid #b8860b;margin-top:-2px;"></div>
        <div style="width:26px;height:36px;background:linear-gradient(to bottom,#ff1493,#c71585);border-radius:8px 8px 12px 12px;border:1px solid #8b0a50;margin-top:-2px;"></div>
      </div>`,
    popupName: 'Om Parvati Deviye Namaha'
  },
  {
    id: 'murugan-shrine',
    name: 'Murugan Shrine',
    x: 320, y: 850, w: 120, h: 130,
    deityId: 'murugan-deity',
    hasBell: true,
    popupHTML: `
      <div style="display:flex;flex-direction:column;align-items:center;position:relative;">
        <div style="width:16px;height:16px;background:#deb887;border-radius:50%;border:1px solid #b8860b;"></div>
        <div style="width:22px;height:28px;background:linear-gradient(to bottom,#ff4500,#cc3300);border-radius:5px;border:1px solid #8b2500;margin-top:-2px;"></div>
        <div style="position:absolute;right:-10px;top:0;width:3px;height:45px;background:#ccc;border:1px solid #999;"></div>
        <div style="display:flex;gap:2px;margin-top:5px;">
          <div style="width:10px;height:8px;background:#1e90ff;border-radius:50%;"></div>
          <div style="width:8px;height:12px;background:radial-gradient(circle,#00ff00,#1e90ff);border-radius:50%;"></div>
          <div style="width:8px;height:12px;background:radial-gradient(circle,#00ff00,#1e90ff);border-radius:50%;"></div>
        </div>
      </div>`,
    popupName: 'Om Saravana Bhava'
  },
  {
    id: 'nandi',
    name: 'Nandi Statue',
    x: 760, y: 1100, w: 80, h: 80,
    deityId: null,
    hasBell: false,
    popupHTML: null,
    popupName: null
  },
  {
    id: 'gopuram',
    name: 'Gopuram - Temple Entrance',
    x: 730, y: 1900, w: 140, h: 170,
    deityId: null,
    hasBell: false,
    popupHTML: null,
    popupName: null
  },
  {
    id: 'pond',
    name: 'Temple Tank (Kulam)',
    x: 235, y: 1335, w: 230, h: 190,
    deityId: null,
    hasBell: false,
    popupHTML: null,
    popupName: null
  }
];

// ===== Input Handling =====
document.addEventListener('keydown', (e) => {
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
  let dx = 0;
  let dy = 0;

  if (state.keys['ArrowUp'] || state.keys['w'] || state.keys['W']) dy = -state.speed;
  if (state.keys['ArrowDown'] || state.keys['s'] || state.keys['S']) dy = state.speed;
  if (state.keys['ArrowLeft'] || state.keys['a'] || state.keys['A']) dx = -state.speed;
  if (state.keys['ArrowRight'] || state.keys['d'] || state.keys['D']) dx = state.speed;

  // Diagonal normalization
  if (dx !== 0 && dy !== 0) {
    dx *= 0.707;
    dy *= 0.707;
  }

  const newX = Math.max(20, Math.min(state.worldWidth - 20, state.playerX + dx));
  const newY = Math.max(20, Math.min(state.worldHeight - 20, state.playerY + dy));

  state.playerX = newX;
  state.playerY = newY;

  player.style.left = (state.playerX - 10) + 'px';
  player.style.top = (state.playerY - 10) + 'px';
}

// ===== Zone Detection =====
function checkZones() {
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

    if (inZone.popupHTML && inZone.id !== state.currentLocation) {
      deityPopupContent.innerHTML = inZone.popupHTML;
      deityPopupName.textContent = inZone.popupName;
      deityPopup.classList.remove('hidden');
      deityPopup.classList.add('visible');
    }

    state.currentLocation = inZone.id;
  } else {
    if (state.currentLocation) {
      // Hide deity figures when leaving
      for (const zone of zones) {
        if (zone.deityId) {
          const deity = document.getElementById(zone.deityId);
          if (deity) {
            deity.classList.remove('visible');
            deity.classList.add('hidden');
          }
        }
      }

      deityPopup.classList.remove('visible');
      deityPopup.classList.add('hidden');
      state.currentLocation = '';
      state.activeShrine = null;
    }

    // Determine general location
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
