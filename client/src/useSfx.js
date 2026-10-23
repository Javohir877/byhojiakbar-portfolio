import { useEffect } from "react";
import { sfx, unlock } from "./sfx.js";

// Sahifadagi tugma va havolalarga ovozlarni bitta joydan ulaydi.
// Pleyer ichidagi ovozlar Player.jsx da (klaviatura bilan ham ishlashi uchun).
const INTERACTIVE = "a, button, input, select, textarea, label";

// Bosilgan nuqtadan tarqaladigan nur to'lqini
function ripple(el, e) {
  const r = el.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 2.2;
  const s = document.createElement("span");
  s.className = "ripple";
  s.style.cssText = `width:${size}px;height:${size}px;left:${(e.clientX || r.left + r.width / 2) - r.left - size / 2}px;top:${(e.clientY || r.top + r.height / 2) - r.top - size / 2}px`;
  el.appendChild(s);
  s.addEventListener("animationend", () => s.remove());
}

export default function useSfx() {
  useEffect(() => {
    let lastHover = null;

    const onOver = (e) => {
      if (e.pointerType !== "mouse") return;
      const el = e.target.closest?.(`.card, ${INTERACTIVE}`);
      if (el === lastHover) return;
      lastHover = el;
      if (!el || el.closest(".modal")) return;
      if (el.matches(".card")) sfx.hoverCard();
      else if (el.matches("a, button")) sfx.hover();
    };

    const onDown = () => unlock();

    const onClick = (e) => {
      unlock();
      const t = e.target;
      if (t.closest?.(".modal")) return;
      const el = t.closest?.(INTERACTIVE + ", .card");
      if (!el) return sfx.sparkle(); // bo'sh fonni bosish — uchqun portlashi
      if (el.matches(".btn, .chip, .nav-cta, .links a, .sound-toggle")) ripple(el, e);
      if (el.matches(".card")) sfx.open();
      else if (el.matches(".chip")) sfx.select();
      else if (el.matches(".btn, .nav-cta")) sfx.impact();
      else if (el.matches(".sound-toggle")) return; // o'zi chaladi
      else if (el.matches("a, button")) sfx.click();
    };

    const onFocus = (e) => {
      if (e.target.matches?.("input, select, textarea")) sfx.tick();
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("click", onClick);
      document.removeEventListener("focusin", onFocus);
    };
  }, []);
}
