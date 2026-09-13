import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — Begin Awakening",
};

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-system text-3xl font-black tracking-widest mb-2" style={{ color: "#2d9cff" }}>
            ⬡ ASCEND
          </div>
          <p className="font-system text-xs tracking-[0.3em] uppercase text-slate-500">
            Begin Your Awakening
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto w-full flex justify-center",
              cardBox: "w-full",
              card: "w-full bg-[rgba(6,3,15,0.95)] border border-[rgba(45,156,255,0.25)] shadow-[0_0_30px_rgba(45,156,255,0.1)] backdrop-blur-xl",
              headerTitle: "font-system text-white tracking-widest",
              headerSubtitle: "text-slate-400",
              formButtonPrimary: "btn-system btn-primary w-full",
              formFieldInput: "input-system",
              formFieldLabel: "label-system",
              footerActionLink: "text-[#2d9cff] hover:text-blue-300",
            },
          }}
        />
      </div>
    </main>
  );
}
