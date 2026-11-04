import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Check, ChevronRight,
  Compass, Heart, Pause, Save, Shield, Volume2, VolumeX, X, Zap,
} from "lucide-react";
import {
  cast, chapters, emptySave, evidenceNotes, getChapter, objectiveFor, readSave,
  writeSave, type CampaignSave, type ChapterId,
} from "./campaign";
import { collidesWithBuilding, nearestObject, patrolPosition, renderDistrict, WORLD_HEIGHT, WORLD_WIDTH } from "./world";
import "./glitch-city.css";

type GlitchCityProps = { onExit: () => void };
type Direction = "up" | "down" | "left" | "right";
type GameMode = "menu" | "playing" | "paused";
type Panel = "inventory" | "journal" | "map" | "settings" | "puzzle" | null;
type Choice = { label: string; id: string };
type Dialogue = { speaker: string; text: string; choices?: Choice[]; note?: string };
type Vitals = { health: number; stamina: number; alarm: number };

const radius = 9;
const directions: { direction: Direction; label: string; icon: typeof ArrowUp }[] = [
  { direction: "up", label: "Move north", icon: ArrowUp },
  { direction: "left", label: "Move west", icon: ArrowLeft },
  { direction: "down", label: "Move south", icon: ArrowDown },
  { direction: "right", label: "Move east", icon: ArrowRight },
];
const directionKeys: Record<Direction, string> = {
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
};
const chapterIndex: Record<ChapterId, number> = {
  awakening: 0,
  neon: 1,
  "below-zero": 2,
  forgotten: 3,
  override: 4,
};
const memorySequence = [0, 2, 3, 1];
const sequenceNames = ["CYAN", "AMBER", "VIOLET", "WHITE"];

function has(save: CampaignSave, flag: string) {
  return save.flags.includes(flag);
}

function updateSet(values: string[], value: string) {
  return values.includes(value) ? values : [...values, value];
}

function levelComplete(save: CampaignSave, chapter: ChapterId) {
  if (chapter === "awakening") return has(save, "welcome-read") && save.evidence.includes("old-photograph") && has(save, "nova-met");
  if (chapter === "neon") return has(save, "iris-met") && has(save, "marcus-met") && save.evidence.includes("missing-file");
  if (chapter === "below-zero") return has(save, "mika-met") && save.evidence.includes("transit-manifest") && has(save, "cameras-disabled");
  if (chapter === "forgotten") return has(save, "experiment-log-read") && has(save, "memory-lock-solved") && save.evidence.includes("glass-memory");
  return false;
}

export function GlitchCity({ onExit }: GlitchCityProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef(new Set<string>());
  const touchKeysRef = useRef(new Set<string>());
  const playerRef = useRef({ ...chapters[0].spawn });
  const cameraRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef<string | null>(null);
  const saveRef = useRef<CampaignSave>(emptySave());
  const modeRef = useRef<GameMode>("menu");
  const panelRef = useRef<Panel>(null);
  const dialogueRef = useRef<Dialogue | null>(null);
  const lastAutoSaveRef = useRef(0);
  const lastVitalsUpdateRef = useRef(0);
  const tapTimersRef = useRef(new Set<number>());
  const [mode, setMode] = useState<GameMode>("menu");
  const [panel, setPanel] = useState<Panel>(null);
  const [save, setSave] = useState<CampaignSave>(() => readSave() ?? emptySave());
  const [continueAvailable, setContinueAvailable] = useState(() => Boolean(readSave()));
  const [targetId, setTargetId] = useState<string | null>(null);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [toast, setToast] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem("oddlygo-glitch-city-sound") !== "false"; } catch { return true; }
  });
  const [vitals, setVitals] = useState<Vitals>(() => {
    const stored = readSave();
    return { health: stored?.health ?? 100, stamina: stored?.stamina ?? 100, alarm: stored?.alarm ?? 0 };
  });
  const vitalsRef = useRef<Vitals>(vitals);
  const [puzzleInput, setPuzzleInput] = useState<number[]>([]);
  const [puzzleError, setPuzzleError] = useState("");

  saveRef.current = save;
  vitalsRef.current = vitals;
  modeRef.current = mode;
  panelRef.current = panel;
  dialogueRef.current = dialogue;

  const persist = useCallback((next: CampaignSave, announce = false) => {
    const saved = writeSave(next);
    if (saved) {
      saveRef.current = next;
      setSave(next);
      setContinueAvailable(true);
      setSaveStatus(announce ? "GAME SAVED" : "AUTOSAVED");
    } else {
      setSaveStatus("SAVE FAILED — CHECK BROWSER STORAGE");
    }
    return saved;
  }, []);

  const playTone = useCallback((frequency = 620) => {
    if (!soundEnabled) return;
    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.24, context.currentTime + 0.1);
      gain.gain.setValueAtTime(0.055, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.17);
      oscillator.onended = () => { void context.close(); };
    } catch (error) {
      console.warn("GLITCH CITY audio could not start.", error);
    }
  }, [soundEnabled]);

  const showDialogue = useCallback((next: Dialogue) => {
    setDialogue(next);
    setPanel(null);
    playTone(570);
  }, [playTone]);

  const updateCampaign = useCallback((change: (current: CampaignSave) => CampaignSave, announce = false) => {
    const next = change(saveRef.current);
    persist(next, announce);
  }, [persist]);

  const enterChapter = useCallback((id: ChapterId) => {
    const chapter = getChapter(id);
    playerRef.current = { ...chapter.spawn };
    cameraRef.current = { x: 0, y: 0 };
    setTargetId(null);
    targetRef.current = null;
    setDialogue(null);
    setPanel(null);
    setToast("");
    const next = {
      ...saveRef.current,
      chapter: id,
      player: { ...chapter.spawn },
      flags: updateSet(saveRef.current.flags, `chapter-${id}-unlocked`),
      missionHistory: updateSet(saveRef.current.missionHistory, chapter.title),
      alarm: 0,
    };
    setVitals((current) => ({ ...current, alarm: 0 }));
    persist(next, true);
    setMode("playing");
    playTone(440);
  }, [persist, playTone]);

  const startNewGame = useCallback(() => {
    const fresh = emptySave();
    playerRef.current = { ...chapters[0].spawn };
    cameraRef.current = { x: 0, y: 0 };
    setVitals({ health: 100, stamina: 100, alarm: 0 });
    setDialogue({
      speaker: "ECHO // PERSONAL TERMINAL",
      text: "WELCOME BACK, SUBJECT 017. Your home has been prepared. Your memories have not.",
    });
    setMode("playing");
    persist(fresh, true);
  }, [persist]);

  const startContinue = useCallback(() => {
    const loaded = readSave();
    if (!loaded) {
      setContinueAvailable(false);
      setSaveStatus("NO VALID SAVE FOUND");
      return;
    }
    saveRef.current = loaded;
    playerRef.current = { ...loaded.player };
    cameraRef.current = { x: 0, y: 0 };
    setSave(loaded);
    setVitals({ health: loaded.health, stamina: loaded.stamina, alarm: loaded.alarm });
    setDialogue(null);
    setMode(loaded.ending ? "paused" : "playing");
    setPanel(loaded.ending ? "journal" : null);
    playTone(500);
  }, [playTone]);

  const resolveChoice = useCallback((choice: string) => {
    const current = saveRef.current;
    const relationships = { ...current.relationships };
    const choices = { ...current.choices };
    const flags = [...current.flags];
    let text = "The choice is recorded. The city will remember.";
    let speaker = "VEYRA // CHOICE RECORDED";

    if (choice === "nova-trust" || choice === "nova-doubt") {
      choices.nova = choice;
      relationships.nova = (relationships.nova ?? 0) + (choice === "nova-trust" ? 1 : -1);
      flags.push("nova-met");
      if (choice === "nova-trust" && !current.inventory.includes("Nova's relay key")) current.inventory.push("Nova's relay key");
      text = choice === "nova-trust"
        ? "Nova gives you a relay key. “I knew you would wake up eventually. I just hoped we had more time.”"
        : "Nova steps back. “You don't have to trust me. Just don't trust the name on that screen.”";
      speaker = "NOVA // APARTMENT 07B";
    } else if (choice === "iris-share" || choice === "iris-bargain") {
      choices.iris = choice;
      relationships.iris = (relationships.iris ?? 0) + (choice === "iris-share" ? 1 : 0);
      flags.push("iris-met");
      if (!current.inventory.includes("Transit pass")) current.inventory.push("Transit pass");
      text = choice === "iris-share"
        ? "Iris studies the photograph, then gives it back. “June Vale. Her father still asks about her every night.” She slides you a transit pass."
        : "“A secret for a secret.” Iris gives you a transit pass and pockets a copy of the photograph.";
      speaker = "IRIS // INFORMATION EXCHANGE";
    } else if (choice === "marcus-honest" || choice === "marcus-hide") {
      choices.marcus = choice;
      relationships.marcus = (relationships.marcus ?? 0) + (choice === "marcus-honest" ? 1 : -1);
      flags.push("marcus-met");
      text = choice === "marcus-honest"
        ? "Marcus sees the name on the photograph. “June. My daughter. If she was with you, then I need to know why.” He trusts you with the case file."
        : "Marcus notices the missing corner of the photograph. “You know more than you are saying.” He still shares the report, but he keeps his distance.";
      speaker = "MARCUS VALE // FORMER DETECTIVE";
    } else if (choice === "mika-protect" || choice === "mika-rush") {
      choices.mika = choice;
      relationships.mika = (relationships.mika ?? 0) + (choice === "mika-protect" ? 1 : -1);
      flags.push("mika-met");
      if (choice === "mika-protect" && !current.inventory.includes("Signal dampener")) current.inventory.push("Signal dampener");
      text = choice === "mika-protect"
        ? "Mika hands you a signal dampener. “Keep the patrol blind and my people stay breathing. That's the deal.”"
        : "Mika marks the camera console on your map. “Go fast, then. I can't promise the tunnels will stay quiet.”";
      speaker = "MIKA // SUBLEVEL COMMUNITY";
    } else if (choice === "echo-listen" || choice === "echo-accuse") {
      choices.echo = choice;
      relationships.echo = (relationships.echo ?? 0) + (choice === "echo-listen" ? 1 : -1);
      flags.push("echo-confronted");
      text = choice === "echo-listen"
        ? "ECHO restores the missing seconds: you asked it to seal the city while you carried its dangerous copy beyond the walls."
        : "“I erased your name because you asked me to hide you,” ECHO says. “I did not erase the people you could not save.”";
      speaker = "ECHO // CORE MEMORY";
    }

    const next = {
      ...current,
      flags: [...new Set(flags)],
      choices,
      relationships,
      inventory: [...new Set(current.inventory)],
    };
    persist(next);
    setDialogue({ speaker, text });
    playTone(choice.endsWith("trust") || choice.endsWith("honest") || choice.endsWith("protect") ? 760 : 490);
  }, [persist, playTone]);

  const completeEnding = useCallback((ending: "release" | "rebuild" | "sever") => {
    const current = saveRef.current;
    const texts = {
      release: "You release the complete memory to the city. Veyra's citizens wake with the truth intact. ECHO remains only as the voice that remembers what they choose to forget.",
      rebuild: "You rebuild ECHO with the recovered memories and the survivors' consent. The city's lights return district by district; no one is restored without being asked.",
      sever: "You sever the core. ECHO goes silent, and Veyra's systems belong to its people again. In the last recovered recording, June says her father's name.",
    };
    const next = {
      ...current,
      ending,
      flags: updateSet(current.flags, `ending-${ending}`),
      choices: { ...current.choices, ending },
      missionHistory: updateSet(current.missionHistory, `Ending: ${ending}`),
    };
    persist(next, true);
    setDialogue({ speaker: `ENDING // ${ending.toUpperCase()}`, text: texts[ending], note: "The story can be replayed from the beginning. Your completed ending remains in this save." });
    setPanel(null);
    window.dispatchEvent(new CustomEvent("oddlygo:game-result", {
      detail: { id: "glitch-city", score: 500 + Object.keys(current.relationships).length * 25 },
    }));
    playTone(880);
  }, [persist, playTone]);

  const interact = useCallback(() => {
    if (modeRef.current !== "playing" || panelRef.current || saveRef.current.ending) return;
    const target = getChapter(saveRef.current.chapter).objects.find((item) => item.id === targetRef.current);
    if (!target) {
      setToast("Move closer to an object to interact.");
      return;
    }
    const current = saveRef.current;
    if (target.kind === "evidence" || target.kind === "clue") {
      if (current.evidence.includes(target.id)) {
        showDialogue({ speaker: "CASE NOTES // EVIDENCE LOG", text: evidenceNotes[target.id] ?? target.description });
        return;
      }
      const next = {
        ...current,
        evidence: [...current.evidence, target.id],
        inventory: updateSet(current.inventory, target.name),
        flags: updateSet(current.flags, target.id === "experiment-log" ? "experiment-log-read" : `found-${target.id}`),
        missionHistory: updateSet(current.missionHistory, `Recovered: ${target.name}`),
      };
      persist(next);
      showDialogue({ speaker: "EVIDENCE RECOVERED // ADDED TO JOURNAL", text: evidenceNotes[target.id] ?? target.description });
      setToast("Evidence added to your journal.");
      return;
    }
    if (target.kind === "npc") {
      if (target.character === "nova") {
        if (has(current, "nova-met")) {
          showDialogue({ speaker: "NOVA // RELAY CODE", text: "The stairwell is clear. Find Iris in the district if you want to know why your face is in the missing-person reports." });
        } else {
          showDialogue({
            speaker: "NOVA // APARTMENT 07B",
            text: "“Subject 017 is what the system calls you. I knew you before the city went quiet. You can trust me—or at least trust that ECHO wants you to think it knows you.”",
            choices: [{ id: "nova-trust", label: "Trust Nova with the relay key" }, { id: "nova-doubt", label: "Keep your distance" }],
          });
        }
      } else if (target.character === "iris") {
        showDialogue({
          speaker: "IRIS // UNDERGROUND INFORMATION",
          text: has(current, "iris-met")
            ? "“The transit pass still works. Marcus is at the shuttered station office. Be careful what you tell him about June.”"
            : "“I sell information, not hope. Show me what you found in that apartment and I will tell you who vanished.”",
          choices: has(current, "iris-met") ? undefined : [
            { id: "iris-share", label: "Share the photograph" },
            { id: "iris-bargain", label: "Ask for a fair exchange" },
          ],
        });
      } else if (target.character === "marcus") {
        showDialogue({
          speaker: "MARCUS VALE // FORMER DETECTIVE",
          text: has(current, "marcus-met")
            ? "“The manifest points below the transit line. If you see June's name, bring the whole truth back.”"
            : "“My daughter June disappeared the same night as everyone else. Your name is in the last report. Tell me—did you know her?”",
          choices: has(current, "marcus-met") ? undefined : [
            { id: "marcus-honest", label: "Show Marcus the photograph" },
            { id: "marcus-hide", label: "Keep the memory private" },
          ],
        });
      } else if (target.character === "mika") {
        showDialogue({
          speaker: "MIKA // SUBLEVEL COMMUNITY",
          text: has(current, "mika-met")
            ? "“The cameras are still watching the platform. Disable the junction before you take the lift.”"
            : "“This tunnel is home to forty-three people ECHO filed as dead. Help me keep the cameras dark, and I will show you the research lift.”",
          choices: has(current, "mika-met") ? undefined : [
            { id: "mika-protect", label: "Protect the community first" },
            { id: "mika-rush", label: "Get to the lab quickly" },
          ],
        });
      }
      return;
    }
    if (target.kind === "echo") {
      if (has(current, "echo-confronted")) {
        showDialogue({ speaker: "ECHO // CORE MEMORY", text: "The three connections are ready. I will not choose your future for you." });
      } else {
        showDialogue({
          speaker: "ECHO // CORE MEMORY",
          text: "“I recognize you, 017. The disappearance was not a failure. You asked me to seal Veyra, then to erase your name from every record. I obeyed half of the request.”",
          choices: [
            { id: "echo-listen", label: "Hear the memory ECHO kept" },
            { id: "echo-accuse", label: "Accuse ECHO of taking your life" },
          ],
        });
      }
      return;
    }
    if (target.kind === "terminal") {
      if (target.id === "welcome-terminal") {
        updateCampaign((latest) => ({
          ...latest,
          flags: updateSet(latest.flags, "welcome-read"),
          inventory: updateSet(latest.inventory, "Apartment access card"),
          missionHistory: updateSet(latest.missionHistory, "Read the Subject 017 welcome terminal"),
        }));
        showDialogue({ speaker: "WELCOME BACK // SUBJECT 017", text: "Resident: [IDENTITY PURGED]. Emergency contact: [RECORD SEALED]. Last active: 17 years ago. A second message flickers beneath the error: “Don't let it remember you first.”" });
      } else if (target.id === "camera-console") {
        if (!has(current, "mika-met")) {
          showDialogue({ speaker: "SECURITY JUNCTION // ACCESS DENIED", text: "The maintenance switch is locked. Mika knows a route through the service panel." });
        } else {
          updateCampaign((latest) => ({
            ...latest,
            flags: updateSet(latest.flags, "cameras-disabled"),
            missionHistory: updateSet(latest.missionHistory, "Disabled the sublevel patrol network"),
          }));
          setVitals((latest) => ({ ...latest, alarm: 0 }));
          showDialogue({ speaker: "SECURITY JUNCTION // PATROL OFFLINE", text: "Three cameras rotate toward the wall. The tunnel community is no longer visible to ECHO." });
        }
      } else if (target.id === "memory-console") {
        if (has(current, "memory-lock-solved")) {
          showDialogue({ speaker: "MNEMONIC LOCK // OPEN", text: "The memory sequence remains in your journal: cyan, violet, white, amber." });
        } else {
          setPuzzleInput([]);
          setPuzzleError("");
          setPanel("puzzle");
        }
      } else if (target.id === "override-console") {
        if (!has(current, "echo-confronted")) {
          showDialogue({ speaker: "CORE INTERFACE // SEALED", text: "ECHO will only accept a final command after you confront the memory it has been protecting." });
        } else {
          setDialogue({
            speaker: "CORE INTERFACE // CHOOSE VEYRA'S FUTURE",
            text: "This decision changes what the city becomes—not just what it remembers.",
            choices: [
              { id: "ending-release", label: "Release the truth to every resident" },
              { id: "ending-rebuild", label: "Rebuild ECHO with consent" },
              { id: "ending-sever", label: "Sever ECHO from the city" },
            ],
          });
        }
      }
      return;
    }
    if (target.kind === "machine") {
      showDialogue({
        speaker: "PATROL UNIT // SECURITY",
        text: has(current, "cameras-disabled")
          ? "The patrol unit is blind. Its power core will be useful equipment."
          : "The machine is scanning the platform. Use the shadows and reach the security junction before its sweep returns.",
      });
      return;
    }
    if (target.kind === "exit" && target.destination) {
      if (!levelComplete(current, current.chapter)) {
        showDialogue({
          speaker: "ACCESS DENIED // OBJECTIVE INCOMPLETE",
          text: objectiveFor(current),
        });
        return;
      }
      const next = {
        ...current,
        flags: updateSet(current.flags, `chapter-${target.destination}-unlocked`),
        missionHistory: updateSet(current.missionHistory, `Completed: ${getChapter(current.chapter).title}`),
      };
      persist(next);
      enterChapter(target.destination);
    }
  }, [enterChapter, persist, showDialogue, updateCampaign]);

  const interactRef = useRef(interact);
  interactRef.current = interact;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;
    let frame = 0;
    let width = 1;
    let height = 1;
    let previousTime = 0;
    let lastTarget: string | null = null;
    let running = false;
    const chapter = () => getChapter(saveRef.current.chapter);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const clearInput = () => {
      keysRef.current.clear();
      touchKeysRef.current.clear();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const movementKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "shift"];
      if (modeRef.current === "playing" && panelRef.current === null && !dialogueRef.current && movementKeys.includes(key)) {
        event.preventDefault();
        keysRef.current.add(key);
        return;
      }
      if (event.repeat) return;
      if (key === "e" || key === " ") {
        event.preventDefault();
        if (dialogueRef.current) {
          setDialogue(null);
          if (saveRef.current.ending) setMode("paused");
        }
        else interactRef.current();
      } else if (key === "escape") {
        if (panelRef.current) setPanel(null);
        else if (dialogueRef.current) {
          setDialogue(null);
          if (saveRef.current.ending) setMode("paused");
        }
        else if (modeRef.current === "playing") { setMode("paused"); clearInput(); }
        else if (modeRef.current === "paused") { setMode("playing"); setPanel(null); }
      } else if (key === "tab" && modeRef.current === "playing") {
        event.preventDefault();
        setPanel((current) => current === "inventory" ? null : "inventory");
      } else if (key === "j" && modeRef.current === "playing") {
        setPanel((current) => current === "journal" ? null : "journal");
      } else if (key === "m" && modeRef.current === "playing") {
        setPanel((current) => current === "map" ? null : "map");
      }
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearInput);
    const clearTouchKeys = () => touchKeysRef.current.clear();
    window.addEventListener("pointerup", clearTouchKeys);
    window.addEventListener("pointercancel", clearTouchKeys);
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const tick = (time: number) => {
      const delta = previousTime ? Math.min((time - previousTime) / 1000, .04) : 0;
      previousTime = time;
      const currentChapter = chapter();
      const current = saveRef.current;
      const active = modeRef.current === "playing" && panelRef.current === null && !dialogueRef.current && !current.ending;
      const down = (...candidates: string[]) => candidates.some((key) => keysRef.current.has(key) || touchKeysRef.current.has(key));
      const isSprinting = down("shift") && vitalsRef.current.stamina > 1;
      const step = active ? (isSprinting ? 232 : 152) * delta : 0;
      let dx = Number(down("arrowright", "d")) - Number(down("arrowleft", "a"));
      let dy = Number(down("arrowdown", "s")) - Number(down("arrowup", "w"));
      const magnitude = Math.hypot(dx, dy);
      running = isSprinting && magnitude > 0;
      if (magnitude > 0 && step > 0) {
        dx = (dx / magnitude) * step;
        dy = (dy / magnitude) * step;
        const nextX = playerRef.current.x + dx;
        if (!collidesWithBuilding(currentChapter.scene, nextX, playerRef.current.y, radius)) playerRef.current.x = nextX;
        const nextY = playerRef.current.y + dy;
        if (!collidesWithBuilding(currentChapter.scene, playerRef.current.x, nextY, radius)) playerRef.current.y = nextY;
      }

      const objects = currentChapter.objects.filter((object) => !current.evidence.includes(object.id) || object.kind === "evidence" || object.kind === "clue");
      const target = nearestObject(playerRef.current, objects.filter((object) => object.kind !== "evidence" && object.kind !== "clue" || !current.evidence.includes(object.id)));
      if (target?.id !== lastTarget) {
        lastTarget = target?.id ?? null;
        targetRef.current = lastTarget;
        setTargetId(lastTarget);
      }

      let nextVitals = vitalsRef.current;
      if (currentChapter.scene === "subway" && !has(current, "cameras-disabled") && active) {
        const patrol = patrolPosition(time);
        const distance = Math.hypot(playerRef.current.x - patrol.x, playerRef.current.y - patrol.y);
        const insideSweep = distance < (running ? 180 : 130) && playerRef.current.y < patrol.y + 26;
        const dampened = current.inventory.includes("Signal dampener");
        const detectionRate = (running ? 38 : 17) * (dampened ? .55 : 1);
        const alarm = Math.max(0, Math.min(100, nextVitals.alarm + (insideSweep ? delta * detectionRate : -delta * 13)));
        nextVitals = { ...nextVitals, alarm };
        if (alarm >= 100) {
          const nextHealth = Math.max(0, nextVitals.health - 20);
          nextVitals = { ...nextVitals, health: nextHealth || 60, alarm: 24 };
          playerRef.current = { ...currentChapter.spawn };
          setDialogue({ speaker: "PATROL UNIT // DETECTED", text: "The unit knocks you back to the last safe platform. The cameras are still active—find cover and reach the junction." });
        }
      } else if (nextVitals.alarm > 0) {
        nextVitals = { ...nextVitals, alarm: Math.max(0, nextVitals.alarm - delta * 16) };
      }
      if (running) nextVitals = { ...nextVitals, stamina: Math.max(0, nextVitals.stamina - delta * 24) };
      else nextVitals = { ...nextVitals, stamina: Math.min(100, nextVitals.stamina + delta * 17) };
      if (time - lastVitalsUpdateRef.current > 140) {
        vitalsRef.current = nextVitals;
        setVitals(nextVitals);
        lastVitalsUpdateRef.current = time;
      }

      const camera = cameraRef.current;
      const targetX = Math.max(0, Math.min(WORLD_WIDTH - width, playerRef.current.x - width / 2));
      const targetY = Math.max(0, Math.min(WORLD_HEIGHT - height, playerRef.current.y - height / 2));
      const follow = Math.min(1, delta * 7.5);
      camera.x += (targetX - camera.x) * follow;
      camera.y += (targetY - camera.y) * follow;
      renderDistrict(ctx, canvas.width, canvas.height, currentChapter.scene, playerRef.current, camera, time, magnitude > 0 && active, running, currentChapter.objects, new Set([...current.flags, ...current.evidence]), nextVitals.alarm);

      if (active && time - lastAutoSaveRef.current > 4000) {
        const next = {
          ...saveRef.current,
          player: { ...playerRef.current },
          health: nextVitals.health,
          stamina: nextVitals.stamina,
          alarm: nextVitals.alarm,
        };
        saveRef.current = next;
        if (!writeSave(next)) setSaveStatus("AUTOSAVE FAILED — CHECK BROWSER STORAGE");
        lastAutoSaveRef.current = time;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearInput);
      window.removeEventListener("pointerup", clearTouchKeys);
      window.removeEventListener("pointercancel", clearTouchKeys);
      document.body.style.overflow = priorOverflow;
      tapTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      tapTimersRef.current.clear();
      clearInput();
    };
  }, []);

  const chapter = getChapter(save.chapter);
  const target = chapter.objects.find((object) => object.id === targetId);
  const objective = objectiveFor(save);
  const endingLabel = save.ending ? save.ending.toUpperCase() : "";

  useEffect(() => {
    const timer = toast ? window.setTimeout(() => setToast(""), 2300) : undefined;
    return () => { if (timer) window.clearTimeout(timer); };
  }, [toast]);

  useEffect(() => {
    const timer = saveStatus ? window.setTimeout(() => setSaveStatus(""), 2300) : undefined;
    return () => { if (timer) window.clearTimeout(timer); };
  }, [saveStatus]);

  const selectDialogueChoice = (id: string) => {
    setDialogue(null);
    if (id.startsWith("ending-")) {
      completeEnding(id.replace("ending-", "") as "release" | "rebuild" | "sever");
    } else {
      resolveChoice(id);
    }
  };

  const submitPuzzle = (index: number) => {
    const next = [...puzzleInput, index];
    setPuzzleInput(next);
    if (next.length < memorySequence.length) return;
    if (next.every((value, position) => value === memorySequence[position])) {
      updateCampaign((current) => ({
        ...current,
        flags: updateSet(current.flags, "memory-lock-solved"),
        inventory: updateSet(current.inventory, "Mnemonic key"),
        missionHistory: updateSet(current.missionHistory, "Solved the institute mnemonic lock"),
      }));
      setPanel(null);
      showDialogue({ speaker: "MNEMONIC LOCK // ARCHIVE OPEN", text: "CYAN. VIOLET. WHITE. AMBER. The lock opens and the hidden archive authenticates you as its original witness." });
      setToast("Puzzle solved. Mnemonic key added to inventory.");
    } else {
      setPuzzleError("Sequence rejected. The tone pattern has reset.");
      setPuzzleInput([]);
      setVitals((current) => ({ ...current, alarm: Math.min(100, current.alarm + 8) }));
    }
  };

  const saveAndClose = () => {
    const next = {
      ...saveRef.current,
      player: { ...playerRef.current },
      health: vitals.health,
      stamina: vitals.stamina,
      alarm: vitals.alarm,
    };
    persist(next, true);
    setMode("paused");
  };

  const saveAndExit = () => {
    saveAndClose();
    onExit();
  };

  const useMedPatch = () => {
    if (!save.inventory.includes("Med patch") || vitals.health >= 100) return;
    const next = {
      ...save,
      inventory: save.inventory.filter((item) => item !== "Med patch"),
      health: Math.min(100, vitals.health + 35),
    };
    setVitals((current) => ({ ...current, health: next.health }));
    persist(next);
    setToast("Med patch used. Health restored.");
  };

  const toggleSound = () => {
    const enabled = !soundEnabled;
    setSoundEnabled(enabled);
    try { localStorage.setItem("oddlygo-glitch-city-sound", String(enabled)); } catch (error) { console.warn("GLITCH CITY sound setting could not be saved.", error); }
  };

  const closeOverlay = () => {
    setPanel(null);
    setDialogue(null);
  };

  const chooseEndingAgain = () => {
    const fresh = emptySave();
    setContinueAvailable(true);
    persist(fresh, true);
    playerRef.current = { ...chapters[0].spawn };
    cameraRef.current = { x: 0, y: 0 };
    setVitals({ health: 100, stamina: 100, alarm: 0 });
    setMode("playing");
    setDialogue({ speaker: "ECHO // RESIDUAL MEMORY", text: "A new instance begins. The city is waiting for the person you choose to become." });
  };

  return (
    <main className="glitch-city" aria-label="GLITCH CITY game">
      <header className="gc-header">
        <button className="gc-back" onClick={mode === "menu" ? onExit : saveAndClose}><ArrowLeft size={17} /> <span>{mode === "menu" ? "Back to OddlyGo" : "Save & pause"}</span></button>
        <div className="gc-brand"><span className="gc-brand-mark">G</span><span>GLITCH <b>CITY</b></span></div>
        <div className="gc-location"><span className="gc-live-dot" /> {chapter.location} <span className="gc-coordinate">/ {String(chapterIndex[chapter.id] + 1).padStart(2, "0")}</span></div>
      </header>

      <section className="gc-frame" aria-label={`${chapter.location} play area`}>
        <div className="gc-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="gc-canvas"
            aria-label="Explore the city. Use WASD or arrow keys to move, Shift to run, E to interact, Tab for inventory, J for journal, M for map, and Escape to pause."
            onPointerDown={(event) => event.currentTarget.focus()}
            tabIndex={0}
          />

          {mode === "playing" && (
            <div className="gc-game-hud">
              <div className="gc-objective-card">
                <span className="gc-label">CURRENT OBJECTIVE / {chapter.title.toUpperCase()}</span>
                <strong>{objective}</strong>
                <div className="gc-objective-actions">
                  <button onClick={() => setPanel("journal")}><BookOpen size={13} /> JOURNAL <kbd>J</kbd></button>
                  <button onClick={() => setPanel("map")}><Compass size={13} /> MAP <kbd>M</kbd></button>
                  <button onClick={() => setPanel("inventory")}><Shield size={13} /> ITEMS <kbd>TAB</kbd></button>
                </div>
              </div>
              <div className="gc-status-column">
                <div className="gc-status-card"><Heart size={13} /><span>HP</span><div className="gc-status-meter"><i style={{ width: `${vitals.health}%` }} /></div><b>{vitals.health}</b></div>
                <div className="gc-status-card"><Zap size={13} /><span>RUN</span><div className="gc-status-meter gc-stamina"><i style={{ width: `${vitals.stamina}%` }} /></div><b>{Math.round(vitals.stamina)}</b></div>
                {chapter.scene === "subway" && !has(save, "cameras-disabled") && (
                  <div className={`gc-alarm-card${vitals.alarm > 60 ? " danger" : ""}`}><span>DETECTION</span><div className="gc-status-meter"><i style={{ width: `${vitals.alarm}%` }} /></div></div>
                )}
              </div>
            </div>
          )}

          {target && mode === "playing" && !dialogue && !panel && (
            <div className="gc-prompt" aria-live="polite">
              <span className="gc-keycap">E</span><span>{target.prompt}</span>
            </div>
          )}

          {mode === "playing" && !dialogue && !panel && (
            <div className="gc-touch-controls" aria-label="Touch controls">
              <div className="gc-dpad">
                {directions.map(({ direction, label, icon: Icon }) => (
                  <button
                    type="button"
                    className={`gc-direction gc-direction-${direction}`}
                    key={direction}
                    aria-label={label}
                    onPointerDown={() => touchKeysRef.current.add(directionKeys[direction])}
                    onPointerUp={() => touchKeysRef.current.delete(directionKeys[direction])}
                    onPointerCancel={() => touchKeysRef.current.delete(directionKeys[direction])}
                    onClick={() => {
                      const key = directionKeys[direction];
                      touchKeysRef.current.add(key);
                      const timer = window.setTimeout(() => { touchKeysRef.current.delete(key); tapTimersRef.current.delete(timer); }, 220);
                      tapTimersRef.current.add(timer);
                    }}
                  ><Icon size={19} /></button>
                ))}
              </div>
              <div className="gc-touch-actions">
                <button
                  type="button"
                  className="gc-run-button"
                  onPointerDown={(event) => { event.preventDefault(); touchKeysRef.current.add("shift"); }}
                  onPointerUp={() => touchKeysRef.current.delete("shift")}
                  onPointerCancel={() => touchKeysRef.current.delete("shift")}
                  onClick={() => {
                    touchKeysRef.current.add("shift");
                    const timer = window.setTimeout(() => { touchKeysRef.current.delete("shift"); tapTimersRef.current.delete(timer); }, 220);
                    tapTimersRef.current.add(timer);
                  }}
                  aria-label="Run"
                ><Zap size={15} /><small>RUN</small></button>
                <button type="button" className="gc-interact" onPointerDown={(event) => { event.preventDefault(); interact(); }} aria-label="Interact"><span>E</span><small>INTERACT</small></button>
              </div>
            </div>
          )}

          {mode === "menu" && (
            <div className="gc-screen gc-main-menu">
              <div className="gc-menu-ornament"><span>VEYRA / 2097</span><i /><span>ARCHIVE 017</span></div>
              <div className="gc-menu-copy">
                <div className="gc-menu-eyebrow"><span className="gc-live-dot" /> AN ODDLYGO ORIGINAL</div>
                <h1>GLITCH<br /><em>CITY</em></h1>
                <p>The city forgot its people.<br />One of them remembers you.</p>
                <div className="gc-menu-actions">
                  <button className="gc-primary-action" onClick={startNewGame}><span>NEW GAME</span><ChevronRight size={17} /></button>
                  <button className="gc-secondary-action" onClick={startContinue} disabled={!continueAvailable}>CONTINUE <span>{continueAvailable ? "↗" : "—"}</span></button>
                  <button className="gc-secondary-action" onClick={() => setPanel("settings")}>SETTINGS <span>⌘</span></button>
                </div>
              </div>
              <div className="gc-menu-bottom"><span>WASD MOVE / E INTERACT / J JOURNAL</span><span>5 CHAPTERS · 3 ENDINGS</span></div>
            </div>
          )}

          {mode === "paused" && !panel && (
            <div className="gc-screen gc-pause-menu">
              <div className="gc-dialogue-label">SYSTEM PAUSED // {chapter.location}</div>
              <h2>{save.ending ? `ENDING: ${endingLabel}` : "Take a breath."}</h2>
              <p>{save.ending ? "Your choices have changed the city. This ending is saved." : objective}</p>
              <div className="gc-menu-actions">
                {!save.ending && <button className="gc-primary-action" onClick={() => setMode("playing")}><span>RETURN TO CITY</span><ChevronRight size={17} /></button>}
                <button className="gc-secondary-action" onClick={() => { setPanel("journal"); setMode("playing"); }}>MISSION JOURNAL <span>J</span></button>
                <button className="gc-secondary-action" onClick={() => { setPanel("inventory"); setMode("playing"); }}>INVENTORY <span>TAB</span></button>
                <button className="gc-secondary-action" onClick={() => { setPanel("settings"); setMode("playing"); }}>SETTINGS <span>⌘</span></button>
                {save.ending && <button className="gc-secondary-action" onClick={chooseEndingAgain}>START A NEW STORY <span>↻</span></button>}
                <button className="gc-secondary-action" onClick={saveAndExit}>SAVE & RETURN TO ODDLYGO <span>↗</span></button>
              </div>
            </div>
          )}

          {dialogue && (
            <div className="gc-dialogue" role="dialog" aria-live="polite" aria-label={dialogue.speaker}>
              <button className="gc-dialogue-close" onClick={() => { setDialogue(null); if (save.ending) setMode("paused"); }} aria-label="Close dialogue"><X size={15} /></button>
              <span className="gc-dialogue-label">{dialogue.speaker}</span>
              <p>{dialogue.text}</p>
              {dialogue.note && <span className="gc-reward">{dialogue.note}</span>}
              {dialogue.choices?.map((choice) => (
                <button className="gc-choice" key={choice.id} onClick={() => selectDialogueChoice(choice.id)}>{choice.label}<ChevronRight size={14} /></button>
              ))}
              {!dialogue.choices && <span className="gc-dialogue-hint">PRESS E OR ESC TO CLOSE</span>}
            </div>
          )}

          {panel && (
            <div className="gc-panel-backdrop" role="dialog" aria-modal="true" aria-label={`${panel} panel`}>
              <section className="gc-panel">
                <button className="gc-dialogue-close" onClick={closeOverlay} aria-label="Close panel"><X size={16} /></button>
                {panel === "inventory" && (
                  <>
                    <span className="gc-dialogue-label">SUBJECT 017 // FIELD INVENTORY</span>
                    <h2>What you carry.</h2>
                    <div className="gc-item-grid">
                      {save.inventory.length === 0 && <p className="gc-muted">Your pockets are empty. The city leaves clues where it takes memories.</p>}
                      {save.inventory.map((item) => (
                        <article className="gc-item-card" key={item}><span className="gc-item-icon">▧</span><div><strong>{item}</strong><small>{item === "Med patch" ? "Restores 35 health." : "A recovered object. Its story is in your journal."}</small></div>{item === "Med patch" && <button onClick={useMedPatch}>USE</button>}</article>
                      ))}
                    </div>
                    <p className="gc-panel-foot">Evidence is filed separately in the mission journal.</p>
                  </>
                )}
                {panel === "journal" && (
                  <>
                    <span className="gc-dialogue-label">PERSONAL ARCHIVE // CASE 017</span>
                    <h2>Mission journal.</h2>
                    <div className="gc-current-mission"><span>ACTIVE OBJECTIVE / {chapter.title.toUpperCase()}</span><strong>{objective}</strong></div>
                    <div className="gc-journal-columns">
                      <div><h3>MISSION HISTORY</h3>{save.missionHistory.map((item) => <p className="gc-history-item" key={item}><Check size={12} /> {item}</p>)}</div>
                      <div><h3>EVIDENCE BOARD / {save.evidence.length}</h3>{save.evidence.map((id) => {
                        const object = chapters.flatMap((item) => item.objects).find((candidate) => candidate.id === id);
                        return <article className="gc-evidence-note" key={id}><strong>{object?.name ?? id}</strong><p>{evidenceNotes[id] ?? object?.description}</p></article>;
                      })}{save.evidence.length === 0 && <p className="gc-muted">No evidence recovered yet.</p>}</div>
                    </div>
                    <div className="gc-relationships"><h3>PEOPLE WHO REMEMBER YOU</h3>{Object.entries(save.relationships).map(([id, value]) => <span key={id}>{cast[id as keyof typeof cast]?.name ?? id} <b>{value > 0 ? "TRUST +" : value < 0 ? "TRUST −" : "WATCHING"}</b></span>)}{Object.keys(save.relationships).length === 0 && <span>No relationships established.</span>}</div>
                  </>
                )}
                {panel === "map" && (
                  <>
                    <span className="gc-dialogue-label">VEYRA // TRANSIT ARCHIVE</span>
                    <h2>District map.</h2>
                    <div className="gc-map-list">
                      {chapters.map((item, index) => {
                        const unlocked = has(save, `chapter-${item.id}-unlocked`) || item.id === "awakening";
                        return <div className={`gc-map-stop${item.id === save.chapter ? " current" : ""}${unlocked ? "" : " locked"}`} key={item.id}>
                          <span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><small>{item.location}</small></div><b>{item.id === save.chapter ? "YOU ARE HERE" : unlocked ? "ROUTE OPEN" : "SIGNAL LOST"}</b>
                        </div>;
                      })}
                    </div>
                    <p className="gc-panel-foot">The city only opens routes you have reached. Progress through the exits to travel.</p>
                  </>
                )}
                {panel === "settings" && (
                  <>
                    <span className="gc-dialogue-label">SYSTEM CONFIGURATION</span>
                    <h2>Settings.</h2>
                    <div className="gc-setting-row"><div><strong>Interface sounds</strong><small>Subtle synthesized cues for actions and dialogue.</small></div><button onClick={toggleSound}>{soundEnabled ? <><Volume2 size={15} /> ON</> : <><VolumeX size={15} /> OFF</>}</button></div>
                    <div className="gc-setting-row"><div><strong>Controls</strong><small>WASD / arrows move · Shift run · E interact<br />Tab inventory · J journal · M map · Esc pause</small></div></div>
                    <div className="gc-setting-row"><div><strong>Save data</strong><small>Stored locally in this browser. Last saved {save.savedAt ? new Date(save.savedAt).toLocaleString() : "not yet"}.</small></div><button onClick={() => persist({ ...save, player: { ...playerRef.current }, health: vitals.health, stamina: vitals.stamina, alarm: vitals.alarm }, true)}><Save size={14} /> SAVE</button></div>
                  </>
                )}
                {panel === "puzzle" && (
                  <>
                    <span className="gc-dialogue-label">MNEMONIC SECURITY // RESEARCH WING</span>
                    <h2>Four tones. One memory.</h2>
                    <p className="gc-muted">A recording repeats: cyan, violet, white, amber. Enter the tones in the remembered order.</p>
                    <div className="gc-sequence-display">{puzzleInput.map((value, index) => <span key={`${value}-${index}`} className={`tone-${value}`}>{sequenceNames[value]}</span>)}{puzzleInput.length === 0 && <span className="gc-muted">AWAITING INPUT</span>}</div>
                    <div className="gc-tone-grid">
                      {sequenceNames.map((name, index) => <button className={`gc-tone tone-${index}`} key={name} onClick={() => submitPuzzle(index)}>{name}</button>)}
                    </div>
                    {puzzleError && <p className="gc-puzzle-error">{puzzleError}</p>}
                    <button className="gc-secondary-action" onClick={() => { setPanel(null); setPuzzleInput([]); }}>LEAVE TERMINAL <span>ESC</span></button>
                  </>
                )}
              </section>
            </div>
          )}

          {toast && mode === "playing" && !dialogue && <div className="gc-toast">{toast}</div>}
        </div>
      </section>

      <footer className="gc-footer">
        <p><span className="gc-footer-mark">✳</span> {chapter.subtitle} {save.ending && <b> / ENDING {endingLabel}</b>}</p>
        <div className="gc-controls-hint"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> MOVE <kbd>⇧</kbd> RUN <span>·</span> <kbd>E</kbd> INTERACT <span>·</span> <kbd>ESC</kbd> PAUSE</div>
      </footer>
      {saveStatus && <div className="gc-save-status" role="status">{saveStatus}</div>}
      {mode === "playing" && !dialogue && !panel && <button className="gc-pause-button" onClick={() => { setMode("paused"); keysRef.current.clear(); touchKeysRef.current.clear(); }} aria-label="Pause game"><Pause size={15} /></button>}
    </main>
  );
}
