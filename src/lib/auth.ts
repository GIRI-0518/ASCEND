import { auth } from "@clerk/nextjs/server";
import { db } from "@/prisma/db";

/**
 * Gets the current authenticated user's DB record.
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.orm.public.User.where({ clerkId: userId }).first();
  return user;
}

/**
 * Gets the current user or throws if not authenticated/found.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
