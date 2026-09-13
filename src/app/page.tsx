import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "ASCEND — Arise, Hunter",
  description:
    "Transform your real-life tasks into a verified progression system. Level up, collect loot, and command your Shadow Army. The System is watching.",
};

const FEATURES = [
  {
    icon: "⚔️",
    title: "Quest System",
    desc: "Create real-world quests tied to your goals. Completion earns XP scaled by difficulty and proof tier.",
  },
  {
    icon: "🎲",
    title: "Loot Roll System",
    desc: "Every quest completion triggers a loot drop — from Common to Mythic rarity. Genuine curiosity loop.",
  },
  {
    icon: "👤",
    title: "Shadow Army",
    desc: "Five Shadow Companions level alongside you, specializing in your chosen attributes.",
  },
  {
    icon: "🏆",
    title: "Rank System",
    desc: "Climb from E-Rank to Monarch through verified effort — not just clicking buttons.",
  },
  {
    icon: "✅",
    title: "Verification Tiers",
    desc: "Self-attest or upload photo proof. Higher tiers = higher XP and better loot odds.",
  },
  {
    icon: "🔥",
    title: "Streak Tracking",
    desc: "Maintain daily streaks per attribute. Your shadows grow weaker if you slack.",
  },
];

const RANKS = [
  { rank: "E", color: "#94a3b8" },
  { rank: "D", color: "#6ee7b7" },
  { rank: "C", color: "#60a5fa" },
  { rank: "B", color: "#a78bfa" },
  { rank: "A", color: "#f59e0b" },
  { rank: "S", color: "#f97316" },
  { rank: "SS", color: "#ef4444" },
  { rank: "SSS", color: "#ec4899" },
  { rank: "Monarch", color: "#7c3aed" },
];

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-void relative overflow-x-hidden flex flex-col items-center w-full">
      {/* Background particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              background: i % 3 === 0 ? "#2d9cff" : i % 3 === 1 ? "#a78bfa" : "#ffffff",
              opacity: Math.random() * 0.4 + 0.1,
              animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + "s",
            }}
          />
        ))}
      </div>

      {/* Nav */}
      <nav className="relative z-10 w-full border-b border-[rgba(45,156,255,0.15)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
          <div className="font-system text-2xl font-bold tracking-widest text-white">
            <span style={{ color: "#2d9cff" }}>⬡</span>{" "}
            <span>ASCEND</span>
          </div>
          <div className="flex items-center gap-4">
            {!userId ? (
              <>
                <Link href="/sign-in" className="btn-system text-sm">
                  Sign In
                </Link>
                <Link href="/sign-up" className="btn-system btn-primary text-sm">
                  Arise, Hunter →
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="btn-system btn-primary text-sm">
                  Open System →
                </Link>
                <UserButton />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 w-full max-w-5xl mx-auto">
        {/* Pre-title */}
        <div
          className="font-system text-xs font-bold tracking-[0.3em] uppercase mb-6 px-4 py-2 border border-[rgba(45,156,255,0.3)] rounded-sm"
          style={{ color: "#2d9cff", background: "rgba(45,156,255,0.05)" }}
        >
          ◈ System Notification ◈
        </div>

        {/* Main Title */}
        <h1
          className="font-system font-black tracking-widest mb-4 leading-none"
          style={{
            fontSize: "clamp(3.5rem, 10vw, 7.5rem)",
            background: "linear-gradient(135deg, #ffffff 0%, #2d9cff 40%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ASCEND
        </h1>

        <p
          className="font-system text-lg md:text-xl font-medium tracking-wider mb-3 max-w-2xl"
          style={{ color: "#2d9cff" }}
        >
          THE SOLO LEVELING LIFE RPG
        </p>

        <p className="text-slate-400 text-base md:text-lg max-w-xl mb-2 leading-relaxed">
          The System does not care what you say you did.
        </p>
        <p className="text-slate-400 text-base md:text-lg max-w-xl mb-10 leading-relaxed">
          <strong style={{ color: "#e2e8f0" }}>It cares what you can prove.</strong>
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {!userId ? (
            <>
              <Link
                href="/sign-up"
                className="btn-system btn-primary px-8 py-3 text-base"
              >
                ⚡ Begin Awakening
              </Link>
              <Link href="/sign-in" className="btn-system px-8 py-3 text-base">
                Access System
              </Link>
            </>
          ) : (
            <Link href="/dashboard" className="btn-system btn-primary px-8 py-3 text-base">
              ⚡ Open System →
            </Link>
          )}
        </div>

        {/* Rank preview */}
        <div className="flex items-center gap-2.5 mt-16 flex-wrap justify-center max-w-3xl mx-auto">
          {RANKS.map(({ rank, color }) => (
            <div
              key={rank}
              className="font-system font-bold flex items-center justify-center shrink-0 px-3 py-1.5 rounded-md border transition-all hover:scale-105"
              style={{
                minWidth: "40px",
                height: "38px",
                color,
                borderColor: `${color}99`,
                background: `${color}15`,
                boxShadow: `0 0 14px ${color}33`,
                fontSize: rank.length > 3 ? "0.7rem" : rank.length > 1 ? "0.8rem" : "0.95rem",
                letterSpacing: "0.05em",
              }}
            >
              {rank}
            </div>
          ))}
          <span className="text-slate-500 text-xs font-system tracking-widest ml-2 shrink-0 uppercase">
            E → MONARCH
          </span>
        </div>
      </section>

      {/* Divider */}
      <div
        className="relative z-10 w-full h-px mx-auto max-w-4xl my-16"
        style={{ background: "linear-gradient(90deg, transparent, rgba(45,156,255,0.4), transparent)" }}
      />

      {/* Features Grid */}
      <section className="relative z-10 px-6 pb-20 w-full max-w-5xl mx-auto flex flex-col items-center">
        <h2 className="font-system text-center text-2xl font-bold tracking-[0.15em] uppercase mb-12" style={{ color: "#2d9cff" }}>
          ◈ System Features ◈
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {FEATURES.map((f) => (
            <article key={f.title} className="panel panel-cornered p-6 flex flex-col">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-system font-bold text-base tracking-wider uppercase mb-2" style={{ color: "#2d9cff" }}>
                {f.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 pb-24 w-full max-w-3xl mx-auto flex flex-col items-center text-center">
        <h2 className="font-system text-2xl font-bold tracking-[0.15em] uppercase mb-10" style={{ color: "#2d9cff" }}>
          ◈ The Core Loop ◈
        </h2>
        <div className="space-y-4 w-full">
          {[
            { n: "01", title: "Create a Quest", desc: "Set your real-world goal with a difficulty and attribute category." },
            { n: "02", title: "Complete & Prove It", desc: "Self-attest (Tier 1) or upload photo proof (Tier 2) for bonus XP." },
            { n: "03", title: "Roll the Loot", desc: "Every completion triggers a rarity roll. Common → Mythic. No guarantees." },
            { n: "04", title: "Level Up Your Life", desc: "Watch XP bar fill, rank up, and your Shadow Army grow stronger." },
          ].map(({ n, title, desc }) => (
            <div key={n} className="panel flex items-start gap-4 p-5 text-left w-full">
              <span
                className="font-system font-black text-2xl shrink-0 tabular-nums"
                style={{ color: "rgba(45,156,255,0.4)" }}
              >
                {n}
              </span>
              <div>
                <h3 className="font-system font-bold text-base tracking-wider uppercase mb-1" style={{ color: "#e2e8f0" }}>
                  {title}
                </h3>
                <p className="text-slate-400 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-24 w-full flex justify-center">
        <div className="panel w-full max-w-2xl p-10 panel-bright text-center">
          <div
            className="font-system text-xs tracking-[0.3em] uppercase mb-4"
            style={{ color: "#2d9cff" }}
          >
            ◈ System Alert ◈
          </div>
          <h2 className="font-system font-black text-3xl md:text-4xl tracking-widest uppercase mb-4 text-white">
            YOU HAVE BEEN<br />SELECTED
          </h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-md mx-auto">
            The Awakening has begun. Register your hunter license and prove your worth to the System.
          </p>
          {!userId ? (
            <Link href="/sign-up" className="btn-system btn-primary px-10 py-3 text-base inline-flex">
              ⚡ Arise
            </Link>
          ) : (
            <Link href="/dashboard" className="btn-system btn-primary px-10 py-3 text-base inline-flex">
              ⚡ Enter the System
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[rgba(45,156,255,0.15)] px-8 py-6 text-center w-full mt-auto">
        <p className="font-system text-xs tracking-widest uppercase text-slate-600">
          ASCEND © 2026 — THE SYSTEM IS WATCHING
        </p>
      </footer>
    </main>
  );
}
