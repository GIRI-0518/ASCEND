"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { createQuestSchema } from "@/lib/validations";
import {
  calculateXpReward,
  getLevelFromTotalXp,
  getRankFromLevel,
  rollLootRarity,
  generateLootItem,
  updateStreak,
} from "@/lib/game-engine";

async function getDbUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.orm.public.User.where({ clerkId: userId }).first();
  if (!user) throw new Error("User not found. Please complete onboarding.");
  return user;
}

// ---- CREATE QUEST ----
export async function createQuest(prevState: unknown, formData: FormData) {
  try {
    const user = await getDbUser();

    const raw = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      attributeCategory: formData.get("attributeCategory") as string,
      verificationTier: Number(formData.get("verificationTier") ?? 1),
      difficulty: formData.get("difficulty") as string,
      isDaily: formData.get("isDaily") === "true",
    };

    const parsed = createQuestSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    const data = parsed.data;
    const xpReward = calculateXpReward(data.difficulty, data.verificationTier);

    await db.orm.public.Quest.create({
      userId: user.id,
      title: data.title,
      description: data.description ?? null,
      attributeCategory: data.attributeCategory,
      verificationTier: data.verificationTier,
      difficulty: data.difficulty,
      isDaily: data.isDaily,
      xpReward,
      status: "active",
    });

    revalidatePath("/quests");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create quest" };
  }
}

// ---- DELETE QUEST ----
export async function deleteQuest(questId: string) {
  try {
    const user = await getDbUser();
    const quest = await db.orm.public.Quest.where({ id: questId }).first();
    if (!quest || quest.userId !== user.id) throw new Error("Quest not found");

    await db.orm.public.Quest.where({ id: questId }).delete();
    revalidatePath("/quests");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete quest" };
  }
}

// ---- COMPLETE QUEST ----
export async function completeQuest(
  questId: string,
  proofUrl?: string
): Promise<{
  success?: boolean;
  error?: string;
  xpAwarded?: number;
  lootRarity?: string;
  lootItem?: { name: string; rarity: string; iconEmoji: string };
  leveledUp?: boolean;
  newLevel?: number;
  rankedUp?: boolean;
  newRank?: string;
}> {
  try {
    const user = await getDbUser();

    const quest = await db.orm.public.Quest.where({ id: questId }).first();
    if (!quest || quest.userId !== user.id) throw new Error("Quest not found");
    if (quest.status === "completed") throw new Error("Quest already completed");

    const xpAwarded = calculateXpReward(quest.difficulty, quest.verificationTier);
    const tierBonus = quest.verificationTier - 1;
    const lootRarity = rollLootRarity(tierBonus);
    const lootItemData = generateLootItem(lootRarity);

    const oldLevel = getLevelFromTotalXp(user.totalXp);
    const oldRank = getRankFromLevel(oldLevel);
    const newTotalXp = user.totalXp + xpAwarded;
    const newLevel = getLevelFromTotalXp(newTotalXp);
    const newRank = getRankFromLevel(newLevel);
    const leveledUp = newLevel > oldLevel;
    const rankedUp = newRank !== oldRank;

    // Get streak for this category
    const streakRecord = await db.orm.public.StreakLog.where({
      userId: user.id,
      questCategory: quest.attributeCategory,
    }).first();

    const { newStreak } = updateStreak(
      streakRecord?.lastCompletedAt ? new Date(streakRecord.lastCompletedAt) : null,
      streakRecord?.currentStreak ?? 0
    );

    await db.transaction(async (tx) => {
      // Create inventory item
      const lootItem = await tx.orm.public.InventoryItem.create({
        userId: user.id,
        name: lootItemData.name,
        description: lootItemData.description ?? null,
        rarity: lootRarity,
        itemType: lootItemData.itemType,
        iconEmoji: lootItemData.iconEmoji,
        statsJson: JSON.stringify(lootItemData.stats),
        equipped: false,
      });

      // Create completion record
      await tx.orm.public.QuestCompletion.create({
        questId: quest.id,
        userId: user.id,
        proofUrl: proofUrl ?? null,
        verifiedBy: proofUrl ? "upload" : "self",
        xpAwarded,
        lootRollRarity: lootRarity,
        lootItemId: lootItem.id,
      });

      // Mark quest completed
      await tx.orm.public.Quest.where({ id: quest.id }).update({ status: "completed" });

      // Update user XP, level, rank
      await tx.orm.public.User.where({ id: user.id }).update({
        totalXp: newTotalXp,
        currentLevel: newLevel,
        hunterRank: newRank,
      });

      // Update or create streak for this category
      const now = new Date().toISOString();
      if (streakRecord) {
        await tx.orm.public.StreakLog.where({ id: streakRecord.id }).update({
          currentStreak: newStreak,
          longestStreak: Math.max(streakRecord.longestStreak, newStreak),
          lastCompletedAt: now,
        });
      } else {
        await tx.orm.public.StreakLog.create({
          userId: user.id,
          questCategory: quest.attributeCategory,
          currentStreak: 1,
          longestStreak: 1,
          lastCompletedAt: now,
        });
      }

      // Update overall streak
      const overallStreak = await tx.orm.public.StreakLog.where({
        userId: user.id,
        questCategory: "overall",
      }).first();
      if (overallStreak) {
        const { newStreak: overallNew } = updateStreak(
          overallStreak.lastCompletedAt ? new Date(overallStreak.lastCompletedAt) : null,
          overallStreak.currentStreak
        );
        await tx.orm.public.StreakLog.where({ id: overallStreak.id }).update({
          currentStreak: overallNew,
          longestStreak: Math.max(overallStreak.longestStreak, overallNew),
          lastCompletedAt: now,
        });
      }

      // Level up the shadow companion for this attribute
      const shadow = await tx.orm.public.ShadowCompanion.where({
        userId: user.id,
        attributeAffinity: quest.attributeCategory,
        state: "active",
      }).first();

      if (shadow) {
        await tx.orm.public.ShadowCompanion.where({ id: shadow.id }).update({
          level: shadow.level + (leveledUp ? 2 : 1),
          lastActivityAt: now,
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/quests");
    revalidatePath("/inventory");
    revalidatePath("/shadows");

    return {
      success: true,
      xpAwarded,
      lootRarity,
      lootItem: { name: lootItemData.name, rarity: lootRarity, iconEmoji: lootItemData.iconEmoji },
      leveledUp,
      newLevel,
      rankedUp,
      newRank,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to complete quest" };
  }
}

// ---- EQUIP ITEM ----
export async function equipItem(itemId: string) {
  try {
    const user = await getDbUser();
    const item = await db.orm.public.InventoryItem.where({ id: itemId }).first();
    if (!item || item.userId !== user.id) throw new Error("Item not found");

    // Get all equipped items of same type
    const equippedSameType = await db.orm.public.InventoryItem.where({
      userId: user.id,
      itemType: item.itemType,
      equipped: true,
    }).all();

    await db.transaction(async (tx) => {
      for (const equipped of equippedSameType) {
        await tx.orm.public.InventoryItem.where({ id: equipped.id }).update({ equipped: false });
      }
      await tx.orm.public.InventoryItem.where({ id: itemId }).update({ equipped: true });
    });

    revalidatePath("/inventory");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to equip item" };
  }
}
