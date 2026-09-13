"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createQuest } from "@/app/actions/quests";
import { ATTRIBUTE_CATEGORIES } from "@/lib/game-engine";

const DIFFICULTIES = [
  { value: "Easy", label: "Easy", desc: "+50 XP", color: "#6ee7b7" },
  { value: "Normal", label: "Normal", desc: "+100 XP", color: "#60a5fa" },
  { value: "Hard", label: "Hard", desc: "+200 XP", color: "#f59e0b" },
  { value: "Extreme", label: "Extreme", desc: "+500 XP", color: "#ef4444" },
];

const TIERS = [
  { value: 1, label: "Self-Attest", desc: "Your word. 1x XP" },
  { value: 2, label: "Photo Proof", desc: "Upload evidence. 1.5x XP" },
];

export default function NewQuestPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(async (prevState: unknown, formData: FormData) => {
    const result = await createQuest(prevState, formData);
    if (result?.success) {
      router.push("/quests");
      return result;
    }
    return result;
  }, null);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="font-system text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#2d9cff" }}>
          ◈ System Quest Interface ◈
        </div>
        <h1 className="font-system font-black text-3xl text-white tracking-wider">
          Create Quest
        </h1>
      </div>

      <div className="panel panel-cornered">
        <div className="system-header">Quest Configuration</div>
        <form action={formAction} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="quest-title" className="label-system">Quest Title</label>
            <input
              id="quest-title"
              name="title"
              type="text"
              required
              maxLength={80}
              placeholder="e.g., Complete 30-minute workout"
              className="input-system"
              autoComplete="off"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="quest-description" className="label-system">
              Description <span className="text-slate-600 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              id="quest-description"
              name="description"
              rows={2}
              placeholder="What exactly will you do to complete this quest?"
              className="input-system resize-none"
            />
          </div>

          {/* Attribute */}
          <div>
            <label className="label-system">Attribute Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ATTRIBUTE_CATEGORIES.map((attr) => (
                <label
                  key={attr.id}
                  className="flex items-center gap-2 p-3 border border-[rgba(45,156,255,0.2)] cursor-pointer transition-all hover:border-[rgba(45,156,255,0.5)] has-[:checked]:border-[#2d9cff] has-[:checked]:bg-[rgba(45,156,255,0.08)] rounded-sm"
                >
                  <input
                    type="radio"
                    name="attributeCategory"
                    value={attr.id}
                    defaultChecked={attr.id === "Intellect"}
                    className="sr-only"
                  />
                  <span className="text-xl">{attr.emoji}</span>
                  <div>
                    <div className="font-system text-xs font-bold text-white">{attr.label}</div>
                    <div className="font-system text-[10px] text-slate-500">{attr.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="label-system">Difficulty</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIFFICULTIES.map((diff) => (
                <label
                  key={diff.value}
                  className="relative flex flex-col items-center p-3 border cursor-pointer transition-all rounded-sm has-[:checked]:bg-opacity-10"
                  style={{ borderColor: "rgba(45,156,255,0.2)" }}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={diff.value}
                    defaultChecked={diff.value === "Normal"}
                    className="sr-only"
                  />
                  <span className="font-system font-bold text-sm" style={{ color: diff.color }}>
                    {diff.label}
                  </span>
                  <span className="font-system text-[10px] text-slate-500 mt-0.5">{diff.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Verification Tier */}
          <div>
            <label className="label-system">Verification Tier</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TIERS.map((tier) => (
                <label
                  key={tier.value}
                  className="flex items-center gap-3 p-3 border border-[rgba(45,156,255,0.2)] cursor-pointer transition-all hover:border-[rgba(45,156,255,0.5)] has-[:checked]:border-[#2d9cff] has-[:checked]:bg-[rgba(45,156,255,0.08)] rounded-sm"
                >
                  <input
                    type="radio"
                    name="verificationTier"
                    value={tier.value}
                    defaultChecked={tier.value === 1}
                    className="sr-only"
                  />
                  <div>
                    <div className="font-system text-xs font-bold text-white">Tier {tier.value} — {tier.label}</div>
                    <div className="font-system text-[10px] text-slate-500">{tier.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Daily toggle */}
          <div className="flex items-center justify-between py-3 border-t border-[rgba(45,156,255,0.1)]">
            <div>
              <div className="font-system text-xs font-bold tracking-wider text-white">Daily Quest</div>
              <div className="font-system text-[10px] text-slate-500">Resets every day. Part of your streak.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="isDaily" value="true" className="sr-only peer" />
              <div className="w-10 h-5 rounded-full border border-[rgba(45,156,255,0.3)] bg-[rgba(4,2,15,0.8)] peer-checked:border-[#2d9cff] peer-checked:bg-[rgba(45,156,255,0.2)] transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:rounded-full after:bg-slate-500 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-[#2d9cff]" />
            </label>
          </div>

          {/* Error */}
          {state && "error" in state && state.error && (
            <div className="system-toast border-red-500" style={{ borderColor: "#ef4444", background: "rgba(239,68,68,0.05)" }}>
              <p className="text-red-400 text-sm font-system">{state.error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              id="create-quest-submit"
              disabled={isPending}
              className="btn-system btn-primary flex-1 py-3"
            >
              {isPending ? "Creating..." : "⚔️ Register Quest"}
            </button>
            <a href="/quests" className="btn-system py-3 px-6">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
