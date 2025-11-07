"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-slate-600">Redirecting...</p>
    </div>
  )
}
