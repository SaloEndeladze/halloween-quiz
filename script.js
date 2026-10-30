// Every image in images/ is named after the person whose eyes it shows.
// To add someone: drop "<name>.png" into images/ and add the name here.
const NAMES = [
  'ალექსანდრე ბურჯანაძე',
  'ალექსანდრე ნემსაძე',
  'ანა თოი',
  'ეკა',
  'ელენე თანდაშვილი',
  'ზვიად წოწოკოლაური',
  'ზუკა გრძელიძე',
  'ზუკა ნიქაბაძე',
  'თაზო',
  'თამარუ',
  'თამთა ბაბუნაშვილი',
  'თინა ანანიაშვილი',
  'თორნიკე',
  'თორო სულაბერიძე',
  'ირაკლი თავაძე',
  'მათე',
  'მარიამ მანთიძე',
  'ნათია ავსაჯანიშვილი',
  'ნინი ხარშილაძე',
  'ნინო ჩიტაშვილი',
  'ნინუნა უნგიაძე',
  'სალომე ენდელაძე',
  'ქეთი ჩახნაშვილი',
  'ქეთო გეთიაშვილი',
  'ხოსიკა',
  'ჯერიკო',
];

const QUESTION_TIME = 15;
const OPTION_ICONS = ['🎃', '🦇', '🕸️', '🕯️'];
const CANDY = ['🍬', '🍭', '🍫', '🎃', '⭐', '👻', '🦇'];
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const RANKS = [
  { min: 1, emoji: '👑', title: 'ჰელოუინის ლეგენდა' },
  { min: 0.8, emoji: '🔮', title: 'ნამდვილი ექსტრასენსი' },
  { min: 0.6, emoji: '🧙', title: 'გამოცდილი ჯადოქარი' },
  { min: 0.4, emoji: '🎃', title: 'მხიარული გოგრა' },
  { min: 0.2, emoji: '🦇', title: 'ბრმა ღამურა' },
  { min: 0, emoji: '🧟', title: 'დაკარგული ზომბი' },
];

const STAGE_W = 1920;
const STAGE_H = 1080;

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const imgSrc = (name) => 'images/' + encodeURIComponent(name) + '.png';

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------- Sound (synthesized, no files needed) ----------
let audio = null;

function initAudio() {
  if (!audio) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audio = new Ctx();
  }
  if (audio && audio.state === 'suspended') audio.resume();
}

function tone(freq, delay, dur, { type = 'sine', vol = 0.15, to = null } = {}) {
  if (!audio) return;
  const t = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

const sfx = {
  start() {
    tone(420, 0, 1.3, { vol: 0.14, to: 140 });
    tone(630, 0.18, 1.1, { vol: 0.07, to: 210 });
    tone(90, 0, 0.9, { type: 'triangle', vol: 0.2, to: 50 });
  },
  correct() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.28, { type: 'triangle', vol: 0.16 }));
  },
  wrong() {
    tone(220, 0, 0.55, { type: 'sawtooth', vol: 0.1, to: 60 });
    tone(233, 0.02, 0.55, { type: 'square', vol: 0.05, to: 55 });
  },
  tick() { tone(1400, 0, 0.05, { type: 'square', vol: 0.04 }); },
  potion() {
    [300, 450, 380, 600, 520, 820].forEach((f, i) => tone(f, i * 0.05, 0.08, { type: 'sine', vol: 0.12 }));
  },
  zoom() { tone(500, 0, 0.12, { type: 'triangle', vol: 0.06, to: 900 }); },
  end() {
    [392, 523, 659, 784, 659, 1047].forEach((f, i) => tone(f, i * 0.12, 0.35, { type: 'triangle', vol: 0.15 }));
  },
};

// ---------- Decor ----------
function buildDecor() {
  const stars = $('stars');
  for (let i = 0; i < 140; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 65 + '%';
    s.style.animationDelay = -Math.random() * 3 + 's';
    if (Math.random() < 0.2) s.classList.add('big');
    stars.appendChild(s);
  }

  // Spider webs in the top corners
  const angles = [0, 18, 36, 54, 72, 90];
  const R = 155;
  const pts = angles.map((a) => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)]);
  let d = pts.map(([x, y]) => `M0 0L${x * R} ${y * R}`).join('');
  [0.25, 0.45, 0.65, 0.85].forEach((f) => {
    const r = R * f;
    d += `M${pts[0][0] * r} ${pts[0][1] * r}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const mx = ((x0 + x1) / 2) * r * 0.86;
      const my = ((y0 + y1) / 2) * r * 0.86;
      d += `Q${mx} ${my} ${x1 * r} ${y1 * r}`;
    }
  });
  document.querySelectorAll('.web').forEach((w) => (w.innerHTML = `<path d="${d}"/>`));
}

// ---------- Stage scaling ----------
// The game is laid out at 1920x1080 and scaled to fill the screen (2x on a 4K TV).
let scale = 1;

function fitStage() {
  scale = Math.min(innerWidth / STAGE_W, innerHeight / STAGE_H);
  stage.style.transform = `scale(${scale})`;
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

// Hide the mouse cursor while it's not moving, so it doesn't sit on the TV picture
let idleTimer = 0;
function wakeCursor() {
  document.body.classList.remove('idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => document.body.classList.add('idle'), 2500);
}

// ---------- Screens ----------
function show(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  document.body.classList.toggle('playing', id === 'game');
  if (id === 'end') armEndIdle();
  else clearInterval(endIdleTimer);
}

// ---------- Results screen: back to home when nobody touches it ----------
const END_IDLE_SECONDS = 20;
let endIdleTimer = 0;
let endIdleDeadline = 0;

function armEndIdle() {
  clearInterval(endIdleTimer);
  endIdleDeadline = performance.now() + END_IDLE_SECONDS * 1000;
  updateEndIdle();
  endIdleTimer = setInterval(updateEndIdle, 250);
}

function updateEndIdle() {
  const left = Math.ceil((endIdleDeadline - performance.now()) / 1000);
  // Show a countdown on the home button for the last 10 seconds
  $('homeBtn').textContent = left <= 10 ? `🏠 მთავარი (${Math.max(left, 0)})` : '🏠 მთავარი';
  if (left <= 0) show('start');
}

function activeScreen() {
  return document.querySelector('.screen.active').id;
}

// ---------- Game state ----------
const state = {
  order: [],
  idx: 0,
  score: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  missed: [],
  answered: true,
  fifty: true,
  extraTime: true,
  total: QUESTION_TIME,
  deadline: 0,
  lastSec: 0,
  raf: 0,
  timerStarted: false,
  paused: false,
  pausedLeft: 0,
  hintSeen: false,
};

function startGame() {
  initAudio();
  sfx.start();
  Object.assign(state, {
    order: shuffle(NAMES.slice()),
    idx: 0,
    score: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    missed: [],
    fifty: true,
    extraTime: true,
    hintSeen: false,
  });
  $('score').textContent = '0';
  show('game');
  renderQuestion();
}

function current() {
  return state.order[state.idx];
}

function renderQuestion() {
  const name = current();
  state.answered = false;
  $('game').classList.remove('answered');
  $('nextBtn').classList.remove('show');
  $('feedback').className = 'feedback';
  $('qCounter').textContent = `👻 ${state.idx + 1}/${state.order.length}`;
  updateStreak();

  $('fiftyBtn').disabled = !state.fifty;
  $('timeBtn').disabled = !state.extraTime;

  const photo = $('photo');
  photo.classList.remove('zoom');
  $('zoomHint').classList.toggle('hide', state.hintSeen);

  const card = $('card');
  card.classList.remove('enter', 'shake');
  void card.offsetWidth;
  card.classList.add('enter');

  const others = shuffle(NAMES.filter((n) => n !== name)).slice(0, 3);
  const options = shuffle([name, ...others]);
  const box = $('options');
  box.innerHTML = '';
  options.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.dataset.name = opt;
    b.innerHTML = `<span class="letter">${OPTION_LETTERS[i]}</span><span class="ico">${OPTION_ICONS[i]}</span><span></span>`;
    b.lastChild.textContent = opt;
    b.addEventListener('click', () => answer(b));
    box.appendChild(b);
  });

  resetTimerUI();
  const img = $('ghostImg');
  img.onload = img.onerror = () => startTimer();
  img.src = imgSrc(name);

  // Preload the next ghost so it pops in instantly
  const next = state.order[state.idx + 1];
  if (next) new Image().src = imgSrc(next);
}

// ---------- Timer ----------
function resetTimerUI() {
  cancelAnimationFrame(state.raf);
  state.timerStarted = false;
  state.total = QUESTION_TIME;
  $('timerFill').style.transform = 'scaleX(1)';
  $('secs').textContent = QUESTION_TIME;
  $('secs').classList.remove('low');
  document.querySelector('.timer').classList.remove('low');
}

function startTimer() {
  if (state.answered || state.paused) return;
  cancelAnimationFrame(state.raf);
  state.timerStarted = true;
  state.deadline = performance.now() + QUESTION_TIME * 1000;
  state.lastSec = QUESTION_TIME;
  tickTimer();
}

function remaining() {
  return Math.max(0, (state.deadline - performance.now()) / 1000);
}

function tickTimer() {
  if (state.answered) return;
  const left = remaining();
  const sec = Math.ceil(left);
  $('timerFill').style.transform = `scaleX(${Math.min(1, left / state.total)})`;
  $('secs').textContent = sec;
  const low = left <= 5;
  $('secs').classList.toggle('low', low);
  document.querySelector('.timer').classList.toggle('low', low);
  if (low && sec !== state.lastSec && sec > 0) sfx.tick();
  state.lastSec = sec;

  if (left <= 0) return timeUp();
  state.raf = requestAnimationFrame(tickTimer);
}

function stopTimer() {
  cancelAnimationFrame(state.raf);
  document.querySelector('.timer').classList.remove('low');
}

// ---------- Answering ----------
function lockOptions(chosen) {
  const name = current();
  document.querySelectorAll('.opt').forEach((b) => {
    b.disabled = true;
    if (b.dataset.name === name) b.classList.add('correct');
    else if (b === chosen) b.classList.add('wrong');
    else b.classList.add('dim');
  });
}

function answer(btn) {
  if (state.answered) return;
  state.answered = true;
  stopTimer();
  const ok = btn.dataset.name === current();
  lockOptions(btn);

  if (ok) {
    state.streak++;
    state.correct++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    const mult = state.streak >= 5 ? 2 : state.streak >= 3 ? 1.5 : 1;
    const points = Math.round((100 + Math.ceil(remaining()) * 10) * mult);
    addScore(points);
    sfx.correct();
    burstFrom(btn);
    floatPoints(btn, '+' + points);
    const praise = ['სწორია! 🎃', 'ბრავო! 👻', 'შესანიშნავია! 🦇', 'ზუსტად! 🔮', 'ყოჩაღ! 🍭'];
    const extra = mult > 1 ? `🔥 x${mult} სერიის ბონუსი` : `+${points} ქულა`;
    showFeedback('good', praise[Math.floor(Math.random() * praise.length)], extra);
  } else {
    miss();
    showFeedback('bad', 'არასწორია! 💀', 'ეს იყო: ' + current());
  }
  finishQuestion();
}

function timeUp() {
  if (state.answered) return;
  state.answered = true;
  stopTimer();
  lockOptions(null);
  miss();
  showFeedback('bad', 'დრო ამოიწურა! ⌛', 'ეს იყო: ' + current());
  finishQuestion();
}

function miss() {
  state.streak = 0;
  state.missed.push(current());
  sfx.wrong();
  const card = $('card');
  card.classList.remove('enter', 'shake');
  void card.offsetWidth;
  card.classList.add('shake');
  const flash = $('flash');
  flash.classList.remove('on');
  void flash.offsetWidth;
  flash.classList.add('on');
}

function finishQuestion() {
  updateStreak();
  $('photo').classList.remove('zoom');
  $('game').classList.add('answered');
  const last = state.idx === state.order.length - 1;
  $('nextBtn').textContent = last ? 'შედეგების ნახვა 🏆' : 'შემდეგი 👉';
  $('nextBtn').classList.add('show');
}

function showFeedback(kind, title, sub) {
  const fb = $('feedback');
  fb.innerHTML = '';
  fb.append(title);
  const small = document.createElement('small');
  small.textContent = sub;
  fb.appendChild(small);
  fb.className = 'feedback show ' + kind;
}

function updateStreak() {
  const el = $('streak');
  el.textContent = `🔥 x${state.streak}`;
  el.classList.toggle('on', state.streak >= 2);
}

function addScore(points) {
  const el = $('score');
  const from = state.score;
  state.score += points;
  const to = state.score;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / 600);
    el.textContent = Math.round(from + (to - from) * t);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  const pill = el.parentElement;
  pill.classList.remove('bump');
  void pill.offsetWidth;
  pill.classList.add('bump');
}

function nextQuestion() {
  if (!state.answered) return;
  state.idx++;
  if (state.idx >= state.order.length) endGame();
  else renderQuestion();
}

// ---------- Lifelines ----------
function useFifty() {
  if (!state.fifty || state.answered) return;
  state.fifty = false;
  $('fiftyBtn').disabled = true;
  sfx.potion();
  const wrong = shuffle([...document.querySelectorAll('.opt')].filter((b) => b.dataset.name !== current()));
  wrong.slice(0, 2).forEach((b) => {
    b.classList.add('gone');
    b.disabled = true;
  });
}

function useExtraTime() {
  if (!state.extraTime || state.answered) return;
  state.extraTime = false;
  $('timeBtn').disabled = true;
  sfx.potion();
  state.deadline += 10000;
  state.total = remaining();
  floatPoints($('secs'), '+10');
}

function toggleZoom() {
  if (state.answered) return;
  $('photo').classList.toggle('zoom');
  sfx.zoom();
  if (!state.hintSeen) {
    state.hintSeen = true;
    $('zoomHint').classList.add('hide');
  }
}

// ---------- Effects ----------
// Center of an element in stage (1920x1080) coordinates
function relPos(el) {
  const a = stage.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return {
    x: (r.left - a.left + r.width / 2) / scale,
    y: (r.top - a.top + r.height / 2) / scale,
  };
}

function burstFrom(el) {
  const { x, y } = relPos(el);
  const fx = $('fx');
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    p.textContent = CANDY[Math.floor(Math.random() * CANDY.length)];
    const ang = Math.random() * Math.PI * 2;
    const dist = 180 + Math.random() * 260;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
    p.style.setProperty('--dy', Math.sin(ang) * dist - 100 + 'px');
    p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
    fx.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

function floatPoints(el, text) {
  const { x, y } = relPos(el);
  const p = document.createElement('div');
  p.className = 'float-points';
  p.textContent = text;
  p.style.left = x + 'px';
  p.style.top = y - 80 + 'px';
  $('fx').appendChild(p);
  setTimeout(() => p.remove(), 1100);
}

function candyRain(count) {
  const fx = $('fx');
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'rain';
    p.textContent = CANDY[Math.floor(Math.random() * CANDY.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.fontSize = 44 + Math.random() * 50 + 'px';
    p.style.animationDuration = 2.6 + Math.random() * 2.4 + 's';
    p.style.animationDelay = Math.random() * 1.5 + 's';
    p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
    fx.appendChild(p);
    setTimeout(() => p.remove(), 6000);
  }
}

// ---------- End ----------
function endGame() {
  const total = state.order.length;
  const ratio = state.correct / total;
  const rank = RANKS.find((r) => ratio >= r.min);

  $('rankEmoji').textContent = rank.emoji;
  $('rankTitle').textContent = rank.title;
  $('statCorrect').textContent = `${state.correct}/${total}`;
  $('statStreak').textContent = state.bestStreak;

  const list = $('missedList');
  list.innerHTML = '';
  state.missed.forEach((name) => {
    const item = document.createElement('div');
    item.className = 'miss';
    item.innerHTML = `<div class="thumb"><img alt=""></div><span></span>`;
    item.querySelector('img').src = imgSrc(name);
    item.querySelector('span').textContent = name;
    item.style.animationDelay = list.children.length * 0.05 + 's';
    list.appendChild(item);
  });
  if (!state.missed.length) {
    list.innerHTML = '<div class="all-good">🎉 ყველა გამოიცანი! 🎉</div>';
  }

  show('end');
  sfx.end();
  candyRain(ratio >= 0.6 ? 70 : 30);

  const el = $('finalScore');
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / 1400);
    el.textContent = Math.round(state.score * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  autoScroll(list);
}

// ---------- Leaving mid-game ----------
// The timer is paused while the "leave the game?" dialog is open.
function openExit() {
  if (state.paused) return;
  state.paused = true;
  if (state.timerStarted && !state.answered) {
    state.pausedLeft = remaining();
    cancelAnimationFrame(state.raf);
  }
  $('exitModal').hidden = false;
}

function closeExit() {
  $('exitModal').hidden = true;
  state.paused = false;
  if (state.answered) return;
  if (state.timerStarted) {
    state.deadline = performance.now() + state.pausedLeft * 1000;
    tickTimer();
  } else {
    startTimer();
  }
}

function leaveGame() {
  $('exitModal').hidden = true;
  state.paused = false;
  state.answered = true;
  stopTimer();
  show('start');
}

// Slowly scroll a list down and back up when it has more than fits on screen
let scrollRaf = 0;
function autoScroll(el) {
  cancelAnimationFrame(scrollRaf);
  el.scrollTop = 0;
  let pos = 0;
  let dir = 1;
  let pauseUntil = performance.now() + 2500;
  let last = performance.now();
  const step = (now) => {
    if (activeScreen() !== 'end') return;
    const dt = now - last;
    last = now;
    const max = el.scrollHeight - el.clientHeight;
    if (max > 4 && now > pauseUntil) {
      pos = Math.min(max, Math.max(0, pos + dir * dt * 0.05));
      el.scrollTop = pos;
      if ((dir > 0 && pos >= max) || (dir < 0 && pos <= 0)) {
        dir = -dir;
        pauseUntil = now + 2500;
      }
    }
    scrollRaf = requestAnimationFrame(step);
  };
  scrollRaf = requestAnimationFrame(step);
}

// ---------- Wire up ----------
$('startBtn').addEventListener('click', startGame);
$('againBtn').addEventListener('click', startGame);
$('nextBtn').addEventListener('click', nextQuestion);
$('fiftyBtn').addEventListener('click', useFifty);
$('timeBtn').addEventListener('click', useExtraTime);
$('photo').addEventListener('click', toggleZoom);
$('fullBtn').addEventListener('click', toggleFullscreen);
$('homeBtn').addEventListener('click', () => show('start'));
$('exitBtn').addEventListener('click', openExit);
$('stayBtn').addEventListener('click', closeExit);
$('leaveBtn').addEventListener('click', leaveGame);
document.addEventListener('pointerdown', () => {
  if (activeScreen() === 'end') armEndIdle();
});

addEventListener('resize', fitStage);
addEventListener('mousemove', wakeCursor);

$('ruleTime').textContent = QUESTION_TIME;
fitStage();
wakeCursor();
buildDecor();
