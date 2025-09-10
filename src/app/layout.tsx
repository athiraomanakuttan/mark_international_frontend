import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/toast-provider"
import  StoreProvider  from "@/lib/redux/StoreProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mark International",
  description: "Sign in to your account",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <StoreProvider>
        {children}
        <ToastProvider />
       </StoreProvider> 
      </body>
    </html>
  )
}
