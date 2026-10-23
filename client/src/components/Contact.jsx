import { useState } from "react";
import { API_URL, sendOrder } from "../api.js";

const SERVICES = ["Shorts / Reels edit", "YouTube video montaj", "VFX / effektlar", "Boshqa"];

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
      <div className="contact-info reveal">
        <h2>Buyurtma</h2>
        <p>
          Videongizni yangi darajaga olib chiqamiz.{" "}
          {API_URL ? "Formani to'ldiring yoki to'g'ridan-to'g'ri yozing:" : "To'g'ridan-to'g'ri yozing:"}
        </p>
        <div className="links">
          {profile.telegram && <a href={profile.telegram} target="_blank" rel="noopener">Telegram {profile.telegramNick}</a>}
          {profile.youtube && <a href={profile.youtube} target="_blank" rel="noopener">YouTube</a>}
          {profile.instagram && <a href={profile.instagram} target="_blank" rel="noopener">Instagram</a>}
        </div>
      </div>

      {API_URL ? (
        <form className="order reveal" onSubmit={submit}>
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
        <div className="order order-fallback reveal">
          <p>Buyurtma uchun Telegram'da yozing — tez javob beraman.</p>
          <a className="btn" href={profile.telegram} target="_blank" rel="noopener">Telegram'da yozish</a>
        </div>
      )}
    </section>
  );
}
