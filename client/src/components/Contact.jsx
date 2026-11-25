import { useState } from "react";
import { API_URL, sendOrder } from "../api.js";
import { BrandGlyph } from "./Ico.jsx";

const SERVICES = ["Shorts / Reels edit", "YouTube video montaj", "VFX / effektlar", "Boshqa"];

// Ijtimoiy tarmoq kartochkalari — har biri o'z brendi rangidagi gradient bilan
function SocialCards({ profile }) {
  const items = [
    profile.telegram && {
      key: "telegram", title: "Telegram", sub: profile.telegram.replace(/^https?:\/\//, ""), href: profile.telegram,
    },
    profile.instagram && {
      key: "instagram", title: "Instagram sahifa", sub: "@" + profile.instagram.replace(/\/$/, "").split("/").pop(), href: profile.instagram,
    },
    profile.youtube && {
      key: "youtube", title: "YouTube kanal", sub: "@" + profile.youtube.split("@").pop(), href: profile.youtube,
    },
  ].filter(Boolean);

  return (
    <div className="socials">
      {items.map((s, i) => (
        <a key={s.key} className={`social ${s.key} reveal cut`} style={{ "--d": `${i * 90}ms` }}
          href={s.href} target="_blank" rel="noopener">
          <span className="social-icon"><BrandGlyph name={s.key} /></span>
          <span className="social-text">
            <b>{s.title}</b>
            <small>{s.sub}</small>
          </span>
          <svg className="social-arrow" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      ))}
    </div>
  );
}

export default function Contact({ profile }) {
  const [form, setForm] = useState({ name: "", contact: "", service: SERVICES[0], message: "", website: "" });
  const [status, setStatus] = useState({ state: "idle", text: "" });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", text: "" });
    try {
      await sendOrder(form);
      setStatus({ state: "ok", text: "Rahmat! Xabaringiz yuborildi, tez orada bog'lanaman." });
      setForm({ ...form, name: "", contact: "", message: "" });
    } catch (err) {
      setStatus({ state: "error", text: err.message });
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-info reveal cut">
        <span className="eyebrow"><i />Biz bilan aloqada bo'ling</span>
        <h2>Buyurtma</h2>
        <p>
          Videongizni yangi darajaga olib chiqamiz. Yangi editlar va buyurtma uchun sahifalarimizga
          yozing{API_URL ? " yoki formani to'ldiring" : ""}.
        </p>
        {API_URL && <SocialCards profile={profile} />}
      </div>

      {API_URL ? (
        <form className="order reveal cut" onSubmit={submit}>
          <label>Ismingiz
            <input required maxLength={60} value={form.name} onChange={set("name")} placeholder="Ism" />
          </label>
          <label>Telegram yoki telefon
            <input required maxLength={60} value={form.contact} onChange={set("contact")} placeholder="@username yoki +998…" />
          </label>
          <label>Xizmat turi
            <select value={form.service} onChange={set("service")}>
              {SERVICES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>Xabar
            <textarea required maxLength={1000} rows={4} value={form.message} onChange={set("message")} placeholder="Qanday video kerak?" />
          </label>
          {/* Botlar uchun tuzoq — odamlar bu maydonni ko'rmaydi */}
          <input className="hp" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} aria-hidden="true" />
          <button className="btn" disabled={status.state === "sending"}>
            {status.state === "sending" ? "Yuborilmoqda…" : "Yuborish"}
          </button>
          {status.text && <p className={`form-msg ${status.state}`}>{status.text}</p>}
        </form>
      ) : (
        <SocialCards profile={profile} />
      )}
    </section>
  );
}
