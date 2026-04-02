"use client"

import { useState } from "react"
import { ref, set } from "firebase/database"
import { db } from "@/lib/firebase"
import { X, Calendar, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface Project {
  id: string
  projectName: string
  reminderDate: string
}

export default function ReminderDateModal({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  const [newDate, setNewDate] = useState(project.reminderDate || "")
  const [loading, setLoading] = useState(false)

  const handleUpdateReminder = async () => {
    if (!newDate) return

    setLoading(true)
    try {
      const reminderRef = ref(db, `Projects/${project.id}/reminderDate`)
      await set(reminderRef, newDate)
      onClose()
    } catch (error) {
      console.error("Error updating reminder date:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Update Payment Reminder</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">Project Name</p>
            <p className="text-lg font-semibold text-slate-900">{project.projectName}</p>
          </div>

          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="pt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expected Payment Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="date"
                  className="pl-10 h-12 text-lg focus:ring-2 focus:ring-blue-500 border-slate-300"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 italic">
                {newDate ? `Setting reminder for ${new Date(newDate).toLocaleDateString()}` : "Select a date for the next payment reminder"}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11">
              Cancel
            </Button>
            <Button onClick={handleUpdateReminder} disabled={loading || !newDate} className="flex-1 h-11 bg-blue-600 hover:bg-blue-700">
              {loading ? "Updating..." : "Update Date"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
