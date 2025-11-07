"use client"

import { useState } from "react"
import { ref, set } from "firebase/database"
import { db } from "@/lib/firebase"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface Project {
  id: string
  projectName: string
  AmountHistory: Record<string, { amount: number; date: string; note: string }>
}

export default function PaymentHistoryModal({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  const [newAmount, setNewAmount] = useState("")
  const [newNote, setNewNote] = useState("")
  const [loading, setLoading] = useState(false)

  const getTotalAmount = () => {
    if (!project.AmountHistory) return 0
    return Object.values(project.AmountHistory).reduce((sum, payment: any) => sum + (payment.amount || 0), 0)
  }

  const getNextPaymentNumber = () => {
    if (!project.AmountHistory) return 1
    const keys = Object.keys(project.AmountHistory)
    return keys.length + 1
  }

  const handleAddPayment = async () => {
    if (!newAmount) return

    setLoading(true)
    try {
      const paymentNumber = getNextPaymentNumber()
      const paymentKey =
        paymentNumber === 1
          ? "1stPayment"
          : paymentNumber === 2
            ? "2ndPayment"
            : paymentNumber === 3
              ? "3rdPayment"
              : `${paymentNumber}thPayment`

      const paymentRef = ref(db, `Projects/${project.id}/AmountHistory/${paymentKey}`)
      await set(paymentRef, {
        amount: Number.parseFloat(newAmount),
        date: new Date().toISOString(),
        note: newNote || "Payment",
      })

      setNewAmount("")
      setNewNote("")
      onClose()
    } catch (error) {
      console.error("Error adding payment:", error)
    } finally {
      setLoading(false)
    }
  }

  const payments = project.AmountHistory ? Object.entries(project.AmountHistory) : []
  const totalAmount = getTotalAmount()
  const percentage = ((totalAmount / 50000) * 100).toFixed(1)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-lg max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Payment History - {project.projectName}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Total Summary */}
        <Card className="mb-6 bg-blue-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600">Total Received</p>
                <p className="text-xl font-bold text-slate-900">Rs {totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Project Total</p>
                <p className="text-xl font-bold text-slate-900">Rs 50,000</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Progress</p>
                <p className="text-xl font-bold text-blue-600">{percentage}%</p>
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${percentage}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">All Payments</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {payments.map(([key, payment]: [string, any]) => (
              <div key={key} className="flex justify-between items-center bg-slate-50 p-3 rounded">
                <div>
                  <p className="font-medium text-slate-900 capitalize">{key}</p>
                  <p className="text-xs text-slate-600">{new Date(payment.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">Rs {payment.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-600">{payment.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Payment */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-3">Add Payment</h4>
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Amount"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Note (optional)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <Button onClick={handleAddPayment} disabled={loading} className="w-full">
              {loading ? "Adding..." : "Add Payment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
