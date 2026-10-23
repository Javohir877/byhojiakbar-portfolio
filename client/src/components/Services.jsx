const SERVICES = [
  { icon: "⚽", title: "Futbol editlar", text: "Futbolchilar va havaskor o'yinchilar uchun dinamik editlar: sekinlashuv, beat sync, effektlar." },
  { icon: "🎙", title: "Bloger kontent", text: "Gapiruvchi videolar, podkast va rubrikalar: matn animatsiyasi, kesimlar, ritm." },
  { icon: "📱", title: "Reels / Shorts", text: "Vertikal format, birinchi soniyadan ushlab qoladigan montaj va trendga mos uslub." },
  { icon: "✨", title: "VFX va rang", text: "Vizual effektlar, o'tishlar, rang korreksiyasi — videoga kino ko'rinishi beraman." },
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
            <span className="service-icon" aria-hidden="true">{s.icon}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
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
