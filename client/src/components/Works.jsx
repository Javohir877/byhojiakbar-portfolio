import { useEffect, useRef, useState } from "react";
import { CATEGORIES, posterSrc, videoSrc } from "../works.js";

function formatViews(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

const formatDuration = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

function Card({ work, index, views, onOpen }) {
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
      className={`card ${work.format}${work.pinned ? " pinned" : ""}`}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      onClick={onOpen}
      onMouseEnter={() => preview(true)}
      onMouseLeave={() => preview(false)}
      aria-label={`${work.title} — ko'rish`}
    >
      <img src={posterSrc(work)} alt="" loading="lazy" />
      <video ref={video} src={videoSrc(work)} muted loop playsInline preload="none" />
      <span className="play" aria-hidden="true" />
      {work.pinned && <span className="pin">📌<span className="pin-text"> Birinchi edit</span></span>}
      {views > 0 && <span className="views">👁 {formatViews(views)}</span>}
      {work.duration && <span className="duration">{formatDuration(work.duration)}</span>}
      <span className="meta">
        <span className="tag">{CATEGORIES[work.category]}</span>
        <span className="title">{work.title}</span>
      </span>
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

export default function Works({ works, total, filter, onFilter, views, onOpen }) {
  const n = useColumns();
  // Masonry: ishlar chapdan o'ngga navbat bilan ustunlarga taqsimlanadi,
  // shunda ekrandagi tartib pleyerdagi "keyingi" tartibiga mos keladi
  const columns = Array.from({ length: n }, (_, c) =>
    works.map((w, i) => [w, i]).filter(([, i]) => i % n === c)
  );
  const count = (key) => total.filter((w) => w.category === key).length;

  return (
    <section id="works" className="works">
      <div className="section-head reveal">
        <h2>Ishlar</h2>
        <span className="count">{works.length} ta edit</span>
      </div>
      <div className="chips reveal" role="tablist" aria-label="Toifalar">
        {[["all", "Barchasi", total.length], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v, count(k)])]
          .filter(([, , c]) => c > 0)
          .map(([key, label, c]) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              className={`chip${filter === key ? " active" : ""}`}
              onClick={() => onFilter(key)}
            >
              {label} <span>{c}</span>
            </button>
          ))}
      </div>
      <div className="grid" key={filter}>
        {columns.map((col, c) => (
          <div className="col" key={c}>
            {col.map(([w, i]) => (
              <Card key={w.id} work={w} index={i} views={views[w.id] || 0} onOpen={() => onOpen(w.id)} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
