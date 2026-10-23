// By.Xojiakbar portfolio — backend
//   GET  /api/health        — server ishlayaptimi
//   GET  /api/views         — barcha videolarning ko'rishlar soni
//   POST /api/views/:id     — videoni ochishda ko'rishni +1 qilish
//   POST /api/order         — buyurtma formasini Telegram botga yuborish
import express from "express";
import cors from "cors";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = process.env.PORT || 3001;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:5174,https://javohir877.github.io")
  .split(",").map((s) => s.trim()).filter(Boolean);

const dir = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(dir, "data");
const VIEWS_FILE = path.join(DATA_DIR, "views.json");

// ---------- Ko'rishlar statistikasi (JSON faylda) ----------
let views = {};
try {
  views = JSON.parse(await readFile(VIEWS_FILE, "utf8"));
} catch {
  views = {};
}

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(VIEWS_FILE, JSON.stringify(views, null, 2));
  }, 1000);
}

// ---------- Oddiy so'rov cheklovi (IP bo'yicha) ----------
function rateLimit({ windowMs, max }) {
  const hits = new Map();
  setInterval(() => hits.clear(), windowMs).unref();
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const n = (hits.get(key) || 0) + 1;
    hits.set(key, n);
    if (n > max) return res.status(429).json({ error: "Juda ko'p so'rov, birozdan keyin urinib ko'ring" });
    next();
  };
}

const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: ORIGINS }));
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/views", (req, res) => res.json(views));

const VALID_ID = /^[a-z0-9-]{1,60}$/;
app.post("/api/views/:id", rateLimit({ windowMs: 60_000, max: 30 }), (req, res) => {
  const { id } = req.params;
  if (!VALID_ID.test(id)) return res.status(400).json({ error: "Noto'g'ri video id" });
  // Soxta id'lar bilan faylni to'ldirib yuborishning oldini olish
  if (!(id in views) && Object.keys(views).length >= 500) return res.status(400).json({ error: "Limit" });
  views[id] = (views[id] || 0) + 1;
  scheduleSave();
  res.json({ id, views: views[id] });
});

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const escapeHtml = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

app.post("/api/order", rateLimit({ windowMs: 10 * 60_000, max: 5 }), async (req, res) => {
  const body = req.body || {};
  // Bot tuzog'i: haqiqiy foydalanuvchi bu maydonni to'ldirmaydi
  if (body.website) return res.json({ ok: true });

  const name = clean(body.name, 60);
  const contact = clean(body.contact, 60);
  const service = clean(body.service, 60);
  const message = clean(body.message, 1000);
  if (!name || !contact || !message) {
    return res.status(400).json({ error: "Ism, aloqa va xabarni to'ldiring" });
  }
  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(503).json({ error: "Buyurtma qabul qilish hozircha sozlanmagan. Telegram orqali yozing." });
  }

  const text =
    `🎬 <b>Yangi buyurtma</b>\n\n` +
    `👤 <b>Ism:</b> ${escapeHtml(name)}\n` +
    `📱 <b>Aloqa:</b> ${escapeHtml(contact)}\n` +
    `🛠 <b>Xizmat:</b> ${escapeHtml(service)}\n\n` +
    `💬 ${escapeHtml(message)}`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
    });
    if (!r.ok) throw new Error(`Telegram ${r.status}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Telegramga yuborishda xato:", err.message);
    res.status(502).json({ error: "Xabar yuborilmadi, Telegram orqali yozing." });
  }
});

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
