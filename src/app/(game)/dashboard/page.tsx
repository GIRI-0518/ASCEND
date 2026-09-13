import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { getXpProgress, getRankInfo, getNextRank, ATTRIBUTE_CATEGORIES } from "@/lib/game-engine";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard — Hunter HQ",
  description: "Your personal hunter dashboard. Track quests, XP, inventory, and shadow companions.",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.orm.public.User.where({ clerkId: userId }).first();
  if (!user) redirect("/onboarding");

  // Fetch dashboard data
  const [activeQuests, recentCompletions, shadows, streakData] = await Promise.all([
    db.orm.public.Quest.where({ userId: user.id, status: "active" })
      .orderBy((q) => q.createdAt.desc())
      .limit(5)
      .all(),
    db.orm.public.QuestCompletion.where({ userId: user.id })
      .orderBy((c) => c.completedAt.desc())
      .limit(5)
      .all(),
    db.orm.public.ShadowCompanion.where({ userId: user.id })
      .orderBy((s) => s.level.desc())
      .limit(5)
      .all(),
    db.orm.public.StreakLog.where({ userId: user.id }).all(),
  ]);

  const xpProgress = getXpProgress(user.totalXp);
  const rankInfo = getRankInfo(user.hunterRank);
  const nextRank = getNextRank(user.hunterRank);
  const overallStreak = streakData.find((s) => s.questCategory === "overall");
  const totalCompletions = recentCompletions.length;

  const DIFFICULTY_COLORS: Record<string, string> = {
    Easy: "#6ee7b7",
    Normal: "#60a5fa",
    Hard: "#f59e0b",
    Extreme: "#ef4444",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-system text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#2d9cff" }}>
            ◈ Hunter Dashboard ◈
          </div>
          <h1 className="font-system font-black text-3xl text-white tracking-wider">
            Welcome Back, {user.displayName}
          </h1>
        </div>
        <Link href="/quests/new" className="btn-system btn-primary">
          + New Quest
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Hunter Rank", value: user.hunterRank, color: rankInfo?.color ?? "#94a3b8" },
          { label: "Current Level", value: `Lv.${user.currentLevel}`, color: "#2d9cff" },
          { label: "Total XP", value: user.totalXp.toLocaleString(), color: "#a78bfa" },
          { label: "Day Streak", value: `${overallStreak?.currentStreak ?? 0}🔥`, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel p-4">
            <div className="font-system text-[10px] tracking-[0.2em] uppercase text-slate-500 mb-1">
              {label}
            </div>
            <div className="font-system font-black text-2xl" style={{ color }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-system text-xs tracking-[0.2em] uppercase text-slate-400">
            Level Progress
          </div>
          <div className="font-system text-sm" style={{ color: "#2d9cff" }}>
            {xpProgress.currentXp.toLocaleString()} / {xpProgress.requiredXp.toLocaleString()} XP
          </div>
        </div>
        <div className="xp-bar-container" style={{ height: "12px" }}>
          <div
            className="xp-bar-fill"
            style={{ width: `${xpProgress.percentage}%`, height: "12px" }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-system text-[10px] text-slate-600">Lv.{xpProgress.level}</span>
          {nextRank && (
            <span className="font-system text-[10px] text-slate-600">
              Next rank at Lv.{nextRank.minLevel} → {nextRank.rank}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Quests */}
        <section className="panel">
          <div className="system-header flex items-center justify-between">
            <span>Active Quests ({activeQuests.length})</span>
            <Link href="/quests" className="text-slate-500 hover:text-slate-300 text-[10px] font-normal lowercase tracking-normal transition-colors">
              view all →
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {activeQuests.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">⚔️</div>
                <p className="font-system text-sm text-slate-500 tracking-wider">NO ACTIVE QUESTS</p>
                <Link href="/quests/new" className="btn-system mt-4 text-xs inline-flex">
                  Create First Quest
                </Link>
              </div>
            ) : (
              activeQuests.map((quest) => {
                const attr = ATTRIBUTE_CATEGORIES.find((a) => a.id === quest.attributeCategory);
                return (
                  <div
                    key={quest.id}
                    className="border-l-2 pl-3 py-2"
                    style={{
                      borderColor: DIFFICULTY_COLORS[quest.difficulty] ?? "#2d9cff",
                      background: "rgba(45,156,255,0.03)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-system font-bold text-sm text-white truncate">
                          {quest.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-system text-[10px] tracking-wider text-slate-500">
                            {attr?.emoji} {quest.attributeCategory}
                          </span>
                          <span
                            className="font-system text-[10px] tracking-wider"
                            style={{ color: DIFFICULTY_COLORS[quest.difficulty] }}
                          >
                            {quest.difficulty}
                          </span>
                        </div>
                      </div>
                      <span
                        className="font-system text-sm font-bold shrink-0"
                        style={{ color: "#2d9cff" }}
                      >
                        +{quest.xpReward}XP
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Shadow Companions */}
        <section className="panel">
          <div className="system-header flex items-center justify-between">
            <span>Shadow Army</span>
            <Link href="/shadows" className="text-slate-500 hover:text-slate-300 text-[10px] font-normal lowercase tracking-normal transition-colors">
              view all →
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {shadows.map((shadow) => {
              const attr = ATTRIBUTE_CATEGORIES.find((a) => a.id === shadow.attributeAffinity);
              const isActive = shadow.state === "active";
              return (
                <div
                  key={shadow.id}
                  className="flex items-center gap-3"
                  style={{ opacity: isActive ? 1 : 0.4 }}
                >
                  <div
                    className="shadow-icon text-2xl shrink-0"
                    style={{ filter: isActive ? "drop-shadow(0 0 8px rgba(124,58,237,0.6))" : "none" }}
                  >
                    {shadow.iconEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-system font-bold text-sm text-white">
                        {shadow.name}
                      </span>
                      <span className="font-system text-xs text-slate-500">
                        Lv.{shadow.level}
                      </span>
                    </div>
                    <div className="font-system text-[10px] tracking-wider text-slate-500 mt-0.5">
                      {attr?.emoji} {shadow.title}
                    </div>
                    {/* Shadow level bar */}
                    <div className="stat-bar mt-1.5">
                      <div
                        className="stat-bar-fill"
                        style={{
                          width: `${Math.min(100, shadow.level)}%`,
                          background: isActive
                            ? "linear-gradient(90deg, #7c3aed, #a78bfa)"
                            : "#374151",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Recent Activity */}
      {recentCompletions.length > 0 && (
        <section className="panel">
          <div className="system-header">Recent Completions</div>
          <div className="p-4">
            <div className="space-y-2">
              {recentCompletions.map((completion) => {
                const RARITY_COLORS: Record<string, string> = {
                  Common: "#94a3b8",
                  Rare: "#60a5fa",
                  Epic: "#a78bfa",
                  Legendary: "#f59e0b",
                  Mythic: "#ec4899",
                };
                return (
                  <div key={completion.id} className="flex items-center justify-between py-1.5 border-b border-[rgba(45,156,255,0.08)] last:border-0">
                    <div>
                      <span
                        className="font-system text-xs font-bold"
                        style={{ color: RARITY_COLORS[completion.lootRollRarity ?? "Common"] }}
                      >
                        [{completion.lootRollRarity ?? "Common"}]
                      </span>
                      <span className="font-system text-xs text-slate-400 ml-2">
                        Quest completed
                      </span>
                    </div>
                    <span className="font-system text-sm font-bold" style={{ color: "#2d9cff" }}>
                      +{completion.xpAwarded}XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
