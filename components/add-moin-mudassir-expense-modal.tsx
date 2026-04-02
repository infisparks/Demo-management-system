"use client"

import type React from "react"
import { useState } from "react"
import { ref, set } from "firebase/database"
import { db, storage } from "@/lib/firebase"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddMoinMudassirExpenseModal({ 
  onClose,
  expense 
}: { 
  onClose: () => void,
  expense?: any
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: expense?.name || "",
    amount: expense?.amount || 0,
    date: expense?.date || new Date().toISOString().split("T")[0],
    expensedBy: expense?.paidBy || "Moin",
  })
  const [billFile, setBillFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const expenseId = expense?.id || Date.now().toString()
      const expenseRef = ref(db, `moin-mudassir-expense/${expenseId}`)

      let billURL = expense?.billURL || ""
      if (billFile) {
        const fileRef = storageRef(storage, `moin-mudassir-expense/${expenseId}/${billFile.name}`)
        await uploadBytes(fileRef, billFile)
        billURL = await getDownloadURL(fileRef)
      }

      await set(expenseRef, {
        name: formData.name,
        amount: Number.parseFloat(formData.amount.toString()),
        date: formData.date,
        paidBy: formData.expensedBy, // Storing as paidBy for compatibility with table but label is Expensed By
        billURL,
        createdAt: expense?.createdAt || new Date().toISOString(),
      })

      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Account Expense</CardTitle>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Expense Name</label>
              <Input
                type="text"
                placeholder="Enter expense name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount (Rs)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.amount === 0 ? "" : formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Expensed By</label>
              <select
                value={formData.expensedBy}
                onChange={(e) => setFormData({ ...formData, expensedBy: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              >
                <option value="Moin">Moin</option>
                <option value="Mudassir">Mudassir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Expense Bill Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
              {billFile && <p className="text-xs text-green-600 mt-1 flex items-center gap-1">✓ {billFile.name}</p>}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (expense ? "Saving..." : "Adding...") : (expense ? "Save Changes" : "Add Expense")}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
