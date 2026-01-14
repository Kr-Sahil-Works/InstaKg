import fs from "fs";
import path from "path";

/* ================= LOAD EMOJI JSON ================= */
const emojiPath = path.resolve(
  "node_modules/emoji-datasource/emoji.json"
);
const data = JSON.parse(fs.readFileSync(emojiPath, "utf-8"));

/* ================= CORRECT CATEGORY MAP ================= */
const CATEGORY_MAP = {
  "Smileys & Emotion": "faces",
  "People & Body": "gestures",
  "Symbols": "symbols",
  "Objects": "objects",
  "Animals & Nature": "objects",
  "Food & Drink": "objects",
  "Travel & Places": "objects",
  "Activities": "objects",
  "Flags": "symbols",
};

const OUTPUT = {
  faces: [],
  gestures: [],
  hearts: [],
  symbols: [],
  objects: [],
};

function toEmoji(unified) {
  return String.fromCodePoint(
    ...unified.split("-").map(u => parseInt(u, 16))
  );
}

/* ================= BUILD EMOJI DATA (FIXED) ================= */
for (const item of data) {
  if (!item.has_img_google) continue;

  const emoji = toEmoji(item.unified);
  const keywords = item.short_names;

  /* ❤️ HEARTS (derived category) */
  if (keywords.some(k => k.includes("heart"))) {
    OUTPUT.hearts.push({
      e: emoji,
      k: keywords,
      tones: item.skin_variations
        ? Object.values(item.skin_variations).map(v => toEmoji(v.unified))
        : [],
    });
    continue;
  }

  const category = CATEGORY_MAP[item.category];
  if (!category) continue;

  OUTPUT[category].push({
    e: emoji,
    k: keywords,
    tones: item.skin_variations
      ? Object.values(item.skin_variations).map(v => toEmoji(v.unified))
      : [],
  });
}

/* ================= WRITE GENERATED FILE ================= */
const outPath = path.resolve("src/constants/emojis.generated.js");

fs.writeFileSync(
  outPath,
  `
export const EMOJI_CATEGORIES = {
  recent: "🕘",
  faces: "😀",
  gestures: "👍",
  hearts: "❤️",
  symbols: "♻️",
  objects: "🎉",
};

export const EMOJIS = ${JSON.stringify(OUTPUT, null, 2)};
`,
  "utf-8"
);

console.log("✅ Emojis generated correctly (faces, gestures, hearts fixed)");
