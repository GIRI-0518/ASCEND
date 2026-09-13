import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ASCEND — Life RPG System",
    template: "%s | ASCEND",
  },
  description:
    "The System does not care what you say you did. It cares what you can prove. Level up your real life with ASCEND — a Solo Leveling-inspired Life RPG.",
  keywords: ["life rpg", "habit tracker", "gamification", "solo leveling", "productivity", "ascend"],
  openGraph: {
    title: "ASCEND — Life RPG System",
    description: "Level up your real life. Prove your growth. The System is watching.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className={`${inter.className} bg-void`}>
          <div className="scanlines" aria-hidden="true" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
