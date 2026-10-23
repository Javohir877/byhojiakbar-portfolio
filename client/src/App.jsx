import { useEffect, useState } from "react";
import Background from "./components/Background.jsx";
import Hero from "./components/Hero.jsx";
import Works from "./components/Works.jsx";
import Player from "./components/Player.jsx";
import Contact from "./components/Contact.jsx";
import { PROFILE, WORKS } from "./works.js";
import { addView, getViews } from "./api.js";

// Eng yangi ish birinchi
const ORDERED = [...WORKS].reverse();

export default function App() {
  const [openIndex, setOpenIndex] = useState(null);
  const [views, setViews] = useState({});

  useEffect(() => {
    getViews().then(setViews);
  }, []);

  const open = (i) => {
    setOpenIndex(i);
    const id = ORDERED[i].id;
    addView(id).then((n) => n != null && setViews((v) => ({ ...v, [id]: n })));
  };

  return (
    <>
      <Background />
      <header className="nav">
        <a href="#top" className="logo">By.<span>Xojiakbar</span></a>
        <nav>
          <a href="#works">Ishlar</a>
          <a href="#contact" className="nav-cta">Buyurtma</a>
        </nav>
      </header>

      <main id="top">
        <Hero profile={PROFILE} count={WORKS.length} />
        <Works works={ORDERED} views={views} onOpen={open} />
        <Contact profile={PROFILE} />
      </main>

      <footer>© {new Date().getFullYear()} By.Xojiakbar · Video Editor</footer>

      {openIndex != null && (
        <Player
          works={ORDERED}
          index={openIndex}
          onChange={open}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
