import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XPLife — Gamify Your Life",
  description: "Turn your real-life goals into quests. Level up, earn XP, unlock rewards, and join a community of players leveling up together.",
  keywords: [
    "gamified to-do list",
    "RPG productivity app",
    "ADHD planner",
    "XPLife app",
    "habit tracker",
    "productivity gamification",
    "task management RPG",
    "level up your life"
  ],
  metadataBase: new URL("https://xplife.app"),
  alternates: {
    canonical: "/",
    languages: {
      "en": "/en",
      "bg": "/bg",
    },
  },
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

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "XPLife",
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Turn your real-life goals into quests. Level up, earn XP, unlock rewards, and join a community of players leveling up together."
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is XPLife?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "XPLife is a gamified productivity app that turns your daily tasks into RPG-style quests. Earn XP, level up, and unlock rewards as you complete real-life goals. It's designed specifically for people who want to make productivity fun and engaging."
          }
        },
        {
          "@type": "Question",
          "name": "Is XPLife a good Habitica alternative?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, XPLife is an excellent alternative to Habitica with modern design, enhanced gamification features, and ADHD-friendly task management. Unlike Habitica, XPLife focuses on simplicity and a clean user experience while maintaining deep RPG mechanics."
          }
        },
        {
          "@type": "Question",
          "name": "Is XPLife suitable for people with ADHD?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, XPLife is specifically designed to help people with ADHD stay motivated. The gamification elements provide immediate dopamine rewards, while the quest-based system breaks down overwhelming tasks into manageable steps."
          }
        },
        {
          "@type": "Question",
          "name": "What makes XPLife different from other productivity apps?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "XPLife is NOT a printer app or food delivery service - it's a pure productivity application. What makes it unique is the deep RPG integration, community features, and psychology-based reward systems that make completing tasks genuinely enjoyable."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
