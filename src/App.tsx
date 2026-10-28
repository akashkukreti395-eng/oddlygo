import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  History,
  Check,
  Compass,
  ExternalLink,
  Gamepad2,
  Globe2,
  Menu,
  Orbit,
  Search,
  Shuffle,
  Sparkles,
  X,
  Maximize2,
  Download,
  RefreshCw,
  Trophy,
  CalendarDays,
  Flame,
  Star,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Zap,
  Target,
  Medal,
} from "lucide-react";
import { experiences, type Category, type Experience } from "./data/experiences";
import { CinematicIntro } from "./components/CinematicIntro";

type DiscoveryVibe = "Surprise me" | "Quick hit" | "Play something" | "Weird web" | "Make stuff";
const discoveryVibes: { label: DiscoveryVibe; hint: string }[] = [
  { label: "Surprise me", hint: "Anything unexpected" },
  { label: "Quick hit", hint: "Under a minute" },
  { label: "Play something", hint: "Games and challenges" },
  { label: "Weird web", hint: "External rabbit holes" },
  { label: "Make stuff", hint: "Creative toys" },
];

const categories: { label: Category; icon: typeof Gamepad2 }[] = [
  { label: "All", icon: Compass },
  { label: "Play", icon: Gamepad2 },
  { label: "Discover", icon: Globe2 },
  { label: "Experiment", icon: Orbit },
  { label: "Create", icon: Sparkles },
];

function readStorage(key: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function App() {
  const [showCinematicIntro, setShowCinematicIntro] = useState(() => {
    try { return !sessionStorage.getItem("oddlygo-intro-seen"); } catch { return false; }
  });
  const finishCinematicIntro = useCallback(() => {
    try { sessionStorage.setItem("oddlygo-intro-seen", "1"); } catch { /* storage may be unavailable */ }
    setShowCinematicIntro(false);
  }, []);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [discoveryVibe, setDiscoveryVibe] = useState<DiscoveryVibe>("Surprise me");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recommended" | "newest" | "shortest" | "az">("recommended");
  const [quickOnly, setQuickOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>(() => readStorage("oddlygo-saved"));
  const [history, setHistory] = useState<string[]>(() => readStorage("oddlygo-history"));
  const [surprise, setSurprise] = useState<Experience | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [onlyOriginals, setOnlyOriginals] = useState(false);
  const [onlyExternal, setOnlyExternal] = useState(false);
  const [showArcade, setShowArcade] = useState(false);
  const [completedGames, setCompletedGames] = useState<string[]>(() => readStorage("oddlygo-completed-games"));
  const [gameBests, setGameBests] = useState<Record<string, number>>(() => { try { const v = JSON.parse(localStorage.getItem("oddlygo-game-bests") || "{}"); return v && typeof v === "object" ? v : {}; } catch { return {}; } });
  const [prismFewest, setPrismFewest] = useState<number | null>(() => { const value = Number(localStorage.getItem("oddlygo-prism-fewest-rotations")); return Number.isFinite(value) && value > 0 ? value : null; });
  const [dailyWins, setDailyWins] = useState<string[]>(() => readStorage("oddlygo-daily-wins"));
  const [xp, setXp] = useState<number>(() => { try { return Math.max(0, Number(localStorage.getItem("oddlygo-xp") || 0)); } catch { return 0; } });
  const [combo, setCombo] = useState<number>(() => { try { return Math.max(0, Number(localStorage.getItem("oddlygo-win-combo") || 0)); } catch { return 0; } });
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("oddlygo-sound") !== "false");
  const [resultLog, setResultLog] = useState<{ id: string; date: string; score?: number }[]>(() => { try { const v = JSON.parse(localStorage.getItem("oddlygo-result-log") || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } });
  const [claimedMissions, setClaimedMissions] = useState<string[]>(() => readStorage("oddlygo-claimed-missions"));
  const [themeUnlocked, setThemeUnlocked] = useState(() => localStorage.getItem("oddlygo-theme-unlocked") === "true");
  const [altTheme, setAltTheme] = useState(() => localStorage.getItem("oddlygo-alt-theme") === "true");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [gameState, setGameState] = useState<"idle" | "running" | "result">("idle");
  const [gameStart, setGameStart] = useState(0);
  const [clock, setClock] = useState(0);
  const [gameResult, setGameResult] = useState<number | null>(null);
  const [bestTimer, setBestTimer] = useState<number | null>(() => {
    try {
      const stored = Number(localStorage.getItem("oddlygo-best-timer"));
      return Number.isFinite(stored) && stored > 0 ? stored : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const selector = ".hero-copy, .hero-art, .section-heading, .experience-card, .category-pill, .daily-banner, .about-section, .creator-note, .footer-made, .daily-prism-card, .arcade-panel, .arcade-passport";
    const reveal = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
      if (reduceMotion || !("IntersectionObserver" in window)) {
        nodes.forEach((el) => el.classList.add("og-revealed"));
        return;
      }
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add("og-revealed");
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.04, rootMargin: "0px 0px -24px 0px" });
      nodes.forEach((el, index) => {
        el.classList.add("og-reveal");
        if (el.classList.contains("experience-card")) el.style.setProperty("--og-stagger", `${Math.min(index % 4, 3) * 75}ms`);
        observer.observe(el);
      });
      return observer;
    };
    let observer = reveal();
    // Re-scan after React updates filters, search results, and game catalog state.
    const mutation = new MutationObserver(() => {
      observer?.disconnect();
      observer = reveal();
    });
    const root = document.querySelector("#root");
    if (root) mutation.observe(root, { childList: true, subtree: true });
    return () => { observer?.disconnect(); mutation.disconnect(); };
  }, []);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>(".site-shell");
    if (!shell || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onPointerMove = (event: PointerEvent) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        shell.style.setProperty("--pointer-x", `${event.clientX}px`);
        shell.style.setProperty("--pointer-y", `${event.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onPointerMove); if (frame) cancelAnimationFrame(frame); };
  }, []);



  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let activeCard: HTMLElement | null = null;
    const onMove = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(".experience-card") : null;
      if (!target) {
        if (activeCard) {
          activeCard.style.setProperty("--tilt-x", "0deg");
          activeCard.style.setProperty("--tilt-y", "0deg");
          activeCard = null;
        }
        return;
      }
      activeCard = target;
      const rect = target.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      target.style.setProperty("--spot-x", `${x * 100}%`);
      target.style.setProperty("--spot-y", `${y * 100}%`);
      target.style.setProperty("--tilt-x", `${(0.5 - y) * 5}deg`);
      target.style.setProperty("--tilt-y", `${(x - 0.5) * 6}deg`);
    };
    const onLeave = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(".experience-card") : null;
      if (!target || target.contains(event.relatedTarget as Node | null)) return;
      target.style.setProperty("--tilt-x", "0deg");
      target.style.setProperty("--tilt-y", "0deg");
      if (activeCard === target) activeCard = null;
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
    };
  }, []);

  useEffect(() => {
    if (gameState !== "running") return;
    const interval = window.setInterval(() => setClock(performance.now()), 30);
    return () => window.clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSurprise(null);
        setGameState("idle");
        setMobileMenu(false);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>(".search-box input")?.focus();
        document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return experiences.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSaved = !showSaved || saved.includes(item.id);
      const matchesRecent = !showRecent || history.includes(item.id);
      const matchesOriginals = !onlyOriginals || item.kind === "internal";
      const matchesExternal = !onlyExternal || item.kind === "external";
      const seconds = (value: string) => { const n = Number.parseInt(value, 10) || 5; return value.toLowerCase().includes("sec") ? n : n * 60; };
      const matchesQuick = !quickOnly || seconds(item.time) <= 60;
      const searchable = [item.title, item.description, item.category, ...item.tags].join(" ").toLowerCase();
      return matchesCategory && matchesSaved && matchesRecent && matchesOriginals && matchesExternal && matchesQuick && (!term || searchable.includes(term));
    }).sort((a, b) => {
      if (showRecent) return history.indexOf(a.id) - history.indexOf(b.id);
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "shortest") { const seconds = (v: string) => { const n = Number.parseInt(v, 10) || 5; return v.toLowerCase().includes("sec") ? n : n * 60; }; return seconds(a.time) - seconds(b.time); }
      if (sortBy === "newest") return experiences.indexOf(b) - experiences.indexOf(a);
      return 0;
    });
  }, [activeCategory, query, saved, showSaved, showRecent, history, onlyOriginals, onlyExternal, quickOnly, sortBy]);


  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".experience-card"));
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;
    const cleanup: Array<() => void> = [];
    cards.forEach((card) => {
      const move = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rx = ((y / rect.height) - .5) * -5.5;
        const ry = ((x / rect.width) - .5) * 6.5;
        card.style.setProperty("--spot-x", `${x}px`);
        card.style.setProperty("--spot-y", `${y}px`);
        card.style.setProperty("--tilt-x", `${rx}deg`);
        card.style.setProperty("--tilt-y", `${ry}deg`);
      };
      const leave = () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.style.setProperty("--spot-x", "50%");
        card.style.setProperty("--spot-y", "50%");
      };
      card.addEventListener("pointermove", move, { passive: true });
      card.addEventListener("pointerleave", leave);
      cleanup.push(() => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
      });
    });
    return () => cleanup.forEach((fn) => fn());
  }, [filtered.length, activeCategory, query, showSaved, showRecent, onlyOriginals, onlyExternal]);

  function persistSaved(next: string[]) {
    setSaved(next);
    localStorage.setItem("oddlygo-saved", JSON.stringify(next));
  }

  function saveExperience(id: string) {
    persistSaved(saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id]);
  }

  function recordVisit(item: Experience) {
    localStorage.setItem(`oddlygo-visit-date-${item.id}`, new Date().toLocaleDateString("en-CA"));
    const next = [item.id, ...history.filter((id) => id !== item.id)].slice(0, 20);
    setHistory(next);
    localStorage.setItem("oddlygo-history", JSON.stringify(next));
  }



  const todayKey = new Date().toLocaleDateString("en-CA");
  const originalGames = experiences.filter((item) => item.kind === "internal" && item.category === "Play" && ["one-second", "maze-mind", "prism-shift", "green-light", "memory-matrix", "word-scramble", "orbit-dodge"].includes(item.id));
  const dailyExperience = originalGames.length ? originalGames[Math.floor(new Date(`${todayKey}T12:00:00`).getTime() / 86400000) % originalGames.length] : experiences[0];
  const dailyCompleted = dailyWins.includes(todayKey);
  const todayResults = resultLog.filter((entry) => entry.date === todayKey);
  const todayWinsCount = todayResults.length;
  const dailyMissions = [
    { title: "Warm up", detail: "Win any original game", progress: Math.min(1, todayWinsCount), goal: 1, reward: 40 },
    { title: "Double trouble", detail: "Win 2 original games today", progress: Math.min(2, todayWinsCount), goal: 2, reward: 75 },
    { title: "Curiosity sprint", detail: "Open 3 different experiences today", progress: Math.min(3, new Set(history.filter((id) => experiences.some((item) => item.id === id)).filter((id) => { const opened = localStorage.getItem(`oddlygo-visit-date-${id}`); return opened === todayKey; })).size), goal: 3, reward: 50 },
  ];
  useEffect(() => {
    const newlyCompleted = dailyMissions.filter((mission) => mission.progress >= mission.goal && !claimedMissions.includes(`${todayKey}:${mission.title}`));
    if (!newlyCompleted.length) return;
    const nextClaims = [...claimedMissions, ...newlyCompleted.map((mission) => `${todayKey}:${mission.title}`)];
    const bonus = newlyCompleted.reduce((sum, mission) => sum + mission.reward, 0);
    const nextXp = xp + bonus;
    setClaimedMissions(nextClaims); localStorage.setItem("oddlygo-claimed-missions", JSON.stringify(nextClaims));
    setXp(nextXp); localStorage.setItem("oddlygo-xp", String(nextXp));
  }, [todayKey, todayWinsCount, history, xp, claimedMissions]);
  const uniqueOpened = history.length;
  const completedCount = completedGames.length;
  const streak = (() => { let n = 0; const d = new Date(`${todayKey}T12:00:00`); const wins = new Set(dailyWins); if (!wins.has(todayKey)) d.setDate(d.getDate()-1); while (wins.has(d.toLocaleDateString("en-CA"))) { n++; d.setDate(d.getDate()-1); } return n; })();
  const achievementList = [
    { title: "First steps", description: "Open your first experience", unlocked: uniqueOpened >= 1, progress: Math.min(uniqueOpened, 1), goal: 1, icon: "✦" },
    { title: "Curiosity collector", description: "Save 3 experiences", unlocked: saved.length >= 3, progress: Math.min(saved.length, 3), goal: 3, icon: "⌑" },
    { title: "Rabbit-hole regular", description: "Explore 5 different experiences", unlocked: uniqueOpened >= 5, progress: Math.min(uniqueOpened, 5), goal: 5, icon: "◎" },
    { title: "Original thinker", description: "Save an OddlyGo Original", unlocked: saved.some((id) => experiences.some((item) => item.id === id && item.kind === "internal")), progress: saved.some((id) => experiences.some((item) => item.id === id && item.kind === "internal")) ? 1 : 0, goal: 1, icon: "✳" },
    { title: "Daily finisher", description: "Win a daily challenge", unlocked: dailyCompleted, progress: dailyCompleted ? 1 : 0, goal: 1, icon: "☀" },
    { title: "Collector's instinct", description: "Save 5 experiences", unlocked: saved.length >= 5, progress: Math.min(saved.length, 5), goal: 5, icon: "★" },
    { title: "Game changer", description: "Win 3 different original games", unlocked: completedCount >= 3, progress: Math.min(completedCount, 3), goal: 3, icon: "🏆" },
    { title: "On a roll", description: "Build a 3-day daily win streak", unlocked: streak >= 3, progress: Math.min(streak, 3), goal: 3, icon: "🔥" },
    { title: "XP hunter", description: "Earn 500 Arcade XP", unlocked: xp >= 500, progress: Math.min(xp, 500), goal: 500, icon: "⚡" },
    { title: "Puzzle architect", description: "Complete Prism Shift", unlocked: completedGames.includes("prism-shift"), progress: completedGames.includes("prism-shift") ? 1 : 0, goal: 1, icon: "✧" },
    { title: "Master of memory", description: "Finish the 12-level Memory Overload run", unlocked: completedGames.includes("memory-matrix"), progress: completedGames.includes("memory-matrix") ? 1 : 0, goal: 1, icon: "▦" },
    { title: "Clean getaway", description: "Escape Pocket Heist with all gems", unlocked: completedGames.includes("orbit-dodge"), progress: completedGames.includes("orbit-dodge") ? 1 : 0, goal: 1, icon: "◆" },
  ];

  useEffect(() => {
    function onGameResult(event: Event) {
      const detail = (event as CustomEvent<{ id: string; score?: number; moves?: number; daily?: boolean }>).detail;
      if (!detail?.id) return;
      const completed = [...new Set([...readStorage("oddlygo-completed-games"), detail.id])];
      setCompletedGames(completed); localStorage.setItem("oddlygo-completed-games", JSON.stringify(completed));
      const nowDate = new Date().toLocaleDateString("en-CA");
      const nextCombo = Math.min(99, Number(localStorage.getItem("oddlygo-win-combo") || 0) + 1);
      const reward = 50 + Math.min(50, (nextCombo - 1) * 10);
      const nextXp = Math.max(0, Number(localStorage.getItem("oddlygo-xp") || 0)) + reward;
      const nextLog = [...(Array.isArray(JSON.parse(localStorage.getItem("oddlygo-result-log") || "[]")) ? JSON.parse(localStorage.getItem("oddlygo-result-log") || "[]") : []), { id: detail.id, date: nowDate, score: detail.score }].slice(-500);
      localStorage.setItem("oddlygo-win-combo", String(nextCombo)); localStorage.setItem("oddlygo-xp", String(nextXp)); localStorage.setItem("oddlygo-result-log", JSON.stringify(nextLog));
      setCombo(nextCombo); setXp(nextXp); setResultLog(nextLog);
      if (localStorage.getItem("oddlygo-sound") !== "false") {
        try { const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext; if (AudioContextClass) { const ctx = new AudioContextClass(); [660, 880].forEach((frequency, index) => { const oscillator = ctx.createOscillator(); const gain = ctx.createGain(); oscillator.type = "sine"; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(0.0001, ctx.currentTime + index * 0.09); gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + index * 0.09 + 0.015); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.09 + 0.16); oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(ctx.currentTime + index * 0.09); oscillator.stop(ctx.currentTime + index * 0.09 + 0.17); }); window.setTimeout(() => void ctx.close(), 450); } } catch { /* Audio is optional; gameplay must never depend on it. */ }
      }
      if (typeof detail.score === "number" && Number.isFinite(detail.score)) {
        setGameBests((old) => { const next = { ...old, [detail.id]: Math.max(old[detail.id] ?? -Infinity, detail.score!) }; localStorage.setItem("oddlygo-game-bests", JSON.stringify(next)); return next; });
      }
      if (detail.id === "prism-shift" && typeof detail.moves === "number" && Number.isFinite(detail.moves)) {
        const current = Number(localStorage.getItem("oddlygo-prism-fewest-rotations"));
        const best = current > 0 ? Math.min(current, detail.moves) : detail.moves;
        localStorage.setItem("oddlygo-prism-fewest-rotations", String(best));
        setPrismFewest(best);
      }
      if (localStorage.getItem("oddlygo-active-daily-id") === detail.id) {
        const wins = [...new Set([...readStorage("oddlygo-daily-wins"), todayKey])].slice(-180);
        setDailyWins(wins); localStorage.setItem("oddlygo-daily-wins", JSON.stringify(wins)); localStorage.removeItem("oddlygo-active-daily-id");
      }
      if ((completed.length >= 3 || nextXp >= 500) && localStorage.getItem("oddlygo-theme-unlocked") !== "true") { localStorage.setItem("oddlygo-theme-unlocked", "true"); setThemeUnlocked(true); }
    }
    window.addEventListener("oddlygo:game-result", onGameResult);
    return () => window.removeEventListener("oddlygo:game-result", onGameResult);
  }, [todayKey]);

  function startDailyChallenge() {
    localStorage.setItem("oddlygo-active-daily-id", dailyExperience.id);
    setShowArcade(false);
    openExperience(dailyExperience);
  }

  function startDailyPrismPuzzle() {
    const prism = experiences.find((item) => item.id === "prism-shift");
    if (!prism) return;
    localStorage.setItem("oddlygo-active-daily-id", "prism-shift");
    localStorage.setItem("oddlygo-prism-daily-mode", "true");
    setShowArcade(false);
    openExperience(prism);
  }

  function openExperience(item: Experience) {
    recordVisit(item);
    setSurprise(item);
    setIsDiscovering(false);
    if (item.id === "one-second") {
      setGameState("idle");
      setGameResult(null);
    }
  }

  function takeMeSomewhere() {
    if (isDiscovering) return;
    setIsDiscovering(true);

    // Discovery is guided by the selected vibe, while still avoiding recent repeats.
    const matchesVibe = (item: Experience) => {
      if (discoveryVibe === "Quick hit") return item.time.toLowerCase().includes("sec") || item.time.toLowerCase().includes("1 min");
      if (discoveryVibe === "Play something") return item.category === "Play";
      if (discoveryVibe === "Weird web") return item.kind === "external";
      if (discoveryVibe === "Make stuff") return item.category === "Create" || item.category === "Experiment";
      return true;
    };
    const vibePool = experiences.filter(matchesVibe);
    const recentIds = new Set(history.slice(0, 5));
    const unseen = vibePool.filter((item) => !recentIds.has(item.id));
    const pool = unseen.length ? unseen : vibePool.length ? vibePool : experiences;

    // If the last few picks were all internal or external, gently rebalance the next pick.
    const lastKinds = history.slice(0, 3).map((id) => experiences.find((item) => item.id === id)?.kind);
    const preferredKind = discoveryVibe === "Surprise me" && lastKinds.length >= 2 && lastKinds.every((kind) => kind === lastKinds[0])
      ? (lastKinds[0] === "internal" ? "external" : "internal")
      : null;
    const balancedPool = preferredKind ? pool.filter((item) => item.kind === preferredKind) : pool;
    const finalPool = balancedPool.length ? balancedPool : pool;
    const pick = finalPool[Math.floor(Math.random() * finalPool.length)];

    window.setTimeout(() => {
      openExperience(pick);
      setIsDiscovering(false);
    }, 420);
  }

  function startTimer() {
    setGameState("running");
    const now = performance.now();
    setGameStart(now);
    setClock(now);
    setGameResult(null);
  }

  function stopTimer() {
    if (gameState !== "running") return;
    const elapsed = (performance.now() - gameStart) / 1000;
    setGameResult(elapsed);
    window.dispatchEvent(new CustomEvent("oddlygo:game-result", { detail: { id: "one-second", score: Math.max(0, 1000 - Math.round(Math.abs(elapsed - 1) * 1000)) } }));
    setBestTimer((current) => {
      const next = current === null || Math.abs(elapsed - 1) < Math.abs(current - 1) ? elapsed : current;
      localStorage.setItem("oddlygo-best-timer", String(next));
      return next;
    });
    setGameState("result");
  }

  function closeModal() {
    setSurprise(null);
    setGameState("idle");
    setGameResult(null);
  }

  return (
    <div className={`site-shell${altTheme && themeUnlocked ? " theme-arcade" : ""}`}>
      {showCinematicIntro && <CinematicIntro onComplete={finishCinematicIntro} />}
      <div className="announcement">
        <span className="announcement-dot" />
        YOUR DAILY DOSE OF DIGITAL CURIOSITY
        <span className="announcement-right">NO PLAN REQUIRED <span>✳</span></span>
      </div>

      <header className="topbar">
        <a className="wordmark" href="#" aria-label="OddlyGo home">
          <img className="brand-icon-image" src="/favicon.svg" alt="" aria-hidden="true" />
          <span className="wordmark-oddly">Oddly</span><span className="wordmark-go">Go</span>
        </a>
        <nav className={mobileMenu ? "main-nav open" : "main-nav"}>
          <a href="#explore" onClick={() => setMobileMenu(false)}>Explore</a>
          <a href="#originals" onClick={() => { setActiveCategory("Play"); setMobileMenu(false); }}>Mini games</a>
          <a href="#about" onClick={() => setMobileMenu(false)}>About</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button saved-trigger" onClick={() => { setShowSaved(!showSaved); setShowRecent(false); setOnlyExternal(false); setOnlyOriginals(false); setActiveCategory("All"); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }} aria-label="Show saved experiences">
            <Bookmark size={17} />
            <span>Saved</span>
            {saved.length > 0 && <b>{saved.length}</b>}
          </button>
          <button className="icon-button recent-trigger" onClick={() => { setShowRecent(!showRecent); setShowSaved(false); setOnlyOriginals(false); setOnlyExternal(false); setActiveCategory("All"); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }} aria-label="Show recently played">
            <History size={17} /><span>Recent</span>{history.length > 0 && <b>{history.length}</b>}
          </button>
          <button className="icon-button arcade-trigger" onClick={() => setShowArcade(true)} aria-label="Open Arcade Passport"><Trophy size={17} /><span>Arcade</span></button>
          <button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation">
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-star">✳</span> THE INTERNET IS YOUR PLAYGROUND</div>
            <h1>Bored?<br /><span>Go oddly.</span></h1>
            <p className="hero-description">Weird websites. Tiny games. Digital rabbit holes.<br className="desktop-break" /> One click from your next favourite distraction.</p>
            <div className="hero-actions">
              <button className={`primary-button ${isDiscovering ? "discovering" : ""}`} onClick={takeMeSomewhere} disabled={isDiscovering}>
                <Shuffle size={18} className={isDiscovering ? "shuffle-spinning" : ""} />
                {isDiscovering ? "Finding something odd..." : "Take me somewhere"}
                {!isDiscovering && <ArrowUpRight size={17} />}
              </button>
              <a className="text-link" href="#explore">I'll explore myself <ArrowDownRight size={16} /></a>
            </div>
            <div className="hero-footnote"><span className="tiny-sparkle">✦</span> {discoveryVibe === "Surprise me" ? "Free to explore. Impossible to predict." : `Your vibe: ${discoveryVibe}. No repeats if we can help it.`}</div>
          </div>
          <div className="hero-art" aria-label="OddlyGo playground illustration">
            <div className="art-glow" />
            <div className="art-grid" />
            <div className="art-orbit art-orbit-one" />
            <div className="art-orbit art-orbit-two" />
            <div className="art-planet"><span>o</span><i /></div>
            <div className="art-window window-games">
              <span className="window-dots"><i /><i /><i /></span>
              <span className="window-label">MINI GAMES</span>
              <b>PLAY</b><span className="window-symbol">↗</span>
            </div>
            <div className="art-window window-weird">
              <span className="window-label">WEIRD WEB</span>
              <b>GO ODDLY</b><span className="window-symbol">✳</span>
            </div>
            <div className="art-chip chip-top"><Sparkles size={12} /> STAY CURIOUS</div>
            <div className="art-chip chip-bottom"><span>✦</span> SOMETHING UNEXPECTED</div>
            <div className="art-star star-one">✳</div>
            <div className="art-star star-two">✦</div>
            <div className="art-cross">+</div>
            <div className="art-caption">ODDLYGO / INTERNET PLAYGROUND</div>
          </div>
          <div className="hero-index"><span>01</span><span className="index-line" /><span>DISCOVER YOUR NEXT OBSESSION</span></div>
        </section>

        <section className="category-strip" aria-label="Browse categories">
          {categories.slice(1).map(({ label, icon: Icon }) => (
            <button className={`category-pill ${activeCategory === label ? "active" : ""}`} key={label} onClick={() => { setActiveCategory(activeCategory === label ? "All" : label); setShowSaved(false); setShowRecent(false); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}>
              <Icon size={17} /> {label}<ArrowUpRight size={13} className="pill-arrow" />
            </button>
          ))}
          <button className={`category-pill originals-pill ${onlyOriginals ? "active" : ""}`} onClick={() => { setOnlyOriginals(!onlyOriginals); setOnlyExternal(false); setShowSaved(false); setShowRecent(false); setActiveCategory("All"); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }} aria-pressed={onlyOriginals}><Sparkles size={17} /> OddlyGo Originals <ArrowUpRight size={13} className="pill-arrow" /></button>
          <div className="vibe-picker" aria-label="Choose a discovery vibe">
            <span className="vibe-label">PICK A VIBE</span>
            {discoveryVibes.map(({ label, hint }) => (
              <button key={label} title={hint} className={`vibe-chip ${discoveryVibe === label ? "active" : ""}`} onClick={() => setDiscoveryVibe(label)} aria-pressed={discoveryVibe === label}>{label}</button>
            ))}
          </div>
        </section>

        {history.length > 0 && (
          <section className="continue-section">
            <div className="section-heading">
              <div><div className="section-kicker">BACK FOR ANOTHER DETOUR?</div><h2>Pick up where you <em>left off.</em></h2></div>
              <button className="view-all" onClick={() => { setShowRecent(true); setShowSaved(false); setOnlyOriginals(false); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}>View recent <ArrowRight size={16} /></button>
            </div>
            <div className="featured-grid continue-grid">
              {history.slice(0, 3).map((id) => experiences.find((item) => item.id === id)).filter((item): item is Experience => Boolean(item)).map((item, index) => (
                <ExperienceCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={saveExperience} onOpen={openExperience} index={index} />
              ))}
            </div>
          </section>
        )}

        <section className="featured-section" id="originals">
          <div className="section-heading">
            <div>
              <div className="section-kicker">HAND-PICKED FOR YOUR ATTENTION SPAN</div>
              <h2>Worth the <em>detour.</em></h2>
            </div>
            <a href="#explore" className="view-all">Explore everything <ArrowRight size={16} /></a>
          </div>
          <div className="featured-grid">
            {experiences.filter((item) => item.featured).map((item, index) => (
              <ExperienceCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={saveExperience} onOpen={openExperience} index={index} />
            ))}
          </div>
        </section>

        <section className="explore-section" id="explore">
          <div className="section-heading explore-heading">
            <div>
              <div className="section-kicker">{showSaved ? "YOUR LITTLE COLLECTION" : showRecent ? "PICK UP WHERE YOU LEFT OFF" : onlyOriginals ? "BUILT INSIDE ODDLYGO" : onlyExternal ? "THE WIDER WEB" : "THE GOOD STUFF LIVES HERE"}</div>
              <h2>{showSaved ? <>Your <em>saved finds.</em></> : showRecent ? <>Recently <em>explored.</em></> : onlyOriginals ? <>Made here. <em>OddlyGo Originals.</em></> : onlyExternal ? <>Finds from <em>the wider web.</em></> : <>Enter the <em>rabbit hole.</em></>}</h2>
            </div>
            <div className="explore-count">{filtered.length.toString().padStart(2, "0")} FINDS</div>
          </div>
          <div className="explore-controls">
            <div className="filter-tabs">
              {categories.map(({ label }) => (
                <button key={label} className={activeCategory === label && !onlyOriginals && !onlyExternal ? "filter-tab active" : "filter-tab"} onClick={() => { setActiveCategory(label); setShowSaved(false); setShowRecent(false); setOnlyOriginals(false); setOnlyExternal(false); }}>{label}</button>
              ))}
              <button className={`filter-tab originals-filter ${onlyOriginals ? "active" : ""}`} onClick={() => { setOnlyOriginals(!onlyOriginals); setOnlyExternal(false); setActiveCategory("All"); setShowSaved(false); setShowRecent(false); }}><Sparkles size={13} /> Originals</button>
              <button className={`filter-tab external-filter ${onlyExternal ? "active" : ""}`} onClick={() => { setOnlyExternal(!onlyExternal); setOnlyOriginals(false); setActiveCategory("All"); setShowSaved(false); setShowRecent(false); }}><Globe2 size={13} /> Web finds</button>
            </div>
            <div className="explore-extra-controls">
              <button className={`quick-filter ${quickOnly ? "active" : ""}`} onClick={() => setQuickOnly(!quickOnly)} aria-pressed={quickOnly}><Zap size={13} /> Under 1 min</button>
              <label className="sort-select-label"><span>Sort</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} aria-label="Sort experiences"><option value="recommended">Recommended</option><option value="newest">Recently added</option><option value="shortest">Shortest first</option><option value="az">A–Z</option></select></label>
            </div>
            <label className="search-box">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find your next distraction..." />
              {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}
              <kbd>⌘ K</kbd>
            </label>
          </div>
          {(showSaved || showRecent || onlyOriginals || onlyExternal) && <div className="saved-notice">{showSaved ? <Bookmark size={14} /> : showRecent ? <History size={14} /> : onlyOriginals ? <Sparkles size={14} /> : <Globe2 size={14} />} {showSaved ? "Showing your saved discoveries" : showRecent ? "Your latest 20 opened experiences, newest first" : onlyOriginals ? "Only games and experiments made for OddlyGo" : "External websites and internet discoveries"} <button onClick={() => { setShowSaved(false); setShowRecent(false); setOnlyOriginals(false); setOnlyExternal(false); }}>Show all instead</button></div>}
          <div className="experience-grid">
            {filtered.map((item, index) => (
              <ExperienceCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={saveExperience} onOpen={openExperience} index={index} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
              <span>◌</span>
              <h3>{showSaved ? "Your collection is waiting." : showRecent ? "Your next rabbit hole awaits." : "Nothing odd here. Yet."}</h3>
              <p>{showSaved ? "Save a discovery with the bookmark icon and it will live here." : showRecent ? "Open any experience and it will show up here for next time." : "Try another search or explore all discoveries."}</p>
              <button className="secondary-button" onClick={() => { setQuery(""); setActiveCategory("All"); setShowSaved(false); setShowRecent(false); setOnlyOriginals(false); setOnlyExternal(false); setQuickOnly(false); setSortBy("recommended"); }}>Reset filters</button>
            </div>
          )}
        </section>

        <section className="daily-banner">
          <div className="daily-icon"><Sparkles size={25} /></div>
          <div className="daily-copy">
            <span className="section-kicker">A LITTLE EXPERIMENT, RIGHT NOW</span>
            <h2>Got one second?</h2>
            <p>Stop the timer at exactly 1.00 seconds. Sounds easy. It isn't.</p>
          </div>
          <button className="dark-button" onClick={() => openExperience(experiences.find((item) => item.id === "one-second")!)}>Take the challenge <ArrowUpRight size={16} /></button>
          <span className="banner-decoration">1.00</span>
        </section>

        <section className="about-section" id="about">
          <div className="about-mark"><Orbit size={27} /></div>
          <div>
            <div className="section-kicker">A SMALL CORNER OF A VERY BIG INTERNET</div>
            <h2>The internet is still <em>a weird place.</em></h2>
            <p>OddlyGo is an independent internet playground for tiny games, curious experiments, and unexpected discoveries. Some things are built here; others are found out in the wild. The idea is simple: make the internet feel a little more surprising again.</p>
            <div className="about-details">
              <span><b>01</b> Original mini-games</span>
              <span><b>02</b> Strange internet finds</span>
              <span><b>03</b> Creative experiments</span>
            </div>
            <p className="creator-note">A personal project by <strong>Akash Kukreti</strong> — built while learning, experimenting, and following curious ideas.</p>
          </div>
          <button className="about-button" onClick={takeMeSomewhere}>Find me something odd <ArrowUpRight size={16} /></button>
        </section>
      </main>

      <footer className="footer">
        <a className="wordmark footer-wordmark" href="#"><span className="brand-icon"><Orbit size={18} /></span> oddly<span>go</span><i>.</i></a>
        <div className="footer-made"><span>MADE FOR THE CURIOUS <b>✳</b></span><small>Made with curiosity by <strong>Akash Kukreti</strong>.</small></div>
        <span className="footer-tagline">TAKE THE SCENIC ROUTE THROUGH THE INTERNET.</span>
      </footer>

      {showArcade && (
        <div className="modal-backdrop arcade-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowArcade(false); }}>
          <section className="arcade-modal" role="dialog" aria-modal="true" aria-labelledby="arcade-title">
            <button className="modal-close" onClick={() => setShowArcade(false)} aria-label="Close Arcade Passport"><X size={20} /></button>
            <div className="arcade-kicker"><Trophy size={15} /> YOUR ODDLYGO ARCADE PASSPORT</div>
            <h2 id="arcade-title">Little wins. <em>Big curiosity.</em></h2>
            <p className="arcade-intro">Your progress lives on this device. Explore, collect, and come back for a fresh daily pick.</p>
            <div className="arcade-stats">
              <div><strong>{uniqueOpened}</strong><span>Recent finds</span></div>
              <div><strong>{saved.length}</strong><span>Saved finds</span></div>
              <div><strong>{achievementList.filter((item) => item.unlocked).length}/{achievementList.length}</strong><span>Badges earned</span></div>
            </div>
            <div className="arcade-stats arcade-extra-stats"><div><strong>{completedCount}</strong><span>Games won</span></div><div><strong>{streak}🔥</strong><span>Daily win streak</span></div><div><strong>{Object.keys(gameBests).length}</strong><span>Personal records</span></div></div>
            <div className="xp-panel"><div className="xp-topline"><div><span className="daily-label">ARCADE XP</span><strong>{xp.toLocaleString()} XP</strong></div><div className="xp-level"><Medal size={18}/><span>LEVEL {Math.floor(xp / 250) + 1}</span></div></div><div className="xp-track"><span style={{ width: `${(xp % 250) / 2.5}%` }}/></div><div className="xp-foot"><span>{xp % 250}/250 XP to next level</span><span><Zap size={13}/> {combo} win combo</span></div></div>
            <div className="missions-panel"><div className="missions-title"><h3><Target size={17}/> Daily missions</h3><span>Resets daily</span></div>{dailyMissions.map((mission) => { const done = mission.progress >= mission.goal; return <div className={`mission-row ${done ? "mission-done" : ""}`} key={mission.title}><div className="mission-mark">{done ? <Check size={14}/> : <span>○</span>}</div><div className="mission-main"><strong>{mission.title}</strong><span>{mission.detail}</span><div className="mission-progress"><span style={{width:`${mission.progress / mission.goal * 100}%`}}/></div></div><div className="mission-reward">+{mission.reward} XP</div></div>; })}<p className="mission-note">Mission progress is tracked from actual game wins and today's experience visits.</p></div>
            <div className="sound-setting"><div><strong>Arcade sounds</strong><span>Soft two-note celebration on a win</span></div><button onClick={() => { const next = !soundEnabled; setSoundEnabled(next); localStorage.setItem("oddlygo-sound", String(next)); }} aria-pressed={soundEnabled}>{soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>} {soundEnabled ? "On" : "Off"}</button></div>
            <div className="arcade-records"><h3>Personal bests</h3>{Object.keys(gameBests).length ? Object.entries(gameBests).map(([id, score]) => <div key={id}><span>{experiences.find((item) => item.id === id)?.title ?? id} · high score</span><strong>{score}</strong></div>) : <p>Win an original game to start building your records.</p>}{prismFewest !== null && <div><span>Prism Shift · fewest rotations</span><strong>{prismFewest}</strong></div>}</div>
            <div className="arcade-theme"><div><strong>Arcade Afterglow</strong><p>{themeUnlocked ? "Unlocked! Earned through 3 different original game wins or 500 Arcade XP." : `Win ${Math.max(0, 3-completedCount)} more different original game(s), or reach 500 XP, to unlock this theme.`}</p></div><button disabled={!themeUnlocked} onClick={() => { const next = !altTheme; setAltTheme(next); localStorage.setItem("oddlygo-alt-theme", String(next)); }}>{altTheme ? "Theme on ✓" : themeUnlocked ? "Use theme" : "Locked 🔒"}</button></div>
            <div className="daily-challenge-card">
              <div className="daily-icon"><CalendarDays size={22} /></div>
              <div className="daily-copy"><span className="daily-label">TODAY'S DAILY PICK</span><h3>{dailyExperience.title}</h3><p>{dailyExperience.description}</p><small><Flame size={13} /> {dailyCompleted ? "Challenge completed — nice work!" : "Win today's featured game to complete it"}</small></div>
              <button className="primary-button daily-play" onClick={startDailyChallenge}>{dailyCompleted ? "Play again" : "Start challenge"} <ArrowRight size={15} /></button>
            </div>
            <div className="daily-prism-card">
              <div className="daily-prism-icon">✦</div>
              <div className="daily-copy"><span className="daily-label">DAILY PUZZLE · {todayKey}</span><h3>Prism Shift: one puzzle, one day</h3><p>Everyone using the same date gets the same generated mirror layout on this device. Solve it in as few rotations as possible.</p><small><Target size={13} /> {dailyWins.includes(todayKey) ? "Today's daily challenge is complete." : "A fresh seeded puzzle each local day."}</small></div>
              <button className="primary-button daily-play" onClick={startDailyPrismPuzzle}>Play daily puzzle <ArrowRight size={15} /></button>
            </div>
            <div className="achievement-heading"><h3><Star size={17} /> Achievements</h3><span>{achievementList.filter((item) => item.unlocked).length} unlocked</span></div>
            <div className="achievement-grid">
              {achievementList.map((item) => <div className={`achievement-card ${item.unlocked ? "unlocked" : "locked"}`} key={item.title}><div className="achievement-icon">{item.unlocked ? item.icon : "?"}</div><div className="achievement-main"><strong>{item.title}</strong><p>{item.description}</p><div className="achievement-progress"><span style={{ width: `${Math.min(100, item.progress / item.goal * 100)}%` }} /></div><small>{item.unlocked ? "Requirement complete" : `${item.progress.toLocaleString()} / ${item.goal.toLocaleString()}`}</small></div><span className="achievement-status">{item.unlocked ? "UNLOCKED" : "LOCKED"}</span></div>)}
            </div>
            <p className="arcade-footnote">Wins, XP, mission rewards, records, achievements and daily streaks are saved locally in this browser. Daily picks use your local date.</p>
          </section>
        </div>
      )}

      {surprise && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className="experience-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="modal-close" onClick={closeModal} aria-label="Close"><X size={20} /></button>
            <div className={`modal-art art-${surprise.color}`}><span>{surprise.symbol}</span><div className="modal-art-label">ODDLYGO PICK № {String(experiences.findIndex((item) => item.id === surprise.id) + 1).padStart(3, "0")}</div></div>
            <div className="modal-content">
              <div className="modal-meta"><span>{surprise.category}</span><span>·</span><span>{surprise.time}</span><span>·</span><span>{surprise.kind === "internal" ? "ODDLYGO ORIGINAL" : "FOUND ON THE WEB"}</span></div>
              <h2 id="modal-title">{surprise.title}</h2>
              <p>{surprise.description}</p>
              {surprise.kind === "external" && <div className="external-note"><ExternalLink size={14} /> Opens in a new tab, so OddlyGo stays right here.</div>}
              {surprise.id === "one-second" ? (
                <div className="timer-game">
                  <div className="timer-readout">{gameResult === null ? (gameState === "running" ? ((clock - gameStart) / 1000).toFixed(2) : "0.00") : gameResult.toFixed(2)}<span>s</span></div>
                  {gameState === "idle" && <><button className="primary-button" onClick={startTimer}>Start timer <ArrowRight size={16} /></button>{bestTimer !== null && <p className="timer-best">YOUR BEST: {bestTimer.toFixed(3)}s · DISTANCE {Math.abs(bestTimer - 1).toFixed(3)}s FROM TARGET</p>}</>}
                  {gameState === "running" && <button className="primary-button stop-button" onClick={stopTimer}>STOP!</button>}
                  {gameState === "result" && <><p className="timer-feedback">{Math.abs((gameResult ?? 0) - 1) < 0.05 ? "Unreasonably good timing. ✨" : `You were ${Math.abs((gameResult ?? 0) - 1).toFixed(2)}s ${((gameResult ?? 0) < 1) ? "too early" : "too late"}.`}</p>{bestTimer !== null && <p className="timer-best">BEST DISTANCE FROM 1.00s: {Math.abs(bestTimer - 1).toFixed(3)}s</p>}<button className="primary-button" onClick={startTimer}>Try again <ArrowRight size={16} /></button></>}
                </div>
              ) : surprise.id === "infinite-canvas" ? (
                <ParticleToy />
              ) : surprise.id === "wrong-answers" ? (
                <WrongAnswers />
              ) : surprise.id === "shape-lab" ? (
                <ShapeLab />
              ) : surprise.id === "odd-one-out" ? (
                <OddOneOut />
              ) : surprise.id === "green-light" ? (
                <GreenLight />
              ) : surprise.id === "maze-mind" ? (
                <MazeMind />
              ) : surprise.id === "prism-shift" ? (
                <PrismShift />
              ) : surprise.id === "memory-matrix" ? (
                <MemoryMatrix />
              ) : surprise.id === "word-scramble" ? (
                <WordScramble />
              ) : surprise.id === "orbit-dodge" ? (
                <OrbitDodge />
              ) : surprise.kind === "external" && surprise.url ? (
                <a className="primary-button modal-launch" href={surprise.url} target="_blank" rel="noopener noreferrer" onClick={() => recordVisit(surprise)}>Open experience <ExternalLink size={16} /></a>
              ) : (
                <p className="coming-soon">This OddlyGo original is in the workshop. More oddness coming soon.</p>
              )}
              <div className="modal-bottom">
                <button className="save-modal" onClick={() => saveExperience(surprise.id)}>{saved.includes(surprise.id) ? <Check size={15} /> : <Bookmark size={15} />}{saved.includes(surprise.id) ? "Saved" : "Save for later"}</button>
                <button className="another-modal" onClick={takeMeSomewhere}><Shuffle size={15} /> Another surprise</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function ExperienceCard({ item, saved, onSave, onOpen, index }: {
  item: Experience;
  saved: boolean;
  onSave: (id: string) => void;
  onOpen: (item: Experience) => void;
  index: number;
}) {
  return (
    <article className={`experience-card card-${item.color}`} style={{ animationDelay: `${index * 55}ms` }}>
      <button className="card-art-button" onClick={() => onOpen(item)} aria-label={`Open ${item.title}`}>
        <div className={`card-art art-${item.color}`}>
          <span className="card-symbol">{item.symbol}</span>
          <span className="card-art-label">{item.kind === "internal" ? "ODDLYGO ORIGINAL" : "FOUND ON THE WEB"}</span>
          <span className="card-art-index">№ {String(experiences.findIndex((entry) => entry.id === item.id) + 1).padStart(2, "0")}</span>
          {item.category === "Experiment" && <div className="mini-orbit" />}
          {item.category === "Play" && <span className="mini-star">✳</span>}
        </div>
      </button>
      <div className="card-content">
        <div className="card-meta"><span>{item.category}</span><span>·</span><span>{item.time}</span></div>
        <div className="card-title-row">
          <button className="card-title" onClick={() => onOpen(item)}>{item.title}</button>
          <button className={`save-button ${saved ? "saved" : ""}`} onClick={() => onSave(item.id)} aria-label={saved ? "Remove saved item" : "Save item"}>{saved ? <Check size={16} /> : <Bookmark size={16} />}</button>
        </div>
        <p>{item.description}</p>
        <button className="card-open" onClick={() => onOpen(item)}>
          {item.kind === "internal" ? "Try it out" : "Visit website"}
          {item.kind === "external" ? <ExternalLink size={14} /> : <ArrowRight size={15} />}
        </button>
      </div>
    </article>
  );
}

function ParticleToy() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number>(0);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; r: number; phase: number; cluster: number }>>([]);
  const pointerRef = useRef({ x: -1000, y: -1000, active: false });
  const ripplesRef = useRef<Array<{ x: number; y: number; radius: number; alpha: number }>>([]);
  const count = 180;
  const [gravity, setGravity] = useState(0.42);
  const [chaos, setChaos] = useState(0.48);
  const [hue, setHue] = useState(76);
  const [isPlaying, setIsPlaying] = useState(true);
  const [universe, setUniverse] = useState(1);
  const palettes = [
    { name: "Lime", hue: 76 }, { name: "Violet", hue: 265 },
    { name: "Cyan", hue: 188 }, { name: "Rose", hue: 335 }, { name: "Orange", hue: 24 },
  ];

  function seedParticles(width: number, height: number, amount: number) {
    // Four drifting seed regions create an organic universe without one diagonal chain.
    const centers = Array.from({ length: 4 }, (_, i) => ({
      x: width * (0.18 + (i % 2) * 0.64) + (Math.random() - 0.5) * width * 0.12,
      y: height * (0.22 + Math.floor(i / 2) * 0.56) + (Math.random() - 0.5) * height * 0.12,
    }));
    particlesRef.current = Array.from({ length: amount }, (_, i) => {
      const cluster = i % centers.length;
      const center = centers[cluster];
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * Math.min(width, height) * 0.145;
      return {
        x: Math.max(8, Math.min(width - 8, center.x + Math.cos(angle) * radius)),
        y: Math.max(8, Math.min(height - 8, center.y + Math.sin(angle) * radius * 0.8)),
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.8 + 1,
        phase: Math.random() * Math.PI * 2 + i,
        cluster,
      };
    });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles(rect.width, rect.height, count);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    let last = 0;
    const draw = (time: number) => {
      frameRef.current = requestAnimationFrame(draw);
      const rect = wrap.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      if (!isPlaying) {
        if (last === 0) last = time;
        ctx.fillStyle = "rgba(13, 17, 14, 0.22)";
        ctx.fillRect(0, 0, w, h);
        return;
      }
      last = time;
      ctx.clearRect(0, 0, w, h);
      const gradient = ctx.createRadialGradient(w * 0.5, h * 0.5, 5, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
      gradient.addColorStop(0, "#172018");
      gradient.addColorStop(1, "#0b0e0c");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      const ps = particlesRef.current;
      const cx = w * 0.5, cy = h * 0.5;
      const pointer = pointerRef.current;
      ps.forEach((p, i) => {
        // Each cluster has its own gently orbiting anchor; a very soft core pull
        // keeps the overall composition balanced without drawing everything into a line.
        const clusterAngle = time * (0.00012 + gravity * 0.00008) + p.cluster * Math.PI * 0.5;
        const anchorX = cx + Math.cos(clusterAngle) * w * 0.22;
        const anchorY = cy + Math.sin(clusterAngle * 0.83) * h * 0.22;
        const ax = anchorX - p.x, ay = anchorY - p.y;
        p.vx += ax * (0.000065 + gravity * 0.000035);
        p.vy += ay * (0.000065 + gravity * 0.000035);
        const dx = cx - p.x, dy = cy - p.y;
        const distanceFromCore = Math.max(1, Math.hypot(dx, dy));
        p.vx += dx * gravity * 0.000004;
        p.vy += dy * gravity * 0.000004;
        // Tangential flow and slow noise create movement without runaway streaks.
        const swirl = 0.00012 + gravity * 0.00006;
        p.vx += (-dy / distanceFromCore) * swirl * 0.16;
        p.vy += (dx / distanceFromCore) * swirl * 0.16;
        p.vx += Math.cos(time * 0.00042 + p.phase) * chaos * 0.008;
        p.vy += Math.sin(time * 0.00048 + p.phase * 1.13) * chaos * 0.008;
        if (pointer.active) {
          const px = p.x - pointer.x, py = p.y - pointer.y;
          const distance = Math.max(25, Math.sqrt(px * px + py * py));
          if (distance < 145) {
            const force = (1 - distance / 145) * (0.045 + chaos * 0.045);
            p.vx += (px / distance) * force;
            p.vy += (py / distance) * force;
          }
        }
        // Click ripples physically nudge nearby particles outward as the wave passes.
        ripplesRef.current.forEach((r) => {
          const rx = p.x - r.x, ry = p.y - r.y;
          const rd = Math.max(1, Math.hypot(rx, ry));
          const waveDistance = Math.abs(rd - r.radius);
          if (waveDistance < 15) {
            const impulse = (1 - waveDistance / 15) * r.alpha * 0.24;
            p.vx += (rx / rd) * impulse;
            p.vy += (ry / rd) * impulse;
          }
        });
        p.vx *= 0.996;
        p.vy *= 0.996;
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 1.7) {
          p.vx = (p.vx / speed) * 1.7;
          p.vy = (p.vy / speed) * 1.7;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(2, Math.min(w - 2, p.x));
        p.y = Math.max(2, Math.min(h - 2, p.y));

        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j];
          const lx = q.x - p.x, ly = q.y - p.y;
          const d = Math.sqrt(lx * lx + ly * ly);
          if (d < 82 && p.cluster === q.cluster) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `hsla(${hue + (i % 25)}, 95%, 68%, ${(1 - d / 82) * 0.28})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      // A handful of faint bridges make the clusters feel like one universe,
      // while keeping most links local and avoiding a single web-like diagonal.
      for (let i = 0; i < ps.length; i += 7) {
        const p = ps[i];
        let nearest: typeof p | null = null;
        let nearestDistance = Infinity;
        for (let j = 0; j < ps.length; j++) {
          if (ps[j].cluster === p.cluster) continue;
          const d = Math.hypot(ps[j].x - p.x, ps[j].y - p.y);
          if (d < nearestDistance) { nearestDistance = d; nearest = ps[j]; }
        }
        if (nearest && nearestDistance < Math.min(w, h) * 0.24) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nearest.x, nearest.y);
          ctx.strokeStyle = `hsla(${hue}, 80%, 68%, ${0.07 * (1 - nearestDistance / (Math.min(w, h) * 0.24))})`;
          ctx.lineWidth = 0.55; ctx.stroke();
        }
      }

      // Soft central attractor.
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 72);
      core.addColorStop(0, `hsla(${hue}, 100%, 65%, .20)`);
      core.addColorStop(1, `hsla(${hue}, 100%, 65%, 0)`);
      ctx.fillStyle = core;
      ctx.fillRect(cx - 72, cy - 72, 144, 144);
      ctx.beginPath();
      ctx.arc(cx, cy, 20 + Math.sin(time * 0.0012) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue}, 100%, 70%, .95)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${hue}, 100%, 72%)`;
      ctx.shadowBlur = 18;
      ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
      ctx.fill();
      ctx.shadowBlur = 0;

      ps.forEach((p, i) => {
        const twinkle = 0.65 + (Math.sin(time * 0.002 + p.phase) + 1) * 0.17;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (i % 13 === 0 ? 1.7 : 1), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue + (i % 30) * 1.5}, 100%, ${65 + (i % 4) * 5}%, ${twinkle})`;
        ctx.shadowBlur = i % 7 === 0 ? 12 : 5;
        ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      ripplesRef.current = ripplesRef.current.filter((r) => r.alpha > 0.02);
      ripplesRef.current.forEach((r) => {
        r.radius += 1.65;
        r.alpha *= 0.984;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue}, 100%, 72%, ${r.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
    };
  }, [count, gravity, chaos, hue, isPlaying, universe]);

  function handlePointer(event: import('react').PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    };
  }

  function ripple(event: import('react').PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    ripplesRef.current.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, radius: 4, alpha: 0.85 });
    pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
  }

  function newUniverse() {
    setUniverse((v) => v + 1);
    if (wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      seedParticles(rect.width, rect.height, count);
    }
    ripplesRef.current = [];
    pointerRef.current.active = false;
  }

  function saveImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `oddlyverse-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function toggleFullscreen() {
    const target = wrapRef.current;
    if (!target) return;
    try {
      if (!document.fullscreenElement) await target.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      // Fullscreen can be blocked by browser settings; the canvas remains usable.
    }
  }

  return (
    <div className="oddlyverse">
      <div className="verse-heading">
        <div><span className="eyebrow">ODDLYGO ORIGINAL / INTERACTIVE TOY</span><h3>OddlyVerse <em>— Infinite Canvas</em></h3></div>
        <p>A living canvas of moving particles.<br />Create, explore, and lose track of time.</p>
      </div>
      <div className="verse-stage" ref={wrapRef}>
        <div className="verse-stage-top"><span><i /> ODDLYVERSE / LIVE UNIVERSE</span><span>{count} NODES · DYNAMIC FIELD</span></div>
        <canvas
          ref={canvasRef}
          className="verse-canvas"
          onPointerMove={handlePointer}
          onPointerDown={ripple}
          onPointerLeave={() => { pointerRef.current.active = false; }}
          aria-label="Interactive generative particle universe. Move the pointer to bend the field and click to create a ripple."
        />
        <span className="verse-hint">↗ MOVE TO BEND THE FIELD · CLICK TO CREATE A RIPPLE</span>
        <button className="verse-fullscreen" onClick={toggleFullscreen} aria-label="Toggle fullscreen"><Maximize2 size={16} /></button>
      </div>
      <div className="verse-controls">
        <label className="verse-slider"><span>Gravity</span><input type="range" min="0" max="1" step=".01" value={gravity} onChange={(e) => setGravity(Number(e.target.value))} /><b>{gravity.toFixed(2)}</b></label>
        <label className="verse-slider"><span>Chaos</span><input type="range" min="0" max="1" step=".01" value={chaos} onChange={(e) => setChaos(Number(e.target.value))} /><b>{chaos.toFixed(2)}</b></label>
        <div className="verse-colours"><span>Colour</span><div>{palettes.map((p) => <button key={p.name} title={p.name} aria-label={`${p.name} palette`} className={hue === p.hue ? "active" : ""} style={{ background: `hsl(${p.hue}, 95%, 62%)` }} onClick={() => setHue(p.hue)} />)}</div></div>
        <div className="verse-actions">
          <button className="verse-pause" onClick={() => setIsPlaying((v) => !v)}>{isPlaying ? <Pause size={15} /> : <Play size={15} />}{isPlaying ? "Pause" : "Resume"}</button>
          <button onClick={newUniverse}><RefreshCw size={15} /> New universe</button>
          <button className="verse-save" onClick={saveImage}><Download size={15} /> Save image</button>
        </div>
      </div>
    </div>
  );
}

function WrongAnswers() {
  // A shuffled question deck prevents repeats until the whole bank has been played.
  const questions = [
    { q: "What is the moon made of?", answers: ["Extremely old cheese", "A sleeping dragon", "The world's biggest night-light"] },
    { q: "Why do cats knock things off tables?", answers: ["Gravity needed a reminder", "Tiny chaos experiments", "They are testing your reflexes"] },
    { q: "What is a cloud?", answers: ["Sky cotton", "A sheep that learned to float", "The internet's bathwater"] },
    { q: "Where does lost time go?", answers: ["A secret drawer in the universe", "Behind the fridge", "A meeting that could have been an email"] },
    { q: "What do plants think about?", answers: ["Their next leaf", "Why humans walk so slowly", "Photosynthesis: the remix"] },
    { q: "What is the purpose of a sock?", answers: ["A tiny foot sleeping bag", "A portable sweater for toes", "A shoe's best friend"] },
    { q: "Why is the ocean salty?", answers: ["The land keeps telling it sad stories", "Mermaids season it", "The sea has excellent taste"] },
    { q: "What powers the internet?", answers: ["Hamsters on tiny treadmills", "A million invisible raccoons", "One very determined potato"] },
    { q: "Why do we have eyebrows?", answers: ["Face caterpillars", "To keep thoughts from escaping", "Tiny roof gutters for feelings"] },
    { q: "What happens when you sneeze?", answers: ["Your brain takes a screenshot", "Your soul briefly logs out", "A tiny dragon clears its throat"] },
    { q: "Why is the sky blue?", answers: ["The ocean got promoted", "The universe picked a favourite colour", "A giant blueberry exploded"] },
    { q: "What is a keyboard for?", answers: ["Piano for very small musicians", "Summoning typos", "Teaching fingers to tap dance"] },
    { q: "Why do dogs tilt their heads?", answers: ["Recalibrating their ears", "Loading a treat-related thought", "Trying to hear in italics"] },
    { q: "What is inside a black hole?", answers: ["Every missing sock", "A very dark waiting room", "The universe's junk drawer"] },
    { q: "Why do we dream?", answers: ["The brain's midnight cinema", "Free trial of another life", "A screensaver for your imagination"] },
    { q: "What is Wi-Fi made of?", answers: ["Invisible spaghetti", "Air with a password", "Tiny radio fairies"] },
    { q: "Why do bananas curve?", answers: ["They are shy", "They are trying to wave", "Straight bananas were discontinued"] },
    { q: "What is a calendar?", answers: ["A spreadsheet for the sun", "A countdown to snacks", "Time's colouring book"] },
    { q: "Why do pigeons walk like that?", answers: ["They are always late", "Their legs are buffering", "They are practising runway walks"] },
    { q: "What is dust?", answers: ["Tiny retired rocks", "Old sunlight", "Furniture confetti"] },
    { q: "Why does toast land butter-side down?", answers: ["The floor has a favourite side", "Gravity enjoys breakfast", "Toast is naturally dramatic"] },
    { q: "What is a mirror?", answers: ["A window for your twin", "A selfie machine from the past", "Glass with confidence"] },
    { q: "Why do onions make us cry?", answers: ["They know too much", "They are tiny drama coaches", "They are cutting themselves emotionally"] },
    { q: "What is a password?", answers: ["A secret handshake for computers", "A word that forgot its own name", "A tiny digital bouncer"] },
    { q: "Where do deleted files go?", answers: ["A digital retirement village", "A cloud-shaped lost property office", "To haunt the recycle bin"] },
    { q: "Why are flamingos pink?", answers: ["They blush professionally", "They eat strawberry clouds", "They were born in sunset mode"] },
    { q: "What is the sun doing at night?", answers: ["Working the night shift elsewhere", "Charging its batteries", "Hiding from the moon"] },
    { q: "Why do elevators have mirrors?", answers: ["To keep your clone company", "To make the ride feel longer", "So the buttons have an audience"] },
    { q: "What is a hiccup?", answers: ["A tiny internal frog", "Your diaphragm telling a joke", "A surprise punctuation mark"] },
    { q: "Why do keyboards have a space bar?", answers: ["For astronauts", "To let words breathe", "A tiny pub for letters"] },
    { q: "What do ants do on weekends?", answers: ["Move a crumb to the beach", "Build miniature shopping malls", "Take very tiny holidays"] },
    { q: "Why does time fly when you're having fun?", answers: ["Time has a tiny jetpack", "Fun secretly speeds up clocks", "Boredom is holding the other end"] },
    { q: "What is the purpose of a belly button?", answers: ["A retired loading port", "A pocket for invisible coins", "The body's tiny pause button"] },
    { q: "Why do stars twinkle?", answers: ["They are nervous performers", "The sky is blinking", "Space has a loose connection"] },
    { q: "What is a refrigerator doing?", answers: ["Keeping snacks in witness protection", "Practising winter indoors", "Running a cold storage podcast"] },
    { q: "Why do we call it a building if it is already built?", answers: ["English is still under construction", "The building is emotionally growing", "Grammar took the day off"] },
    { q: "What do fish drink?", answers: ["Fancy water", "Ocean-flavoured tea", "Whatever the sea is serving"] },
    { q: "Why are traffic lights red, yellow, and green?", answers: ["The road's favourite board game", "Stop, think, and go vibes", "A traffic rainbow with authority"] },
    { q: "What is a shadow?", answers: ["Your outline's clingy friend", "A person made of absence", "The sun's photocopy"] },
    { q: "Why do we have five fingers?", answers: ["The hand subscription includes five", "Four was too confusing", "For maximum high-fives"] },
    { q: "What is the smell after rain?", answers: ["Earth's fresh laundry", "Clouds taking a shower", "The planet opening a window"] },
    { q: "Why do computers need updates?", answers: ["They are growing their digital hair", "The bugs need new homes", "The computer wants a new outfit"] },
    { q: "What is a black cat thinking?", answers: ["Excellent camouflage, excellent plans", "I own this hallway", "Humans are oddly shaped furniture"] },
    { q: "Why do bubbles pop?", answers: ["They remembered an appointment", "They are allergic to being round", "Their dreams were too big"] },
    { q: "What is a traffic jam?", answers: ["Cars having a group hug", "A very slow parade", "Road spaghetti"] },
    { q: "Why do we say 'sleep like a log'?", answers: ["Logs are excellent sleepers", "Beds were invented by trees", "Logs never check their phones"] },
    { q: "What is a library?", answers: ["A gym for your imagination", "A quiet book airport", "A house where paper whispers"] },
    { q: "Why do clocks tick?", answers: ["They are counting tiny chickens", "Time has impatient shoes", "A very small woodpecker lives inside"] },
    { q: "What do penguins wear to formal events?", answers: ["Their everyday tuxedos", "A bow tie made of fish", "Very serious snow shoes"] },
    { q: "Why is pizza round in a square box?", answers: ["Geometry likes plot twists", "The box is shy about circles", "Triangles were unavailable"] },
    { q: "What is a password hint?", answers: ["A riddle written by your past self", "A note from a forgetful wizard", "A tiny clue with big responsibility"] },
    { q: "Why do people clap?", answers: ["Hands are giving each other high-fives", "To scare the silence away", "The audience is trying to start a fire"] },
    { q: "What is a weekend?", answers: ["Two days of pretending Monday is far away", "A short vacation from calendars", "Time wearing comfy trousers"] },
    { q: "Why do we park in a driveway and drive on a parkway?", answers: ["Words enjoy confusing visitors", "The dictionary is pranking us", "Road names were picked from a hat"] },
    { q: "What is a sneeze's biggest dream?", answers: ["A standing ovation", "A tissue sponsorship", "To surprise everyone in the room"] },
    { q: "Why do stars come out at night?", answers: ["They have day jobs elsewhere", "Space turns on its fairy lights", "The universe hosts an evening show"] },
    { q: "What is a tiny spoon for?", answers: ["Very small soup emergencies", "Dessert with dramatic pacing", "Measuring a dragon's tea"] },
    { q: "Why does the fridge hum?", answers: ["It knows all the cool songs", "It is keeping the milk entertained", "It is humming to avoid food waste"] },
    { q: "What is a map?", answers: ["A treasure hunt with fewer pirates", "Paper pretending to know the way", "A bird's-eye view without the bird"] },
    { q: "Why do socks disappear in the wash?", answers: ["They join a secret sock society", "The washing machine collects souvenirs", "One sock always chooses adventure"] },
    { q: "What is the moon doing during the day?", answers: ["Working remotely", "Waiting for its spotlight", "Taking a very long coffee break"] },
    { q: "Why do we have knees?", answers: ["Leg hinges for advanced walking", "To make trousers more interesting", "Built-in crouch buttons"] },
    { q: "What is a browser tab?", answers: ["A tiny window with commitment issues", "A digital sticky note", "A portal you forgot to close"] },
    { q: "Why do leaves fall in autumn?", answers: ["Trees are decluttering", "Leaves are chasing the wind", "The branches said it is time to move out"] },
  ];
  const shuffle = (excludeFirst = -1) => {
    const deck = questions.map((_, i) => i);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    if (deck.length > 1 && deck[0] === excludeFirst) [deck[0], deck[1]] = [deck[1], deck[0]];
    return deck;
  };
  const [deck, setDeck] = useState<number[]>(() => shuffle());
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    try { return Number(localStorage.getItem("oddlygo-wrong-answers-best-streak") || 0); } catch { return 0; }
  });
  const [finished, setFinished] = useState(false);
  const question = questions[deck[index]];

  function choose(option: string) {
    if (answer !== null || finished) return;
    setAnswer(option);
    setScore((value) => value + 1);
    setStreak((value) => {
      const next = value + 1;
      setBestStreak((best) => {
        const improved = Math.max(best, next);
        try { localStorage.setItem("oddlygo-wrong-answers-best-streak", String(improved)); } catch { /* local storage is optional */ }
        return improved;
      });
      return next;
    });
  }

  function nextQuestion() {
    if (index + 1 >= deck.length) {
      setFinished(true);
      window.dispatchEvent(new CustomEvent("oddlygo:game-result", { detail: { id: "wrong-answers", score: score + 1 } }));
      return;
    }
    setIndex((value) => value + 1);
    setAnswer(null);
  }

  function resetQuiz() {
    setDeck(shuffle(deck[index]));
    setIndex(0);
    setAnswer(null);
    setScore(0);
    setStreak(0);
    setFinished(false);
  }

  return (
    <div className="wrong-game">
      <div className="wrong-scoreboard">
        <span>CHAOS SCORE <b>{score}</b></span>
        <span>STREAK <b>{streak} ✳</b></span>
        <span>QUESTION <b>{finished ? deck.length : index + 1}/{deck.length}</b></span>
      </div>
      <div className="wrong-progress"><span style={{ width: `${(finished ? 100 : (index + 1) / deck.length * 100)}%` }} /></div>
      {finished ? (
        <div className="answer-feedback wrong-complete">
          <strong>CHAOS COMPLETE. ✳</strong>
          <h3>You survived all {deck.length} questions.</h3>
          <p>You gave {score} confidently incorrect answers. Best streak on this device: {bestStreak}.</p>
          <div className="wrong-feedback-actions"><button onClick={resetQuiz}>Shuffle all questions and play again →</button></div>
        </div>
      ) : <>
        <span className="question-number">QUESTION {index + 1} / {deck.length}</span>
        <h3>{question.q}</h3>
        <p className="wrong-instruction">Pick the most confidently incorrect answer. There are {deck.length} questions in this shuffled run, with no repeats until you finish.</p>
        {question.answers.map((option) => (
          <button key={option} className={answer === option ? "answer-choice chosen" : "answer-choice"} onClick={() => choose(option)} disabled={answer !== null}>
            {option}<ArrowRight size={14} />
          </button>
        ))}
        {answer && (
          <div className="answer-feedback">
            <strong>Excellent. Absolutely incorrect.</strong> <span>✳</span>
            <p>There are no wrong answers here. Just suspicious confidence.</p>
            <div className="wrong-feedback-actions">
              <button onClick={nextQuestion}>{index + 1 === deck.length ? "Finish run" : "Next ridiculous question"} →</button>
              <button onClick={resetQuiz}>Restart run</button>
            </div>
          </div>
        )}
      </>}
      {!finished && <div className="wrong-footer-stats">PERSONAL BEST STREAK: {bestStreak} · {deck.length} UNIQUE QUESTIONS</div>}
    </div>
  );
}

function ShapeLab() {
  const palette = ["#d8ff62", "#9c6bff", "#47d9ed", "#ff4f91", "#ff9a4d", "#f4f1e8"];
  const [shape, setShape] = useState("circle");
  const [color, setColor] = useState(palette[0]);
  const [size, setSize] = useState(48);
  const [rotation, setRotation] = useState(0);
  const [stamps, setStamps] = useState<Array<{ id: number; shape: string; color: string; size: number; rotation: number; x: number; y: number }>>([]);
  const [nextId, setNextId] = useState(1);
  function stampAt(event: ReactMouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((event.clientY - rect.top) / rect.height) * 100));
    setStamps((items) => [...items, { id: nextId, shape, color, size, rotation, x, y }].slice(-80));
    setNextId((id) => id + 1);
  }
  function remix() {
    const shapes = ["circle", "square", "triangle", "diamond"];
    setStamps(Array.from({ length: 22 }, (_, i) => ({
      id: nextId + i,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: palette[Math.floor(Math.random() * palette.length)],
      size: 18 + Math.random() * 42,
      rotation: Math.floor(Math.random() * 360),
      x: 5 + Math.random() * 90,
      y: 8 + Math.random() * 84,
    })));
    setNextId((id) => id + 22);
  }
  return <div className="shape-lab">
    <div className="shape-lab-heading"><div><strong>MAKE SOMETHING ODD</strong><span>Pick a shape, then stamp it onto your canvas.</span></div><b>{stamps.length} / 80</b></div>
    <div className="shape-stage" onClick={stampAt} role="button" tabIndex={0} aria-label="Click to stamp your selected shape" onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); const fakeEvent = { currentTarget: event.currentTarget, clientX: rect.left + rect.width * (0.15 + Math.random() * 0.7), clientY: rect.top + rect.height * (0.15 + Math.random() * 0.7) } as ReactMouseEvent<HTMLDivElement>; stampAt(fakeEvent); } }}>
      {stamps.length === 0 && <div className="shape-stage-empty"><span>＋</span><strong>Your canvas is waiting.</strong><small>Click anywhere to place your first shape</small></div>}
      {stamps.map((item) => <span key={item.id} className={`shape-stamp ${item.shape}`} style={{ left: `${item.x}%`, top: `${item.y}%`, width: item.shape === "triangle" ? item.size * 1.1 : item.size, height: item.shape === "triangle" ? item.size : item.size, background: item.shape === "triangle" ? "transparent" : item.color, borderBottomColor: item.color, transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`, ["--stamp-color" as string]: item.color, ["--stamp-size" as string]: `${item.size}px` }} />)}
    </div>
    <div className="shape-controls">
      <div className="shape-choice-row"><span>SHAPE</span>{["circle", "square", "triangle", "diamond"].map((item) => <button key={item} className={`shape-choice ${shape === item ? "active" : ""}`} onClick={() => setShape(item)} aria-label={item} title={item}><span className={`shape-choice-icon ${item}`} /></button>)}</div>
      <div className="shape-choice-row"><span>COLOUR</span><div className="shape-palette">{palette.map((item) => <button key={item} className={`shape-swatch ${color === item ? "active" : ""}`} style={{ background: item }} onClick={() => setColor(item)} aria-label={`Choose ${item}`} />)}</div></div>
      <label>Size <input type="range" min="18" max="74" value={size} onChange={(e) => setSize(Number(e.target.value))} /><b>{size}px</b></label>
      <label>Rotation <input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} /><b>{rotation}°</b></label>
      <div className="shape-actions"><button onClick={remix}><RefreshCw size={14}/> Remix canvas</button><button onClick={() => setStamps([])}>Clear canvas</button></div>
    </div>
  </div>;
}

function OddOneOut() {
  const rounds = [
    { base: "🍋", odd: "🍈" }, { base: "🐸", odd: "🐢" }, { base: "🍪", odd: "🥯" },
    { base: "🌙", odd: "🌚" }, { base: "🦋", odd: "🐝" }, { base: "🎾", odd: "🥝" },
    { base: "🐱", odd: "🐯" }, { base: "🍎", odd: "🍅" }, { base: "🚗", odd: "🚕" },
    { base: "🐧", odd: "🐦" }, { base: "🌵", odd: "🌲" }, { base: "🍓", odd: "🍒" },
    { base: "⚽", odd: "🏀" }, { base: "🐙", odd: "🦑" }, { base: "🧀", odd: "🍰" },
    { base: "🌧️", odd: "⚡" }, { base: "🦆", odd: "🐤" }, { base: "🥕", odd: "🌶️" },
    { base: "🎹", odd: "🎸" }, { base: "🪐", odd: "🌍" }, { base: "👻", odd: "💀" },
    { base: "🧤", odd: "🧦" }, { base: "🍉", odd: "🥥" }, { base: "🐳", odd: "🦈" },
    { base: "📘", odd: "📕" }, { base: "🌻", odd: "🌷" }, { base: "🥨", odd: "🥐" },
    { base: "🛴", odd: "🚲" }, { base: "🦁", odd: "🐻" }, { base: "💎", odd: "🔮" },
  ];
  const shuffle = (exclude = -1) => {
    const values = rounds.map((_, i) => i);
    for (let i = values.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [values[i], values[j]] = [values[j], values[i]]; }
    if (values[0] === exclude) [values[0], values[1]] = [values[1], values[0]];
    return values;
  };
  const [deck, setDeck] = useState<number[]>(() => shuffle());
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => { try { return Number(localStorage.getItem("oddlygo-odd-one-out-best-streak") || 0); } catch { return 0; } });
  const [lives, setLives] = useState(3);
  const [finished, setFinished] = useState(false);
  const oddIndex = useMemo(() => Math.floor(Math.random() * 25), [round, deck]);
  const current = rounds[deck[round]];
  function pick(index: number) {
    if (chosen !== null || finished) return;
    setChosen(index);
    if (index === oddIndex) {
      setScore((value) => value + 1);
      setStreak((value) => { const next = value + 1; setBestStreak((best) => { const improved = Math.max(best, next); try { localStorage.setItem("oddlygo-odd-one-out-best-streak", String(improved)); } catch {} return improved; }); return next; });
    } else {
      const nextLives = Math.max(0, lives - 1);
      setLives(nextLives);
      if (nextLives === 0) { setFinished(true); window.dispatchEvent(new CustomEvent("oddlygo:game-result", { detail: { id: "odd-one-out", score } })); }
      setStreak(0);
    }
  }
  function next() {
    if (finished) return;
    if (round + 1 >= deck.length) { setDeck(shuffle(deck[round])); setRound(0); }
    else setRound((value) => value + 1);
    setChosen(null);
  }
  function restart() { setDeck(shuffle(deck[round])); setRound(0); setScore(0); setChosen(null); setStreak(0); setBestStreak(0); setLives(3); setFinished(false); }
  return <div className="oddout-game">
    <div className="mini-game-stats"><span>SCORE <b>{score}</b></span><span>STREAK <b>{streak} ✳</b></span><span>LIVES <b>{"♥".repeat(lives)}{"♡".repeat(3 - lives)}</b></span></div>
    <div className="oddout-progress-row"><span>ROUND {round + 1} / {rounds.length}</span><span>BEST STREAK {bestStreak}</span></div>
    <div className="oddout-progress"><span style={{ width: `${((round + 1) / rounds.length) * 100}%` }} /></div>
    {!finished ? <>
      <p className="mini-game-instruction">30 different rounds in a shuffled run. Find the odd emoji — lose a life if you miss.</p>
      <div className="oddout-grid" role="group" aria-label="Find the different emoji">
        {Array.from({ length: 25 }, (_, i) => <button key={`${deck[round]}-${round}-${i}`} onClick={() => pick(i)} disabled={chosen !== null} className={`oddout-tile ${chosen !== null && i === oddIndex ? "is-odd" : ""} ${chosen === i && i !== oddIndex ? "is-wrong" : ""}`} aria-label={`Tile ${i + 1}`}>{i === oddIndex ? current.odd : current.base}</button>)}
      </div>
      {chosen !== null && <div className="mini-game-result"><strong>{chosen === oddIndex ? "Perfect spot. Keep the streak alive!" : `Missed it — ${current.odd} was the odd one.`}</strong><button onClick={next}>Next round <ArrowRight size={14}/></button></div>}
    </> : <div className="oddout-game-over"><span>GAME OVER</span><h3>{score} points</h3><p>You spotted {score} odd ones and reached a streak of {bestStreak}.</p><button className="primary-button" onClick={restart}>Play again <ArrowRight size={14}/></button></div>}
  </div>;
}

function GreenLight() {
  const [phase, setPhase] = useState<"ready" | "waiting" | "go" | "result">("ready");
  const [startAt, setStartAt] = useState(0);
  const [reaction, setReaction] = useState<number | null>(null);
  const [message, setMessage] = useState("Wait for green. Then click as fast as you can.");
  const [best, setBest] = useState<number | null>(() => { try { const value = localStorage.getItem("oddlygo-green-light-best"); return value ? Number(value) : null; } catch { return null; } });
  const timeoutRef = useRef<number | null>(null);
  useEffect(() => () => { if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current); }, []);
  function start() {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setReaction(null); setMessage("Don't click yet…"); setPhase("waiting");
    timeoutRef.current = window.setTimeout(() => { setStartAt(performance.now()); setPhase("go"); setMessage("NOW! CLICK!"); }, 1300 + Math.random() * 2600);
  }
  function clickField() {
    if (phase === "waiting") {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      setPhase("result"); setReaction(null); setMessage("Too soon! False start. Give it another go.");
    } else if (phase === "go") {
      const ms = Math.round(performance.now() - startAt);
      setReaction(ms); setPhase("result");
      window.dispatchEvent(new CustomEvent("oddlygo:game-result", { detail: { id: "green-light", score: Math.max(0, 1000 - ms) } }));
      if (best === null || ms < best) { setBest(ms); try { localStorage.setItem("oddlygo-green-light-best", String(ms)); } catch { /* storage optional */ } }
      setMessage(ms < 220 ? "Lightning reflexes. Suspiciously fast." : ms < 330 ? "Nice reflexes. Your neurons showed up." : "Not bad. Try to beat that time.");
    }
  }
  return <div className="greenlight-game">
    <div className="greenlight-stats"><div><span>YOUR BEST</span><strong>{best === null ? "—" : `${best} ms`}</strong></div><div><span>LAST ATTEMPT</span><strong>{reaction === null ? "—" : `${reaction} ms`}</strong></div></div>
    <button className={`reaction-field ${phase}`} onClick={clickField} disabled={phase === "ready" || phase === "result"}>
      <span className="reaction-orb">{phase === "waiting" ? "…" : phase === "go" ? "!" : phase === "result" ? (reaction === null ? "×" : reaction) : "GO?"}</span>
      <span>{phase === "waiting" ? "WAIT FOR GREEN" : phase === "go" ? "CLICK NOW" : phase === "result" ? (reaction === null ? "FALSE START" : "MILLISECONDS") : "REACTION TEST"}</span>
    </button>
    <p>{message}</p>
    {(phase === "ready" || phase === "result") && <button className="primary-button" onClick={start}>{phase === "ready" ? "Start test" : "Try again"} <ArrowRight size={15}/></button>}
    <small className="greenlight-tip">Personal best is saved on this device. Lower is better.</small>
  </div>;
}

export default App;



// Prism Shift: a curated opening campaign followed by solvable generated puzzles.
type PrismPoint = { x: number; y: number };
type PrismPuzzle = { mirrors: PrismPoint[]; initial: boolean[]; solution: boolean[]; splitter: boolean };
const PRISM_CAMPAIGN: PrismPoint[][] = [
  [{x:2,y:2},{x:2,y:0}],
  [{x:1,y:2},{x:2,y:2},{x:2,y:0}],
  [{x:1,y:2},{x:3,y:2},{x:3,y:0}],
  [{x:2,y:1},{x:2,y:3},{x:4,y:2}],
  [{x:1,y:2},{x:2,y:1},{x:3,y:1},{x:3,y:3}],
  [{x:1,y:1},{x:2,y:3},{x:3,y:1},{x:4,y:2}],
  [{x:1,y:2},{x:2,y:0},{x:3,y:2},{x:3,y:4}],
  [{x:1,y:0},{x:1,y:3},{x:3,y:1},{x:4,y:2}],
];
const prismTrace = (mirrors: PrismPoint[], orientations: boolean[], splitter = false) => {
  const cells = new Set<string>();
  const queue: Array<{x:number;y:number;dx:number;dy:number;split:boolean}> = [{x:0,y:2,dx:1,dy:0,split:false}];
  const seen = new Set<string>();
  let reached = false;
  while (queue.length) {
    const ray = queue.shift()!;
    let {x,y,dx,dy,split} = ray;
    for (let step=0; step<30; step++) {
      if (x<0 || x>4 || y<0 || y>4) break;
      const key = `${x},${y}`; cells.add(key);
      if (x===4 && y===0) { reached = true; break; }
      const stateKey = `${x},${y},${dx},${dy},${split}`;
      if (seen.has(stateKey)) break;
      seen.add(stateKey);
      if (splitter && x===2 && y===2 && !split) {
        queue.push({x,y,dx:-dy,dy:dx,split:true});
        split = true;
      }
      const mi = mirrors.findIndex(point=>point.x===x && point.y===y);
      if (mi>=0) {
        const oldDx=dx;
        if (orientations[mi]) { dx=-dy; dy=-oldDx; }
        else { dx=dy; dy=oldDx; }
      }
      x+=dx; y+=dy;
    }
  }
  return { cells:[...cells], reached };
};
function solvePrismLayout(mirrors: PrismPoint[], splitter: boolean): boolean[] | null {
  const count=mirrors.length;
  for (let mask=0; mask<(1<<count); mask++) {
    const state=Array.from({length:count},(_,i)=>Boolean(mask&(1<<i)));
    if (prismTrace(mirrors,state,splitter).reached) return state;
  }
  return null;
}
function createPrismPuzzle(level = 1, seed?: number): PrismPuzzle {
  let state = (seed ?? Math.floor(Math.random() * 2147483646)) % 2147483647;
  const random = seed === undefined ? Math.random : () => { state = (state * 48271) % 2147483647; return (state - 1) / 2147483646; };
  const splitter = level >= 6;
  if (level <= PRISM_CAMPAIGN.length) {
    const mirrors = PRISM_CAMPAIGN[level-1];
    const solution = solvePrismLayout(mirrors, splitter);
    if (solution) {
      for (let i=0;i<solution.length;i++) {
        const initial=[...solution]; initial[i]=!initial[i];
        if (!prismTrace(mirrors,initial,splitter).reached) return {mirrors,initial,solution,splitter};
      }
    }
  }
  const spots: PrismPoint[]=[];
  for(let y=0;y<5;y++) for(let x=0;x<5;x++) {
    if (!(x===0&&y===2) && !(x===4&&y===0) && !(splitter&&x===2&&y===2)) spots.push({x,y});
  }
  for(let attempt=0;attempt<900;attempt++) {
    const shuffled=[...spots];
    for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
    const mirrors=shuffled.slice(0,Math.min(4,2+Math.floor((level-1)/3)));
    const solution=solvePrismLayout(mirrors,splitter);
    if(!solution) continue;
    const alternatives=solution.map((_,i)=>{const state=[...solution];state[i]=!state[i];return state;}).filter(state=>!prismTrace(mirrors,state,splitter).reached);
    if(alternatives.length) return {mirrors,initial:alternatives[Math.floor(random()*alternatives.length)],solution,splitter};
  }
  const mirrors=[{x:2,y:1},{x:2,y:3}];
  const solution=solvePrismLayout(mirrors,false) || [true,false];
  return {mirrors,initial:solution.map((v,i)=>i===0?!v:v),solution,splitter:false};
}
function PrismShift() {
  const [dailyMode,setDailyMode]=useState(()=>localStorage.getItem("oddlygo-prism-daily-mode")==="true");
  const dailySeed = useMemo(()=>{ const date = new Date().toLocaleDateString("en-CA"); let hash=2166136261; for(const char of date){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);} return hash>>>0; },[]);
  const [level,setLevel]=useState(()=>localStorage.getItem("oddlygo-prism-daily-mode")==="true"?9:1);
  const [puzzle,setPuzzle]=useState<PrismPuzzle>(()=>localStorage.getItem("oddlygo-prism-daily-mode")==="true"?createPrismPuzzle(9,dailySeed):createPrismPuzzle(1));
  const [mirrors,setMirrors]=useState<boolean[]>(()=>[...puzzle.initial]);
  const [moves,setMoves]=useState(0);
  const [won,setWon]=useState(false);
  const [hintUsed,setHintUsed]=useState(false);
  const beam=useMemo(()=>prismTrace(puzzle.mirrors,mirrors,puzzle.splitter),[puzzle,mirrors]);
  useEffect(()=>{if(beam.reached&&!won){setWon(true);window.dispatchEvent(new CustomEvent("oddlygo:game-result",{detail:{id:"prism-shift",score:Math.max(1,100-moves+(hintUsed?0:10)),moves,daily:dailyMode}}));}},[beam,won,moves,hintUsed,dailyMode]);
  const nextPuzzle=()=>{if(dailyMode){localStorage.removeItem("oddlygo-prism-daily-mode");setDailyMode(false);setLevel(1);const next=createPrismPuzzle(1);setPuzzle(next);setMirrors([...next.initial]);setMoves(0);setWon(false);setHintUsed(false);return;}const nextLevel=level+1;const next=createPrismPuzzle(nextLevel);setPuzzle(next);setMirrors([...next.initial]);setMoves(0);setWon(false);setHintUsed(false);setLevel(nextLevel);};
  const reset=()=>{setMirrors([...puzzle.initial]);setMoves(0);setWon(false);setHintUsed(false);};
  const useHint=()=>{if(won)return;const index=mirrors.findIndex((value,i)=>value!==puzzle.solution[i]);if(index<0)return;setMirrors(current=>current.map((value,i)=>i===index?!value:value));setMoves(value=>value+1);setHintUsed(true);};
  const rotate=(index:number)=>{if(won)return;setMirrors(current=>current.map((value,i)=>i===index?!value:value));setMoves(value=>value+1);};
  return <div className="prism-game">
    <div className="prism-stats"><div><span>{dailyMode?"DAILY PUZZLE":"LEVEL"}</span><strong>{dailyMode?"TODAY":String(level).padStart(2,'0')}</strong></div><div><span>ROTATIONS</span><strong>{moves}</strong></div><div><span>MIRRORS</span><strong>{puzzle.mirrors.length}</strong></div><div><span>BEAM STATUS</span><strong className={won?'prism-lit':''}>{won?'CONNECTED':'SEARCHING'}</strong></div></div>
    <p className="prism-instruction">{dailyMode && <><b>Daily challenge:</b> this layout is seeded from today's local date. Try to beat your fewest-rotation record. </>}Rotate mirrors to guide light from the <b>emitter</b> to the receiver. {puzzle.splitter ? <><b>Splitter active:</b> the crystal at the center sends a second beam upward/sideways.</> : level<=8 ? <><b>Campaign puzzle {level} of 8:</b> each opening level is curated.</> : 'New solvable layouts are generated as you progress.'}</p>
    <div className="prism-board" role="group" aria-label={`Light routing puzzle ${level}`}>
      {Array.from({length:25},(_,index)=>{
        const x=index%5,y=Math.floor(index/5),key=`${x},${y}`;
        const mirrorIndex=puzzle.mirrors.findIndex(point=>point.x===x&&point.y===y);
        const isBeam=beam.cells.includes(key);
        return <div key={key} className={`prism-cell${isBeam?' beam-on':''}${x===0&&y===2?' emitter':''}${x===4&&y===0?' receiver':''}`}>
          {x===0&&y===2?<span className="prism-emitter-mark">◉</span>:x===4&&y===0?<span className={`prism-target${won?' target-lit':''}`}>✦</span>:puzzle.splitter&&x===2&&y===2?<span className="prism-splitter" title="Beam splitter">✣</span>:mirrorIndex>=0?<button className="prism-mirror" onClick={()=>rotate(mirrorIndex)} aria-label={`Rotate mirror ${mirrorIndex+1}`} disabled={won}><span className={mirrors[mirrorIndex]?'slash':'backslash'}>{mirrors[mirrorIndex]?'／':'＼'}</span></button>:null}
        </div>;
      })}
    </div>
    {won?<div className="prism-win"><strong>LIGHT CONNECTED ✦</strong><span>{hintUsed?`Receiver reached in ${moves} rotations. Hint used.`:moves<=2?'Clean solve. Not a single unnecessary twist.':`Receiver reached in ${moves} rotations.`}{dailyMode?" Daily puzzle complete!":""}</span><button onClick={nextPuzzle}>Next puzzle →</button></div>:<div className="prism-hint"><span>TIP</span> {puzzle.splitter?'Use the splitter to create a second route; both rays share the same mirrors.':'Trace the route cell by cell and think about each reflection.'} <button className="prism-hint-button" onClick={useHint}>Reveal one move</button></div>}
    <div className="prism-footer"><span>{level<=8?'CURATED CAMPAIGN':'INFINITE PUZZLES'} · LEVEL {level}</span><button onClick={reset}>Reset puzzle ↻</button><button onClick={nextPuzzle}>Skip puzzle →</button></div>
  </div>;
}

// Maze Mind: a fresh, connected maze is generated for each run.
type MazeCell = { walls: [boolean, boolean, boolean, boolean]; visited: boolean };
type MazePoint = { x: number; y: number };
const MAZE_SIZE = 9;
const MAZE_DIRS = [
  { dx: 0, dy: -1, wall: 0, opposite: 2, label: "↑" },
  { dx: 1, dy: 0, wall: 1, opposite: 3, label: "→" },
  { dx: 0, dy: 1, wall: 2, opposite: 0, label: "↓" },
  { dx: -1, dy: 0, wall: 3, opposite: 1, label: "←" },
];
function buildMaze(): MazeCell[][] {
  const grid = Array.from({ length: MAZE_SIZE }, () => Array.from({ length: MAZE_SIZE }, () => ({ walls: [true, true, true, true] as [boolean, boolean, boolean, boolean], visited: false })));
  const stack: MazePoint[] = [{ x: 0, y: 0 }];
  grid[0][0].visited = true;
  while (stack.length) {
    const current = stack[stack.length - 1];
    const options = MAZE_DIRS.map((d) => ({ ...d, x: current.x + d.dx, y: current.y + d.dy }))
      .filter((d) => d.x >= 0 && d.x < MAZE_SIZE && d.y >= 0 && d.y < MAZE_SIZE && !grid[d.y][d.x].visited);
    if (!options.length) { stack.pop(); continue; }
    const next = options[Math.floor(Math.random() * options.length)];
    grid[current.y][current.x].walls[next.wall] = false;
    grid[next.y][next.x].walls[next.opposite] = false;
    grid[next.y][next.x].visited = true;
    stack.push({ x: next.x, y: next.y });
  }
  return grid;
}
function MazeMind() {
  const [maze, setMaze] = useState<MazeCell[][]>(() => buildMaze());
  const [player, setPlayer] = useState<MazePoint>({ x: 0, y: 0 });
  const [sparks, setSparks] = useState<MazePoint[]>(() => [{ x: 2, y: 1 }, { x: 6, y: 4 }, { x: 7, y: 7 }]);
  const [collected, setCollected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  function newRun() {
    setMaze(buildMaze()); setPlayer({ x: 0, y: 0 }); setCollected([]); setMoves(0); setWon(false);
    const points: MazePoint[] = [];
    while (points.length < 3) {
      const point = { x: 1 + Math.floor(Math.random() * (MAZE_SIZE - 2)), y: 1 + Math.floor(Math.random() * (MAZE_SIZE - 2)) };
      if ((point.x !== 0 || point.y !== 0) && !points.some((p) => p.x === point.x && p.y === point.y)) points.push(point);
    }
    setSparks(points);
    window.setTimeout(() => boardRef.current?.focus(), 0);
  }
  function move(dx: number, dy: number) {
    if (won) return;
    const dir = MAZE_DIRS.find((d) => d.dx === dx && d.dy === dy)!;
    if (maze[player.y][player.x].walls[dir.wall]) return;
    const next = { x: player.x + dx, y: player.y + dy };
    setPlayer(next); setMoves((n) => n + 1);
    const spark = sparks.findIndex((p) => p.x === next.x && p.y === next.y);
    if (spark >= 0 && !collected.includes(`${next.x},${next.y}`)) setCollected((items) => [...items, `${next.x},${next.y}`]);
    if (next.x === MAZE_SIZE - 1 && next.y === MAZE_SIZE - 1 && collected.length + (spark >= 0 && !collected.includes(`${next.x},${next.y}`) ? 1 : 0) >= 3) { setWon(true); window.dispatchEvent(new CustomEvent("oddlygo:game-result", { detail: { id: "maze-mind", score: Math.max(1, 100 - moves) } })); }
  }
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(event.key)) {
        if ((document.activeElement === boardRef.current) || (boardRef.current && boardRef.current.contains(document.activeElement))) {
          event.preventDefault();
          if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") move(0, -1);
          if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") move(1, 0);
          if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") move(0, 1);
          if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") move(-1, 0);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return <div className="maze-game">
    <div className="maze-topline"><div><span>MAZE STATUS</span><strong>{won ? "ESCAPED ✦" : collected.length === 3 ? "EXIT UNLOCKED" : "FIND THE SPARKS"}</strong></div><div><span>STEPS TAKEN</span><strong>{moves}</strong></div><div><span>SPARKS</span><strong>{collected.length} / 3</strong></div></div>
    <p className="maze-instruction">Collect all 3 sparks <b>✦</b>, then reach the glowing exit. Use arrow keys or the pad below.</p>
    <div className="maze-board" ref={boardRef} tabIndex={0} role="group" aria-label="Maze board. Focus here and use arrow keys to move.">
      {maze.map((row, y) => row.map((cell, x) => {
        const isPlayer = player.x === x && player.y === y;
        const isSpark = sparks.some((p) => p.x === x && p.y === y) && !collected.includes(`${x},${y}`);
        const isExit = x === MAZE_SIZE - 1 && y === MAZE_SIZE - 1;
        return <div key={`${x}-${y}`} className={`maze-cell${isPlayer ? " player-cell" : ""}${isExit ? " exit-cell" : ""}${isSpark ? " spark-cell" : ""}`} style={{ borderTop: cell.walls[0] ? undefined : "1px solid transparent", borderRight: cell.walls[1] ? undefined : "1px solid transparent", borderBottom: cell.walls[2] ? undefined : "1px solid transparent", borderLeft: cell.walls[3] ? undefined : "1px solid transparent" }}>
          {isPlayer ? <span className="maze-player">●</span> : isSpark ? <span className="maze-spark">✦</span> : isExit ? <span className={`maze-exit${collected.length === 3 ? " unlocked" : ""}`}>⌂</span> : null}
        </div>;
      }))}
    </div>
    <div className="maze-controls" aria-label="Movement controls"><span /><button onClick={() => move(0,-1)} aria-label="Move up">↑</button><span /><button onClick={() => move(-1,0)} aria-label="Move left">←</button><button onClick={() => move(0,1)} aria-label="Move down">↓</button><button onClick={() => move(1,0)} aria-label="Move right">→</button></div>
    {won && <div className="maze-win"><strong>YOU FOUND YOUR WAY OUT.</strong><span>Three sparks recovered in {moves} moves. Ready for another maze?</span></div>}
    <div className="maze-bottom"><span>TIP: THE MAZE CHANGES EVERY RUN</span><button onClick={newRun}><RefreshCw size={14}/> New maze</button></div>
  </div>;
}


function MemoryMatrix() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [shown, setShown] = useState<number[]>([]);
  const [inputIndex, setInputIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [status, setStatus] = useState<"ready" | "watch" | "repeat" | "over" | "won">("ready");
  const [best, setBest] = useState(() => { try { return Number(localStorage.getItem("oddlygo-memory-best") || 0); } catch { return 0; } });
  const [mode, setMode] = useState<"classic" | "decoy">("classic");
  const timeoutRef = useRef<number | undefined>(undefined);
  const size = round >= 9 ? 6 : round >= 5 ? 5 : 4;
  const cellCount = size * size;
  useEffect(() => () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); }, []);
  function startRound(nextRound = 1, prior: number[] = []) {
    const nextSize = nextRound >= 9 ? 6 : nextRound >= 5 ? 5 : 4;
    const nextCount = nextSize * nextSize;
    const next = [...prior, Math.floor(Math.random() * nextCount)];
    setSequence(next); setShown(next); setInputIndex(0); setRound(nextRound); setStatus("watch");
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => { setShown([]); setStatus("repeat"); }, Math.max(550, 1450 - next.length * 65));
  }
  function tapCell(index: number) {
    if (status !== "repeat") return;
    if (sequence[inputIndex] !== index) {
      setStatus("over");
      if (round - 1 > best) { setBest(round - 1); try { localStorage.setItem("oddlygo-memory-best", String(round - 1)); } catch {} }
      return;
    }
    if (inputIndex === sequence.length - 1) {
      if (round >= 12) {
        setStatus("won");
        if (round > best) { setBest(round); try { localStorage.setItem("oddlygo-memory-best", String(round)); } catch {} }
        window.dispatchEvent(new CustomEvent("oddlygo:game-result", { detail: { id: "memory-matrix", score: round } }));
        return;
      }
      startRound(round + 1, sequence); return;
    }
    setInputIndex(inputIndex + 1);
  }
  function startGame() { setSequence([]); setShown([]); setRound(0); startRound(1, []); }
  return <div className="og-mini-game"><div className="og-game-stats"><span>LEVEL <b>{round}</b></span><span>BEST <b>{best}</b></span><span>{size}×{size} GRID</span></div><p>Patterns grow every level. At level 5 the board expands; level 9 expands again. The pattern also flashes faster as it grows.</p><div className="memory-mode"><button className={mode === "classic" ? "selected" : ""} onClick={() => setMode("classic")}>Classic</button><button className={mode === "decoy" ? "selected" : ""} onClick={() => setMode("decoy")}>Decoy mode</button><span>{mode === "decoy" ? "Watch for false flashes" : "Pure sequence memory"}</span></div><div className="memory-grid" style={{gridTemplateColumns:`repeat(${size},minmax(0,1fr))`}}>{Array.from({length:cellCount},(_,i)=>{const lit = shown.includes(i) || (mode === "decoy" && status === "watch" && round >= 3 && i === (sequence[sequence.length-1]+Math.floor(cellCount/2))%cellCount && !sequence.includes(i));return <button key={`${size}-${i}`} className={lit?"memory-tile lit":"memory-tile"} onClick={()=>tapCell(i)} disabled={status!=="repeat"} aria-label={`Tile ${i+1}`}/>})}</div>{status==="ready"||status==="over"||status==="won"?<div className="og-game-message big">{status==="won"?"MEMORY OVERLOAD CLEARED! Twelve levels, done. +Arcade rewards unlocked.":status==="over"?`Pattern broken at level ${round}. You cleared ${Math.max(0,round-1)} levels. No reward for a failed run — try again.`:"Ready to stress-test your memory? Clear all 12 levels to win."}<button className="og-game-button" onClick={startGame}>{status==="won"||status==="over"?"Run it back":"Start Memory Overload"} →</button></div>:<div className="og-game-message">{status==="watch"?"Memorize the sequence…":`Repeat tile ${inputIndex+1} of ${sequence.length}`}</div>}</div>;
}

const SCRAMBLE_PACKS: Record<string, string[]> = {
  chill: ["curious", "puzzle", "orbit", "wonder", "pixel", "cosmic", "oddity", "spark", "maze", "playful", "glitch", "planet"],
  brainy: ["paradox", "gravity", "illusion", "quantum", "labyrinth", "eclipse", "nebula", "mystery", "vortex", "pioneer", "enigma", "mirage"],
  chaos: ["kaleidoscope", "serendipity", "constellation", "imagination", "extraordinary", "infinite", "curiosity", "dimension", "phenomenon", "adventure", "unexpected", "daydream"]
};
const SCRAMBLE_LABELS: Record<string, string> = { chill: "Warm-up", brainy: "Brainy", chaos: "Chaos" };
function scrambleWord(word: string) {
  if (word.length < 2) return word;
  let out = word;
  for (let tries = 0; (out === word || out.split("").every((c, i) => c === word[i])) && tries < 30; tries++) out = word.split("").sort(() => Math.random() - .5).join("");
  return out === word ? word.split("").reverse().join("") : out;
}
function WordScramble() {
  const [difficulty,setDifficulty] = useState<keyof typeof SCRAMBLE_PACKS>("chill");
  const [wordIndex,setWordIndex] = useState(0);
  const [scrambled,setScrambled] = useState(()=>scrambleWord(SCRAMBLE_PACKS.chill[0]));
  const [answer,setAnswer] = useState(""); const [score,setScore] = useState(0); const [tries,setTries] = useState(3); const [message,setMessage] = useState("Unscramble the letters."); const [done,setDone] = useState(false); const [hintUsed,setHintUsed] = useState(false);
  const words = SCRAMBLE_PACKS[difficulty];
  function newWord(index: number, points: number, lives: number) {
    if(index >= words.length) { setDone(true); return; }
    setWordIndex(index); setScrambled(scrambleWord(words[index])); setAnswer(""); setScore(points); setTries(lives); setHintUsed(false); setMessage("Unscramble the letters.");
  }
  function choosePack(pack: keyof typeof SCRAMBLE_PACKS) { setDifficulty(pack); setWordIndex(0); setScrambled(scrambleWord(SCRAMBLE_PACKS[pack][0])); setAnswer(""); setScore(0); setTries(3); setHintUsed(false); setDone(false); setMessage("New pack loaded. Let's go!"); }
  function submit() {
    if(answer.trim().toLowerCase()===words[wordIndex]) {
      const points=score + (difficulty === "chill" ? 1 : difficulty === "brainy" ? 2 : 3) - (hintUsed ? 0 : 0);
      setScore(points); setMessage(`Correct! +${difficulty === "chill" ? 1 : difficulty === "brainy" ? 2 : 3} points ✦`);
      if (wordIndex === words.length - 1) { setDone(true); window.dispatchEvent(new CustomEvent("oddlygo:game-result", { detail: { id: "word-scramble", score: points } })); } else window.setTimeout(()=>newWord(wordIndex+1,points,tries),450);
    } else {
      const lives=tries-1; setTries(lives); setMessage(lives===0?`The word was “${words[wordIndex]}”.`:"Not quite — try again!");
      if(lives===0) window.setTimeout(()=>newWord(wordIndex+1,score,3),900);
    }
  }
  function useHint() { if(hintUsed) return; setHintUsed(true); setMessage(`Hint: starts with “${words[wordIndex][0].toUpperCase()}” and has ${words[wordIndex].length} letters.`); }
  return <div className="og-mini-game">
    <div className="og-game-stats"><span>PACK <b>{SCRAMBLE_LABELS[difficulty]}</b></span><span>WORD <b>{Math.min(wordIndex+1,words.length)}/{words.length}</b></span><span>SCORE <b>{score}</b></span><span>TRIES <b>{tries}</b></span></div>
    <div className="scramble-packs" aria-label="Choose word difficulty">{(Object.keys(SCRAMBLE_PACKS) as Array<keyof typeof SCRAMBLE_PACKS>).map(pack=><button key={pack} className={difficulty===pack?"selected":""} onClick={()=>choosePack(pack)}>{SCRAMBLE_LABELS[pack]}{pack==="brainy"?" · 2x":pack==="chaos"?" · 3x":""}</button>)}</div>
    {done?<div className="og-game-message big">Pack complete! You scored {score} points. <button className="og-game-button" onClick={()=>newWord(0,0,3)}>Replay pack →</button></div>:<><div className="scramble-word">{scrambled.split("").join("  ").toUpperCase()}</div><form className="scramble-form" onSubmit={e=>{e.preventDefault();if(answer.trim())submit();}}><input value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type the word…" autoComplete="off"/><button className="og-game-button" type="submit">Check ↗</button></form><div className="scramble-actions"><button onClick={useHint} disabled={hintUsed}>Hint</button><span>{difficulty==="chill"?"1 point per word":difficulty==="brainy"?"2 points per word":"3 points per word"}</span></div><div className="og-game-message">{message}</div></>}
  </div>;
}

function OrbitDodge() {
  const W = 5;
  type HeistLayout = { walls: number[]; gems: number[]; guards: number[][]; key: number; treasure: number };
  const layouts: HeistLayout[] = [
    { walls: [6, 7, 17], gems: [2, 12, 18], guards: [[5, 10, 15, 16], [9, 14, 19]], key: 11, treasure: 3 },
    { walls: [6, 11, 16, 8], gems: [1, 13, 23], guards: [[5, 10, 15, 20], [9, 14, 19, 24], [3, 8, 13, 18]], key: 2, treasure: 21 },
    { walls: [6, 7, 12, 17], gems: [1, 15, 23], guards: [[5, 10, 15, 20], [9, 14, 19, 24], [3, 4, 9, 14]], key: 2, treasure: 21 },
    { walls: [5, 6, 11, 16, 18], gems: [2, 14, 22], guards: [[0, 1, 2, 3, 4], [9, 14, 19, 24], [15, 16, 17, 22]], key: 10, treasure: 20 },
    { walls: [6, 8, 11, 13, 16], gems: [1, 3, 21], guards: [[5, 10, 15, 20], [9, 14, 19, 24], [0, 1, 2, 3, 4], [20, 21, 22, 23, 24]], key: 2, treasure: 18 },
  ];
  const [level, setLevel] = useState(1);
  const [player, setPlayer] = useState(20);
  const [gems, setGems] = useState<number[]>(layouts[0].gems);
  const [keyTile, setKeyTile] = useState(layouts[0].key);
  const [hasKey, setHasKey] = useState(false);
  const [guards, setGuards] = useState<number[]>(layouts[0].guards.map(route => route[0]));
  const [guardSteps, setGuardSteps] = useState<number[]>(layouts[0].guards.map(() => 0));
  const [walls, setWalls] = useState<number[]>(layouts[0].walls);
  const [treasure, setTreasure] = useState<number | null>(layouts[0].treasure);
  const [treasureFound, setTreasureFound] = useState(false);
  const [moves, setMoves] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [message, setMessage] = useState("Study the patrol routes. Walls block movement and sight. Collect the key, all gems, then escape.");
  const exit = 4;
  const layout = layouts[(level - 1) % layouts.length];

  function newHeist(nextLevel = level) {
    const next = layouts[(nextLevel - 1) % layouts.length];
    setLevel(nextLevel); setPlayer(20); setGems([...next.gems]); setKeyTile(next.key); setHasKey(false);
    setGuards(next.guards.map(route => route[0])); setGuardSteps(next.guards.map(() => 0)); setWalls([...next.walls]);
    setTreasure(next.treasure); setTreasureFound(false); setMoves(0); setPlaying(true); setWon(false); setLost(false);
    setMessage(`Heist ${nextLevel}: patrols follow fixed routes. Watch their next positions before moving.`);
  }

  function move(dx: number, dy: number) {
    if (!playing || won || lost) return;
    const x = player % W, y = Math.floor(player / W), nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= W || ny < 0 || ny >= W) return;
    const next = ny * W + nx;
    if (walls.includes(next)) { setMessage("Blocked! Walls stop both you and the guards. Find another route."); return; }
    if (guards.includes(next)) { setPlayer(next); setLost(true); setPlaying(false); setMoves(m => m + 1); setMessage("Caught by a patrol. Study its route and try again."); return; }

    const remaining = gems.filter(g => g !== next);
    const pickedKey = next === keyTile && !hasKey;
    const foundTreasure = treasure !== null && next === treasure && !treasureFound;
    const nextHasKey = hasKey || pickedKey;
    setPlayer(next); setGems(remaining); setMoves(m => m + 1);
    if (pickedKey) { setHasKey(true); setMessage("Key secured. The exit is now available once all gems are collected."); }
    if (foundTreasure) { setTreasureFound(true); setTreasure(null); setMessage("Bonus treasure collected! Your getaway score gets a boost."); }

    const nextSteps = guardSteps.map((step, i) => (step + 1) % layout.guards[i].length);
    const nextGuards = layout.guards.map((route, i) => route[nextSteps[i]]);
    setGuardSteps(nextSteps); setGuards(nextGuards);
    if (nextGuards.includes(next)) { setLost(true); setPlaying(false); setMessage("A patrol reached your tile. Watch the route indicators and move between patrols."); return; }

    if (next === exit && remaining.length === 0 && nextHasKey) {
      const score = Math.max(10, 100 - (moves + 1) + (foundTreasure || treasureFound ? 25 : 0));
      setWon(true); setPlaying(false); setMessage(`Clean getaway in ${moves + 1} moves${foundTreasure || treasureFound ? " with bonus treasure" : ""}! Score: ${score}.`);
      window.dispatchEvent(new CustomEvent("oddlygo:game-result", { detail: { id: "orbit-dodge", score } }));
    } else if (next === exit && remaining.length > 0) setMessage(`Exit locked by missing loot: ${remaining.length} gem${remaining.length === 1 ? "" : "s"} remaining.`);
    else if (next === exit && !nextHasKey) setMessage("The exit needs a key. Find it, collect all gems, then return here.");
    else if (remaining.length < gems.length) setMessage("Gem secured. Check where the patrols will move next.");
    else if (foundTreasure) setMessage("Bonus treasure found! Keep the route safe and finish the heist.");
    else if (pickedKey) setMessage("Key secured. Now collect the gems and escape.");
    else setMessage("Your move. Patrols advanced along their marked routes.");
  }

  useEffect(() => {
    if (!playing) return;
    function key(e: KeyboardEvent) {
      const map: Record<string, [number, number]> = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
      const v = map[e.key]; if (v) { e.preventDefault(); move(v[0], v[1]); }
    }
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  });

  return <div className="og-mini-game">
    <div className="og-game-stats"><span>HEIST <b>{level}</b></span><span>GEMS <b>{3 - gems.length}/3</b></span><span>KEY <b>{hasKey ? "FOUND" : "MISSING"}</b></span><span>MOVES <b>{moves}</b></span><span>{won ? "ESCAPED" : lost ? "CAUGHT" : playing ? "STEALTH" : "READY"}</span></div>
    <p><strong>POCKET HEIST</strong> — Study the patrol routes before moving. Walls block movement. Collect the key, all three gems, and optional treasure, then reach the exit. Use arrow keys/WASD or the controls.</p>
    <div className="heist-board" role="grid" aria-label="Pocket Heist board">{Array.from({ length: 25 }, (_, i) => {
      const guard = guards.includes(i), gem = gems.includes(i), you = player === i, keyHere = i === keyTile && !hasKey, wall = walls.includes(i), treasureHere = treasure === i;
      const guardIndex = guards.indexOf(i); const nextGuard = guardIndex >= 0 ? layout.guards[guardIndex][guardSteps[guardIndex] + 1 >= layout.guards[guardIndex].length ? 0 : guardSteps[guardIndex] + 1] : -1;
      return <div key={i} className={`heist-cell${you ? " heist-player" : ""}${guard ? " heist-guard" : ""}${gem ? " heist-gem" : ""}${keyHere ? " heist-key" : ""}${i === exit ? " heist-exit" : ""}${wall ? " heist-wall" : ""}${treasureHere ? " heist-treasure" : ""}`} title={wall ? "Wall" : guard ? `Guard patrol${nextGuard >= 0 ? ` — next tile ${nextGuard + 1}` : ""}` : treasureHere ? "Bonus treasure" : ""}>{wall ? "▧" : you ? "●" : guard ? "◉" : gem ? "◆" : keyHere ? "⚿" : treasureHere ? "★" : i === exit ? (hasKey && gems.length === 0 ? "↗" : "▣") : ""}</div>;
    })}</div>
    <div className="heist-controls"><button onClick={() => move(0, -1)} disabled={!playing} aria-label="Move up">↑</button><div><button onClick={() => move(-1, 0)} disabled={!playing} aria-label="Move left">←</button><button onClick={() => move(0, 1)} disabled={!playing} aria-label="Move down">↓</button><button onClick={() => move(1, 0)} disabled={!playing} aria-label="Move right">→</button></div></div>
    <div className="og-game-message big">{message}{(!playing || won || lost) && <button className="og-game-button" onClick={() => newHeist(won ? level + 1 : level)}>{won ? "Next heist" : lost ? "Retry heist" : "Start heist"} →</button>}</div>
    <div className="heist-legend"><span>● You</span><span>◉ Guard</span><span>◆ Gem</span><span>⚿ Key</span><span>★ Bonus</span><span>▧ Wall</span><span>▣ Locked exit</span></div>
  </div>;
}
