import { useEffect, useMemo, useState } from "react";
import Background from "./components/Background.jsx";
import Hero from "./components/Hero.jsx";
import Works from "./components/Works.jsx";
import Services from "./components/Services.jsx";
import Player from "./components/Player.jsx";
import Contact from "./components/Contact.jsx";
import { PROFILE, WORKS } from "./works.js";
import { addView, getViews } from "./api.js";
import useReveal from "./useReveal.js";
import useSfx from "./useSfx.js";
import SoundToggle from "./components/SoundToggle.jsx";

// Pin qilinganlar birinchi, qolganlari — eng yangisi birinchi
const ORDERED = [...WORKS.filter((w) => w.pinned), ...WORKS.filter((w) => !w.pinned).reverse()];

// Manzildagi #v=video-id orqali videoni to'g'ridan-to'g'ri ochish
const idFromHash = () => new URLSearchParams(location.hash.slice(1)).get("v");
const setHash = (id) =>
  history.replaceState(null, "", id ? `#v=${id}` : location.pathname + location.search);

export default function App() {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(() => (ORDERED.some((w) => w.id === idFromHash()) ? idFromHash() : null));
  const [views, setViews] = useState({});

  const shown = useMemo(
    () => (filter === "all" ? ORDERED : ORDERED.filter((w) => w.category === filter)),
    [filter]
  );
  // Pleyer ochiq videoning ro'yxatini ishlatadi; filtrdan tashqarida bo'lsa — hammasini
  const playlist = shown.some((w) => w.id === openId) ? shown : ORDERED;
  const openIndex = playlist.findIndex((w) => w.id === openId);

  useReveal([filter]);
  useSfx();

  useEffect(() => {
    getViews().then(setViews);
  }, []);

  useEffect(() => {
    if (!openId) return;
    setHash(openId);
    addView(openId).then((n) => n != null && setViews((v) => ({ ...v, [openId]: n })));
  }, [openId]);

  const close = () => {
    setOpenId(null);
    setHash(null);
  };

  return (
    <>
      <Background />
      <header className="nav">
        <a href="#top" className="logo">By.<span>Xojiakbar</span></a>
        <nav>
          <a href="#works">Ishlar</a>
          <a href="#services">Xizmatlar</a>
          <SoundToggle />
          <a href="#contact" className="nav-cta">Buyurtma</a>
        </nav>
      </header>

      <main id="top">
        <Hero profile={PROFILE} count={WORKS.length} />
        <Works works={shown} total={ORDERED} filter={filter} onFilter={setFilter} views={views} onOpen={setOpenId} />
        <Services />
        <Contact profile={PROFILE} />
      </main>

      <footer>© {new Date().getFullYear()} By.Xojiakbar · Video Editor</footer>

      {openIndex >= 0 && (
        <Player
          works={playlist}
          index={openIndex}
          onChange={(i) => setOpenId(playlist[i].id)}
          onClose={close}
        />
      )}
    </>
  );
}
