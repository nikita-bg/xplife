import type { Metadata } from "next";
import { Inter, Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

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
  return (
    <html suppressHydrationWarning>
      <body
        className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
