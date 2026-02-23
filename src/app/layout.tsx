import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XPLife — Gamify Your Life",
  description: "Turn your real-life goals into quests. Level up, earn XP, unlock rewards, and join a community of players leveling up together.",
  metadataBase: new URL("https://xplife.app"),
  openGraph: {
    title: "XPLife — Gamify Your Life",
    description: "Turn your real-life goals into quests. Level up, earn XP, unlock rewards.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

