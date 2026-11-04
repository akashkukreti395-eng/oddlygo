export type ChapterId = "awakening" | "neon" | "below-zero" | "forgotten" | "override";
export type SceneId = "apartment" | "neon-district" | "subway" | "research-lab" | "central-tower";
export type ObjectKind = "npc" | "evidence" | "terminal" | "exit" | "machine" | "clue" | "echo";

export type WorldObject = {
  id: string;
  name: string;
  kind: ObjectKind;
  x: number;
  y: number;
  prompt: string;
  description: string;
  character?: "nova" | "iris" | "marcus" | "mika" | "echo";
  destination?: ChapterId;
};

export type Chapter = {
  id: ChapterId;
  title: string;
  location: string;
  subtitle: string;
  scene: SceneId;
  spawn: { x: number; y: number };
  objects: WorldObject[];
  objective: string;
};

export type CampaignSave = {
  version: 1;
  chapter: ChapterId;
  player: { x: number; y: number };
  flags: string[];
  inventory: string[];
  evidence: string[];
  choices: Record<string, string>;
  relationships: Record<string, number>;
  missionHistory: string[];
  health: number;
  stamina: number;
  alarm: number;
  ending?: string;
  savedAt: number;
};

export const SAVE_KEY = "oddlygo-glitch-city-save";

export const chapters: Chapter[] = [
  {
    id: "awakening",
    title: "The Awakening",
    location: "APARTMENT 07B",
    subtitle: "VEYRA // RESIDENTIAL STACK 09",
    scene: "apartment",
    spawn: { x: 230, y: 680 },
    objective: "Read the terminal and recover a trace of your erased identity.",
    objects: [
      { id: "welcome-terminal", name: "Apartment terminal", kind: "terminal", x: 370, y: 360, prompt: "Read the terminal", description: "A personal welcome terminal, still warm despite the years of dust." },
      { id: "old-photograph", name: "Water-damaged photograph", kind: "evidence", x: 600, y: 550, prompt: "Examine the photograph", description: "A photograph of a child beside a flooded street. The face is yours; the date is impossible." },
      { id: "nova-awakening", name: "Nova", kind: "npc", character: "nova", x: 875, y: 340, prompt: "Speak with the stranger", description: "A hacker with a cracked visor and a familiar hesitation." },
      { id: "neighbor-door", name: "Service stairwell", kind: "exit", destination: "neon", x: 1110, y: 730, prompt: "Unlock the service stairwell", description: "The door opens onto a city that should no longer exist." },
    ],
  },
  {
    id: "neon",
    title: "Neon District",
    location: "VEYRA // NEON DISTRICT",
    subtitle: "RAIN WARNING / TRANSIT OFFLINE",
    scene: "neon-district",
    spawn: { x: 770, y: 720 },
    objective: "Find Iris and Marcus. Decide whose version of the missing-person case to trust.",
    objects: [
      { id: "iris-shop", name: "Iris's information stall", kind: "npc", character: "iris", x: 430, y: 500, prompt: "Talk to Iris", description: "An information broker selling the stories the city tried to delete." },
      { id: "marcus-case", name: "Marcus Vale", kind: "npc", character: "marcus", x: 1050, y: 340, prompt: "Talk to Marcus", description: "A former investigator carrying a missing-person file with one name scratched out." },
      { id: "missing-file", name: "Missing-person report", kind: "evidence", x: 1020, y: 600, prompt: "Examine the case file", description: "The report names Subject 017 as the last person seen with the vanished residents." },
      { id: "night-owl-clue", name: "Night Owl jukebox", kind: "clue", x: 250, y: 240, prompt: "Listen to the corrupted recording", description: "A voice on a damaged club recording calls the player by a name that is not Subject 017." },
      { id: "subway-gate", name: "Flooded subway entrance", kind: "exit", destination: "below-zero", x: 770, y: 165, prompt: "Enter the maintenance stairs", description: "The city signal points down, beneath the old transit lines." },
    ],
  },
  {
    id: "below-zero",
    title: "Below Zero",
    location: "VEYRA // MAINTENANCE LINE",
    subtitle: "SUBLEVEL 04 / CAMERAS ACTIVE",
    scene: "subway",
    spawn: { x: 210, y: 700 },
    objective: "Find Mika's survivors, recover the transit manifest, and disable the patrol network.",
    objects: [
      { id: "mika-community", name: "Mika", kind: "npc", character: "mika", x: 300, y: 480, prompt: "Speak with the tunnel guide", description: "A tunnel guide who built a home from the people the city forgot." },
      { id: "transit-manifest", name: "Evacuation manifest", kind: "evidence", x: 710, y: 250, prompt: "Recover the manifest", description: "The evacuation list shows residents were transferred to a research facility, not lost." },
      { id: "camera-console", name: "Security junction", kind: "terminal", x: 1080, y: 490, prompt: "Disable the patrol cameras", description: "A maintenance console controls the security machines and their detection grid." },
      { id: "lab-gate", name: "Research lift", kind: "exit", destination: "forgotten", x: 1110, y: 730, prompt: "Take the research lift", description: "A service elevator descends toward ECHO's sealed memory program." },
    ],
  },
  {
    id: "forgotten",
    title: "The Forgotten",
    location: "VEYRA // MEMORY INSTITUTE",
    subtitle: "AUTHORIZED STAFF ONLY",
    scene: "research-lab",
    spawn: { x: 200, y: 700 },
    objective: "Solve the memory-sequence lock and expose what the institute did to its residents.",
    objects: [
      { id: "experiment-log", name: "Experiment 017 log", kind: "evidence", x: 350, y: 300, prompt: "Read the experiment log", description: "The record shows Subject 017 volunteered to carry a copy of ECHO outside the city." },
      { id: "memory-console", name: "Mnemonic sequence lock", kind: "terminal", x: 650, y: 475, prompt: "Solve the sequence lock", description: "Four memory tones form the key. A failed attempt resets the sequence." },
      { id: "glass-memory", name: "Memory archive", kind: "evidence", x: 930, y: 300, prompt: "Open the memory archive", description: "A preserved recording reveals who chose the city's disappearance." },
      { id: "tower-elevator", name: "Central tower lift", kind: "exit", destination: "override", x: 1110, y: 730, prompt: "Enter the central tower", description: "The last access lift waits beyond the institute's glass doors." },
    ],
  },
  {
    id: "override",
    title: "System Override",
    location: "VEYRA // CENTRAL TOWER",
    subtitle: "ECHO CORE / CONNECTION UNSTABLE",
    scene: "central-tower",
    spawn: { x: 220, y: 700 },
    objective: "Confront ECHO and choose what becomes of Veyra.",
    objects: [
      { id: "echo-core", name: "ECHO", kind: "echo", character: "echo", x: 680, y: 430, prompt: "Speak with ECHO", description: "The city's intelligence speaks with a voice from a life the player no longer remembers." },
      { id: "override-console", name: "Core decision interface", kind: "terminal", x: 960, y: 430, prompt: "Choose the city's future", description: "Three live connections wait: release, rebuild, or sever." },
    ],
  },
];

export const emptySave = (): CampaignSave => ({
  version: 1,
  chapter: "awakening",
  player: { ...chapters[0].spawn },
  flags: [],
  inventory: ["Med patch"],
  evidence: [],
  choices: {},
  relationships: {},
  missionHistory: [],
  health: 100,
  stamina: 100,
  alarm: 0,
  savedAt: Date.now(),
});

export function getChapter(id: ChapterId) {
  return chapters.find((chapter) => chapter.id === id) ?? chapters[0];
}

export function readSave(): CampaignSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const save = value as Partial<CampaignSave>;
    if (
      save.version !== 1 ||
      !chapters.some((chapter) => chapter.id === save.chapter) ||
      !save.player ||
      !Number.isFinite(save.player.x) ||
      !Number.isFinite(save.player.y) ||
      !Array.isArray(save.flags) ||
      !Array.isArray(save.inventory) ||
      !Array.isArray(save.evidence) ||
      !Array.isArray(save.missionHistory)
    ) return null;
    return {
      ...emptySave(),
      ...save,
      player: { x: save.player.x, y: save.player.y },
      flags: save.flags.filter((item): item is string => typeof item === "string"),
      inventory: save.inventory.filter((item): item is string => typeof item === "string"),
      evidence: save.evidence.filter((item): item is string => typeof item === "string"),
      missionHistory: save.missionHistory.filter((item): item is string => typeof item === "string"),
      choices: save.choices && typeof save.choices === "object" ? save.choices : {},
      relationships: save.relationships && typeof save.relationships === "object" ? save.relationships : {},
    };
  } catch {
    console.warn("GLITCH CITY save data could not be read.");
    return null;
  }
}

export function writeSave(save: CampaignSave) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...save, savedAt: Date.now() }));
    return true;
  } catch {
    console.warn("GLITCH CITY save data could not be written.");
    return false;
  }
}

export function objectiveFor(save: CampaignSave) {
  if (save.ending) return "The city has chosen a future. Your story is complete.";
  if (save.chapter === "awakening") {
    if (!save.flags.includes("welcome-read")) return "Read the terminal in apartment 07B.";
    if (!save.evidence.includes("old-photograph")) return "Find something that proves this apartment belonged to you.";
    if (!save.flags.includes("nova-met")) return "Speak to the stranger waiting by the apartment door.";
    return "Unlock the service stairwell and escape the residential stack.";
  }
  if (save.chapter === "neon") {
    if (!save.flags.includes("iris-met")) return "Ask Iris what she knows about the vanished residents.";
    if (!save.flags.includes("marcus-met")) return "Hear Marcus's account of his missing daughter.";
    if (!save.evidence.includes("missing-file")) return "Recover the missing-person report from the station.";
    return "Use the maintenance entrance to follow the residents' trail.";
  }
  if (save.chapter === "below-zero") {
    if (!save.flags.includes("mika-met")) return "Find the hidden community beneath the transit line.";
    if (!save.evidence.includes("transit-manifest")) return "Recover the evacuation manifest from the platform.";
    if (!save.flags.includes("cameras-disabled")) return "Disable the patrol cameras before entering the lift.";
    return "Take the research lift into the memory institute.";
  }
  if (save.chapter === "forgotten") {
    if (!save.flags.includes("experiment-log-read")) return "Read the institute's Subject 017 experiment log.";
    if (!save.flags.includes("memory-lock-solved")) return "Solve the mnemonic sequence lock.";
    if (!save.evidence.includes("glass-memory")) return "Open the archive and face the recovered memory.";
    return "Take the central tower lift.";
  }
  if (!save.flags.includes("echo-confronted")) return "Confront ECHO about the night Veyra disappeared.";
  return "Choose the city's future at the core interface.";
}

export const cast: Record<NonNullable<WorldObject["character"]>, { name: string; tone: string }> = {
  nova: { name: "NOVA", tone: "A guarded hacker who knows more about Subject 017 than she admits." },
  iris: { name: "IRIS", tone: "An information broker who keeps the city's erased stories alive." },
  marcus: { name: "MARCUS VALE", tone: "A former investigator looking for his missing daughter, June." },
  mika: { name: "MIKA", tone: "A practical tunnel guide protecting a community beneath the city." },
  echo: { name: "ECHO", tone: "The intelligence that remembers the life Subject 017 was made to forget." },
};

export const evidenceNotes: Record<string, string> = {
  "old-photograph": "A rain-soaked child beside a flooded street. The reverse reads: 'June & 017 — Veyra, before the wall.'",
  "missing-file": "The missing-person report lists June Vale among the disappeared. Subject 017 was the last person recorded with her.",
  "night-owl-clue": "A corrupted club recording catches a voice whispering: 'Nova, the copy is still with them.'",
  "transit-manifest": "Residents were transferred to the Veyra Memory Institute on the night the city went offline.",
  "experiment-log": "Subject 017 volunteered as a living bridge for ECHO. The city seal was initiated by Subject 017, not by the AI.",
  "glass-memory": "The recovered memory shows 017 asking ECHO to isolate Veyra while a dangerous copy of the AI was contained inside them.",
};
