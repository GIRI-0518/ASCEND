"use client";

import { useEffect, useRef } from "react";

interface QuestCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    xpAwarded: number;
    lootRarity: string;
    lootItem: { name: string; rarity: string; iconEmoji: string };
    leveledUp: boolean;
    newLevel?: number;
    rankedUp: boolean;
    newRank?: string;
  } | null;
}

const RARITY_CONFIG: Record<
  string,
  { color: string; glow: string; label: string; bgGlow: string }
> = {
  Common: { color: "#94a3b8", glow: "rgba(148,163,184,0.3)", label: "COMMON", bgGlow: "rgba(148,163,184,0.05)" },
  Rare: { color: "#60a5fa", glow: "rgba(96,165,250,0.5)", label: "RARE", bgGlow: "rgba(96,165,250,0.08)" },
  Epic: { color: "#a78bfa", glow: "rgba(167,139,250,0.6)", label: "EPIC", bgGlow: "rgba(167,139,250,0.1)" },
  Legendary: { color: "#f59e0b", glow: "rgba(245,158,11,0.7)", label: "LEGENDARY", bgGlow: "rgba(245,158,11,0.12)" },
  Mythic: { color: "#ec4899", glow: "rgba(236,72,153,0.9)", label: "MYTHIC", bgGlow: "rgba(236,72,153,0.15)" },
};

export function QuestCompleteModal({ isOpen, onClose, result }: QuestCompleteModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const xpBarRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const awakeningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !result) return;

    // Dynamically import GSAP to avoid SSR issues
    const animate = async () => {
      const { gsap } = await import("gsap");

      const tl = gsap.timeline();

      // 1. Fade in overlay
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      // 2. Card scale in
      tl.fromTo(
        cardRef.current,
        { scale: 0.8, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" },
        "-=0.1"
      );

      // 3. XP bar fill animation
      if (xpBarRef.current) {
        const fill = xpBarRef.current.querySelector(".xp-bar-fill") as HTMLElement;
        if (fill) {
          gsap.fromTo(
            fill,
            { width: "0%" },
            { width: fill.dataset.target ?? "60%", duration: 1.2, ease: "power3.out", delay: 0.5 }
          );
        }
      }

      // 4. Particle burst
      if (particlesRef.current) {
        const particles = particlesRef.current.children;
        gsap.fromTo(
          particles,
          { scale: 0, opacity: 1 },
          {
            scale: 1,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.05,
            delay: 0.4,
            x: () => (Math.random() - 0.5) * 200,
            y: () => (Math.random() - 0.5) * 200,
          }
        );
      }

      // 5. Rank-up Awakening cinematic
      if (result.rankedUp && awakeningRef.current) {
        tl.to(
          overlayRef.current,
          {
            backgroundColor: "rgba(0,0,0,0.98)",
            duration: 0.5,
            delay: 1.5,
          },
          "+=1"
        );

        tl.fromTo(
          awakeningRef.current,
          { opacity: 0, scale: 2 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "power4.out" }
        );

        // Flash effect
        tl.to(awakeningRef.current, { opacity: 0, duration: 0.1 });
        tl.to(awakeningRef.current, { opacity: 1, duration: 0.1 });
        tl.to(awakeningRef.current, { opacity: 0, duration: 0.1 });
        tl.to(awakeningRef.current, { opacity: 1, duration: 0.3 });

        // Hold then fade out
        tl.to(awakeningRef.current, { opacity: 0, duration: 0.4, delay: 2 });
      }
    };

    animate();
  }, [isOpen, result]);

  const handleClose = async () => {
    const { gsap } = await import("gsap");
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.25,
      onComplete: onClose,
    });
  };

  if (!isOpen || !result) return null;

  const rarity = result.lootRarity;
  const rarityConfig = RARITY_CONFIG[rarity] ?? RARITY_CONFIG.Common;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)", opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Quest Complete"
    >
      {/* Particle burst */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: "6px",
              height: "6px",
              background: rarityConfig.color,
              boxShadow: `0 0 8px ${rarityConfig.glow}`,
            }}
          />
        ))}
      </div>

      {/* Awakening overlay (rank-up only) */}
      {result.rankedUp && (
        <div
          ref={awakeningRef}
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ opacity: 0, zIndex: 60 }}
        >
          <div
            className="font-system font-black tracking-[0.3em] uppercase mb-4"
            style={{
              fontSize: "clamp(2rem, 8vw, 6rem)",
              background: "linear-gradient(135deg, #2d9cff, #a78bfa)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            RANK UP
          </div>
          <div
            className="font-system font-bold text-2xl tracking-[0.5em] uppercase"
            style={{ color: "#2d9cff" }}
          >
            {result.newRank}-RANK
          </div>
          <div className="mt-8 font-system text-sm tracking-[0.3em] uppercase text-slate-500">
            The System acknowledges your growth.
          </div>
        </div>
      )}

      {/* Main card */}
      <div
        ref={cardRef}
        className="panel panel-bright relative max-w-md w-full mx-4 overflow-hidden"
        style={{ opacity: 0 }}
      >
        {/* Header */}
        <div className="system-header">
          ◈ Quest Reward ◈
        </div>

        <div className="p-6 space-y-5">
          {/* XP Awarded */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-system text-xs font-bold tracking-widest uppercase text-slate-400">
                XP Gained
              </span>
              <span
                className="font-system font-black text-2xl"
                style={{ color: "#2d9cff" }}
              >
                +{result.xpAwarded.toLocaleString()}
              </span>
            </div>
            <div ref={xpBarRef} className="xp-bar-container">
              <div
                className="xp-bar-fill"
                data-target="60%"
                style={{ width: "0%" }}
              />
            </div>
            <div className="font-system text-[10px] tracking-wider text-slate-600 text-right mt-1">
              {result.leveledUp ? `LEVEL UP! → Lv.${result.newLevel}` : `Lv.${result.newLevel} Progress`}
            </div>
          </div>

          {/* Loot Drop */}
          <div
            className="border rounded-sm p-4 text-center"
            style={{
              borderColor: rarityConfig.color,
              background: rarityConfig.bgGlow,
              boxShadow: `0 0 20px ${rarityConfig.glow}`,
            }}
          >
            <div className="font-system text-xs tracking-[0.3em] uppercase mb-2 text-slate-400">
              Item Drop
            </div>
            <div className="text-4xl mb-2">{result.lootItem.iconEmoji}</div>
            <div
              className="font-system font-bold text-base tracking-wider"
              style={{ color: rarityConfig.color }}
            >
              {result.lootItem.name}
            </div>
            <div
              className="font-system text-xs tracking-[0.2em] uppercase mt-1 font-bold"
              style={{ color: rarityConfig.color, textShadow: `0 0 8px ${rarityConfig.glow}` }}
            >
              ◈ {rarityConfig.label} ◈
            </div>
          </div>

          {/* Level/Rank up banners */}
          {result.leveledUp && !result.rankedUp && (
            <div
              className="panel py-2 px-4 text-center"
              style={{ borderColor: "#2d9cff", boxShadow: "0 0 15px rgba(45,156,255,0.3)" }}
            >
              <span className="font-system font-bold tracking-widest text-white">
                ⬡ LEVEL UP → Lv.{result.newLevel}
              </span>
            </div>
          )}

          {result.rankedUp && (
            <div
              className="panel py-2 px-4 text-center"
              style={{ borderColor: "#f59e0b", boxShadow: "0 0 20px rgba(245,158,11,0.4)" }}
            >
              <span className="font-system font-bold tracking-widest text-white">
                👑 RANK UP → {result.newRank}-RANK
              </span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={handleClose}
            id="quest-complete-close"
            className="btn-system btn-primary w-full py-3"
          >
            Claim Reward
          </button>
        </div>
      </div>
    </div>
  );
}
