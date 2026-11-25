// 3D ikonkalar — Microsoft Fluent Emoji (MIT litsenziya), 128px PNG
import clapper from "../assets/icons/clapper.png";
import sparkles from "../assets/icons/sparkles.png";
import soccer from "../assets/icons/soccer.png";
import pin from "../assets/icons/pin.png";
import eye from "../assets/icons/eye.png";
import laugh from "../assets/icons/laugh.png";
import mic from "../assets/icons/mic.png";
import megaphone from "../assets/icons/megaphone.png";
import car from "../assets/icons/car.png";
import scroll from "../assets/icons/scroll.png";
import film from "../assets/icons/film.png";

const ICONS = { clapper, sparkles, soccer, pin, eye, laugh, mic, megaphone, car, scroll, film };

// Toifa → ikonka
export const CATEGORY_ICON = {
  all: "film", football: "soccer", content: "mic", ad: "megaphone", comedy: "laugh", auto: "car", doc: "scroll",
};

export default function Ico({ name, size = 18, className = "" }) {
  return (
    <img className={`ico ${className}`} src={ICONS[name]} alt="" width={size} height={size}
      loading="lazy" decoding="async" draggable="false" />
  );
}

// Oq logotip belgilari — rangli gradient plitka ichida ishlatiladi
export function BrandGlyph({ name }) {
  if (name === "telegram")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#fff" d="M3.4 11.3 18.9 5.3c.7-.3 1.4.2 1.2 1.3l-2.6 12.4c-.2.9-.7 1.1-1.5.7l-4-2.9-1.9 1.9c-.2.2-.4.4-.8.4l.3-4.1 7.4-6.7c.3-.3 0-.4-.4-.2l-9.2 5.8-4-1.2c-.9-.3-.9-.9.2-1.3z" />
      </svg>
    );
  if (name === "youtube")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="4.5" fill="#fff" />
        <path fill="#FF0033" d="M10 8.8v6.4l5.6-3.2z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="#fff" />
    </svg>
  );
}
