"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash2, Calendar } from "lucide-react"

interface Project {
  id: string
  projectName: string
  totalAmount: number
  startDate: string
  endDate: string
  reminderDate: string
  maintenance: { type: string; amount: number }
  certificateURL: string
  userId: string
  createdAt: string
  AmountHistory: Record<string, { amount: number; date: string; note: string }>
}

export default function ActionMenu({
  project,
  onDelete,
  onPaymentClick,
  onReminderClick,
}: {
  project: Project
  onDelete: (id: string) => void
  onPaymentClick: () => void
  onReminderClick: () => void
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Edit Details: Amber/Yellow for modification */}
      <Link href={`/edit-project/${project.id}`}>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Details
        </Button>
      </Link>
      
      {/* Update Reminder Date: Blue for planning/reminders */}
      <Button 
        variant="outline"
        size="sm" 
        className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors" 
        onClick={onReminderClick}
      >
        <Calendar className="w-4 h-4" />
        Update Reminder
      </Button>
      
      {/* Update Payment: Green for adding/success */}
      <Button 
        size="sm" 
        className="gap-2 bg-green-500 hover:bg-green-600 text-white transition-colors" 
        onClick={onPaymentClick}
      >
        <Plus className="w-4 h-4" />
        Update Payment
      </Button>
      
      {/* Delete: Destructive (Red) for critical action */}
      <Button variant="destructive" size="sm" className="gap-2" onClick={() => onDelete(project.id)}>
        <Trash2 className="w-4 h-4" />
        Delete
      </Button>
    </div>
  )
}