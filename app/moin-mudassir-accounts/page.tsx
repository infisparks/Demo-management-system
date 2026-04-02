"use client"

import { useState, useEffect } from "react"
import { ref, onValue, remove } from "firebase/database"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Wallet, User } from "lucide-react"
import AddMoinMudassirExpenseModal from "@/components/add-moin-mudassir-expense-modal"
import ViewMoinMudassirExpenseModal from "@/components/view-moin-mudassir-expense-modal"

interface Expense {
  id: string
  name: string
  amount: number
  date: string
  paidBy: string
  billURL?: string
  createdAt: string
}

export default function MoinMudassirAccountsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [bankAmount, setBankAmount] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  useEffect(() => {
    // We'll calculate everything in a single listener flow or separate states for accuracy
    let currentRevenue = 0
    let currentCompanyExpense = 0
    let currentPersonalExpense = 0

    const updateBankAmount = () => {
        // Base profit pool is just Revenue minus Company Expenses
        setBankAmount(currentRevenue - currentCompanyExpense)
    }

    // projects -> Revenue
    const projectsRef = ref(db, "Projects")
    const unsubscribeProjects = onValue(projectsRef, (snapshot) => {
      currentRevenue = 0
      if (snapshot.exists()) {
        const projects = snapshot.val()
        Object.values(projects as any).forEach((project: any) => {
          if (project.AmountHistory) {
            Object.values(project.AmountHistory).forEach((payment: any) => {
              currentRevenue += payment.amount || 0
            })
          }
        })
      }
      updateBankAmount()
    })

    // company expenses -> companyExpense
    const companyExpensesRef = ref(db, "expenses")
    const unsubscribeCompanyExps = onValue(companyExpensesRef, (snapshot) => {
      currentCompanyExpense = 0
      if (snapshot.exists()) {
        const exps = snapshot.val()
        Object.values(exps as any).forEach((exp: any) => {
          currentCompanyExpense += exp.amount || 0
        })
      }
      updateBankAmount()
    })

    // personal expenses -> personalExpense & list
    const mmExpensesRef = ref(db, "moin-mudassir-expense")
    const unsubscribePersonalExps = onValue(mmExpensesRef, (snapshot) => {
      currentPersonalExpense = 0
      const data: Expense[] = []
      if (snapshot.exists()) {
        Object.entries(snapshot.val()).forEach(([key, value]: [string, any]) => {
          const exp = { id: key, ...value } as Expense
          data.push(exp)
          currentPersonalExpense += exp.amount || 0
        })
      }
      setExpenses(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      updateBankAmount()
    })

    return () => {
        unsubscribeProjects()
        unsubscribeCompanyExps()
        unsubscribePersonalExps()
    }
  }, [])

  const getTotalMoinExpense = () => {
    return expenses
      .filter((exp) => exp.paidBy === "Moin")
      .reduce((sum, exp) => sum + exp.amount, 0)
  }

  const getTotalMudassirExpense = () => {
    return expenses
      .filter((exp) => exp.paidBy === "Mudassir")
      .reduce((sum, exp) => sum + exp.amount, 0)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await remove(ref(db, `moin-mudassir-expense/${id}`))
      } catch (error) {
        console.error("Error deleting expense:", error)
      }
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Moin & Mudassir Accounts</h1>
          <p className="text-slate-600 mt-2">Personal accounts and individual expense tracking</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 bg-blue-600 hover:bg-blue-700" size="lg">
          <Plus className="w-5 h-5" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-md border-0 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wider">Moin Bank Amount</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">Rs {(bankAmount / 2 - getTotalMoinExpense()).toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-blue-600">
               <Wallet className="w-4 h-4" /> Moin Balance
            </div>
          </CardContent>
        </Card>

        {/* Mudassir Bank Amount */}
        <Card className="shadow-md border-0 bg-indigo-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wider">Mudassir Bank Amount</p>
            <p className="text-2xl font-bold text-indigo-700 mt-2">Rs {(bankAmount / 2 - getTotalMudassirExpense()).toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-indigo-600">
               <Wallet className="w-4 h-4" /> Mudassir Balance
            </div>
          </CardContent>
        </Card>

        {/* Total Moin Expense */}
        <Card className="shadow-md border-0 bg-orange-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wider">Total Moin Expense</p>
            <p className="text-2xl font-bold text-orange-700 mt-2">Rs {getTotalMoinExpense().toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-orange-600">
               <User className="w-4 h-4" /> Personal expenses by Moin
            </div>
          </CardContent>
        </Card>

        {/* Total Mudassir Expense */}
        <Card className="shadow-md border-0 bg-emerald-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wider">Total Mudassir Expense</p>
            <p className="text-2xl font-bold text-emerald-700 mt-2">Rs {getTotalMudassirExpense().toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600">
               <User className="w-4 h-4" /> Personal expenses by Mudassir
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card className="shadow-md border-0">
        <CardHeader>
          <CardTitle>All Accounts Expenses</CardTitle>
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Expensed By</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Expense Bill</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-900 text-sm">{index + 1}</td>
                    <td className="py-3 px-4 text-slate-900 font-medium text-sm">{expense.name}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Rs {expense.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-sm">
                        {new Date(expense.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${expense.paidBy === 'Moin' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {expense.paidBy}
                        </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {expense.billURL ? (
                        <button
                          onClick={() => setSelectedExpense(expense)}
                          className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Bill
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">No Bill</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedExpense(expense)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingExpense(expense)
                            setShowAddModal(true)
                          }}
                          className="text-amber-600 hover:text-amber-800 font-medium text-sm flex items-center gap-1"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-600">No personal expenses recorded yet</p>
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
      {showAddModal && (
        <AddMoinMudassirExpenseModal 
          onClose={() => {
            setShowAddModal(false)
            setEditingExpense(null)
          }} 
          expense={editingExpense}
        />
      )}

      {selectedExpense && <ViewMoinMudassirExpenseModal expense={selectedExpense} onClose={() => setSelectedExpense(null)} />}
    </div>
  )
}
