"use client"

import { useState, useEffect } from "react"
import { ref, onValue } from "firebase/database"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Eye } from "lucide-react"
import AddExpenseModal from "@/components/add-expense-modal"
import ViewExpenseModal from "@/components/view-expense-modal"

interface Expense {
  id: string
  name: string
  amount: number
  date: string
  paidBy: string
  createdAt: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  useEffect(() => {
    const expensesRef = ref(db, "expenses")
    onValue(expensesRef, (snapshot) => {
      const data: Expense[] = []
      if (snapshot.exists()) {
        Object.entries(snapshot.val()).forEach(([key, value]: [string, any]) => {
          data.push({ id: key, ...value })
        })
      }
      setExpenses(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    })
  }, [])

  const getTotalExpense = () => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-slate-600 mt-2">Track and manage all project expenses</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2" size="lg">
          <Plus className="w-5 h-5" />
          Add Expense
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="mb-8 shadow-md border-0 bg-linear-to-r from-orange-50 to-red-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Expenses</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">Rs {getTotalExpense().toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Number of Expenses</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{expenses.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Average Expense</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                Rs {expenses.length > 0 ? Math.round(getTotalExpense() / expenses.length).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="shadow-md border-0">
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Sr.No</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Paid By</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-900 text-sm">{index + 1}</td>
                    <td className="py-3 px-4 text-slate-900 font-medium text-sm">{expense.name}</td>
                    <td className="py-3 px-4">
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Rs {expense.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{expense.paidBy}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedExpense(expense)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-600">No expenses recorded yet</p>
                <Button onClick={() => setShowAddModal(true)} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Expense
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showAddModal && <AddExpenseModal onClose={() => setShowAddModal(false)} />}

      {selectedExpense && <ViewExpenseModal expense={selectedExpense} onClose={() => setSelectedExpense(null)} />}
    </div>
  )
}
