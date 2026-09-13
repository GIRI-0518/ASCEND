"use client";

import { useState, useTransition } from "react";
import { completeQuest } from "@/app/actions/quests";
import { QuestCompleteModal } from "@/components/QuestCompleteModal";

interface Quest {
  id: string;
  title: string;
  description: string | null;
  attributeCategory: string;
  difficulty: string;
  xpReward: number;
  verificationTier: number;
  status: string;
}

interface CompletionResult {
  xpAwarded: number;
  lootRarity: string;
  lootItem: { name: string; rarity: string; iconEmoji: string };
  leveledUp: boolean;
  newLevel?: number;
  rankedUp: boolean;
  newRank?: string;
}

interface QuestCardClientProps {
  quest: Quest;
  attrEmoji: string;
  difficultyColor: string;
}

export function QuestCardClient({ quest, attrEmoji, difficultyColor }: QuestCardClientProps) {
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = () => {
    setError(null);
    startTransition(async () => {
      const result = await completeQuest(quest.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setCompletionResult({
        xpAwarded: result.xpAwarded ?? 0,
        lootRarity: result.lootRarity ?? "Common",
        lootItem: result.lootItem ?? { name: "Unknown Item", rarity: "Common", iconEmoji: "📦" },
        leveledUp: result.leveledUp ?? false,
        newLevel: result.newLevel,
        rankedUp: result.rankedUp ?? false,
        newRank: result.newRank,
      });
      setModalOpen(true);
    });
  };

  return (
    <>
      <article
        id={`quest-${quest.id}`}
        className={`quest-card ${quest.status === "completed" ? "completed" : ""}`}
        aria-label={`Quest: ${quest.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="font-system text-[10px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 border"
                style={{ color: difficultyColor, borderColor: difficultyColor, background: `${difficultyColor}11` }}
              >
                {quest.difficulty}
              </span>
              <span className="font-system text-[10px] tracking-wider text-slate-500 uppercase">
                {attrEmoji} {quest.attributeCategory}
              </span>
              <span className="font-system text-[10px] tracking-wider text-slate-600">
                Tier {quest.verificationTier}
              </span>
            </div>

            <h3 className="font-system font-bold text-base text-white mb-1">
              {quest.title}
            </h3>

            {quest.description && (
              <p className="text-slate-500 text-xs leading-relaxed truncate">
                {quest.description}
              </p>
            )}

            {error && (
              <p className="text-red-400 text-xs mt-2">{error}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="font-system font-black text-lg" style={{ color: "#2d9cff" }}>
              +{quest.xpReward}
              <span className="text-xs font-medium ml-0.5">XP</span>
            </span>

            {quest.status === "active" ? (
              <button
                id={`complete-quest-${quest.id}`}
                onClick={handleComplete}
                disabled={isPending}
                className="btn-system btn-primary text-xs px-3 py-1.5"
                aria-label={`Complete quest: ${quest.title}`}
              >
                {isPending ? "..." : "Complete ✓"}
              </button>
            ) : (
              <span className="font-system text-xs tracking-wider" style={{ color: "#6ee7b7" }}>
                ✓ Done
              </span>
            )}
          </div>
        </div>
      </article>

      <QuestCompleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        result={completionResult}
      />
    </>
  );
}
