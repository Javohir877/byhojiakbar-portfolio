# By.Hojiakbar — Video Editor Portfolio

Sayt: https://byhojiakbar.pages.dev/ (Cloudflare Pages)

Eski manzil https://javohir877.github.io/byhojiakbar-portfolio/ yangisiga yo'naltiradi.
GitHub Pages O'zbekistondan juda sekin (~60 KB/s) bo'lgani uchun sayt Cloudflare'ga ko'chirildi (~2 MB/s).

- `client/` — React (Vite) sayt: galereya, o'z video pleyeri, buyurtma formasi
- `server/` — Node.js (Express) backend: buyurtmani Telegram botga yuborish, ko'rishlar statistikasi

## Yangi video qo'shish

1. Videoni siqib `client/public/videos/` ga qo'ying (`nomi.mp4`, `nomi-720.mp4`, `nomi-480.mp4` va muqova `nomi.jpg`).
   Har bir fayl **25 MB dan kichik** bo'lishi shart (Cloudflare Pages limiti):
   ```
   ffmpeg -i asl.mp4 -vf "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart client/public/videos/nomi.mp4
   ffmpeg -ss 0.5 -i client/public/videos/nomi.mp4 -frames:v 1 -vf "scale='min(720,iw)':-2" client/public/videos/nomi.jpg
   # 720p / 480p (tik video uchun scale=720:-2, yotiq uchun scale=-2:720)
   ffmpeg -i client/public/videos/nomi.mp4 -vf scale=720:-2 -c:v libx264 -crf 23 -c:a aac -b:a 128k -movflags +faststart client/public/videos/nomi-720.mp4
   ffmpeg -i client/public/videos/nomi.mp4 -vf scale=480:-2 -c:v libx264 -crf 25 -c:a aac -b:a 128k -movflags +faststart client/public/videos/nomi-480.mp4
   ```
2. `client/src/works.js` dagi `WORKS` ro'yxati oxiriga qator qo'shing.
3. Saytni yangilang: `cd client && npm run deploy` (build qilib Cloudflare Pages'ga yuklaydi; `wrangler login` kerak).
   `client/functions/videos/` — videolarni qismlab (Range, 206) beradi: iPhone Safari va oldinga o'tkazish uchun shart.
4. Kodni ham saqlang: `git add -A && git commit -m "Yangi video" && git push`.

## Lokal ishga tushirish

```
cd server && npm install && npm run dev     # http://localhost:3001
cd client && npm install && npm run dev     # http://localhost:5173
```

## Backendni internetga chiqarish (Render.com, bepul)

1. render.com da GitHub orqali kiring → **New → Blueprint** → shu repo (`render.yaml` tayyor).
2. `TELEGRAM_BOT_TOKEN` — @BotFather dan yangi bot yarating.
   `TELEGRAM_CHAT_ID` — botga `/start` yozing, so'ng `https://api.telegram.org/bot<TOKEN>/getUpdates` dan `chat.id` ni oling.
3. Render bergan manzilni (masalan `https://byhojiakbar-api.onrender.com`) `client/.env.production`
   dagi `VITE_API_URL=` ga yozing va `cd client && npm run deploy` qiling.

`VITE_API_URL` bo'sh turguncha sayt backendsiz ishlaydi: forma o'rniga Telegram tugmasi chiqadi, statistika ko'rinmaydi.

> Eslatma: Render bepul tarifida disk doimiy emas — qayta deploy qilinganda ko'rishlar statistikasi nollanadi.
