import { Buenard as Pretendard } from "next/font/google"
import { Inter } from "next/font/google"
import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const pretendard = Pretendard({
  subsets: ["latin", "korean"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pretendard",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Obryn AI Chat",
  description: "Obryn AI Chat Interface",
  generator: "v0.app",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    interactiveWidget: "resizes-content",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${pretendard.variable} ${inter.variable}`} style={{ colorScheme: "dark" }}>
      <body className={`font-sans antialiased bg-background text-foreground overflow-hidden`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
