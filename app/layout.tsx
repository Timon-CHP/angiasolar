import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AnGia Solar - Điện Mặt Trời",
  description: "Giải pháp điện mặt trời cho nhà ở và doanh nghiệp",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}><Suspense>{children}</Suspense></body>
    </html>
  )
}



import { Suspense } from "react"
import './globals.css'

