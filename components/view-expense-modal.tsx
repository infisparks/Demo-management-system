"use client"

import { X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Expense {
  id: string
  name: string
  amount: number
  date: string
  paidBy: string
  createdAt: string
}

export default function ViewExpenseModal({
  expense,
  onClose,
}: {
  expense: Expense
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expense Details</CardTitle>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-slate-600">Expense Name</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">{expense.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Amount</p>
              <p className="text-xl font-bold text-orange-600 mt-1">Rs {expense.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Date</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{new Date(expense.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-600">Paid By</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">{expense.paidBy}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-600">Created</p>
            <p className="text-sm text-slate-800 mt-1">{new Date(expense.createdAt).toLocaleString()}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
