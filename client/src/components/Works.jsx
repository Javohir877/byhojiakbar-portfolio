import { useEffect, useRef, useState } from "react";
import { posterSrc, videoSrc } from "../works.js";

function formatViews(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function Card({ work, views, onOpen }) {
  const video = useRef(null);
  // Sichqoncha ustiga kelganda ovozsiz oldindan ko'rsatish
  const preview = (on) => {
    const v = video.current;
    if (!v) return;
    if (on) v.play().catch(() => {});
    else { v.pause(); v.currentTime = 0; }
  };

  return (
    <button
      className={`card ${work.format}`}
      onClick={onOpen}
      onMouseEnter={() => preview(true)}
      onMouseLeave={() => preview(false)}
      aria-label={`${work.title} — ko'rish`}
    >
      <img src={posterSrc(work)} alt="" loading="lazy" />
      <video ref={video} src={videoSrc(work)} muted loop playsInline preload="none" />
      <span className="play" aria-hidden="true" />
      {views > 0 && <span className="views">👁 {formatViews(views)}</span>}
      <span className="title">{work.title}</span>
    </button>
  );
}

// Ekran kengligiga qarab ustunlar soni
function useColumns() {
  const get = () => (innerWidth <= 980 ? 2 : 3);
  const [n, setN] = useState(get);
  useEffect(() => {
    const onResize = () => setN(get());
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, []);
  return n;
}

export default function Works({ works, views, onOpen }) {
  const n = useColumns();
  // Masonry: ishlar chapdan o'ngga navbat bilan ustunlarga taqsimlanadi,
  // shunda ekrandagi tartib pleyerdagi "keyingi" tartibiga mos keladi
  const columns = Array.from({ length: n }, (_, c) =>
    works.map((w, i) => [w, i]).filter(([, i]) => i % n === c)
  );
  return (
    <section id="works" className="works">
      <div className="section-head">
        <h2>Ishlar</h2>
        <span className="count">{works.length} ta edit</span>
      </div>
      <div className="grid">
        {columns.map((col, c) => (
          <div className="col" key={c}>
            {col.map(([w, i]) => (
              <Card key={w.id} work={w} views={views[w.id] || 0} onOpen={() => onOpen(i)} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
