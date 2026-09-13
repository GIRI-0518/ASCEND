// ============================================================
// ASCEND — Game Engine
// XP curves, rank thresholds, loot rolls, streak logic
// ============================================================

// ----- XP CURVE -----
// Non-linear: each level requires more XP than the last
// Formula: xpForLevel(n) = 100 * n^1.5 (rounded)
export function xpRequiredForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5));
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += xpRequiredForLevel(l);
  }
  return total;
}

export function getLevelFromTotalXp(totalXp: number): number {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = xpRequiredForLevel(level);
    if (accumulated + needed > totalXp) break;
    accumulated += needed;
    level++;
    if (level >= 100) break;
  }
  return level;
}

export function getXpProgress(totalXp: number): {
  level: number;
  currentXp: number;
  requiredXp: number;
  percentage: number;
} {
  const level = getLevelFromTotalXp(totalXp);
  const xpAtCurrentLevel = totalXpForLevel(level);
  const currentXp = totalXp - xpAtCurrentLevel;
  const requiredXp = xpRequiredForLevel(level);
  const percentage = Math.min(100, Math.round((currentXp / requiredXp) * 100));
  return { level, currentXp, requiredXp, percentage };
}

// ----- RANK THRESHOLDS -----
export const RANK_THRESHOLDS: { rank: string; minLevel: number; color: string; glowColor: string }[] = [
  { rank: "E", minLevel: 1, color: "#94a3b8", glowColor: "rgba(148,163,184,0.4)" },
  { rank: "D", minLevel: 10, color: "#6ee7b7", glowColor: "rgba(110,231,183,0.4)" },
  { rank: "C", minLevel: 20, color: "#60a5fa", glowColor: "rgba(96,165,250,0.4)" },
  { rank: "B", minLevel: 35, color: "#a78bfa", glowColor: "rgba(167,139,250,0.4)" },
  { rank: "A", minLevel: 50, color: "#f59e0b", glowColor: "rgba(245,158,11,0.4)" },
  { rank: "S", minLevel: 70, color: "#f97316", glowColor: "rgba(249,115,22,0.4)" },
  { rank: "SS", minLevel: 85, color: "#ef4444", glowColor: "rgba(239,68,68,0.4)" },
  { rank: "SSS", minLevel: 95, color: "#ec4899", glowColor: "rgba(236,72,153,0.5)" },
  { rank: "National", minLevel: 98, color: "#fbbf24", glowColor: "rgba(251,191,36,0.6)" },
  { rank: "Monarch", minLevel: 100, color: "#7c3aed", glowColor: "rgba(124,58,237,0.8)" },
];

export function getRankFromLevel(level: number): string {
  let currentRank = "E";
  for (const threshold of RANK_THRESHOLDS) {
    if (level >= threshold.minLevel) {
      currentRank = threshold.rank;
    }
  }
  return currentRank;
}

export function getRankInfo(rank: string) {
  return RANK_THRESHOLDS.find((r) => r.rank === rank) ?? RANK_THRESHOLDS[0];
}

export function getNextRank(currentRank: string): { rank: string; minLevel: number } | null {
  const idx = RANK_THRESHOLDS.findIndex((r) => r.rank === currentRank);
  if (idx === -1 || idx === RANK_THRESHOLDS.length - 1) return null;
  return RANK_THRESHOLDS[idx + 1];
}

// ----- XP REWARDS -----
export const DIFFICULTY_XP: Record<string, number> = {
  Easy: 50,
  Normal: 100,
  Hard: 200,
  Extreme: 500,
};

export const TIER_XP_MULTIPLIER: Record<number, number> = {
  1: 1.0,
  2: 1.5,
  3: 2.0,
};

export function calculateXpReward(difficulty: string, tier: number): number {
  const base = DIFFICULTY_XP[difficulty] ?? 100;
  const mult = TIER_XP_MULTIPLIER[tier] ?? 1.0;
  return Math.round(base * mult);
}

// ----- LOOT ROLL -----
export type LootRarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

interface LootRarityConfig {
  rarity: LootRarity;
  weight: number; // higher = more common
  color: string;
  glowColor: string;
}

const LOOT_TABLE: LootRarityConfig[] = [
  { rarity: "Common", weight: 50, color: "#94a3b8", glowColor: "rgba(148,163,184,0.3)" },
  { rarity: "Rare", weight: 30, color: "#60a5fa", glowColor: "rgba(96,165,250,0.5)" },
  { rarity: "Epic", weight: 15, color: "#a78bfa", glowColor: "rgba(167,139,250,0.6)" },
  { rarity: "Legendary", weight: 4, color: "#f59e0b", glowColor: "rgba(245,158,11,0.7)" },
  { rarity: "Mythic", weight: 1, color: "#ec4899", glowColor: "rgba(236,72,153,0.9)" },
];

export function rollLootRarity(tierBonus: number = 0): LootRarity {
  // Higher tier = slightly better odds
  const adjustedTable = LOOT_TABLE.map((entry, i) => ({
    ...entry,
    weight: Math.max(1, entry.weight + (i > 1 ? tierBonus * 2 : -tierBonus * 3)),
  }));

  const totalWeight = adjustedTable.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of adjustedTable) {
    roll -= entry.weight;
    if (roll <= 0) return entry.rarity;
  }

  return "Common";
}

export function getLootConfig(rarity: LootRarity): LootRarityConfig {
  return LOOT_TABLE.find((e) => e.rarity === rarity) ?? LOOT_TABLE[0];
}

// Loot item pool per category
const LOOT_ITEMS: Record<LootRarity, { names: string[]; type: string; emoji: string }[]> = {
  Common: [
    { names: ["Iron Sword", "Wooden Staff", "Leather Gloves", "Cloth Robe", "Stone Ring"], type: "Weapon", emoji: "⚔️" },
    { names: ["Basic Potion", "Mana Crystal", "Health Shard", "Energy Bead"], type: "Artifact", emoji: "💊" },
  ],
  Rare: [
    { names: ["Steel Blade", "Mage's Focus", "Shadow Gauntlets", "Hunter's Bow"], type: "Weapon", emoji: "🗡️" },
    { names: ["Knight's Plate", "Warden Cloak", "Agility Boots"], type: "Armor", emoji: "🛡️" },
  ],
  Epic: [
    { names: ["Twilight Dagger", "Void Staff", "Phantom Edge", "Storm Blade"], type: "Weapon", emoji: "⚡" },
    { names: ["Obsidian Armor", "Shadow Cloak", "Rune Bracers"], type: "Armor", emoji: "🌑" },
    { names: ["Skill: Shadow Step", "Skill: Mana Burst", "Skill: Iron Body"], type: "Skill", emoji: "✨" },
  ],
  Legendary: [
    { names: ["Demon King's Sword", "Architect's Staff", "Ruler's Authority"], type: "Weapon", emoji: "🔥" },
    { names: ["Dragon Scale Mail", "Monarch's Robe", "Sovereign Crown"], type: "Armor", emoji: "👑" },
    { names: ["Skill: Dominator's Touch", "Skill: Black Heart", "Skill: Necromancer"], type: "Skill", emoji: "💀" },
  ],
  Mythic: [
    { names: ["Kamish's Wrath", "Ashborn's Vessel", "Ruler's Rune"], type: "Weapon", emoji: "🌌" },
    { names: ["Shadow Monarch's Armor", "Monarch's Essence", "Eternal Ring"], type: "Armor", emoji: "⭐" },
    { names: ["Skill: Shadow Monarch", "Skill: Arise", "Skill: Sovereign's Domain"], type: "Skill", emoji: "🪐" },
  ],
};

export function generateLootItem(rarity: LootRarity): {
  name: string;
  description: string;
  rarity: LootRarity;
  itemType: string;
  iconEmoji: string;
  stats: Record<string, number>;
} {
  const pool = LOOT_ITEMS[rarity];
  const category = pool[Math.floor(Math.random() * pool.length)];
  const name = category.names[Math.floor(Math.random() * category.names.length)];

  const rarityMultiplier = { Common: 1, Rare: 2, Epic: 4, Legendary: 8, Mythic: 16 }[rarity];
  const stats: Record<string, number> = {};
  const statKeys = ["strength", "agility", "intellect", "sense", "spirit"];
  const numStats = Math.min(rarity === "Common" ? 1 : rarity === "Rare" ? 2 : 3, statKeys.length);

  const shuffled = [...statKeys].sort(() => Math.random() - 0.5).slice(0, numStats);
  for (const stat of shuffled) {
    stats[stat] = Math.round((Math.random() * 10 + 5) * rarityMultiplier);
  }

  const descriptions: Record<LootRarity, string> = {
    Common: "A basic item dropped by a low-rank monster.",
    Rare: "A quality item forged by skilled craftsmen.",
    Epic: "A powerful item imbued with magical energy.",
    Legendary: "An item of immense power, known across the world.",
    Mythic: "An artifact of the Shadow Monarch himself. Unimaginable power.",
  };

  return {
    name,
    description: descriptions[rarity],
    rarity,
    itemType: category.type,
    iconEmoji: category.emoji,
    stats,
  };
}

// ----- STREAK LOGIC -----
export function updateStreak(lastCompletedAt: Date | null, currentStreak: number): {
  newStreak: number;
  streakBroken: boolean;
} {
  if (!lastCompletedAt) {
    return { newStreak: 1, streakBroken: false };
  }

  const now = new Date();
  const last = new Date(lastCompletedAt);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 2) {
    // Same day or consecutive day — extend streak
    return { newStreak: currentStreak + 1, streakBroken: false };
  } else {
    // Streak broken
    return { newStreak: 1, streakBroken: true };
  }
}

// ----- ATTRIBUTE CATEGORIES -----
export const ATTRIBUTE_CATEGORIES = [
  { id: "Strength", label: "Strength", emoji: "💪", description: "Physical tasks, exercise, fitness" },
  { id: "Agility", label: "Agility", emoji: "⚡", description: "Speed, reflexes, sports" },
  { id: "Intellect", label: "Intellect", emoji: "🧠", description: "Learning, coding, reading, study" },
  { id: "Sense", label: "Sense", emoji: "👁️", description: "Awareness, mindfulness, creativity" },
  { id: "Spirit", label: "Spirit", emoji: "🌟", description: "Mental health, social, habits" },
];

// ----- SHADOW COMPANIONS -----
export const DEFAULT_SHADOWS = [
  { name: "Igris", title: "Blood-Red Commander", attributeAffinity: "Strength", iconEmoji: "🗡️", description: "A loyal knight who leads your strength training army." },
  { name: "Beru", title: "Queen Ant", attributeAffinity: "Agility", iconEmoji: "🐜", description: "Lightning-fast with an insatiable hunger for speed." },
  { name: "Bellion", title: "Grand Marshal", attributeAffinity: "Intellect", iconEmoji: "📚", description: "The wisest of all shadows. Commands your mind's armies." },
  { name: "Kaisel", title: "Dragon King", attributeAffinity: "Sense", iconEmoji: "🐉", description: "Surveys all — nothing escapes his ancient perception." },
  { name: "Greed", title: "Architect's Shadow", attributeAffinity: "Spirit", iconEmoji: "✨", description: "The embodiment of willpower and spiritual fortitude." },
];
