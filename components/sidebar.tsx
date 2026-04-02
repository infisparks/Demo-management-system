"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Plus, TrendingUp, LogOut, ChevronLeft, Wallet, Users } from "lucide-react"
import { useSidebar } from "./sidebar-context"

export default function Sidebar() {
  const pathname = usePathname()
  const { isToggled, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/add-project", label: "Add Project", icon: Plus },
    { href: "/expenses", label: "Company Expense", icon: TrendingUp },
    { href: "/moin-mudassir-accounts", label: "Moin & Mudassir Accounts", icon: Users },
  ]

  const handleLogout = async () => {
    await signOut(auth)
  }

  // ✅ For desktop use isToggled; for mobile always full width when open
  const sidebarWidthClass = isMobileOpen ? "w-72" : isToggled ? "w-72" : "w-20"
  
  const positionClasses = `
    fixed top-0 left-0 h-screen z-50 transition-transform duration-300 ease-in-out
    md:sticky md:top-0 md:h-screen md:flex-shrink-0
  `

  return (
    <div
      className={`
        ${positionClasses} 
        ${sidebarWidthClass} 
        bg-slate-900 text-white flex flex-col p-6 shadow-2xl md:shadow-lg
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}
    >
      <div className={`flex flex-col h-full ${isToggled || isMobileOpen ? 'w-full' : 'items-center'}`}>
        
        {/* Header/Toggle Button */}
        <div className={`mb-8 flex ${isToggled || isMobileOpen ? 'justify-between' : 'justify-center'} items-center relative`}>
          {/* Title */}
          <div className={`transition-all duration-200 ease-out ${(isToggled || isMobileOpen) ? 'block' : 'hidden md:block'}`}>
            <h1 className="text-2xl font-bold text-blue-400">Infisparks</h1>
            <p className="text-xs text-slate-400 mt-1">Accounts Management System</p>
          </div>
          
          {/* Desktop Collapse Button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex absolute top-1 -right-10 p-2 rounded-full bg-slate-700 text-white shadow-lg transition-transform duration-300 hover:bg-slate-600 z-10"
            title={isToggled ? "Collapse" : "Expand"}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${isToggled ? 'rotate-0' : 'rotate-180'}`} />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={toggleMobileSidebar}
            className="absolute top-1 right-1 p-1 md:hidden text-slate-300 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={isMobileOpen ? toggleMobileSidebar : undefined}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive ? "bg-blue-600 text-white shadow-md" : "text-slate-300 hover:bg-slate-700"
                  } ${(isToggled || isMobileOpen) ? 'justify-start' : 'justify-center'}`}
                  title={!(isToggled || isMobileOpen) ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className={`font-medium ${(isToggled || isMobileOpen) ? 'block' : 'hidden'} truncate`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className={`mt-auto pb-6 ${(isToggled || isMobileOpen) ? 'w-full' : 'w-10'}`}>
          <Button 
            onClick={handleLogout} 
            variant="destructive" 
            className={`gap-2 bg-red-600 hover:bg-red-700 transition-colors ${(isToggled || isMobileOpen) ? 'w-full' : 'w-10 p-0 h-10'}`}
            title="Logout"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={(isToggled || isMobileOpen) ? 'block' : 'hidden'}>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
