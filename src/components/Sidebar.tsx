"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "⬡" },
  { href: "/quests", label: "Quest Board", icon: "⚔️" },
  { href: "/inventory", label: "Inventory", icon: "🎒" },
  { href: "/shadows", label: "Shadow Army", icon: "👤" },
];

interface SidebarProps {
  user: {
    displayName: string;
    username: string;
    hunterRank: string;
    currentLevel: number;
    totalXp: number;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const rankColors: Record<string, string> = {
    E: "#94a3b8", D: "#6ee7b7", C: "#60a5fa", B: "#a78bfa",
    A: "#f59e0b", S: "#f97316", SS: "#ef4444", SSS: "#ec4899",
    National: "#fbbf24", Monarch: "#7c3aed",
  };
  const rankColor = rankColors[user.hunterRank] ?? "#94a3b8";

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen sticky top-0 border-r border-[rgba(45,156,255,0.15)] bg-[rgba(4,2,15,0.95)]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(45,156,255,0.15)]">
        <div className="font-system text-lg font-bold tracking-widest" style={{ color: "#2d9cff" }}>
          ⬡ ASCEND
        </div>
        <div className="font-system text-[10px] tracking-[0.2em] uppercase text-slate-600 mt-0.5">
          Life RPG System
        </div>
      </div>

      {/* Hunter Profile */}
      <div className="px-4 py-4 border-b border-[rgba(45,156,255,0.1)]">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center text-sm font-system font-black shrink-0"
            style={{
              width: "44px",
              height: "44px",
              color: rankColor,
              border: `2px solid ${rankColor}`,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              boxShadow: `0 0 12px ${rankColor}44`,
              fontSize: user.hunterRank.length > 1 ? "0.6rem" : "1rem",
            }}
          >
            {user.hunterRank}
          </div>
          <div className="min-w-0">
            <div className="font-system font-bold text-sm text-white truncate">
              {user.displayName}
            </div>
            <div className="font-system text-[11px] tracking-wider text-slate-500 uppercase">
              Lv.{user.currentLevel} Hunter
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-3">
          <div className="xp-bar-container">
            <div
              className="xp-bar-fill"
              style={{ width: `${Math.min(100, (user.totalXp % 1000) / 10)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-system text-[10px] text-slate-600 tracking-wider">XP</span>
            <span className="font-system text-[10px] tracking-wider" style={{ color: "#2d9cff" }}>
              {user.totalXp.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Game navigation">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${pathname === href ? "active" : ""}`}
          >
            <span className="text-base" aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom: User + Sign out */}
      <div className="px-4 py-4 border-t border-[rgba(45,156,255,0.1)] flex items-center justify-between">
        <Link
          href={`/profile/${user.username}`}
          className="font-system text-xs tracking-widest uppercase text-slate-500 hover:text-slate-300 transition-colors"
        >
          Hunter License
        </Link>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
              userButtonPopoverCard: "bg-[#06030f] border border-[rgba(45,156,255,0.2)]",
            },
          }}
        />
      </div>
    </aside>
  );
}
