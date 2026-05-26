/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FLOATING BUBBLE BACKGROUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const BUBBLES = [
  { x: '10%', y: '18%', s: 95,  d: 28, del: 0,  rgb: '0,114,184'   }, // blue — defender
  { x: '78%', y: '8%',  s: 60,  d: 22, del: 3,  rgb: '255,111,32'  }, // orange — pathogen
  { x: '48%', y: '52%', s: 115, d: 32, del: 7,  rgb: '255,154,0'   }, // orange warm — inflammation
  { x: '6%',  y: '68%', s: 80,  d: 20, del: 11, rgb: '0,114,184'   }, // blue — defender
  { x: '70%', y: '62%', s: 65,  d: 26, del: 5,  rgb: '255,215,0'   }, // yellow — alarm
  { x: '58%', y: '85%', s: 90,  d: 30, del: 9,  rgb: '163,213,224' }, // light blue — memory
  { x: '28%', y: '38%', s: 105, d: 24, del: 15, rgb: '255,111,32'  }, // orange — pathogen
];

const field = document.createElement('div');
field.id = 'cell-field';
document.body.prepend(field);

BUBBLES.forEach(b => {
  const el = document.createElement('div');
  el.className = 'bg-cell';
  Object.assign(el.style, {
    left:    b.x,
    top:     b.y,
    width:   b.s + 'px',
    height:  b.s + 'px',
    '--d':   b.d + 's',
    '--del': b.del + 's',
    background: `radial-gradient(ellipse at 32% 28%,
      rgba(255,255,255,0.60) 0%,
      rgba(${b.rgb},0.14) 45%,
      rgba(${b.rgb},0.03) 100%
    )`,
  });
  field.appendChild(el);
});


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SIGNAL WAVE CANVAS (cytokine pulses)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const sigCanvas = document.createElement('canvas');
sigCanvas.id = 'signal-canvas';
document.body.prepend(sigCanvas);
const sigCtx = sigCanvas.getContext('2d');
let signals = [];

function resizeSig() {
  sigCanvas.width  = window.innerWidth;
  sigCanvas.height = window.innerHeight;
}
resizeSig();
window.addEventListener('resize', resizeSig);

const SIG_COLORS = [
  '0,114,184',    // blue — immune signal
  '255,111,32',   // orange-red — pathogen signal
  '255,154,0',    // orange — inflammation
  '255,215,0',    // yellow — alarm
  '163,213,224',  // light blue — memory signal
];

function spawnSignal(x, y, rgb, maxR) {
  signals.push({ x, y, r: 2, maxR: maxR || (28 + Math.random() * 42), life: 1.0, rgb });
}

function scheduleSignal() {
  const delay = 220 + Math.random() * 380;
  setTimeout(() => {
    const x   = Math.random() * window.innerWidth;
    const y   = Math.random() * window.innerHeight;
    const rgb = SIG_COLORS[Math.floor(Math.random() * SIG_COLORS.length)];
    spawnSignal(x, y, rgb);
    scheduleSignal();
  }, delay);
}
scheduleSignal();

function animateSignals() {
  sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  signals = signals.filter(s => s.life > 0.02);
  for (const s of signals) {
    s.r   += 0.75;
    s.life = Math.max(0, 1 - s.r / s.maxR);
    sigCtx.beginPath();
    sigCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sigCtx.strokeStyle = `rgba(${s.rgb},${s.life * 0.38})`;
    sigCtx.lineWidth   = 1.8 * s.life + 0.4;
    sigCtx.stroke();
  }
  requestAnimationFrame(animateSignals);
}
animateSignals();


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SPACEBAR CYTOKINE STORM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
window.addEventListener('keydown', e => {
  if (e.code !== 'Space') return;
  const tag = document.activeElement.tagName;
  if (['INPUT','TEXTAREA','BUTTON','SELECT'].includes(tag)) return;
  e.preventDefault();

  const count = 50 + Math.floor(Math.random() * 25);
  for (let i = 0; i < count; i++) {
    const x   = Math.random() * window.innerWidth;
    const y   = Math.random() * window.innerHeight;
    const rgb = Math.random() > 0.45 ? '255,111,32' : '0,114,184';
    spawnSignal(x, y, rgb, 35 + Math.random() * 55);
  }
});


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PATHOGEN FRAME ANIMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const pathogenCanvas = document.getElementById('pathogen-canvas');
if (pathogenCanvas) {
  const pCtx       = pathogenCanvas.getContext('2d');
  const FRAME_COUNT = 60;
  const FPS         = 24;
  const FRAME_MS    = 1000 / FPS;
  const BASE        = import.meta.env.BASE_URL;
  const frames      = [];
  let loaded        = 0;
  let currentFrame  = 0;
  let lastFrameTime = 0;
  let animStarted   = false;

  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.src = `${BASE}images/pathogen/${String(i).padStart(4, '0')}.png`;
    img.onload = () => {
      loaded++;
      if (loaded >= 1 && !animStarted) {
        animStarted = true;
        requestAnimationFrame(drawFrame);
      }
    };
    frames.push(img);
  }

  function drawFrame(timestamp) {
    requestAnimationFrame(drawFrame);
    if (timestamp - lastFrameTime < FRAME_MS) return;
    lastFrameTime = timestamp;

    pCtx.clearRect(0, 0, pathogenCanvas.width, pathogenCanvas.height);

    const img = frames[currentFrame];
    if (img.complete && img.naturalWidth > 0) {
      pCtx.drawImage(img, 0, 0, pathogenCanvas.width, pathogenCanvas.height);
    }

    currentFrame = (currentFrame + 1) % FRAME_COUNT;
  }
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ROTATED IMAGE WRAPPER FIX
   Wrap .rotate-ccw imgs in a container div
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
document.querySelectorAll('.rotated-wrap').forEach(figure => {
  const img = figure.querySelector('img');
  const cap = figure.querySelector('figcaption');
  if (!img) return;

  const wrap = document.createElement('div');
  wrap.className = 'img-container';
  figure.insertBefore(wrap, img);
  wrap.appendChild(img);

  if (cap) {
    figure.appendChild(cap);
  }
});


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   NAV ACTIVE STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const navLinks = document.querySelectorAll('#main-nav a');
const sections = document.querySelectorAll('main section[id]');

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`#main-nav a[href="#${entry.target.id}"]`);
      if (link) link.classList.add('active');
    }
  }
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));
