// app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
// Assuming Geist fonts are correctly imported, though not strictly required for the solution
import { Geist, Geist_Mono } from "next/font/google" 
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { SidebarProvider } from "@/components/sidebar-context"
import AppShell from "@/components/app-shell" // Import the new AppShell

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Company Management System",
  description: "Demo Company Management System - Manage Projects and Expenses",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {/* CRITICAL: Wrap the entire application with the provider */}
        <SidebarProvider>
            {/* AppShell handles the sidebar, auth check, and layout structure */}
            <AppShell>
                {children}
            </AppShell>
        </SidebarProvider>
        <Analytics />
      </body>
    </html>
  )
}