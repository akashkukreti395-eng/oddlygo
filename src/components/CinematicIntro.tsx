import { useEffect, useState } from "react";
import { Orbit, Sparkles } from "lucide-react";

type CinematicIntroProps = { onComplete: () => void };

/**
 * OddlyGo's portal intro: an original implementation using the visual patterns
 * of Aceternity UI spotlight/3D card effects and Animata's split-reveal/preloader
 * patterns, adapted to the project's existing CSS stack (no Tailwind required).
 */
export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let done = false;
    let exitTimer = 0;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      setLeaving(true);
      exitTimer = window.setTimeout(onComplete, 560);
    };
    const timer = window.setTimeout(finish, 3300);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(exitTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onComplete]);

  function skip() {
    setLeaving(true);
    window.setTimeout(onComplete, 420);
  }

  return (
    <div className={`og-portal ${leaving ? "og-portal--leaving" : ""}`} role="dialog" aria-label="Welcome to OddlyGo" aria-modal="true">
      <div className="og-portal-noise" />
      <div className="og-portal-grid" />
      <div className="og-portal-flare og-portal-flare--one" />
      <div className="og-portal-flare og-portal-flare--two" />
      <div className="og-portal-ring og-portal-ring--outer" />
      <div className="og-portal-ring og-portal-ring--inner" />
      <div className="og-portal-core"><span>o</span><i /></div>
      <div className="og-portal-particle og-portal-particle--a">✳</div>
      <div className="og-portal-particle og-portal-particle--b">✦</div>
      <div className="og-portal-particle og-portal-particle--c">+</div>
      <div className="og-portal-wordmark"><span className="og-portal-icon"><Orbit size={20} /></span><span>Oddly</span><b>Go</b></div>
      <div className="og-portal-copy">
        <div className="og-portal-kicker"><Sparkles size={13} /> A PLAYGROUND FOR THE CURIOUS</div>
        <h2><span>Curiosity</span> is calling.</h2>
        <p>Tiny games. Strange worlds. Unexpected discoveries.</p>
      </div>
      <button className="og-portal-skip" onClick={skip}>Skip intro <span>ESC</span></button>
      <div className="og-portal-bottom"><span>ODDLYGO / 001</span><span>STAY CURIOUS&nbsp; ✳</span></div>
    </div>
  );
}
