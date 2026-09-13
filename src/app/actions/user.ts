"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/prisma/db";
import { redirect } from "next/navigation";
import { DEFAULT_SHADOWS } from "@/lib/game-engine";

/**
 * Creates the user's DB record after Clerk sign-up
 * and provisions their starter Shadow companions.
 */
export async function createUserProfile(prevState: unknown, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const username = (formData.get("username") as string)?.toLowerCase().trim();
  const displayName = (formData.get("displayName") as string)?.trim();

  if (!username || username.length < 3) {
    return { error: "Username must be at least 3 characters" };
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { error: "Username can only contain lowercase letters, numbers, and underscores" };
  }

  // Check if user already has a profile
  const existingByClerk = await db.orm.public.User.where({ clerkId: userId }).first();
  if (existingByClerk) {
    redirect("/dashboard");
  }

  // Check username uniqueness
  const existingByUsername = await db.orm.public.User.where({ username }).first();
  if (existingByUsername) {
    return { error: "Username already taken. Please choose another." };
  }

  // Get email and avatar from Clerk
  const clerkUserData = await currentUser();
  const email = clerkUserData?.emailAddresses?.[0]?.emailAddress ?? `${userId}@ascend.app`;
  const avatarUrl = clerkUserData?.imageUrl ?? null;

  // Create user + shadows + streak in a transaction
  const user = await db.transaction(async (tx) => {
    const newUser = await tx.orm.public.User.create({
      clerkId: userId,
      username,
      displayName: displayName || username,
      email,
      avatarUrl,
      hunterRank: "E",
      totalXp: 0,
      currentLevel: 1,
    });

    // Provision Shadow companions
    for (const shadow of DEFAULT_SHADOWS) {
      await tx.orm.public.ShadowCompanion.create({
        userId: newUser.id,
        name: shadow.name,
        title: shadow.title,
        attributeAffinity: shadow.attributeAffinity,
        iconEmoji: shadow.iconEmoji,
        description: shadow.description ?? null,
        level: 1,
        state: "active",
      });
    }

    // Provision overall streak log
    await tx.orm.public.StreakLog.create({
      userId: newUser.id,
      questCategory: "overall",
      currentStreak: 0,
      longestStreak: 0,
    });

    return newUser;
  });

  redirect("/dashboard");
}
