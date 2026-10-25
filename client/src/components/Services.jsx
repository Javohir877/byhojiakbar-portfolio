import football from "../assets/services/football.jpg";
import content from "../assets/services/content.jpg";
import reels from "../assets/services/reels.jpg";
import vfx from "../assets/services/vfx.jpg";

// Rasmlar — Hojiakbarning o'z editlaridan olingan kadrlar
const SERVICES = [
  { img: football, title: "Futbol editlar", text: "Futbolchilar va havaskor o'yinchilar uchun dinamik editlar: sekinlashuv, beat sync, effektlar." },
  { img: content, title: "Bloger kontent", text: "Gapiruvchi videolar, podkast va rubrikalar: matn animatsiyasi, kesimlar, ritm." },
  { img: reels, title: "Reels / Shorts", text: "Vertikal format, birinchi soniyadan ushlab qoladigan montaj va trendga mos uslub." },
  { img: vfx, title: "VFX va rang", text: "Vizual effektlar, o'tishlar, rang korreksiyasi — videoga kino ko'rinishi beraman." },
];

export default function Services() {
  return (
    <section id="services" className="services">
      <div className="section-head reveal">
        <h2>Xizmatlar</h2>
      </div>
      <div className="service-grid">
        {SERVICES.map((s, i) => (
          <article className="service reveal" key={s.title} style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="service-img">
              <img src={s.img} alt={s.title} loading="lazy" decoding="async" />
            </div>
            <div className="service-body">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="steps reveal">
        <div><b>1</b><span>Telegram'da yozasiz va g'oyani aytasiz</span></div>
        <div><b>2</b><span>Material yuborasiz: video, musiqa, namuna</span></div>
        <div><b>3</b><span>Tayyor editni olasiz, kerak bo'lsa tuzataman</span></div>
      </div>
    </section>
  );
}
