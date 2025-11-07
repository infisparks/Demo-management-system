"use client"

import DashboardStats from "@/components/dashboard-stats"
import ProjectsTable from "@/components/projects-table"

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600 mt-2">Overview of your company projects and finances</p>
      </div>

      <DashboardStats />
      <ProjectsTable />
    </div>
  )
}
