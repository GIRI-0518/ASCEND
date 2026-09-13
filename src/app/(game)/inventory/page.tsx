import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Your collected loot items from completed quests.",
};

const RARITY_CONFIG: Record<string, { color: string; glow: string; bgGlow: string }> = {
  Common: { color: "#94a3b8", glow: "rgba(148,163,184,0.3)", bgGlow: "rgba(148,163,184,0.05)" },
  Rare: { color: "#60a5fa", glow: "rgba(96,165,250,0.4)", bgGlow: "rgba(96,165,250,0.08)" },
  Epic: { color: "#a78bfa", glow: "rgba(167,139,250,0.5)", bgGlow: "rgba(167,139,250,0.1)" },
  Legendary: { color: "#f59e0b", glow: "rgba(245,158,11,0.6)", bgGlow: "rgba(245,158,11,0.12)" },
  Mythic: { color: "#ec4899", glow: "rgba(236,72,153,0.8)", bgGlow: "rgba(236,72,153,0.15)" },
};

export default async function InventoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.orm.public.User.where({ clerkId: userId }).first();
  if (!user) redirect("/onboarding");

  const items = await db.orm.public.InventoryItem.where({ userId: user.id })
    .orderBy([(i) => i.acquiredAt.desc()])
    .all();

  // Group by rarity
  const rarityOrder = ["Mythic", "Legendary", "Epic", "Rare", "Common"];
  const grouped: Record<string, typeof items> = {};
  for (const rarity of rarityOrder) {
    grouped[rarity] = items.filter((i) => i.rarity === rarity);
  }

  const totalItems = items.length;
  const rarityCounts = rarityOrder.map((r) => ({
    rarity: r,
    count: grouped[r].length,
    config: RARITY_CONFIG[r],
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="font-system text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#2d9cff" }}>
          ◈ Hunter Inventory ◈
        </div>
        <h1 className="font-system font-black text-3xl text-white tracking-wider">
          Item Storage
        </h1>
        <p className="font-system text-xs text-slate-500 mt-1 tracking-wider">
          {totalItems} items collected
        </p>
      </div>

      {/* Rarity summary */}
      <div className="flex flex-wrap gap-2">
        {rarityCounts.filter((r) => r.count > 0).map(({ rarity, count, config }) => (
          <div
            key={rarity}
            className="font-system text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 border"
            style={{
              color: config.color,
              borderColor: config.color,
              background: config.bgGlow,
              boxShadow: `0 0 10px ${config.glow}`,
            }}
          >
            {rarity}: {count}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {totalItems === 0 && (
        <div className="panel p-16 text-center">
          <div className="text-5xl mb-4">🎒</div>
          <p className="font-system text-sm text-slate-500 tracking-widest uppercase">Inventory Empty</p>
          <p className="text-slate-600 text-xs mt-2">
            Complete quests to roll for loot drops.
          </p>
        </div>
      )}

      {/* Items by rarity */}
      {rarityOrder.map((rarity) => {
        const rarityItems = grouped[rarity];
        if (rarityItems.length === 0) return null;
        const config = RARITY_CONFIG[rarity];

        return (
          <section key={rarity} className="space-y-3">
            <h2
              className="font-system text-sm font-bold tracking-[0.2em] uppercase"
              style={{ color: config.color, textShadow: `0 0 10px ${config.glow}` }}
            >
              ◈ {rarity} ({rarityItems.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rarityItems.map((item) => {
                let stats: Record<string, number> = {};
                try { stats = JSON.parse(item.statsJson ?? "{}"); } catch {}

                return (
                  <article
                    key={item.id}
                    id={`item-${item.id}`}
                    className="panel p-4 transition-all"
                    style={{
                      borderColor: config.color,
                      boxShadow: `0 0 15px ${config.glow}`,
                      background: config.bgGlow,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="text-3xl shrink-0 w-12 h-12 flex items-center justify-center border rounded-sm"
                        style={{ borderColor: config.color, background: "rgba(0,0,0,0.4)" }}
                      >
                        {item.iconEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-system font-bold text-sm text-white truncate">
                          {item.name}
                        </div>
                        <div
                          className="font-system text-[10px] font-bold tracking-[0.15em] uppercase mt-0.5"
                          style={{ color: config.color }}
                        >
                          {rarity} · {item.itemType}
                        </div>
                        {item.description && (
                          <p className="text-slate-500 text-[10px] mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    {Object.keys(stats).length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {Object.entries(stats).map(([stat, value]) => (
                          <div key={stat} className="flex items-center gap-2">
                            <span className="font-system text-[10px] uppercase tracking-wider text-slate-500 w-20 shrink-0">
                              {stat}
                            </span>
                            <div className="flex-1 stat-bar">
                              <div
                                className="stat-bar-fill"
                                style={{
                                  width: `${Math.min(100, value)}%`,
                                  background: `linear-gradient(90deg, ${config.color}66, ${config.color})`,
                                }}
                              />
                            </div>
                            <span
                              className="font-system text-[10px] font-bold w-6 text-right shrink-0"
                              style={{ color: config.color }}
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.equipped && (
                      <div className="mt-3 font-system text-[10px] tracking-widest uppercase text-center py-1"
                        style={{ color: "#6ee7b7", border: "1px solid rgba(110,231,183,0.3)", background: "rgba(110,231,183,0.05)" }}>
                        ✓ Equipped
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
