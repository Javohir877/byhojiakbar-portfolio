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

// Ijtimoiy tarmoq logotiplari (sodda SVG)
export function BrandIcon({ name }) {
  if (name === "telegram")
    return (
      <svg viewBox="0 0 24 24" className="brand" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#29A9EB" />
        <path fill="#fff" d="M5.4 11.7 16.9 7.3c.5-.2 1 .1.8 1l-1.9 9.1c-.1.6-.5.8-1.1.5l-2.9-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-3 5.4-4.9c.2-.2 0-.3-.3-.1l-6.7 4.2-2.9-.9c-.6-.2-.6-.6.1-.9z" />
      </svg>
    );
  if (name === "youtube")
    return (
      <svg viewBox="0 0 24 24" className="brand" aria-hidden="true">
        <rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="#FF0000" />
        <path fill="#fff" d="M10 8.8v6.4l5.6-3.2z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className="brand" aria-hidden="true">
      <defs>
        <radialGradient id="igg" cx="30%" cy="107%" r="150%">
          <stop offset="0" stopColor="#FDF497" /><stop offset=".05" stopColor="#FDF497" />
          <stop offset=".45" stopColor="#FD5949" /><stop offset=".6" stopColor="#D6249F" /><stop offset=".9" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#igg)" />
      <rect x="6" y="6" width="12" height="12" rx="4" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.9" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="16.4" cy="7.6" r="1" fill="#fff" />
    </svg>
  );
}
