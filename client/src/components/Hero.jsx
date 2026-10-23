import hero from "../assets/hero.webp";
import Tilt3D from "./Tilt3D.jsx";

export default function Hero({ profile, count }) {
  return (
    <section className="hero">
      <div className="hero-photo">
        <Tilt3D src={hero} alt={profile.name} />
      </div>
      <div className="hero-text">
        <p className="script">portfolio</p>
        <h1>By.<span>Hojiakbar</span></h1>
        <p className="role">{profile.role}</p>
        <p className="about">{profile.about}</p>
        <div className="hero-actions">
          <a href="#works" className="btn">Ishlarni ko'rish</a>
          <a href="#contact" className="btn ghost">Buyurtma berish</a>
        </div>
        <div className="hero-stats">
          <div><b>{count}+</b><span>tayyor edit</span></div>
          <div><b>VFX</b><span>effektlar</span></div>
          <div><b>HD</b><span>sifat</span></div>
        </div>
      </div>
    </section>
  );
}
