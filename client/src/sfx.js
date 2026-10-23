// Montajdagi kabi ovoz effektlari (whoosh, impact, riser, glitch...).
// Hammasi Web Audio API'da sintez qilinadi — tashqi fayl yo'q, sayt og'irlashmaydi.
// Brauzerlar birinchi bosishgacha ovozga ruxsat bermaydi, shuning uchun
// AudioContext birinchi foydalanuvchi harakatida yaratiladi.

const KEY = "byx-sound";
let ctx = null;
let master = null;
let noiseBuf = null;
let enabled = true;
try { enabled = localStorage.getItem(KEY) !== "off"; } catch {}

const listeners = new Set();
export const isSoundOn = () => enabled;
export const onSoundChange = (fn) => (listeners.add(fn), () => listeners.delete(fn));
export function setSound(on) {
  enabled = on;
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
  listeners.forEach((fn) => fn(on));
}

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    // Yumshoq kompressor — ovozlar keskin chiqmasligi uchun
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// "suspended" holatida rejalashtirilgan ovozlar resume() tugashi bilan chalinadi,
// shuning uchun birinchi bosish ham jim qolmaydi
const ready = () => enabled && ctx && ctx.state !== "closed";

// ---------- Qurilish bloklari ----------
function env(gain, t, a, peak, d) {
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + a);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

function tone({ type = "sine", from, to = from, t = 0, a = 0.005, d = 0.1, vol = 0.3, dest = master }) {
  const now = ctx.currentTime + t;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(from, now);
  if (to !== from) o.frequency.exponentialRampToValueAtTime(to, now + a + d);
  env(g, now, a, vol, d);
  o.connect(g).connect(dest);
  o.start(now);
  o.stop(now + a + d + 0.05);
}

function noise({ t = 0, a = 0.01, d = 0.3, vol = 0.3, type = "bandpass", from = 800, to = from, q = 1, pan = 0 }) {
  const now = ctx.currentTime + t;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, now);
  f.frequency.exponentialRampToValueAtTime(to, now + a + d);
  const g = ctx.createGain();
  env(g, now, a, vol, d);
  let node = src.connect(f).connect(g);
  if (ctx.createStereoPanner) {
    const p = ctx.createStereoPanner();
    p.pan.setValueAtTime(pan, now);
    node = node.connect(p);
  }
  node.connect(master);
  src.start(now, Math.random() * 0.5);
  src.stop(now + a + d + 0.05);
}

// Bir xil ovoz ketma-ket juda tez chalinmasin (hover ustida yurganda)
const lastPlayed = {};
function throttle(name, ms) {
  const now = performance.now();
  if (now - (lastPlayed[name] || 0) < ms) return true;
  lastPlayed[name] = now;
  return false;
}

// ---------- Effektlar ----------
export const sfx = {
  // Sichqoncha tugma ustiga kelganda — yengil "tik"
  hover() {
    if (!ready() || throttle("hover", 70)) return;
    tone({ type: "sine", from: 2200, to: 1800, d: 0.04, vol: 0.05 });
  },
  // Kartochka ustiga kelganda — qisqa havo shivirlashi
  hoverCard() {
    if (!ready() || throttle("hoverCard", 120)) return;
    noise({ from: 2500, to: 5000, a: 0.04, d: 0.12, vol: 0.06, q: 1.5 });
  },
  // Oddiy bosish — "klik" + mayin zarba
  click() {
    if (!ready()) return;
    tone({ type: "triangle", from: 900, to: 300, d: 0.07, vol: 0.22 });
    noise({ type: "highpass", from: 3000, d: 0.03, vol: 0.12 });
  },
  // Toifa tanlash — ikki notali "tin-ting"
  select() {
    if (!ready()) return;
    tone({ type: "sine", from: 880, d: 0.09, vol: 0.16 });
    tone({ type: "sine", from: 1320, t: 0.06, d: 0.14, vol: 0.14 });
  },
  // Muhim tugma — kinodagi kabi "impact"
  impact() {
    if (!ready()) return;
    tone({ type: "sine", from: 140, to: 40, a: 0.005, d: 0.35, vol: 0.55 });
    noise({ type: "lowpass", from: 2500, to: 200, d: 0.25, vol: 0.28 });
    tone({ type: "triangle", from: 1200, to: 600, d: 0.05, vol: 0.1 });
  },
  // Pleyer ochilishi — riser + whoosh + zarba
  open() {
    if (!ready()) return;
    noise({ from: 400, to: 6000, a: 0.18, d: 0.08, vol: 0.22, q: 2 });
    tone({ type: "sawtooth", from: 180, to: 900, a: 0.2, d: 0.05, vol: 0.04 });
    tone({ type: "sine", from: 120, to: 45, t: 0.2, d: 0.4, vol: 0.5 });
    noise({ type: "lowpass", from: 3000, to: 300, t: 0.2, d: 0.3, vol: 0.2 });
  },
  // Pleyer yopilishi — teskari whoosh
  close() {
    if (!ready()) return;
    noise({ from: 5000, to: 300, a: 0.02, d: 0.28, vol: 0.2, q: 1.5 });
    tone({ type: "sine", from: 600, to: 120, d: 0.2, vol: 0.12 });
  },
  // Keyingi / oldingi video — chapdan o'ngga swoosh
  swoosh(dir = 1) {
    if (!ready()) return;
    noise({ from: 700, to: 4500, a: 0.06, d: 0.2, vol: 0.24, q: 2.5, pan: -0.7 * dir });
    noise({ from: 4500, to: 900, t: 0.08, a: 0.02, d: 0.18, vol: 0.12, q: 2.5, pan: 0.7 * dir });
  },
  // Ijro / pauza — raqamli "blip"
  play(on) {
    if (!ready()) return;
    tone({ type: "square", from: on ? 520 : 780, to: on ? 780 : 520, d: 0.06, vol: 0.06 });
  },
  // Ovozni yoqish/o'chirish — glitch
  glitch() {
    if (!ready()) return;
    for (let i = 0; i < 5; i++) {
      tone({ type: "square", from: 200 + Math.random() * 1600, t: i * 0.025, d: 0.02, vol: 0.06 });
    }
  },
  // Havola nusxalandi — yorqin "ding"
  success() {
    if (!ready()) return;
    [1046, 1318, 1568].forEach((f, i) => tone({ type: "sine", from: f, t: i * 0.06, d: 0.25, vol: 0.12 }));
  },
  // Fonda uchqun portlashi — sehrli yaltirash
  sparkle() {
    if (!ready() || throttle("sparkle", 90)) return;
    for (let i = 0; i < 6; i++) {
      tone({ type: "sine", from: 1800 + Math.random() * 2600, t: i * 0.03, d: 0.18, vol: 0.05 });
    }
    noise({ type: "highpass", from: 6000, d: 0.2, vol: 0.05 });
  },
  // Vaqt chizig'ini surish — mayin tik
  tick() {
    if (!ready() || throttle("tick", 60)) return;
    tone({ type: "sine", from: 1500, d: 0.025, vol: 0.06 });
  },
};
