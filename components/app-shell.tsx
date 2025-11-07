"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import Sidebar from "@/components/sidebar"
import { useSidebar } from "@/components/sidebar-context"
import { Menu, Loader2 } from "lucide-react"

export default function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobileOpen, toggleMobileSidebar } = useSidebar()
  const [loading, setLoading] = useState(true)

  // Authentication Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (pathname !== "/login") {
            router.push("/login")
        }
      } 
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, pathname])
  
  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" /> 
            <span className="ml-3 text-slate-700">Loading...</span>
        </div>
    )
  }

  // Hide the shell components for the login page
  if (pathname === "/login") {
    return <>{children}</>
  }

  // Combined Layout Structure
  return (
    // CRITICAL FIX: Simple flex container. Sidebar is sticky/flex-shrink-0 
    // and main is flex-1, which correctly forces the layout side-by-side.
    <div className="flex min-h-screen bg-slate-50"> 
        
        {/* Sidebar Component */}
        <Sidebar />

        {/* Backdrop for mobile, clicks outside close the sidebar */}
        {isMobileOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden" 
                onClick={toggleMobileSidebar}
            />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto`}>
            
            {/* Mobile Header/Toggle Button - Sticky on mobile for easy access */}
            <header className="p-4 md:hidden bg-white shadow-sm sticky top-0 z-20 flex items-center">
                <button 
                    onClick={toggleMobileSidebar} 
                    className="p-2 mr-4 text-slate-700 hover:bg-slate-100 rounded"
                    aria-label="Toggle Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                {/* <h1 className="text-xl font-bold text-blue-400">CMS</h1> */}
            </header>
            
            <div className="p-4 md:p-8">
                {children}
            </div>
        </main>
    </div>
  )
}