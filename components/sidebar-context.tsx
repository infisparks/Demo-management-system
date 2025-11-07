"use client"

import { createContext, useContext, useState, useMemo, ReactNode } from 'react'

interface SidebarContextType {
  isToggled: boolean; // For desktop (expanded/collapsed)
  isMobileOpen: boolean; // For mobile (open/closed)
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isToggled, setIsToggled] = useState(true) 
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleSidebar = () => {
    setIsToggled(prev => !prev)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(prev => !prev)
  }

  const contextValue = useMemo(() => ({
    isToggled,
    isMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
  }), [isToggled, isMobileOpen])

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    // This is the check that throws the error if the component is outside the Provider
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}