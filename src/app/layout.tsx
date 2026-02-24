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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "XPLife — Gamify Your Daily Quests",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XPLife — Gamify Your Life",
    description: "Turn your real-life goals into quests. Level up, earn XP, unlock rewards.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
