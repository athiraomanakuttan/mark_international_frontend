import type React from "react"
import '../lib/localStorageShim'
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/toast-provider"
import  StoreProvider  from "@/lib/redux/StoreProvider"
import { ApiCallMonitor } from "@/components/debug/ApiCallMonitor"
import { PagePerformanceMonitor } from "@/components/debug/PagePerformanceMonitor"
import HeaderErrorBoundary from "@/components/HeaderErrorBoundary"

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
        <HeaderErrorBoundary>
          {children}
          <ToastProvider />
          {process.env.NODE_ENV === 'development' && (
            <>
              <ApiCallMonitor />
              <PagePerformanceMonitor />
            </>
          )}
        </HeaderErrorBoundary>
       </StoreProvider> 
      </body>
    </html>
  )
}
