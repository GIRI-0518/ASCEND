"use client";

import { useActionState } from "react";
import { createUserProfile } from "@/app/actions/user";

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState(createUserProfile, null);

  return (
    <main className="min-h-screen bg-void flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(45,156,255,0.06) 0%, transparent 70%)" }}
        />
      </div>

      <div className="panel panel-bright max-w-md w-full relative z-10">
        <div className="system-header text-center">
          ◈ Hunter Registration ◈
        </div>

        <div className="p-8">
          {/* Awakening message */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 animate-float">⚡</div>
            <h1 className="font-system font-black text-2xl text-white tracking-widest mb-2">
              ARISE, HUNTER
            </h1>
            <p className="font-system text-xs tracking-[0.2em] uppercase text-slate-500">
              The System acknowledges your awakening.
            </p>
            <p className="font-system text-xs tracking-[0.2em] uppercase text-slate-500 mt-1">
              Register your hunter identity to proceed.
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            {/* Display name */}
            <div>
              <label htmlFor="onboard-display-name" className="label-system">
                Hunter Name
              </label>
              <input
                id="onboard-display-name"
                name="displayName"
                type="text"
                required
                maxLength={40}
                placeholder="Your hunter name (e.g., Sung Jinwoo)"
                className="input-system"
                autoComplete="name"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="onboard-username" className="label-system">
                Hunter ID
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 font-system text-sm"
                  style={{ color: "#2d9cff" }}
                >
                  @
                </span>
                <input
                  id="onboard-username"
                  name="username"
                  type="text"
                  required
                  minLength={3}
                  maxLength={24}
                  placeholder="lowercase_id"
                  pattern="[a-z0-9_]+"
                  className="input-system pl-8"
                  autoComplete="username"
                />
              </div>
              <p className="font-system text-[10px] text-slate-600 mt-1 tracking-wider">
                Lowercase letters, numbers, underscores only
              </p>
            </div>

            {/* Error */}
            {state && "error" in state && state.error && (
              <div
                className="panel py-3 px-4"
                style={{ borderColor: "#ef4444", background: "rgba(239,68,68,0.05)" }}
              >
                <p className="font-system text-sm text-red-400">{state.error}</p>
              </div>
            )}

            {/* System notice */}
            <div className="py-3 px-4 border border-[rgba(45,156,255,0.15)] bg-[rgba(45,156,255,0.05)]">
              <p className="font-system text-[10px] tracking-wider text-slate-500">
                ◈ You will begin at E-Rank. Your Shadow Army will be awakened upon registration. Prove your worth to ascend.
              </p>
            </div>

            <button
              type="submit"
              id="onboarding-submit"
              disabled={isPending}
              className="btn-system btn-primary w-full py-4 text-base"
            >
              {isPending ? "Awakening..." : "⚡ Enter the System"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
