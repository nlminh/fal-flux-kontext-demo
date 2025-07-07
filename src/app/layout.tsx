import type { Metadata } from "next";
import "./globals.css";
import { CoreProviders } from "./core-providers";
import { focal, hal, halMono, commitMono, inconsolata } from "@/lib/fonts";
import { BotIdClient } from 'botid/client';
import { StagewiseToolbarWrapper } from '@/components/stagewise-toolbar';


export const metadata: Metadata = {
  title: {
    default: "Flux Kontext Dev - AI Style Transfer | Powered by fal.ai",
    template: "%s | Flux Kontext Dev",
  },
  description:
    "Transform your photos with AI-powered style transfer in seconds. Choose from LoRA models and prompt-based styles including anime, oil painting, cyberpunk, and more. Powered by fal.ai's fast AI infrastructure.",
  keywords: [
    "AI style transfer",
    "image transformation",
    "flux model",
    "LoRA",
    "AI art",
    "fal.ai",
    "photo styling",
    "artificial intelligence",
    "machine learning",
    "image generation",
  ],
  authors: [{ name: "fal.ai" }],
  creator: "fal.ai",
  publisher: "fal.ai",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://flux-kontext-demo.vercel.app",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Flux Kontext Dev - AI Style Transfer | Powered by fal.ai",
    description:
      "Transform your photos with AI-powered style transfer in seconds. Choose from LoRA models and prompt-based styles.",
    siteName: "Flux Kontext Dev",
    images: [
      {
        url: "/og-image.jpeg",
        alt: "Flux Kontext Dev - AI Style Transfer Demo",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flux Kontext Dev - AI Style Transfer | Powered by fal.ai",
    description:
      "Transform your photos with AI-powered style transfer in seconds. Choose from LoRA models and prompt-based styles.",
    creator: "@fal_ai",
    site: "@fal_ai",
    images: [
      {
        url: "/og-image.jpeg",
        alt: "Flux Kontext Dev - AI Style Transfer Demo",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={[
        hal.variable,
        halMono.variable,
        focal.variable,
        inconsolata.variable,
        commitMono.variable,
      ].join(" ")}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <BotIdClient protect={[
          {
            path: '/api/fal',
            method: 'POST',
          },
          {
            path: '/api/trpc/*',
            method: 'POST',
          },
        ]} />
      </head>
      <body className={`font-sans bg-background text-foreground min-h-screen`} suppressHydrationWarning>
        <CoreProviders>{children}</CoreProviders>
        {/* <StagewiseToolbarWrapper /> */}
      </body>
    </html>
  );
}
