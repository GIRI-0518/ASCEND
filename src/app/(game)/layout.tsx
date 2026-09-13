import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { Sidebar } from "@/components/Sidebar";

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Check if user has completed onboarding
  const user = await db.orm.public.User.where({ clerkId: userId }).first();
  if (!user) redirect("/onboarding");

  const sidebarUser = {
    displayName: user.displayName,
    username: user.username,
    hunterRank: user.hunterRank,
    currentLevel: user.currentLevel,
    totalXp: user.totalXp,
  };

  return (
    <div className="flex min-h-screen bg-void">
      <Sidebar user={sidebarUser} />
      <main className="flex-1 overflow-hidden relative">
        {/* Ambient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 70% 30%, rgba(45,156,255,0.03) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(124,58,237,0.03) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 p-6 overflow-y-auto h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
