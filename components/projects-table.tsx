"use client"

import { useEffect, useState } from "react"
import { ref, onValue, remove } from "firebase/database"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Plus } from "lucide-react"
import Link from "next/link"
import CertificateModal from "./certificate-modal"
import PaymentHistoryModal from "./payment-history-modal"
import ActionMenu from "./action-menu"
import React from "react"

interface Project {
  id: string
  projectName: string
  startDate: string
  endDate: string
  maintenance: { type: string; amount: number }
  certificateURL: string
  userId: string
  createdAt: string
  AmountHistory: Record<string, { amount: number; date: string; note: string }>
}

export default function ProjectsTable() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  useEffect(() => {
    const projectsRef = ref(db, "Projects")
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data: Project[] = []
      if (snapshot.exists()) {
        Object.entries(snapshot.val()).forEach(([key, value]: [string, any]) => {
          data.push({ id: key, ...value })
        })
      }
      setProjects(data)
    })
    return () => unsubscribe() // Cleanup listener
  }, [])

  const getTotalAmountReceived = (project: Project) => {
    if (!project.AmountHistory) return 0
    return Object.values(project.AmountHistory).reduce((sum, payment: any) => sum + (payment.amount || 0), 0)
  }

  const getPercentageReceived = (project: Project) => {
    const total = getTotalAmountReceived(project)
    // Assuming a fixed total project value of 50000 for percentage calculation
    const percentage = (total / 50000) * 100
    return percentage > 100 ? 100 : percentage.toFixed(1)
  }

  const handleDelete = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await remove(ref(db, `Projects/${projectId}`))
      } catch (error) {
        console.error("Error deleting project:", error)
      }
    }
  }

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle>All Projects</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-16 text-left py-3 px-4 font-semibold text-slate-700 text-sm">Sr.No</th>
                <th className="w-40 text-left py-3 px-4 font-semibold text-slate-700 text-sm">Project Name</th>
                <th className="w-48 text-left py-3 px-4 font-semibold text-slate-700 text-sm">Amount Received</th>
                <th className="w-32 text-left py-3 px-4 font-semibold text-slate-700 text-sm">Start Date</th>
                <th className="w-32 text-left py-3 px-4 font-semibold text-slate-700 text-sm">End Date</th>
                <th className="w-32 text-left py-3 px-4 font-semibold text-slate-700 text-sm">Maintenance</th>
                <th className="w-24 text-left py-3 px-4 font-semibold text-slate-700 text-sm">Certificate</th>
                <th className="w-24 text-left py-3 px-4 font-semibold text-slate-700 text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((project, index) => (
                <React.Fragment key={project.id}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-slate-900 text-sm">{index + 1}</td>
                    <td className="py-4 px-4 text-slate-900 font-medium text-sm truncate">{project.projectName}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 w-full">
                        <span className="font-semibold text-slate-900 text-sm whitespace-nowrap">
                          Rs {getTotalAmountReceived(project).toLocaleString()}
                        </span>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${getPercentageReceived(project)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 whitespace-nowrap">{getPercentageReceived(project)}% of 50,000</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">{project.startDate}</td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">{project.endDate}</td>
                    <td className="py-4 px-4 text-sm whitespace-nowrap">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        {project.maintenance?.type}: Rs {project.maintenance?.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {project.certificateURL ? (
                        <button
                          onClick={() => setSelectedCertificate(project.certificateURL)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 whitespace-nowrap"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setExpandedRow(expandedRow === project.id ? null : project.id)}
                        className="bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-sm font-medium text-slate-700 whitespace-nowrap"
                      >
                        Actions
                      </button>
                    </td>
                  </tr>
                  {expandedRow === project.id && (
                    <tr className="bg-slate-50">
                      {/* 🌟 Updated to ensure perfect centering! 🌟 */}
                      <td colSpan={8} className="py-4 px-4 border-t border-slate-200 **flex justify-center items-center**">
                        <ActionMenu
                          project={project}
                          onDelete={handleDelete}
                          onPaymentClick={() => setSelectedProject(project)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {projects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-600">No projects found. Create your first project!</p>
              <Link href="/add-project" passHref>
                <Button className="mt-4" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>

      {selectedCertificate && (
        <CertificateModal imageUrl={selectedCertificate} onClose={() => setSelectedCertificate(null)} />
      )}

      {selectedProject && <PaymentHistoryModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </Card>
  )
}