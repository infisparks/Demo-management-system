"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ref, get, update } from "firebase/database"
import { db, storage } from "@/lib/firebase"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Project {
  projectName: string
  startDate: string
  endDate: string
  maintenance: { type: string; amount: number }
  certificateURL?: string
}

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<Project>({
    projectName: "",
    startDate: "",
    endDate: "",
    maintenance: { type: "Monthly", amount: 0 },
  })
  const [certificate, setCertificate] = useState<File | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectRef = ref(db, `Projects/${projectId}`)
        const snapshot = await get(projectRef)

        if (snapshot.exists()) {
          const data = snapshot.val()
          setFormData({
            projectName: data.projectName,
            startDate: data.startDate,
            endDate: data.endDate,
            maintenance: data.maintenance,
            certificateURL: data.certificateURL,
          })
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size > 750 * 1024) {
      setError("File size must be less than 750KB")
      return
    }
    setCertificate(file || null)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      let certificateURL = formData.certificateURL

      // Upload new certificate if provided
      if (certificate) {
        const fileRef = storageRef(storage, `projects/${projectId}/${certificate.name}`)
        await uploadBytes(fileRef, certificate)
        certificateURL = await getDownloadURL(fileRef)
      }

      // Update project data
      const projectRef = ref(db, `Projects/${projectId}`)
      await update(projectRef, {
        projectName: formData.projectName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        maintenance: formData.maintenance,
        certificateURL,
      })

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <p className="text-slate-600">Loading project details...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-slate-600 mt-2">Update your project details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <Input
                type="text"
                placeholder="Enter project name"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                required
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-slate-400 mr-2" />
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-slate-400 mr-2" />
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Maintenance */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Maintenance Type</label>
                <select
                  value={formData.maintenance.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenance: { ...formData.maintenance, type: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maintenance Amount (Rs)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={formData.maintenance.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenance: { ...formData.maintenance, amount: Number.parseFloat(e.target.value) },
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* Certificate Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Update Certificate Image (Max 750KB)</label>
              {formData.certificateURL && !certificate && (
                <p className="text-sm text-green-600 mb-2">✓ Current certificate uploaded</p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {certificate && <p className="text-sm text-blue-600 mt-2">New file: {certificate.name}</p>}
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} size="lg" className="flex-1">
                {submitting ? "Updating..." : "Update Details"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard")} size="lg">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
