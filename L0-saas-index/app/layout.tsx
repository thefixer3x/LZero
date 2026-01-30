import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "L0 | Edge Reasoning Infrastructure for Enterprise",
  description:
    "Millisecond-latency AI that works offline, keeps data home, and costs zero per inference. Enterprise reasoning infrastructure designed for organizations that can't compromise on speed, privacy, or control.",
  keywords: "edge AI, on-device AI, zero latency AI, offline AI, enterprise AI, data privacy, edge reasoning, persistent memory",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "L0 | Reasoning at the Edge",
    description:
      "Zero-latency AI that works offline, keeps data home, and costs zero per inference. Enterprise edge reasoning infrastructure.",
    siteName: "L0",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "L0 Edge Reasoning Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "L0 | Reasoning at the Edge",
    description: "Millisecond-latency AI that works offline, keeps data home, and costs zero per inference.",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
