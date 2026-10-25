// ============================================================
//  By.Hojiakbar — ishlar ro'yxati
//  Yangi video: faylni client/public/videos/ ga qo'ying (nomi.mp4 + nomi.jpg muqova)
//  va quyidagi ro'yxat OXIRIGA qator qo'shing. Oxirgi qo'shilgan — saytda birinchi.
//
//  format:   "vertical" (9:16), "portrait" (3:4), "square" (1:1), "horizontal" (16:9)
//  category: CATEGORIES dagi kalitlardan biri
//  pinned:   true — doim galereyaning eng boshida turadi
// ============================================================

export const PROFILE = {
  name: "By.Hojiakbar",
  role: "Video Editor",
  about: "Futbol editlar, Reels va Shorts, blogerlar uchun kontent montaj — dinamik o'tishlar, VFX, effektlar va rang korreksiyasi.",
  telegram: "https://t.me/ByHojiakbarr",
  telegramNick: "@ByHojiakbarr",
  youtube: "https://youtube.com/@byhojiakbarr",
  instagram: "",
};

export const CATEGORIES = {
  football: "Futbol",
  content: "Bloger kontent",
  comedy: "Kulgili",
  auto: "Avto",
  doc: "Hujjatli",
};

export const WORKS = [
  { id: "neymar-edit", title: "Neymar — mening birinchi editim", category: "football", format: "portrait", duration: 18, pinned: true },
  { id: "comp-iris", title: "Yangi rubrika: stol atrofida suhbat", category: "content", format: "portrait", duration: 50 },
  { id: "i-win-you-lose", title: "Ronaldo — «I win, you lose»", category: "football", format: "square", duration: 18 },
  { id: "hoji-vfx-part1", title: "Bozor kaliti: savdoga kirishdan oldin", category: "content", format: "vertical", duration: 49 },
  { id: "trading", title: "Birjada brokerman — trading haqida", category: "content", format: "square", duration: 53 },
  { id: "iris-2", title: "Ronaldo va muxlis — samimiy lahza", category: "football", format: "square", duration: 32 },
  { id: "mrzoxxd-1", title: "Mirzoxid — yosh hujumchi portreti", category: "football", format: "portrait", duration: 15 },
  { id: "mrzoxxd-4", title: "Mirzoxid — maydondagi lahzalar", category: "football", format: "square", duration: 16 },
  { id: "prezident-edits", title: "Islom Karimov xotirasiga", category: "doc", format: "square", duration: 61 },
  { id: "comp-30", title: "Kechki shahar: AMG, GT-R va BMW M4", category: "auto", format: "vertical", duration: 17 },
  { id: "edit-9910", title: "Bozor kaliti: qo'rquv va sabrsizlik", category: "content", format: "vertical", duration: 32 },
  { id: "kamol", title: "Kamol — o'shanda va hozir", category: "content", format: "portrait", duration: 27 },
  { id: "mrzoxxd-3", title: "Mirzoxid — mashg'ulotdagi texnika", category: "football", format: "square", duration: 22 },
  { id: "neymar-jr", title: "Yosh Neymar — Santos davri", category: "football", format: "portrait", duration: 22 },
  { id: "azim-maktab", title: "Azim aka va maktab hangomasi 😂", category: "comedy", format: "portrait", duration: 54 },
];

const base = import.meta.env.BASE_URL;
export const videoSrc = (w) => `${base}videos/${w.id}.mp4`;
export const posterSrc = (w) => `${base}videos/${w.id}.jpg`;
