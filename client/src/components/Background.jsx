import { useEffect, useRef } from "react";

// Uch qavatli fon: rang to'lqinlari (CSS), uchqunlar (canvas), plyonka donadorligi va vinyetka (CSS)
export default function Background() {
  const canvas = useRef(null);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w, h, dpr, sparks, raf;
    let mx = 0, my = 0, tx = 0, ty = 0;

    const make = (anywhere) => {
      const z = Math.random(); // chuqurlik: 0 — uzoq, 1 — yaqin
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        z,
        r: (0.4 + z * 1.8) * dpr,
        vy: (0.15 + z * 0.6) * dpr,
        drift: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.82 ? 355 : 262, // asosan qizil, ba'zan binafsha
        life: Math.random() * Math.PI * 2,
      };
    };

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.width = innerWidth * dpr;
      h = c.height = innerHeight * dpr;
      const n = Math.min(160, Math.floor((innerWidth * innerHeight) / 9000));
      sparks = Array.from({ length: n }, () => make(true));
    };

    const draw = () => {
      tx += (mx - tx) * 0.05;
      ty += (my - ty) * 0.05;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of sparks) {
        p.y -= p.vy;
        p.drift += 0.01;
        p.life += 0.025;
        p.x += Math.sin(p.drift) * 0.25 * dpr;
        if (p.y < -20) Object.assign(p, make(false));
        const px = p.x + tx * p.z * 30 * dpr;
        const py = p.y + ty * p.z * 30 * dpr;
        const a = (0.35 + Math.sin(p.life) * 0.3) * (0.4 + p.z * 0.6);
        const g = ctx.createRadialGradient(px, py, 0, px, py, p.r * 5);
        g.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${a})`);
        g.addColorStop(0.25, `hsla(${p.hue}, 100%, 55%, ${a * 0.5})`);
        g.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, p.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e) => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    };

    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", onMove);
    if (reduce) {
      draw();
      cancelAnimationFrame(raf);
    } else draw();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
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
