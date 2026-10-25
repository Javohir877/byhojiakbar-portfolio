import { useCallback, useEffect, useRef, useState } from "react";
import { posterSrc, videoSrc } from "../works.js";
import { sfx } from "../sfx.js";
import { setPaused } from "../perf.js";

const fmt = (s) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

const Icon = {
  play: <path d="M8 5v14l11-7z" />,
  pause: <path d="M6 5h4v14H6zM14 5h4v14h-4z" />,
  volume: <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />,
  muted: <path d="M3 9v6h4l5 5V4L7 9H3zm18.7 0-1.4-1.4L17.6 10.3 14.9 7.6 13.5 9l2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4-2.7-2.7z" />,
  full: <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />,
  prev: <path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" />,
  next: <path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4 4.6 4.6z" />,
  close: <path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z" />,
  share: <path d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.2c.1-.2.1-.5.1-.7s0-.5-.1-.7L16 7.2c.5.5 1.2.8 2 .8 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .2 0 .5.1.7L8 9.8C7.5 9.3 6.8 9 6 9c-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.5-.3 2-.8l7.1 4.2c-.1.2-.1.4-.1.6 0 1.6 1.3 2.9 2.9 2.9s2.9-1.3 2.9-2.9-1.2-2.9-2.8-2.9z" />,
  check: <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />,
};
const Svg = ({ name }) => <svg viewBox="0 0 24 24" aria-hidden="true">{Icon[name]}</svg>;

export default function Player({ works, index, onChange, onClose }) {
  const work = works[index];
  const box = useRef(null);
  const video = useRef(null);
  const hideTimer = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [idle, setIdle] = useState(false);
  const [copied, setCopied] = useState(false);

  // Telefonda tizim "Ulashish" oynasi, kompyuterda havolani nusxalash
  const share = async () => {
    const url = location.href;
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
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
    setMuted((m) => !m);
  };

  const fullscreen = () => {
    sfx.impact();
    if (document.fullscreenElement) document.exitFullscreen();
    else box.current.requestFullscreen?.().catch(() => {});
  };

  // Harakatsiz bo'lsa boshqaruv paneli yashiriladi
  const wake = () => {
    setIdle(false);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setIdle(true), 2500);
  };

  // Pleyer ochiq turganda orqadagi fon va 3D animatsiyalar to'xtaydi — video silliq o'ynaydi
  useEffect(() => {
    setPaused(true);
    return () => setPaused(false);
  }, []);

  useEffect(() => {
    setTime(0); setDuration(0); setBuffered(0); setLoading(true);
    video.current.play().catch(() => setPlaying(false));
    wake();
  }, [work.id]);

  useEffect(() => {
    const onKey = (e) => {
      const v = video.current;
      if (e.key === "Escape" && !document.fullscreenElement) close();
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
  }, [toggle, go, close]);

  const onBarPointer = (e) => {
    if (e.type === "pointermove" && e.buttons !== 1) return;
    const r = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * duration);
  };

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && close()}>
      <button className="modal-close" onClick={close} aria-label="Yopish"><Svg name="close" /></button>
      <button className="modal-nav prev" onClick={() => go(-1)} aria-label="Oldingi"><Svg name="prev" /></button>
      <button className="modal-nav next" onClick={() => go(1)} aria-label="Keyingi"><Svg name="next" /></button>

      <div
        ref={box}
        className={`player ${work.format} ${idle && playing ? "idle" : ""}`}
        onMouseMove={wake}
        onTouchStart={wake}
      >
        <video
          ref={video}
          key={work.id}
          src={videoSrc(work)}
          poster={posterSrc(work)}
          muted={muted}
          playsInline
          autoPlay
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onWaiting={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
          onPlaying={() => setLoading(false)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
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

        <div className="controls">
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
            <button onClick={toggleMute} aria-label={muted ? "Ovozni yoqish" : "Ovozni o'chirish"}>
              <Svg name={muted ? "muted" : "volume"} />
            </button>
            <span className="ctl-time">{fmt(time)} / {fmt(duration)}</span>
            <span className="ctl-count">{index + 1} / {works.length}</span>
            <button onClick={share} aria-label="Havolani ulashish" title={copied ? "Nusxalandi!" : "Havolani ulashish"}>
              <Svg name={copied ? "check" : "share"} />
            </button>
            <button onClick={fullscreen} aria-label="To'liq ekran"><Svg name="full" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
