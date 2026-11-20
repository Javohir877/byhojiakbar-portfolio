import { useCallback, useEffect, useRef, useState } from "react";
import { QUALITIES, posterSrc, videoSrc } from "../works.js";
import { sfx } from "../sfx.js";
import { isLite, setPaused } from "../perf.js";

const fmt = (s) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

const Icon = {
  play: <path d="M8 5v14l11-7z" />,
  pause: <path d="M6 5h4v14H6zM14 5h4v14h-4z" />,
  volume: <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />,
  volumeLow: <path d="M5 9v6h4l5 5V4L9 9H5zm13.5 3A4.5 4.5 0 0 0 16 8v8a4.5 4.5 0 0 0 2.5-4z" />,
  muted: <path d="M3 9v6h4l5 5V4L7 9H3zm18.7 0-1.4-1.4L17.6 10.3 14.9 7.6 13.5 9l2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4-2.7-2.7z" />,
  full: <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />,
  prev: <path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" />,
  next: <path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4 4.6 4.6z" />,
  close: <path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z" />,
  share: <path d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.2c.1-.2.1-.5.1-.7s0-.5-.1-.7L16 7.2c.5.5 1.2.8 2 .8 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .2 0 .5.1.7L8 9.8C7.5 9.3 6.8 9 6 9c-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.5-.3 2-.8l7.1 4.2c-.1.2-.1.4-.1.6 0 1.6 1.3 2.9 2.9 2.9s2.9-1.3 2.9-2.9-1.2-2.9-2.8-2.9z" />,
  check: <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />,
  gear: <path d="M19.4 13c.04-.33.06-.66.06-1s-.02-.67-.06-1l2.1-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.3 7.3 0 0 0-1.73-1l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65c-.62.25-1.2.59-1.73 1l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64L4.54 11c-.04.33-.06.67-.06 1s.02.67.06 1l-2.1 1.65a.5.5 0 0 0-.12.64l2 3.46c.13.22.39.3.6.22l2.49-1c.53.41 1.11.75 1.73 1l.38 2.65c.04.24.25.42.49.42h4c.24 0 .45-.18.49-.42l.38-2.65c.62-.25 1.2-.59 1.73-1l2.49 1c.22.08.48 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64L19.4 13zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />,
};
// Format bo'yicha taxminiy nisbat (eni/bo'yi); video yuklangach haqiqiysi bilan almashadi
const AR = { vertical: 9 / 16, portrait: 3 / 4, square: 1, horizontal: 16 / 9 };

const Svg = ({ name }) => <svg viewBox="0 0 24 24" aria-hidden="true">{Icon[name]}</svg>;

// Tanlangan sifat va ovoz balandligi keyingi safar ham eslab qolinadi
const load = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

// "Avto": juda sekin internet (2G) yoki trafik tejash — 480p,
// 3G, telefon yoki kuchsiz qurilma — 720p, aks holda 1080p
function autoQuality() {
  const c = navigator.connection;
  const type = (c && c.effectiveType) || "";
  if (c && (c.saveData || type.endsWith("2g"))) return 480;
  if (type === "3g" || isLite()) return 720;
  return 1080;
}

// iPhone'da video ovozini dastur orqali o'zgartirib bo'lmaydi — u yerda faqat o'chirish/yoqish
const canSetVolume = (() => {
  try { const v = document.createElement("video"); v.volume = 0.5; return v.volume === 0.5; } catch { return false; }
})();
const touchUI = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;

export default function Player({ works, index, onChange, onClose }) {
  const work = works[index];
  const box = useRef(null);
  const video = useRef(null);
  const hideTimer = useRef(null);
  const resume = useRef(null); // sifat almashganda qaysi soniyadan davom etish
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [idle, setIdle] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState(false);
  const [ar, setAr] = useState(AR[work.format] || 9 / 16);
  const [quality, setQuality] = useState(() => load("byx-quality", "auto"));
  const [volume, setVolume] = useState(() => Number(load("byx-volume", "1")));
  const [muted, setMuted] = useState(false);
  const touch = useRef(null);

  const q = quality === "auto" ? autoQuality() : Number(quality);

  // Telefonda tizim "Ulashish" oynasi, kompyuterda havolani nusxalash
  const share = async () => {
    const url = location.href;
    try {
      if (navigator.share && touchUI) {
        await navigator.share({ title: `${work.title} — By.Hojiakbar`, url });
      } else {
        await navigator.clipboard.writeText(url);
        sfx.success();
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {}
  };

  const toggle = useCallback(() => {
    const v = video.current;
    sfx.play(v.paused);
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const seek = (t) => {
    const v = video.current;
    sfx.tick();
    v.currentTime = Math.max(0, Math.min(v.duration || 0, t));
  };

  const go = useCallback(
    (d) => {
      sfx.swoosh(d);
      setMenu(false);
      onChange((index + d + works.length) % works.length);
    },
    [index, works.length, onChange]
  );

  const close = useCallback(() => {
    sfx.close();
    onClose();
  }, [onClose]);

  const toggleMute = () => {
    sfx.glitch();
    if (muted || volume === 0) {
      setMuted(false);
      if (volume === 0) setVolume(1);
    } else setMuted(true);
  };

  const changeVolume = (v) => {
    setVolume(v);
    setMuted(v === 0);
    save("byx-volume", String(v));
  };

  const changeQuality = (next) => {
    const v = video.current;
    sfx.select();
    save("byx-quality", String(next));
    resume.current = { t: v.currentTime, play: !v.paused };
    setQuality(String(next));
    setMenu(false);
  };

  const fullscreen = () => {
    sfx.impact();
    if (document.fullscreenElement) document.exitFullscreen();
    else if (box.current.requestFullscreen) box.current.requestFullscreen().catch(() => {});
    // iPhone Safari faqat videoning o'zini to'liq ekranga chiqaradi
    else video.current.webkitEnterFullscreen?.();
  };

  // Harakatsiz bo'lsa boshqaruv paneli yashiriladi (menyu ochiq bo'lsa — yo'q)
  const wake = () => {
    setIdle(false);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setIdle(true), 2800);
  };

  // Telefonda: videoga bosish — avval panelni ko'rsatadi, panel ko'rinib tursa — pauza/ijro
  const onVideoClick = () => {
    if (menu) return setMenu(false);
    if (touchUI && idle && playing) return wake();
    toggle();
  };

  // Telefonda barmoq bilan: chapga/o'ngga — keyingi/oldingi video, pastga — yopish
  const onTouchStart = (e) => {
    if (e.target.closest(".controls, .q-menu")) { touch.current = null; return; }
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, at: Date.now() };
  };
  const onTouchEnd = (e) => {
    const s = touch.current;
    touch.current = null;
    if (!s || Date.now() - s.at > 600) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    else if (dy > 90 && dy > Math.abs(dx) * 1.5) close();
  };

  // Pleyer ochiq turganda orqadagi fon va 3D animatsiyalar to'xtaydi — video silliq o'ynaydi
  useEffect(() => {
    setPaused(true);
    return () => setPaused(false);
  }, []);

  useEffect(() => {
    setTime(0); setDuration(0); setBuffered(0); setLoading(true);
    setAr(AR[work.format] || 9 / 16);
    resume.current = null;
    video.current.play().catch(() => setPlaying(false));
    wake();
  }, [work.id]);

  useEffect(() => {
    const v = video.current;
    if (v) v.volume = volume;
  }, [volume, work.id]);

  useEffect(() => {
    if (menu) clearTimeout(hideTimer.current);
  }, [menu]);

  useEffect(() => {
    const onKey = (e) => {
      const v = video.current;
      if (e.key === "Escape" && !document.fullscreenElement) { if (menu) setMenu(false); else close(); }
      else if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); }
      else if (e.key === "ArrowRight") seek(v.currentTime + 5);
      else if (e.key === "ArrowLeft") seek(v.currentTime - 5);
      else if (e.key === "ArrowDown") go(1);
      else if (e.key === "ArrowUp") go(-1);
      else if (e.key === "m") toggleMute();
      else if (e.key === "f") fullscreen();
      else return;
      wake();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(hideTimer.current);
    };
  }, [toggle, go, close, menu, muted, volume]);

  const onBarPointer = (e) => {
    if (e.type === "pointermove" && e.buttons !== 1) return;
    const r = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * duration);
  };

  const pct = duration ? (time / duration) * 100 : 0;
  const silent = muted || volume === 0;
  const volIcon = silent ? "muted" : volume < 0.5 ? "volumeLow" : "volume";

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && close()}>
      <button className="modal-close" onClick={close} aria-label="Yopish"><Svg name="close" /></button>
      <button className="modal-nav prev" onClick={() => go(-1)} aria-label="Oldingi"><Svg name="prev" /></button>
      <button className="modal-nav next" onClick={() => go(1)} aria-label="Keyingi"><Svg name="next" /></button>

      <div
        ref={box}
        className={`player ${work.format}${idle && playing && !menu ? " idle" : ""}`}
        style={{ "--ar": ar }}
        onMouseMove={wake}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <video
          ref={video}
          key={work.id}
          src={videoSrc(work, q)}
          poster={posterSrc(work)}
          muted={silent}
          playsInline
          autoPlay
          onClick={onVideoClick}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onWaiting={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
          onPlaying={() => setLoading(false)}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            setDuration(v.duration);
            if (v.videoWidth && v.videoHeight) setAr(v.videoWidth / v.videoHeight);
            v.volume = volume;
            // Sifat almashgandan keyin — o'sha joydan davom etadi
            const r = resume.current;
            if (r) {
              resume.current = null;
              v.currentTime = r.t;
              if (r.play) v.play().catch(() => {});
              else v.pause();
            }
          }}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onProgress={(e) => {
            const v = e.currentTarget;
            if (v.buffered.length && v.duration) setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
          }}
          onEnded={() => go(1)}
        />

        {loading && <div className="spinner" aria-label="Yuklanmoqda" />}
        {!playing && !loading && (
          <button className="big-play" onClick={toggle} aria-label="Ijro etish"><Svg name="play" /></button>
        )}

        {menu && (
          <div className="q-menu" role="menu" onClick={(e) => e.stopPropagation()}>
            <div className="q-title">Sifat</div>
            {["auto", ...QUALITIES].map((opt) => {
              const active = String(opt) === quality;
              return (
                <button key={opt} role="menuitemradio" aria-checked={active} className={active ? "active" : ""}
                  onClick={() => changeQuality(opt)}>
                  <span>{opt === "auto" ? `Avto (${autoQuality()}p)` : `${opt}p`}</span>
                  {opt === 1080 && <em>HD</em>}
                  {active && <Svg name="check" />}
                </button>
              );
            })}
            {canSetVolume && (
              <>
                <div className="q-title">Ovoz</div>
                <label className="q-volume">
                  <Svg name={volIcon} />
                  <input type="range" min="0" max="1" step="0.05" value={silent ? 0 : volume}
                    onChange={(e) => changeVolume(Number(e.target.value))} aria-label="Ovoz balandligi"
                    style={{ "--v": `${(silent ? 0 : volume) * 100}%` }} />
                </label>
              </>
            )}
            <button className="q-share" onClick={share}>
              <Svg name={copied ? "check" : "share"} /> <span>{copied ? "Nusxalandi!" : "Havolani ulashish"}</span>
            </button>
          </div>
        )}

        <div className="controls" onClick={(e) => e.stopPropagation()}>
          <div className="ctl-title">{work.title}</div>
          <div
            className="bar"
            onPointerDown={onBarPointer}
            onPointerMove={onBarPointer}
            role="slider"
            aria-label="Vaqt"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
          >
            <div className="bar-buffer" style={{ width: `${buffered}%` }} />
            <div className="bar-fill" style={{ width: `${pct}%` }} />
            <div className="bar-thumb" style={{ left: `${pct}%` }} />
          </div>
          <div className="ctl-row">
            <button onClick={toggle} aria-label={playing ? "Pauza" : "Ijro etish"}>
              <Svg name={playing ? "pause" : "play"} />
            </button>
            <div className="vol">
              <button onClick={toggleMute} aria-label={silent ? "Ovozni yoqish" : "Ovozni o'chirish"}>
                <Svg name={volIcon} />
              </button>
              {canSetVolume && (
                <input className="vol-slider" type="range" min="0" max="1" step="0.05" value={silent ? 0 : volume}
                  onChange={(e) => changeVolume(Number(e.target.value))} aria-label="Ovoz balandligi"
                  style={{ "--v": `${(silent ? 0 : volume) * 100}%` }} />
              )}
            </div>
            <span className="ctl-time">{fmt(time)} <i>/ {fmt(duration)}</i></span>
            <span className="ctl-count">{index + 1} / {works.length}</span>
            <button className={`q-btn${menu ? " on" : ""}`} onClick={() => { sfx.click(); setMenu((m) => !m); }}
              aria-label="Sifat va sozlamalar" aria-expanded={menu}>
              <Svg name="gear" />
              <b>{q}p</b>
            </button>
            <button className="ctl-share" onClick={share} aria-label="Havolani ulashish" title={copied ? "Nusxalandi!" : "Havolani ulashish"}>
              <Svg name={copied ? "check" : "share"} />
            </button>
            <button onClick={fullscreen} aria-label="To'liq ekran"><Svg name="full" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
