import { useEffect, useState } from "react";
import { isSoundOn, onSoundChange, setSound, sfx, unlock } from "../sfx.js";

export default function SoundToggle() {
  const [on, setOn] = useState(isSoundOn);
  useEffect(() => onSoundChange(setOn), []);

  const toggle = () => {
    unlock();
    const next = !on;
    setSound(next);
    if (next) sfx.glitch();
  };

  return (
    <button
      className={`sound-toggle${on ? " on" : ""}`}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Ovoz effektlarini o'chirish" : "Ovoz effektlarini yoqish"}
      title={on ? "Ovoz: yoqilgan" : "Ovoz: o'chirilgan"}
    >
      <span className="eq" aria-hidden="true"><i /><i /><i /><i /></span>
    </button>
  );
}
