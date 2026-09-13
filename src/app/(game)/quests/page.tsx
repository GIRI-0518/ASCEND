import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { ATTRIBUTE_CATEGORIES } from "@/lib/game-engine";
import Link from "next/link";
import { QuestCardClient } from "@/components/QuestCardClient";

export const metadata: Metadata = {
  title: "Quest Board",
  description: "Your active and completed quests. Complete them to earn XP and loot.",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "#6ee7b7",
  Normal: "#60a5fa",
  Hard: "#f59e0b",
  Extreme: "#ef4444",
};

export default async function QuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; category?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.orm.public.User.where({ clerkId: userId }).first();
  if (!user) redirect("/onboarding");

  const params = await searchParams;
  const filter = params.filter ?? "active";
  const category = params.category;

  const allQuests = await db.orm.public.Quest.where({ userId: user.id })
    .orderBy([(q) => q.createdAt.desc()])
    .all();

  const filtered = allQuests.filter((q) => {
    if (filter === "active" && q.status !== "active") return false;
    if (filter === "completed" && q.status !== "completed") return false;
    if (category && q.attributeCategory !== category) return false;
    return true;
  });

  const activeCount = allQuests.filter((q) => q.status === "active").length;
  const completedCount = allQuests.filter((q) => q.status === "completed").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-system text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#2d9cff" }}>
            ◈ Quest Board ◈
          </div>
          <h1 className="font-system font-black text-3xl text-white tracking-wider">
            Quest Log
          </h1>
        </div>
        <Link href="/quests/new" className="btn-system btn-primary">
          + New Quest
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 border border-[rgba(45,156,255,0.2)] rounded-sm w-fit">
        {[
          { key: "active", label: `Active (${activeCount})` },
          { key: "completed", label: `Done (${completedCount})` },
          { key: "all", label: "All" },
        ].map(({ key, label }) => (
          <Link
            key={key}
            href={`/quests?filter=${key}${category ? `&category=${category}` : ""}`}
            className={`font-system text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-sm transition-all ${
              filter === key
                ? "text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
            style={filter === key ? { background: "rgba(45,156,255,0.15)", color: "#2d9cff" } : {}}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Attribute filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={`/quests?filter=${filter}`}
          className={`font-system text-[10px] font-bold tracking-wider uppercase px-3 py-1 border transition-all rounded-sm ${
            !category ? "border-[#2d9cff] text-[#2d9cff]" : "border-[rgba(45,156,255,0.2)] text-slate-500 hover:text-slate-300"
          }`}
        >
          All
        </Link>
        {ATTRIBUTE_CATEGORIES.map((attr) => (
          <Link
            key={attr.id}
            href={`/quests?filter=${filter}&category=${attr.id}`}
            className={`font-system text-[10px] font-bold tracking-wider uppercase px-3 py-1 border transition-all rounded-sm ${
              category === attr.id ? "border-[#2d9cff] text-[#2d9cff]" : "border-[rgba(45,156,255,0.2)] text-slate-500 hover:text-slate-300"
            }`}
          >
            {attr.emoji} {attr.label}
          </Link>
        ))}
      </div>

      {/* Quest list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="panel p-12 text-center">
            <div className="text-4xl mb-4">⚔️</div>
            <p className="font-system text-sm text-slate-500 tracking-widest uppercase">
              No quests found
            </p>
            <p className="text-slate-600 text-xs mt-1">
              {filter === "active" ? "Create a quest to begin your journey." : "Complete some quests to see them here."}
            </p>
            {filter === "active" && (
              <Link href="/quests/new" className="btn-system mt-6 inline-flex">
                Create First Quest
              </Link>
            )}
          </div>
        ) : (
          filtered.map((quest) => {
            const attr = ATTRIBUTE_CATEGORIES.find((a) => a.id === quest.attributeCategory);
            return (
              <QuestCardClient
                key={quest.id}
                quest={quest}
                attrEmoji={attr?.emoji ?? "⚔️"}
                difficultyColor={DIFFICULTY_COLORS[quest.difficulty] ?? "#2d9cff"}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
