"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { usePageConfig } from "@/hooks/use-page-config"
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Smartphone,
  Building2,
  ShoppingCart,
  Car,
  Home,
  Coffee,
  Search,
  Filter,
  Download,
  Calendar,
} from "lucide-react"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "debit" | "credit"
  category: string
  paymentMethod: "pix" | "credit_card" | "debit_card" | "transfer" | "boleto" | "cash"
  bankId: string
  bankName: string
  accountName: string
  merchant?: string
  location?: string
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2024-01-15T14:30:00Z",
    description: "Transferência PIX - João Silva",
    amount: -250.0,
    type: "debit",
    category: "Transferência",
    paymentMethod: "pix",
    bankId: "1",
    bankName: "Nubank",
    accountName: "Nu Conta",
    merchant: "João Silva",
  },
  {
    id: "2",
    date: "2024-01-15T12:15:00Z",
    description: "Salário - Empresa XYZ",
    amount: 5500.0,
    type: "credit",
    category: "Salário",
    paymentMethod: "transfer",
    bankId: "1",
    bankName: "Nubank",
    accountName: "Nu Conta",
    merchant: "Empresa XYZ",
  },
  {
    id: "3",
    date: "2024-01-15T10:45:00Z",
    description: "Uber - Corrida",
    amount: -18.5,
    type: "debit",
    category: "Transporte",
    paymentMethod: "credit_card",
    bankId: "1",
    bankName: "Nubank",
    accountName: "Cartão de Crédito",
    merchant: "Uber",
    location: "São Paulo, SP",
  },
  {
    id: "4",
    date: "2024-01-14T19:20:00Z",
    description: "iFood - Jantar",
    amount: -45.9,
    type: "debit",
    category: "Alimentação",
    paymentMethod: "credit_card",
    bankId: "1",
    bankName: "Nubank",
    accountName: "Cartão de Crédito",
    merchant: "iFood",
  },
  {
    id: "5",
    date: "2024-01-14T16:30:00Z",
    description: "Posto Shell - Combustível",
    amount: -120.0,
    type: "debit",
    category: "Combustível",
    paymentMethod: "debit_card",
    bankId: "2",
    bankName: "Itaú",
    accountName: "Conta Corrente",
    merchant: "Posto Shell",
    location: "São Paulo, SP",
  },
  {
    id: "6",
    date: "2024-01-14T14:15:00Z",
    description: "Mercado Pão de Açúcar",
    amount: -89.75,
    type: "debit",
    category: "Supermercado",
    paymentMethod: "debit_card",
    bankId: "2",
    bankName: "Itaú",
    accountName: "Conta Corrente",
    merchant: "Pão de Açúcar",
  },
  {
    id: "7",
    date: "2024-01-13T11:00:00Z",
    description: "Starbucks - Café",
    amount: -15.9,
    type: "debit",
    category: "Alimentação",
    paymentMethod: "credit_card",
    bankId: "1",
    bankName: "Nubank",
    accountName: "Cartão de Crédito",
    merchant: "Starbucks",
    location: "São Paulo, SP",
  },
  {
    id: "8",
    date: "2024-01-13T09:30:00Z",
    description: "Conta de Luz - ENEL",
    amount: -245.0,
    type: "debit",
    category: "Utilidades",
    paymentMethod: "boleto",
    bankId: "2",
    bankName: "Itaú",
    accountName: "Conta Corrente",
    merchant: "ENEL",
  },
  {
    id: "9",
    date: "2024-01-12T15:45:00Z",
    description: "Freelance - Cliente ABC",
    amount: 1200.0,
    type: "credit",
    category: "Freelance",
    paymentMethod: "pix",
    bankId: "3",
    bankName: "Banco do Brasil",
    accountName: "Conta Corrente",
    merchant: "Cliente ABC",
  },
  {
    id: "10",
    date: "2024-01-12T13:20:00Z",
    description: "Netflix - Assinatura",
    amount: -29.9,
    type: "debit",
    category: "Entretenimento",
    paymentMethod: "credit_card",
    bankId: "1",
    bankName: "Nubank",
    accountName: "Cartão de Crédito",
    merchant: "Netflix",
  },
]

const banks = [
  { id: "1", name: "Nubank" },
  { id: "2", name: "Itaú" },
  { id: "3", name: "Banco do Brasil" },
]

export function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBank, setSelectedBank] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [showFilters, setShowFilters] = useState(false)

  // Configurar as informações da página
  usePageConfig({
    page: "transacoes",
    title: "Transações",
    subtitle: "Visualize e gerencie todas as suas transações"
  })

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((transaction) => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesBank = selectedBank === "all" || transaction.bankId === selectedBank
      const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory
      const matchesPaymentMethod =
        selectedPaymentMethod === "all" || transaction.paymentMethod === selectedPaymentMethod
      const matchesType = selectedType === "all" || transaction.type === selectedType

      const matchesDateRange =
        (!dateRange.from || new Date(transaction.date) >= new Date(dateRange.from)) &&
        (!dateRange.to || new Date(transaction.date) <= new Date(dateRange.to))

      return matchesSearch && matchesBank && matchesCategory && matchesPaymentMethod && matchesType && matchesDateRange
    })
  }, [searchTerm, selectedBank, selectedCategory, selectedPaymentMethod, selectedType, dateRange])

  const getPaymentMethodIcon = (method: Transaction["paymentMethod"]) => {
    switch (method) {
      case "pix":
        return <Smartphone className="h-4 w-4" />
      case "credit_card":
      case "debit_card":
        return <CreditCard className="h-4 w-4" />
      case "transfer":
        return <Building2 className="h-4 w-4" />
      case "boleto":
        return <Calendar className="h-4 w-4" />
      case "cash":
        return <Coffee className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentMethodLabel = (method: Transaction["paymentMethod"]) => {
    switch (method) {
      case "pix":
        return "PIX"
      case "credit_card":
        return "Cartão de Crédito"
      case "debit_card":
        return "Cartão de Débito"
      case "transfer":
        return "Transferência"
      case "boleto":
        return "Boleto"
      case "cash":
        return "Dinheiro"
      default:
        return method
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "transporte":
        return <Car className="h-4 w-4" />
      case "alimentação":
        return <Coffee className="h-4 w-4" />
      case "supermercado":
        return <ShoppingCart className="h-4 w-4" />
      case "utilidades":
        return <Home className="h-4 w-4" />
      default:
        return <Building2 className="h-4 w-4" />
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(value))
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  const totalCredit = filteredTransactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)

  const totalDebit = filteredTransactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const netAmount = totalCredit - totalDebit

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Entradas</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat text-green-600">{formatCurrency(totalCredit)}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredTransactions.filter((t) => t.type === "credit").length} transações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saídas</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat text-red-600">{formatCurrency(totalDebit)}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredTransactions.filter((t) => t.type === "debit").length} transações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Líquido</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold font-montserrat ${netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(netAmount)}
                </div>
                <p className="text-xs text-muted-foreground">{filteredTransactions.length} transações filtradas</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-montserrat">Filtros e Busca</CardTitle>
                  <CardDescription>Encontre transações específicas</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? "Ocultar" : "Mostrar"} Filtros
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição, comerciante ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              {showFilters && (
                <TransactionFilters
                  selectedBank={selectedBank}
                  setSelectedBank={setSelectedBank}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedPaymentMethod={selectedPaymentMethod}
                  setSelectedPaymentMethod={setSelectedPaymentMethod}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  banks={banks}
                  categories={Array.from(new Set(mockTransactions.map((t) => t.category)))}
                />
              )}
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle className="font-montserrat">Transações</CardTitle>
              <CardDescription>
                {filteredTransactions.length} de {mockTransactions.length} transações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "credit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowDownLeft className="h-5 w-5" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(transaction.category)}
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{transaction.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {getPaymentMethodLabel(transaction.paymentMethod)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatDate(transaction.date)}</span>
                          <span>•</span>
                          <span>
                            {transaction.bankName} - {transaction.accountName}
                          </span>
                          <span>•</span>
                          <span>{transaction.category}</span>
                          {transaction.location && (
                            <>
                              <span>•</span>
                              <span>{transaction.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-semibold text-lg ${
                          transaction.type === "credit" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      {transaction.merchant && <p className="text-sm text-muted-foreground">{transaction.merchant}</p>}
                    </div>
                  </div>
                ))}

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-semibold mb-2">Nenhuma transação encontrada</h3>
                    <p className="text-muted-foreground">
                      Tente ajustar os filtros ou termo de busca para encontrar transações
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
    </div>
  )
}
