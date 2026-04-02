"use client"

import { useEffect, useState } from "react"
import { ref, onValue } from "firebase/database"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Briefcase, TrendingDown, Wallet, Users } from "lucide-react"

export default function DashboardStats() {
  const [stats, setStats] = useState({
    bankAmount: 0,
    totalProjects: 0,
    totalExpense: 0,
    totalPersonalExpense: 0,
    revenue: 0,
  })

  useEffect(() => {
    // Fetch all projects to get total projects count and revenue
    const projectsRef = ref(db, "Projects")
    const unsubscribeProjects = onValue(projectsRef, (snapshot) => {
      let totalProjects = 0
      let totalRevenue = 0

      if (snapshot.exists()) {
        const projects = snapshot.val()
        totalProjects = Object.keys(projects).length

        Object.values(projects as any).forEach((project: any) => {
          if (project.AmountHistory) {
            Object.values(project.AmountHistory).forEach((payment: any) => {
              totalRevenue += payment.amount || 0
            })
          }
        })
      }

      setStats((prev) => ({
        ...prev,
        totalProjects,
        revenue: totalRevenue,
        // The bank amount logic seems fine, relying on totalExpense from the other listener
        bankAmount: totalRevenue - prev.totalExpense, 
      }))
    })

    // Fetch all expenses
    const expensesRef = ref(db, "expenses")
    const unsubscribeExpenses = onValue(expensesRef, (snapshot) => {
      let totalExpense = 0

      if (snapshot.exists()) {
        const expenses = snapshot.val()
        Object.values(expenses as any).forEach((expense: any) => {
          totalExpense += expense.amount || 0
        })
      }

      setStats((prev) => ({
        ...prev,
        totalExpense,
        // Update bank amount based on new expense and existing revenue
        bankAmount: prev.revenue - totalExpense - prev.totalPersonalExpense,
      }))
    })

    // Fetch personal Moin & Mudassir expenses
    const personalExpensesRef = ref(db, "moin-mudassir-expense")
    const unsubscribePersonal = onValue(personalExpensesRef, (snapshot) => {
      let totalPersonalExpense = 0

      if (snapshot.exists()) {
        const personal = snapshot.val()
        Object.values(personal as any).forEach((expense: any) => {
          totalPersonalExpense += expense.amount || 0
        })
      }

      setStats((prev) => ({
        ...prev,
        totalPersonalExpense,
        // Update bank amount based on both company and personal expenses
        bankAmount: prev.revenue - prev.totalExpense - totalPersonalExpense,
      }))
    })

    // Cleanup listeners
    return () => {
        unsubscribeProjects()
        unsubscribeExpenses()
        unsubscribePersonal()
    }
  }, []) // Removed dependency array logic since two separate listeners update state.

  const statCards = [
    {
      title: "Bank Amount",
      value: `Rs ${stats.bankAmount.toLocaleString()}`,
      icon: Wallet,
      color: "from-blue-500 to-blue-600",
      lightBg: "from-blue-50 to-blue-100",
    },
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: Briefcase,
      color: "from-green-500 to-green-600",
      lightBg: "from-green-50 to-green-100",
    },
    {
      title: "Total Company Expense",
      value: `Rs ${stats.totalExpense.toLocaleString()}`,
      icon: TrendingDown,
      color: "from-red-500 to-red-600",
      lightBg: "from-red-50 to-red-100",
    },
    {
      title: "Total Moin & Mudassir Expense",
      value: `Rs ${stats.totalPersonalExpense.toLocaleString()}`,
      icon: Users,
      color: "from-amber-500 to-amber-600",
      lightBg: "from-amber-50 to-amber-100",
    },
    {
      title: "Total Revenue",
      value: `Rs ${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
      lightBg: "from-purple-50 to-purple-100",
    },
  ]

  return (
    // Updated grid for better responsiveness: 1 column on small, 2 on medium, 4 on large
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">{stat.title}</p>
                  <p className="text-3xl font-bold mt-3 text-slate-900">{stat.value}</p>
                </div>
                {/* Simplified icon background class name for clarity */}
                <div className={`bg-linear-to-br ${stat.color} p-4 rounded-xl shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}