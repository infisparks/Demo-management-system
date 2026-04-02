"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ref, set } from "firebase/database"
import { db, storage, auth } from "@/lib/firebase"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, AlertCircle } from "lucide-react"

export default function AddProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    projectName: "",
    totalAmount: 0,
    amountPaid: 0,
    startDate: "",
    endDate: "",
    reminderDate: "",
    maintenanceType: "Monthly",
    maintenanceAmount: 0,
    certificate: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size > 750 * 1024) {
      setError("File size must be less than 750KB")
      return
    }
    setFormData({ ...formData, certificate: file || null })
    setError("")
  }

  const validateForm = () => {
    if (!formData.projectName.trim()) {
      setError("Project Name is required")
      return false
    }
    if (formData.amountPaid <= 0) {
      setError("Amount Paid must be greater than 0")
      return false
    }
    if (formData.totalAmount <= 0) {
      setError("Total Amount must be greater than 0")
      return false
    }
    if (formData.maintenanceType !== "None" && formData.maintenanceAmount <= 0) {
      setError("Maintenance Amount must be greater than 0")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      if (!auth.currentUser) throw new Error("Not authenticated")

      const projectId = Date.now().toString()
      let certificateURL = ""

      // Upload certificate if provided
      if (formData.certificate) {
        const fileRef = storageRef(
          storage,
          `projects/${auth.currentUser.uid}/${projectId}/${formData.certificate.name}`,
        )
        await uploadBytes(fileRef, formData.certificate)
        certificateURL = await getDownloadURL(fileRef)
      }

      // Save project data
      const projectRef = ref(db, `Projects/${projectId}`)
      await set(projectRef, {
        projectName: formData.projectName,
        totalAmount: formData.totalAmount,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reminderDate: formData.reminderDate,
        maintenance: {
          type: formData.maintenanceType,
          amount: formData.maintenanceAmount,
        },
        certificateURL,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      })

      // Save initial payment
      const paymentRef = ref(db, `Projects/${projectId}/AmountHistory/1stPayment`)
      await set(paymentRef, {
        amount: formData.amountPaid,
        date: new Date().toISOString(),
        note: "Initial Payment",
      })

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Add Project</h1>
        <p className="text-slate-600 mt-2">Create a new project with details and timeline</p>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter project name"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                required
              />
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Total Amount <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="Enter total project amount"
                value={formData.totalAmount === 0 ? "" : formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: Number.parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            {/* Amount Paid */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount Paid <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.amountPaid === 0 ? "" : formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: Number.parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Reminder Date */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-600 font-semibold">Expected Payment Date (Reminder)</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
                <Input
                  type="date"
                  value={formData.reminderDate}
                  onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                  className="flex-1 border-blue-200 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">This will help you track when the next payment is expected from the client.</p>
            </div>

            {/* Maintenance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Maintenance Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.maintenanceType}
                  onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                  <option value="None">None</option>
                </select>
              </div>
              {formData.maintenanceType !== "None" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maintenance Amount (Rs) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={formData.maintenanceAmount === 0 ? "" : formData.maintenanceAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, maintenanceAmount: Number.parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
              )}
            </div>

            {/* Certificate Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Contract Image (Max 750KB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {formData.certificate && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">✓ {formData.certificate.name}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? "Submitting..." : "Submit Project"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}