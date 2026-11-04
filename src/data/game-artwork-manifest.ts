import { experiences } from "./experiences";

const visualStyles: Record<string, string> = {
  Play: "a legible gameplay moment with a clear focal subject and cinematic depth",
  Discover: "an evocative place or unexpected internet artifact framed as an editorial travel photograph",
  Experiment: "an elegant scientific or generative-art composition with precise light and material",
  Create: "a tactile, expressive art-making scene with carefully composed color and texture",
};

const sharedDirection = [
  "Create original premium game-concept artwork for a sophisticated dark digital-playground storefront.",
  "Wide 3:2 landscape composition, designed to crop cleanly to a 2:1 horizontal card.",
  "Distinctive subject, cinematic directional lighting, rich material detail, deep charcoal shadows, restrained warm amber accents, subtle cool color accents.",
  "Keep the main subject in the central 70 percent of frame with readable silhouette and strong foreground-to-background separation.",
  "No text, lettering, logos, interface elements, borders, watermarks, or copied existing artwork.",
].join(" ");

export const gameArtworkManifest = Object.fromEntries(
  experiences.map((experience) => {
    const focus = `${experience.title}: ${experience.description}`;
    const tags = experience.tags.length ? `Relevant motifs: ${experience.tags.join(", ")}.` : "";
    return [
      experience.id,
      {
        status: "pending-generation" as "pending-generation" | "ready",
        path: `/images/games/${experience.id}.webp`,
        alt: `${experience.title} — ${experience.description}`,
        prompt: `${sharedDirection} Depict the actual experience, not a generic game scene. ${visualStyles[experience.category]} for the category ${experience.category}. Subject: ${focus} ${tags}`,
      },
    ];
  }),
);
