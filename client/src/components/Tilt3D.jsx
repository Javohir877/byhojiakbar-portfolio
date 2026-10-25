import { useEffect, useRef } from "react";
import { isLite, isPaused } from "../perf.js";

// Rasmni 3D qilib harakatlantiradi:
//  - kompyuterda sichqonchaga qarab egiladi (butun sahifa bo'ylab)
//  - telefonda qurilma egilishiga javob beradi (gyroskop)
//  - harakat bo'lmasa o'zi sekin chayqalib turadi
const MAX = 16; // eng katta burilish burchagi (gradus)

export default function Tilt3D({ src, alt }) {
  const card = useRef(null);

  useEffect(() => {
    const el = card.current;
    let raf = 0, last = 0;
    let tx = 0, ty = 0;       // maqsad burchaklar (-1..1)
    let x = 0, y = 0;         // hozirgi (silliq ergashadi)
    let lastInput = -1e9;
    let hover = 0, hoverT = 0;
    let visible = true;
    let rect = null;          // o'lchamni har harakatda qayta o'lchamaslik uchun
    const prev = {};

    const stale = () => { rect = null; };
    const onMove = (e) => {
      if (!visible) return;
      const r = rect || (rect = el.getBoundingClientRect());
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      // Rasmdan uzoqlashgan sari ta'sir kamayadi
      tx = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width * 0.9)));
      ty = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height * 0.9)));
      const inside = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
      hoverT = inside ? 1 : 0;
      lastInput = performance.now();
    };
    const onLeave = () => { hoverT = 0; lastInput = -1e9; };

    const onTilt = (e) => {
      if (!visible || e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 25));
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
      lastInput = performance.now();
    };

    // Faqat o'zgargan qiymat yoziladi — ortiqcha qayta hisoblash yo'q
    const set = (k, v) => { if (prev[k] !== v) { prev[k] = v; el.style.setProperty(k, v); } };

    const frame = (now) => {
      raf = 0;
      if (!visible) return;
      raf = requestAnimationFrame(frame);
      if (isPaused()) return;
      if (isLite() && now - last < 30) return; // kuchsiz qurilmada 30 kadr/s
      last = now;
      // 2.5 soniya harakat bo'lmasa — o'zi chayqaladi
      if (now - lastInput > 2500) {
        const t = now / 1000;
        tx = Math.sin(t * 0.7) * 0.55;
        ty = Math.cos(t * 0.9) * 0.35;
      }
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      hover += (hoverT - hover) * 0.1;
      set("--rx", `${(-y * MAX).toFixed(1)}deg`);
      set("--ry", `${(x * MAX).toFixed(1)}deg`);
      set("--gx", `${(50 + x * 45).toFixed(0)}%`);
      set("--gy", `${(50 + y * 45).toFixed(0)}%`);
      set("--px", x.toFixed(2));
      set("--py", y.toFixed(2));
      set("--hover", hover.toFixed(2));
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };

    // Rasm ekrandan chiqsa — animatsiya butunlay to'xtaydi
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      rect = null;
      if (visible) start();
    });
    io.observe(el);

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", stale, { passive: true });
    addEventListener("resize", stale);
    document.addEventListener("pointerleave", onLeave);
    addEventListener("deviceorientation", onTilt, { passive: true });
    start();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", stale);
      removeEventListener("resize", stale);
      document.removeEventListener("pointerleave", onLeave);
      removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  return (
    <div className="tilt">
      <div className="tilt-card" ref={card}>
        <div className="hero-ring" aria-hidden="true" />
        <div className="tilt-img">
          <img src={src} alt={alt} fetchPriority="high" />
        </div>
        <div className="tilt-glare" aria-hidden="true" />
        <div className="tilt-edge" aria-hidden="true" />
        <span className="tilt-chip c1" aria-hidden="true">🎬 Video Editor</span>
        <span className="tilt-chip c2" aria-hidden="true">✨ VFX</span>
        <span className="tilt-chip c3" aria-hidden="true">⚽ Football edits</span>
        <i className="tilt-spark s1" aria-hidden="true" />
        <i className="tilt-spark s2" aria-hidden="true" />
        <i className="tilt-spark s3" aria-hidden="true" />
      </div>
      <div className="tilt-shadow" aria-hidden="true" />
    </div>
  );
}
