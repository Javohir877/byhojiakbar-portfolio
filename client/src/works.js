// ============================================================
//  By.Xojiakbar — ishlar ro'yxati
//  Yangi video: faylni client/public/videos/ ga qo'ying (nomi.mp4 + nomi.jpg muqova)
//  va quyidagi ro'yxat OXIRIGA qator qo'shing. Oxirgi qo'shilgan — saytda birinchi.
//
//  format: "vertical" (9:16), "portrait" (3:4), "square" (1:1), "horizontal" (16:9)
// ============================================================

export const PROFILE = {
  name: "By.Xojiakbar",
  role: "Video Editor",
  about: "Reels, Shorts va YouTube uchun dinamik montaj, VFX, effektlar va rang korreksiyasi.",
  telegram: "https://t.me/ByHojiakbarr",
  telegramNick: "@ByHojiakbarr",
  youtube: "https://youtube.com/@byhojiakbarr",
  instagram: "",
};

export const WORKS = [
  { id: "neymar-edit", title: "Best Neymar edit", format: "portrait" },
  { id: "comp-iris", title: "Iris", format: "portrait" },
  { id: "i-win-you-lose", title: "I win, you lose", format: "square" },
  { id: "hoji-vfx-part1", title: "Hoji VFX — Part 1", format: "vertical" },
  { id: "trading", title: "Trading", format: "square" },
  { id: "iris-2", title: "Iris 2", format: "square" },
  { id: "mrzoxxd-1", title: "Mrzoxxd", format: "portrait" },
  { id: "mrzoxxd-4", title: "Mrzoxxd — 4", format: "square" },
  { id: "ballondor", title: "Ballon d'Or", format: "portrait" },
  { id: "ima-edit", title: "Ima edit", format: "vertical" },
  { id: "prezident-edits", title: "My best prezident edits", format: "square" },
];

const base = import.meta.env.BASE_URL;
export const videoSrc = (w) => `${base}videos/${w.id}.mp4`;
export const posterSrc = (w) => `${base}videos/${w.id}.jpg`;
