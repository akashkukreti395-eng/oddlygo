import type { SceneId, WorldObject } from "./campaign";

export const TILE_SIZE = 32;
export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 896;

export type Point = { x: number; y: number };

type Theme = {
  floor: string;
  floorAlt: string;
  wall: string;
  trim: string;
  light: string;
  glow: string;
  map: string;
};

const themes: Record<SceneId, Theme> = {
  apartment: { floor: "#30323d", floorAlt: "#383a45", wall: "#505260", trim: "#8e7590", light: "#ff92d2", glow: "#6d465f", map: "07B" },
  "neon-district": { floor: "#30333b", floorAlt: "#383a42", wall: "#414653", trim: "#687a8e", light: "#66e4e0", glow: "#374955", map: "NIGHT OWL" },
  subway: { floor: "#252c34", floorAlt: "#2c343b", wall: "#414951", trim: "#68737a", light: "#d5bc83", glow: "#4b5360", map: "LINE 04" },
  "research-lab": { floor: "#293440", floorAlt: "#303d4a", wall: "#566371", trim: "#70d5db", light: "#8cf5e8", glow: "#355a68", map: "INSTITUTE" },
  "central-tower": { floor: "#212738", floorAlt: "#282e41", wall: "#42495f", trim: "#8797bd", light: "#c395ff", glow: "#4f3d71", map: "ECHO CORE" },
};

const obstacles: Record<SceneId, Array<{ x: number; y: number; width: number; height: number }>> = {
  apartment: [
    { x: 132, y: 170, width: 220, height: 110 },
    { x: 420, y: 200, width: 138, height: 88 },
    { x: 638, y: 170, width: 142, height: 96 },
    { x: 136, y: 532, width: 178, height: 68 },
    { x: 412, y: 532, width: 128, height: 72 },
    { x: 638, y: 532, width: 144, height: 76 },
  ],
  "neon-district": [
    { x: 38, y: 52, width: 225, height: 172 },
    { x: 365, y: 48, width: 230, height: 154 },
    { x: 1002, y: 54, width: 235, height: 164 },
    { x: 42, y: 662, width: 220, height: 184 },
    { x: 370, y: 682, width: 214, height: 160 },
    { x: 1000, y: 666, width: 230, height: 180 },
  ],
  subway: [
    { x: 50, y: 80, width: 200, height: 90 },
    { x: 332, y: 74, width: 176, height: 92 },
    { x: 630, y: 74, width: 184, height: 92 },
    { x: 958, y: 76, width: 248, height: 94 },
    { x: 70, y: 750, width: 196, height: 94 },
    { x: 420, y: 746, width: 182, height: 100 },
    { x: 734, y: 748, width: 170, height: 96 },
    { x: 1014, y: 742, width: 190, height: 102 },
  ],
  "research-lab": [
    { x: 44, y: 78, width: 220, height: 116 },
    { x: 356, y: 82, width: 164, height: 112 },
    { x: 766, y: 80, width: 170, height: 114 },
    { x: 1000, y: 80, width: 236, height: 116 },
    { x: 46, y: 710, width: 194, height: 132 },
    { x: 386, y: 708, width: 170, height: 136 },
    { x: 758, y: 710, width: 188, height: 132 },
    { x: 1008, y: 702, width: 224, height: 140 },
  ],
  "central-tower": [
    { x: 48, y: 78, width: 216, height: 120 },
    { x: 1010, y: 76, width: 222, height: 122 },
    { x: 70, y: 704, width: 206, height: 138 },
    { x: 1000, y: 700, width: 224, height: 140 },
  ],
};

const hash = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

export function collidesWithBuilding(scene: SceneId, x: number, y: number, radius: number) {
  if (x < 38 + radius || y < 38 + radius || x > WORLD_WIDTH - 38 - radius || y > WORLD_HEIGHT - 38 - radius) return true;
  return obstacles[scene].some((obstacle) =>
    x + radius > obstacle.x - 4 &&
    x - radius < obstacle.x + obstacle.width + 4 &&
    y + radius > obstacle.y - 4 &&
    y - radius < obstacle.y + obstacle.height + 4
  );
}

export function nearestObject(player: Point, objects: WorldObject[]): WorldObject | null {
  let nearest: WorldObject | null = null;
  let nearestDistance = 54;
  for (const object of objects) {
    const distance = Math.hypot(player.x - object.x, player.y - object.y);
    if (distance < nearestDistance) {
      nearest = object;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function patrolPosition(time: number): Point {
  return { x: 780 + Math.sin(time / 1550) * 265, y: 500 + Math.cos(time / 1900) * 105 };
}

function drawFloor(ctx: CanvasRenderingContext2D, scene: SceneId, time: number) {
  const theme = themes[scene];
  for (let y = 0; y < WORLD_HEIGHT; y += TILE_SIZE) {
    for (let x = 0; x < WORLD_WIDTH; x += TILE_SIZE) {
      const variation = hash(x / TILE_SIZE, y / TILE_SIZE);
      ctx.fillStyle = variation > .52 ? theme.floor : theme.floorAlt;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = "rgba(10, 13, 19, .2)";
      ctx.fillRect(x, y, TILE_SIZE, 2);
      ctx.fillRect(x, y, 2, TILE_SIZE);
      ctx.fillStyle = "rgba(6, 9, 15, .26)";
      ctx.fillRect(x + TILE_SIZE - 2, y + 2, 1, TILE_SIZE - 3);
      ctx.fillRect(x + 2, y + TILE_SIZE - 2, TILE_SIZE - 3, 1);
      if (variation > .94) {
        ctx.fillStyle = theme.trim;
        ctx.globalAlpha = .35;
        ctx.fillRect(x + 7, y + 17, 7, 2);
        ctx.globalAlpha = 1;
      }
      if (scene === "neon-district" && variation < .018) {
        ctx.fillStyle = `rgba(119, 231, 234, ${.06 + Math.sin(time / 700 + x) * .025})`;
        ctx.fillRect(x + 3, y + 25, 26, 2);
      }
    }
  }
}

function drawObstacle(ctx: CanvasRenderingContext2D, scene: SceneId, obstacle: { x: number; y: number; width: number; height: number }, time: number) {
  const theme = themes[scene];
  const { x, y, width, height } = obstacle;
  ctx.fillStyle = "rgba(6, 8, 14, .52)";
  ctx.fillRect(x + 8, y + 12, width, height);
  ctx.fillStyle = theme.wall;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = "#1a202b";
  ctx.fillRect(x + 7, y + 7, width - 14, height - 14);
  ctx.fillStyle = theme.trim;
  ctx.globalAlpha = .65;
  ctx.fillRect(x + 4, y + 4, width - 8, 4);
  ctx.fillRect(x + 4, y + 4, 4, height - 8);
  ctx.globalAlpha = 1;

  if (scene === "neon-district") {
    const count = Math.max(2, Math.floor(width / 48));
    for (let i = 0; i < count; i++) {
      const wx = x + 17 + i * ((width - 40) / count);
      ctx.fillStyle = "#121923";
      ctx.fillRect(wx, y + 24, 24, 26);
      ctx.fillStyle = theme.light;
      ctx.globalAlpha = .52 + .35 * Math.sin(time / 550 + i + x);
      ctx.fillRect(wx + 4, y + 30, 4, 13);
      ctx.fillRect(wx + 11, y + 29, 8, 15);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "#101720";
    ctx.fillRect(x + width / 2 - 40, y + height - 22, 80, 18);
    ctx.strokeStyle = theme.light;
    ctx.globalAlpha = .68;
    ctx.strokeRect(x + width / 2 - 39.5, y + height - 21.5, 79, 17);
    ctx.fillStyle = theme.light;
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText(width > 220 ? "VEYRA // OPEN" : "NO SIGNAL", x + width / 2, y + height - 10);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = "#161d26";
    ctx.fillRect(x + 17, y + 18, width - 34, 20);
    ctx.fillStyle = theme.light;
    ctx.globalAlpha = .68 + .2 * Math.sin(time / 620 + x);
    ctx.fillRect(x + 22, y + 23, width - 44, 2);
    ctx.globalAlpha = 1;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "#191f29";
      ctx.fillRect(x + 18 + i * 28, y + 51, 18, 12);
      ctx.fillStyle = theme.trim;
      ctx.globalAlpha = .34;
      ctx.fillRect(x + 21 + i * 28, y + 54, 12, 2);
      ctx.globalAlpha = 1;
    }
  }
}

function drawApartment(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = "#1b202b";
  ctx.fillRect(150, 300, 180, 160);
  ctx.fillStyle = "#566072";
  ctx.fillRect(142, 288, 196, 16);
  ctx.fillStyle = "#222936";
  ctx.fillRect(164, 312, 150, 130);
  ctx.fillStyle = "#7a697d";
  ctx.fillRect(172, 320, 134, 5);
  ctx.fillStyle = "#332b37";
  ctx.fillRect(180, 334, 116, 95);
  ctx.fillStyle = "#896d86";
  ctx.fillRect(180, 334, 116, 8);
  ctx.fillStyle = "#ba899d";
  ctx.fillRect(188, 346, 35, 18);
  ctx.fillStyle = "#30394c";
  ctx.fillRect(230, 346, 57, 78);

  ctx.fillStyle = "#222936";
  ctx.fillRect(416, 265, 132, 86);
  ctx.fillStyle = "#596174";
  ctx.fillRect(408, 257, 148, 9);
  ctx.fillStyle = "#29313f";
  ctx.fillRect(426, 277, 112, 62);
  ctx.fillStyle = "#81dbd5";
  ctx.globalAlpha = .72 + .2 * Math.sin(time / 300);
  ctx.fillRect(439, 287, 85, 3);
  ctx.fillRect(439, 299, 64, 2);
  ctx.fillRect(439, 309, 73, 2);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#191e28";
  ctx.fillRect(672, 190, 132, 88);
  ctx.fillStyle = "#798098";
  ctx.fillRect(666, 184, 144, 7);
  ctx.fillStyle = "#29394a";
  ctx.fillRect(680, 198, 116, 72);
  ctx.fillStyle = "#5ba2b0";
  ctx.globalAlpha = .56 + .2 * Math.sin(time / 700);
  ctx.fillRect(690, 208, 96, 48);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffb5d9";
  ctx.fillRect(718, 226, 4, 4);

  ctx.fillStyle = "#1b2028";
  ctx.fillRect(166, 582, 270, 18);
  ctx.fillStyle = "#676578";
  ctx.fillRect(164, 574, 274, 7);
  ctx.fillStyle = "#a98091";
  ctx.fillRect(185, 601, 3, 22);
  ctx.fillRect(415, 601, 3, 22);
}

function drawCity(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = "#252a33";
  ctx.fillRect(0, 407, WORLD_WIDTH, 112);
  ctx.fillRect(586, 0, 108, WORLD_HEIGHT);
  ctx.fillStyle = "#565449";
  for (let x = 0; x < WORLD_WIDTH; x += 74) ctx.fillRect(x + 11, 460, 28, 3);
  for (let y = 0; y < WORLD_HEIGHT; y += 74) ctx.fillRect(638, y + 12, 3, 26);
  ctx.fillStyle = "#45454b";
  ctx.fillRect(0, 402, WORLD_WIDTH, 4);
  ctx.fillRect(0, 520, WORLD_WIDTH, 4);
  ctx.fillRect(580, 0, 4, WORLD_HEIGHT);
  ctx.fillRect(696, 0, 4, WORLD_HEIGHT);
  ctx.fillStyle = "#151a22";
  for (const x of [300, 480, 812, 958]) {
    ctx.fillRect(x, 355, 4, 30);
    ctx.fillStyle = "#77746c";
    ctx.fillRect(x - 9, 348, 22, 5);
    ctx.fillStyle = "#151a22";
    const alpha = .78 + .15 * Math.sin(time / 300 + x);
    ctx.fillStyle = `rgba(255, 202, 130, ${alpha})`;
    ctx.fillRect(x - 5, 350, 13, 2);
    ctx.fillStyle = "#151a22";
  }
}

function drawSubway(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = "#171e28";
  ctx.fillRect(0, 366, WORLD_WIDTH, 194);
  ctx.fillStyle = "#5b6161";
  ctx.fillRect(0, 362, WORLD_WIDTH, 5);
  ctx.fillRect(0, 559, WORLD_WIDTH, 5);
  ctx.fillStyle = "#b5a377";
  ctx.fillRect(0, 382, WORLD_WIDTH, 3);
  ctx.fillRect(0, 540, WORLD_WIDTH, 3);
  ctx.fillStyle = "#545355";
  for (let x = 0; x < WORLD_WIDTH; x += 64) ctx.fillRect(x, 378, 6, 170);
  ctx.fillStyle = "#6b6b64";
  ctx.fillRect(0, 345, WORLD_WIDTH, 13);
  ctx.fillStyle = "#262b31";
  ctx.fillRect(0, 350, WORLD_WIDTH, 3);
  ctx.fillStyle = "#d0b77d";
  ctx.globalAlpha = .7 + .24 * Math.sin(time / 340);
  for (let x = 70; x < WORLD_WIDTH; x += 206) {
    ctx.fillRect(x, 292, 34, 3);
    ctx.fillRect(x + 10, 295, 3, 28);
  }
  ctx.globalAlpha = 1;
}

function drawLab(ctx: CanvasRenderingContext2D, time: number) {
  for (const x of [290, 830]) {
    ctx.fillStyle = "#202c38";
    ctx.fillRect(x, 230, 150, 302);
    ctx.fillStyle = "#526c78";
    ctx.fillRect(x + 7, 237, 136, 5);
    ctx.fillRect(x + 7, 522, 136, 5);
    ctx.fillStyle = "#385666";
    ctx.globalAlpha = .35 + .1 * Math.sin(time / 400 + x);
    ctx.fillRect(x + 12, 248, 126, 263);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#79d6d8";
    ctx.globalAlpha = .6;
    ctx.fillRect(x + 18, 256, 2, 247);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#a1f8e7";
    ctx.globalAlpha = .72 + .2 * Math.sin(time / 320 + x);
    ctx.fillRect(x + 70, 286, 12, 2);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = "#17202a";
  ctx.fillRect(552, 210, 172, 28);
  ctx.fillStyle = "#83e2df";
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.fillText("MEMORY WING / 017", 638, 228);
}

function drawTower(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = "#1b2031";
  ctx.fillRect(395, 230, 490, 380);
  ctx.strokeStyle = "#555579";
  ctx.lineWidth = 3;
  ctx.strokeRect(400, 235, 480, 370);
  ctx.lineWidth = 1;
  ctx.fillStyle = "#252b3e";
  ctx.fillRect(420, 254, 440, 332);
  ctx.fillStyle = "#323650";
  ctx.fillRect(610, 246, 58, 346);
  ctx.fillStyle = "#7664a0";
  ctx.globalAlpha = .52 + .24 * Math.sin(time / 500);
  ctx.fillRect(625, 264, 28, 307);
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.shadowColor = "#c69aff";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#9278c4";
  ctx.fillRect(636, 365, 6, 128);
  ctx.restore();
}

function drawScene(ctx: CanvasRenderingContext2D, scene: SceneId, time: number) {
  const theme = themes[scene];
  drawFloor(ctx, scene, time);

  ctx.fillStyle = theme.wall;
  ctx.fillRect(0, 0, WORLD_WIDTH, 34);
  ctx.fillRect(0, WORLD_HEIGHT - 34, WORLD_WIDTH, 34);
  ctx.fillRect(0, 0, 34, WORLD_HEIGHT);
  ctx.fillRect(WORLD_WIDTH - 34, 0, 34, WORLD_HEIGHT);
  ctx.fillStyle = theme.trim;
  ctx.globalAlpha = .7;
  ctx.fillRect(34, 34, WORLD_WIDTH - 68, 3);
  ctx.fillRect(34, WORLD_HEIGHT - 37, WORLD_WIDTH - 68, 3);
  ctx.fillRect(34, 34, 3, WORLD_HEIGHT - 68);
  ctx.fillRect(WORLD_WIDTH - 37, 34, 3, WORLD_HEIGHT - 68);
  ctx.globalAlpha = 1;

  if (scene === "apartment") drawApartment(ctx, time);
  if (scene === "neon-district") drawCity(ctx, time);
  if (scene === "subway") drawSubway(ctx, time);
  if (scene === "research-lab") drawLab(ctx, time);
  if (scene === "central-tower") drawTower(ctx, time);

  for (const obstacle of obstacles[scene]) drawObstacle(ctx, scene, obstacle, time);

  ctx.fillStyle = theme.light;
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "left";
  ctx.globalAlpha = .68;
  ctx.fillText(theme.map, 54, 66);
  ctx.globalAlpha = 1;
}

function drawCharacter(ctx: CanvasRenderingContext2D, object: WorldObject, time: number) {
  const palettes: Record<string, { coat: string; hair: string; skin: string; glow: string }> = {
    nova: { coat: "#9e557e", hair: "#333448", skin: "#edc5a5", glow: "#f28fd0" },
    iris: { coat: "#bc8054", hair: "#543448", skin: "#e7bfa1", glow: "#ffd587" },
    marcus: { coat: "#52627c", hair: "#37343a", skin: "#d9b699", glow: "#91b5ed" },
    mika: { coat: "#4f847a", hair: "#34383c", skin: "#dcb89a", glow: "#80e3ce" },
    echo: { coat: "#6a64a2", hair: "#222b40", skin: "#d9dcf4", glow: "#d1a1ff" },
  };
  const palette = palettes[object.character ?? "nova"];
  const bob = Math.sin(time / 240 + object.x) * 1.3;
  const x = object.x;
  const y = object.y + bob;
  ctx.fillStyle = "rgba(5, 8, 14, .55)";
  ctx.fillRect(x - 12, y + 8, 24, 7);
  ctx.fillStyle = "#252d3b";
  ctx.fillRect(x - 7, y + 1, 5, 10);
  ctx.fillRect(x + 2, y + 1, 5, 10);
  ctx.fillStyle = palette.coat;
  ctx.fillRect(x - 9, y - 10, 18, 14);
  ctx.fillStyle = palette.skin;
  ctx.fillRect(x - 6, y - 20, 13, 11);
  ctx.fillStyle = palette.hair;
  ctx.fillRect(x - 8, y - 23, 16, 5);
  ctx.fillRect(x + 4, y - 20, 5, 8);
  ctx.fillStyle = palette.glow;
  ctx.fillRect(x + 3, y - 16, 2, 2);
  ctx.fillStyle = palette.glow;
  ctx.globalAlpha = .8 + .17 * Math.sin(time / 320);
  ctx.fillRect(x - 13, y - 5, 2, 5);
  ctx.globalAlpha = 1;
}

function drawEvidence(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  const bob = Math.sin(time / 260 + x) * 2;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const glow = ctx.createRadialGradient(x, y + bob, 1, x, y + bob, 22);
  glow.addColorStop(0, "rgba(102, 228, 224, .28)");
  glow.addColorStop(1, "rgba(102, 228, 224, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - 22, y - 22 + bob, 44, 44);
  ctx.restore();
  ctx.fillStyle = "#d5c9ab";
  ctx.fillRect(x - 8, y - 6 + bob, 16, 12);
  ctx.fillStyle = "#4d9ea7";
  ctx.fillRect(x - 5, y - 3 + bob, 10, 2);
  ctx.fillStyle = "#8ee5de";
  ctx.fillRect(x - 4, y + 1 + bob, 8, 2);
}

function drawWorldObject(ctx: CanvasRenderingContext2D, scene: SceneId, object: WorldObject, time: number, flags: ReadonlySet<string>) {
  const theme = themes[scene];
  if (object.kind === "npc" || object.kind === "echo") {
    drawCharacter(ctx, object, time);
    ctx.fillStyle = theme.light;
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    const label = object.character ? object.character.toUpperCase() : object.name.toUpperCase();
    ctx.fillText(label, object.x, object.y - 30);
  } else if (object.kind === "evidence" || object.kind === "clue") {
    if (flags.has(object.id)) return;
    drawEvidence(ctx, object.x, object.y, time);
  } else if (object.kind === "terminal") {
    ctx.fillStyle = "rgba(5, 8, 14, .52)";
    ctx.fillRect(object.x - 18, object.y + 9, 38, 7);
    ctx.fillStyle = "#171f2b";
    ctx.fillRect(object.x - 15, object.y - 19, 30, 26);
    ctx.fillStyle = theme.trim;
    ctx.fillRect(object.x - 12, object.y - 16, 24, 18);
    ctx.fillStyle = "#101b27";
    ctx.fillRect(object.x - 9, object.y - 13, 18, 12);
    ctx.fillStyle = theme.light;
    ctx.globalAlpha = .68 + .27 * Math.sin(time / 290 + object.x);
    ctx.fillRect(object.x - 6, object.y - 9, 12, 2);
    ctx.fillRect(object.x - 6, object.y - 5, 8, 1);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#8596a7";
    ctx.fillRect(object.x - 18, object.y + 7, 36, 3);
  } else if (object.kind === "exit") {
    const unlocked = object.destination ? flags.has(`chapter-${object.destination}-unlocked`) : true;
    ctx.fillStyle = "rgba(5, 8, 14, .55)";
    ctx.fillRect(object.x - 24, object.y + 9, 48, 7);
    ctx.fillStyle = "#1c2430";
    ctx.fillRect(object.x - 19, object.y - 25, 38, 34);
    ctx.fillStyle = unlocked ? theme.trim : "#4c4654";
    ctx.fillRect(object.x - 15, object.y - 21, 30, 28);
    ctx.fillStyle = "#17202a";
    ctx.fillRect(object.x - 10, object.y - 17, 20, 23);
    ctx.fillStyle = unlocked ? theme.light : "#d96d90";
    ctx.globalAlpha = .65 + Math.sin(time / 400 + object.x) * .2;
    ctx.fillRect(object.x + 5, object.y - 7, 3, 3);
    ctx.globalAlpha = 1;
  } else if (object.kind === "machine") {
    ctx.fillStyle = "#101923";
    ctx.fillRect(object.x - 17, object.y - 13, 34, 25);
    ctx.fillStyle = "#555d67";
    ctx.fillRect(object.x - 13, object.y - 17, 26, 5);
    ctx.fillStyle = flags.has("cameras-disabled") ? "#6de3a1" : "#ff627b";
    ctx.fillRect(object.x - 5, object.y - 6, 10, 7);
    ctx.fillStyle = "#66717d";
    ctx.fillRect(object.x - 12, object.y + 12, 5, 5);
    ctx.fillRect(object.x + 7, object.y + 12, 5, 5);
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Point, time: number, moving: boolean, running: boolean) {
  const step = moving ? Math.sin(time / (running ? 48 : 75)) * 2.5 : 0;
  ctx.fillStyle = "rgba(4, 7, 13, .62)";
  ctx.fillRect(player.x - 12, player.y + 8, 25, 8);
  ctx.fillStyle = "#263142";
  ctx.fillRect(player.x - 8, player.y + 2, 6, 10 + Math.max(0, step));
  ctx.fillRect(player.x + 2, player.y + 2, 6, 10 - Math.max(0, step));
  ctx.fillStyle = "#60dfdc";
  ctx.fillRect(player.x - 10, player.y - 9, 20, 14);
  ctx.fillStyle = "#eed1ad";
  ctx.fillRect(player.x - 7, player.y - 18, 15, 11);
  ctx.fillStyle = "#262c3b";
  ctx.fillRect(player.x - 8, player.y - 20, 17, 5);
  ctx.fillRect(player.x + 3, player.y - 16, 5, 4);
  ctx.fillStyle = "#17202b";
  ctx.fillRect(player.x + 4, player.y - 12, 2, 2);
  ctx.fillStyle = "#ff9bd1";
  ctx.fillRect(player.x - 12, player.y - 7, 3, 7);
  if (running) {
    ctx.fillStyle = "#f3ce91";
    ctx.globalAlpha = .6;
    ctx.fillRect(player.x - 2, player.y + 14, 4, 3);
    ctx.globalAlpha = 1;
  }
}

function drawPatrol(ctx: CanvasRenderingContext2D, position: Point, time: number, disabled: boolean) {
  ctx.save();
  ctx.globalAlpha = disabled ? .2 : .13;
  ctx.fillStyle = disabled ? "#69e7a0" : "#ff5b73";
  ctx.beginPath();
  ctx.moveTo(position.x, position.y);
  ctx.lineTo(position.x - 150, position.y - 76);
  ctx.lineTo(position.x + 150, position.y - 76);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
  ctx.fillStyle = "#171c24";
  ctx.fillRect(position.x - 13, position.y - 12, 26, 21);
  ctx.fillStyle = "#59616b";
  ctx.fillRect(position.x - 9, position.y - 17, 18, 6);
  ctx.fillStyle = disabled ? "#65e6a1" : "#ff657c";
  ctx.globalAlpha = disabled ? .42 : .8 + .17 * Math.sin(time / 190);
  ctx.fillRect(position.x - 4, position.y - 7, 8, 5);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#323a43";
  ctx.fillRect(position.x - 11, position.y + 9, 5, 6);
  ctx.fillRect(position.x + 7, position.y + 9, 5, 6);
}

export function renderDistrict(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: SceneId,
  player: Point,
  camera: Point,
  time: number,
  moving: boolean,
  running: boolean,
  objects: WorldObject[],
  flags: ReadonlySet<string>,
  alarm: number
) {
  const dpr = window.devicePixelRatio || 1;
  const view = { x: camera.x, y: camera.y, width: width / dpr, height: height / dpr };
  const theme = themes[scene];
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, view.width, view.height);
  ctx.fillStyle = theme.floor;
  ctx.fillRect(0, 0, view.width, view.height);

  ctx.save();
  ctx.translate(-view.x, -view.y);
  drawScene(ctx, scene, time);
  for (const object of objects) drawWorldObject(ctx, scene, object, time, flags);

  if (scene === "subway") {
    const patrol = patrolPosition(time);
    if (!flags.has("cameras-disabled")) drawPatrol(ctx, patrol, time, false);
  }

  drawPlayer(ctx, player, time, moving, running);

  const light = ctx.createRadialGradient(player.x, player.y, 30, player.x, player.y, scene === "central-tower" ? 205 : 255);
  light.addColorStop(0, scene === "central-tower" ? "rgba(138, 106, 192, .12)" : "rgba(54, 119, 131, .1)");
  light.addColorStop(.7, "rgba(28, 43, 62, .08)");
  light.addColorStop(1, "rgba(5, 8, 17, .4)");
  ctx.fillStyle = light;
  ctx.fillRect(view.x, view.y, view.width, view.height);

  if (scene === "neon-district") {
    ctx.save();
    ctx.globalAlpha = .2;
    for (let i = 0; i < 70; i++) {
      const x = (i * 181 + time / 8) % WORLD_WIDTH;
      const y = (i * 97 + time / 5) % WORLD_HEIGHT;
      ctx.fillStyle = i % 4 === 0 ? "#ffc3e5" : "#99eaf1";
      ctx.fillRect(x, y, 1, 5 + (i % 5));
    }
    ctx.restore();
  }

  if (scene === "subway" && alarm > 0) {
    const flash = Math.max(0, Math.sin(time / 170)) * Math.min(alarm / 100, .2);
    ctx.fillStyle = `rgba(255, 55, 74, ${flash})`;
    ctx.fillRect(view.x, view.y, view.width, view.height);
  }
  ctx.restore();

  const vignette = ctx.createRadialGradient(view.width / 2, view.height / 2, view.height * .18, view.width / 2, view.height / 2, Math.max(view.width, view.height) * .72);
  vignette.addColorStop(0, "rgba(5, 8, 17, 0)");
  vignette.addColorStop(1, scene === "apartment" ? "rgba(5, 8, 17, .34)" : "rgba(5, 8, 17, .42)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, view.width, view.height);
}
