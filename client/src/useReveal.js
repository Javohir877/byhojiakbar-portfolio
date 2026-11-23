import { useEffect } from "react";

// .reveal klassli elementlar ekranga kirganda "in" klassi oladi va o'z animatsiyasini boshlaydi.
// Keyin qo'shilgan elementlar (filtr, ekran o'lchami o'zgarganda qayta chizilgan kartochkalar)
// ham avtomatik kuzatiladi.
export default function useReveal() {
  useEffect(() => {
    const show = (el) => {
      // Sarlavhada playhead matn oxirigacha borishi uchun kenglik
      if (el.classList.contains("head")) {
        const h = el.querySelector("h2");
        if (h) el.style.setProperty("--head-w", `${h.offsetWidth}px`);
      }
      el.classList.add("in");
    };

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px" }
    );
    const watch = (root) => {
      if (root.nodeType !== 1) return;
      if (root.matches(".reveal:not(.in)")) io.observe(root);
      root.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    };
    watch(document.body);

    const mo = new MutationObserver((list) => {
      for (const m of list) m.addedNodes.forEach(watch);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
