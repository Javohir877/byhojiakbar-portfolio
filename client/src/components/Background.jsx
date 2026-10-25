import { useEffect, useRef } from "react";
import { goLite, isLite, isPaused, onLiteChange } from "../perf.js";

// Jonli fon: miltillovchi yulduzlar, ko'tariluvchi uchqunlar, uchar yulduzlar,
// sichqoncha/barmoqqa javob beradi, bosilganda uchqun portlashi chiqadi.
export default function Background() {
  const canvas = useRef(null);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c.getContext("2d");
    // Tizimda animatsiya kamaytirilgan bo'lsa ham fon to'xtamaydi, faqat sekinroq yuradi
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.4 : 1;
    let w, h, dpr, raf, last = performance.now();
    let stars = [], embers = [], bursts = [], shooters = [];
    const pointer = { x: -1e4, y: -1e4, tx: 0, ty: 0, px: 0, py: 0, active: false };
    let lastScroll = window.scrollY || 0;

    // Tayyor nur "sprayt"lari — har kadrda gradient yaratmaslik uchun
    const sprite = (hue, sat, light) => {
      const s = document.createElement("canvas");
      s.width = s.height = 64;
      const g = s.getContext("2d").createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, `hsla(${hue},${sat}%,${light + 25}%,1)`);
      g.addColorStop(0.18, `hsla(${hue},${sat}%,${light}%,.85)`);
      g.addColorStop(0.45, `hsla(${hue},${sat}%,${light - 10}%,.25)`);
      g.addColorStop(1, `hsla(${hue},${sat}%,${light - 10}%,0)`);
      const sc = s.getContext("2d");
      sc.fillStyle = g;
      sc.fillRect(0, 0, 64, 64);
      return s;
    };
    const RED = sprite(355, 100, 58);
    const VIOLET = sprite(262, 100, 66);
    const WHITE = sprite(250, 60, 80);

    const rand = (a, b) => a + Math.random() * (b - a);

    const makeEmber = (anywhere) => {
      const z = Math.random();
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + rand(10, 80) * dpr,
        z,
        r: (1.2 + z * 3.2) * dpr,
        vy: (0.25 + z * 0.9) * dpr,
        vx: 0,
        drift: Math.random() * Math.PI * 2,
        tw: Math.random() * Math.PI * 2,
        img: Math.random() < 0.8 ? RED : VIOLET,
      };
    };

    const resize = () => {
      // Fon yumshoq nurlardan iborat — yuqori aniqlik shart emas, piksellar 2-4 barobar kam
      dpr = Math.min(window.devicePixelRatio || 1, isLite() ? 1 : 1.5);
      w = c.width = Math.floor(innerWidth * dpr);
      h = c.height = Math.floor(innerHeight * dpr);
      const area = innerWidth * innerHeight;
      const lite = isLite();
      stars = Array.from({ length: lite ? Math.min(60, Math.floor(area / 14000)) : Math.min(140, Math.floor(area / 8000)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        tw: Math.random() * Math.PI * 2,
        speed: rand(0.6, 2.2),
      }));
      embers = Array.from({ length: lite ? Math.min(30, Math.floor(area / 26000)) : Math.min(80, Math.floor(area / 14000)) }, () => makeEmber(true));
    };

    const burst = (x, y) => {
      for (let i = 0; i < 26; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = rand(1.5, 6) * dpr;
        bursts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, r: rand(1.5, 3.5) * dpr,
          img: Math.random() < 0.7 ? RED : VIOLET });
      }
    };

    const shoot = () => {
      const fromLeft = Math.random() < 0.5;
      shooters.push({
        x: fromLeft ? rand(-0.1, 0.5) * w : rand(0.5, 1.1) * w,
        y: rand(-0.05, 0.35) * h,
        vx: (fromLeft ? 1 : -1) * rand(9, 14) * dpr,
        vy: rand(3, 6) * dpr,
        life: 1,
      });
    };
    let nextShoot = performance.now() + rand(1500, 4000);

    // Kadr tezligini kuzatish: sekinlashsa — yengil rejimga o'tiladi
    let statT = 0, statN = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      // Pleyer ochiq yoki tab yashirin — chizilmaydi
      if (isPaused()) { last = now; return; }
      // Yengil rejimda 30 kadr/s yetarli
      if (isLite() && now - last < 30) return;
      const raw = now - last;
      const dt = Math.min(3, raw / 16.67) * calm; // kadrlar tezligidan mustaqil harakat
      last = now;
      if (!isLite() && raw < 500) {
        statT += raw; statN++;
        if (statN >= 90) {
          if (statT / statN > 26) goLite();
          statT = statN = 0;
        }
      }
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // Sichqoncha parallaksi silliq ergashadi
      pointer.px += (pointer.tx - pointer.px) * 0.05;
      pointer.py += (pointer.ty - pointer.py) * 0.05;
      const sy = window.scrollY || 0;
      const scrollShift = (sy - lastScroll) * dpr;
      lastScroll = sy;

      // 1) Miltillovchi yulduzlar
      for (const s of stars) {
        s.tw += 0.02 * s.speed * dt;
        s.y -= scrollShift * (0.05 + s.z * 0.15);
        if (s.y < 0) s.y += h;
        if (s.y > h) s.y -= h;
        const px = s.x + pointer.px * (8 + s.z * 30) * dpr;
        const py = s.y + pointer.py * (8 + s.z * 30) * dpr;
        const tw = 0.5 + Math.sin(s.tw) * 0.5;
        const size = (0.6 + s.z * 1.6) * dpr * (0.7 + tw * 0.6);
        ctx.globalAlpha = 0.25 + tw * 0.75 * (0.4 + s.z * 0.6);
        ctx.drawImage(WHITE, px - size * 4, py - size * 4, size * 8, size * 8);
        // Eng yorqin yulduzlarga xoch nur
        if (s.z > 0.85 && tw > 0.8) {
          ctx.globalAlpha = (tw - 0.8) * 2.5;
          ctx.fillStyle = "#e9e2ff";
          ctx.fillRect(px - size * 6, py - 0.5 * dpr, size * 12, 1 * dpr);
          ctx.fillRect(px - 0.5 * dpr, py - size * 6, 1 * dpr, size * 12);
        }
      }

      // 2) Ko'tariluvchi uchqunlar (sichqonchadan qochadi)
      const R = 140 * dpr;
      for (const p of embers) {
        p.drift += 0.012 * dt;
        p.tw += 0.04 * dt;
        p.y -= p.vy * dt;
        p.x += (Math.sin(p.drift) * 0.35 * dpr + p.vx) * dt;
        p.vx *= 0.94;
        if (pointer.active) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R && d2 > 1) {
            const d = Math.sqrt(d2), f = (1 - d / R) * 2.2 * dpr;
            p.vx += (dx / d) * f;
            p.y += (dy / d) * f * dt;
          }
        }
        if (p.y < -30 * dpr || p.x < -40 * dpr || p.x > w + 40 * dpr) Object.assign(p, makeEmber(false));
        const px = p.x + pointer.px * p.z * 40 * dpr;
        const py = p.y + pointer.py * p.z * 40 * dpr;
        const size = p.r * 6;
        ctx.globalAlpha = (0.45 + Math.sin(p.tw) * 0.35) * (0.45 + p.z * 0.55);
        ctx.drawImage(p.img, px - size / 2, py - size / 2, size, size);
      }

      // 3) Uchar yulduzlar
      if (now > nextShoot) { shoot(); nextShoot = now + rand(3500, 8000) / calm; }
      shooters = shooters.filter((s) => s.life > 0 && s.x > -0.2 * w && s.x < 1.2 * w && s.y < h);
      for (const s of shooters) {
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= 0.012 * dt;
        const len = 18;
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * len, s.y - s.vy * len);
        g.addColorStop(0, `rgba(255,255,255,${s.life})`);
        g.addColorStop(0.3, `rgba(185,166,255,${s.life * 0.6})`);
        g.addColorStop(1, "rgba(255,42,61,0)");
        ctx.globalAlpha = 1;
        ctx.strokeStyle = g;
        ctx.lineWidth = 2 * dpr;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * len, s.y - s.vy * len);
        ctx.stroke();
        ctx.drawImage(WHITE, s.x - 10 * dpr, s.y - 10 * dpr, 20 * dpr, 20 * dpr);
      }

      // 4) Bosilgandagi portlash
      bursts = bursts.filter((b) => b.life > 0);
      for (const b of bursts) {
        b.x += b.vx * dt; b.y += b.vy * dt;
        b.vx *= 0.95; b.vy = b.vy * 0.95 + 0.06 * dpr * dt;
        b.life -= 0.018 * dt;
        const size = b.r * 7 * (0.5 + b.life * 0.5);
        ctx.globalAlpha = Math.max(0, b.life);
        ctx.drawImage(b.img, b.x - size / 2, b.y - size / 2, size, size);
      }

      // 5) Kursor atrofida yumshoq nur
      if (pointer.active) {
        ctx.globalAlpha = 0.18;
        const s = 260 * dpr;
        ctx.drawImage(VIOLET, pointer.x - s / 2, pointer.y - s / 2, s, s);
      }

      ctx.globalAlpha = 1;
    };

    const onMove = (e) => {
      pointer.x = e.clientX * dpr;
      pointer.y = e.clientY * dpr;
      pointer.tx = e.clientX / innerWidth - 0.5;
      pointer.ty = e.clientY / innerHeight - 0.5;
      pointer.active = true;
    };
    const onLeave = () => { pointer.active = false; pointer.x = pointer.y = -1e4; };
    const onDown = (e) => {
      // Video pleyer ichida portlash chiqmasin
      if (e.target.closest?.(".modal")) return;
      burst(e.clientX * dpr, e.clientY * dpr);
    };

    // Telefonda manzil paneli chiqib-yashirinishi resize chaqiradi — kichik balandlik o'zgarishida qayta qurilmaydi
    let sizeW = innerWidth, sizeH = innerHeight;
    const onResize = () => {
      if (innerWidth === sizeW && Math.abs(innerHeight - sizeH) < 160) return;
      sizeW = innerWidth; sizeH = innerHeight;
      resize();
    };
    resize();
    addEventListener("resize", onResize);
    const offLite = onLiteChange(resize);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      offLite();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="bg" aria-hidden="true">
      <div className="aurora a1" />
      <div className="aurora a2" />
      <div className="aurora a3" />
      <div className="grid-lines" />
      <canvas ref={canvas} />
      <div className="grain" />
      <div className="vignette" />
    </div>
  );
}
