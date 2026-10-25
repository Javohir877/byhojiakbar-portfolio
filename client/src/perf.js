// Qurilma kuchini aniqlash va "yengil rejim".
// Kuchsiz telefon/kompyuterda og'ir effektlar avtomatik kamaytiriladi,
// ishlash paytida kadrlar sekinlashsa ham yengil rejimga o'tiladi.

const nav = typeof navigator !== "undefined" ? navigator : {};
const coarse = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
const cores = nav.hardwareConcurrency || 4;
const memory = nav.deviceMemory || 4;
const saveData = !!(nav.connection && nav.connection.saveData);

// Telefon — har doim ehtiyotkor rejim; kompyuter — 4 yadro yoki 4 GB dan kam bo'lsa
let lite = saveData || coarse || cores <= 4 || memory <= 4;

const listeners = new Set();
const apply = () => document.documentElement.classList.toggle("lite", lite);
if (typeof document !== "undefined") apply();

export const isLite = () => lite;
export const onLiteChange = (fn) => (listeners.add(fn), () => listeners.delete(fn));
export function goLite() {
  if (lite) return;
  lite = true;
  apply();
  listeners.forEach((fn) => fn(true));
}

// Video pleyer ochiq bo'lsa, fon animatsiyalari to'xtatiladi
let paused = false;
export const isPaused = () => paused || document.hidden;
export function setPaused(p) {
  paused = p;
  document.documentElement.classList.toggle("paused", p);
}
