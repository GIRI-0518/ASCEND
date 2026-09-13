import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { ATTRIBUTE_CATEGORIES } from "@/lib/game-engine";

export const metadata: Metadata = {
  title: "Shadow Army",
  description: "Your shadow companions. Level them up by completing their attribute quests.",
};

export default async function ShadowsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.orm.public.User.where({ clerkId: userId }).first();
  if (!user) redirect("/onboarding");

  const shadows = await db.orm.public.ShadowCompanion.where({ userId: user.id })
    .orderBy((s) => s.level.desc())
    .all();

  const streaks = await db.orm.public.StreakLog.where({ userId: user.id }).all();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="font-system text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#2d9cff" }}>
          ◈ Shadow Army HQ ◈
        </div>
        <h1 className="font-system font-black text-3xl text-white tracking-wider">
          Shadow Companions
        </h1>
        <p className="font-system text-xs text-slate-500 mt-1 tracking-wider">
          Your shadows grow stronger as you complete attribute quests.
        </p>
      </div>

      {/* Cinematic banner */}
      <div
        className="panel p-6 text-center relative overflow-hidden"
        style={{ borderColor: "rgba(124,58,237,0.4)", boxShadow: "0 0 30px rgba(124,58,237,0.2)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.15) 0%, transparent 70%)"
        }} />
        <div className="font-system text-[10px] tracking-[0.3em] uppercase mb-2 text-slate-500">
          Arise, Shadow Monarch
        </div>
        <div
          className="font-system font-black text-4xl tracking-widest mb-1"
          style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          SHADOW ARMY
        </div>
        <div className="font-system text-sm text-slate-400 tracking-wider">
          {shadows.length} companions under your command
        </div>
      </div>

      {/* Shadow cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shadows.map((shadow) => {
          const attr = ATTRIBUTE_CATEGORIES.find((a) => a.id === shadow.attributeAffinity);
          const streak = streaks.find((s) => s.questCategory === shadow.attributeAffinity);
          const isActive = shadow.state === "active";
          const levelProgress = Math.min(100, shadow.level);

          return (
            <article
              key={shadow.id}
              id={`shadow-${shadow.id}`}
              className={`shadow-card ${!isActive ? "weakened" : ""}`}
            >
              {/* Shadow icon */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="shadow-icon text-4xl w-14 h-14 flex items-center justify-center border shrink-0"
                  style={{
                    borderColor: isActive ? "rgba(167,139,250,0.4)" : "rgba(107,114,128,0.3)",
                    background: "rgba(0,0,0,0.4)",
                    filter: isActive ? "drop-shadow(0 0 12px rgba(124,58,237,0.7))" : "none",
                  }}
                >
                  {shadow.iconEmoji}
                </div>
                <div>
                  <div className="font-system font-black text-lg text-white">
                    {shadow.name}
                  </div>
                  <div className="font-system text-xs text-slate-500 tracking-wider">
                    {shadow.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="font-system text-[10px] font-bold tracking-wider px-2 py-0.5 border"
                      style={{ color: "#a78bfa", borderColor: "rgba(167,139,250,0.4)" }}
                    >
                      Lv.{shadow.level}
                    </span>
                    {!isActive && (
                      <span className="font-system text-[10px] text-red-400 tracking-wider">
                        ⚡ Weakened
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {shadow.description && (
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  {shadow.description}
                </p>
              )}

              {/* Attribute */}
              <div className="flex items-center justify-between mb-3">
                <div className="font-system text-[10px] tracking-wider uppercase text-slate-500">
                  Affinity: {attr?.emoji} {shadow.attributeAffinity}
                </div>
                {streak && (
                  <div className="font-system text-[10px] tracking-wider" style={{ color: "#f59e0b" }}>
                    {streak.currentStreak}🔥 streak
                  </div>
                )}
              </div>

              {/* Level progress bar */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-system text-[10px] uppercase tracking-wider text-slate-600">Power</span>
                  <span className="font-system text-[10px] text-slate-600">{shadow.level}/100</span>
                </div>
                <div className="stat-bar" style={{ height: "6px" }}>
                  <div
                    className="stat-bar-fill"
                    style={{
                      width: `${levelProgress}%`,
                      background: isActive
                        ? "linear-gradient(90deg, #7c3aed, #a78bfa, #c4b5fd)"
                        : "#374151",
                      boxShadow: isActive ? "0 0 8px rgba(124,58,237,0.6)" : "none",
                    }}
                  />
                </div>
              </div>

              {/* Action hint */}
              <div className="mt-4 font-system text-[10px] tracking-wider text-slate-600 text-center">
                Complete {attr?.emoji} {shadow.attributeAffinity} quests to power up
              </div>
            </article>
          );
        })}
      </div>

      {shadows.length === 0 && (
        <div className="panel p-12 text-center">
          <div className="text-5xl mb-4">👤</div>
          <p className="font-system text-sm text-slate-500 tracking-widest uppercase">
            No Shadows Found
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Your shadow companions will appear here after onboarding.
          </p>
        </div>
      )}
    </div>
  );
}
