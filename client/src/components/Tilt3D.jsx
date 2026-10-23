import { useEffect, useRef } from "react";

// Rasmni 3D qilib harakatlantiradi:
//  - kompyuterda sichqonchaga qarab egiladi (butun sahifa bo'ylab)
//  - telefonda qurilma egilishiga javob beradi (gyroskop)
//  - harakat bo'lmasa o'zi sekin chayqalib turadi
const MAX = 16; // eng katta burilish burchagi (gradus)

export default function Tilt3D({ src, alt }) {
  const card = useRef(null);

  useEffect(() => {
    const el = card.current;
    let raf;
    let tx = 0, ty = 0;       // maqsad burchaklar (-1..1)
    let x = 0, y = 0;         // hozirgi (silliq ergashadi)
    let lastInput = -1e9;
    let hover = 0, hoverT = 0;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
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
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 25));
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
      lastInput = performance.now();
    };

    const frame = (now) => {
      // 2.5 soniya harakat bo'lmasa — o'zi chayqaladi
      if (now - lastInput > 2500) {
        const t = now / 1000;
        tx = Math.sin(t * 0.7) * 0.55;
        ty = Math.cos(t * 0.9) * 0.35;
      }
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      hover += (hoverT - hover) * 0.1;
      el.style.setProperty("--rx", `${(-y * MAX).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * MAX).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(50 + x * 45).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(50 + y * 45).toFixed(1)}%`);
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
      el.style.setProperty("--hover", hover.toFixed(3));
      raf = requestAnimationFrame(frame);
    };

    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    addEventListener("deviceorientation", onTilt, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  return (
    <div className="tilt">
      <div className="tilt-card" ref={card}>
        <div className="hero-ring" aria-hidden="true" />
        <div className="tilt-img">
          <img src={src} alt={alt} />
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
