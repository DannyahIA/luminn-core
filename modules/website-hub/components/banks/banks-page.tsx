"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddBankDialog } from "@/components/banks/add-bank-dialog"
import { AddAccountDialog } from "@/components/banks/add-account-dialog"
import { Building2, Plus, Wifi, WifiOff, Trash2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { usePageConfig } from "@/hooks/use-page-config"

interface BankAccount {
  id: string
  name: string
  type: "checking" | "savings" | "credit"
  balance: number
  lastSync: string
  status: "connected" | "disconnected" | "syncing" | "error"
}

interface Bank {
  id: string
  name: string
  logo: string
  color: string
  accounts: BankAccount[]
}

export function BanksPage() {
  const [addBankOpen, setAddBankOpen] = useState(false)
  const [addAccountOpen, setAddAccountOpen] = useState(false)
  const [selectedBankId, setSelectedBankId] = useState<string>("")

  // Configurar as informações da página
  usePageConfig({
    page: "bancos",
    title: "Gerenciamento de Bancos",
    subtitle: "Conecte e gerencie suas contas bancárias"
  })

  const [banks, setBanks] = useState<Bank[]>([
    {
      id: "1",
      name: "Nubank",
      logo: "/placeholder.svg?height=40&width=40&text=Nu",
      color: "#8A05BE",
      accounts: [
        {
          id: "1-1",
          name: "Nu Conta",
          type: "checking",
          balance: 2450.75,
          lastSync: "2024-01-15T10:30:00Z",
          status: "connected",
        },
        {
          id: "1-2",
          name: "Nu Empresa",
          type: "checking",
          balance: 8920.5,
          lastSync: "2024-01-15T10:30:00Z",
          status: "connected",
        },
        {
          id: "1-3",
          name: "Cartão de Crédito",
          type: "credit",
          balance: -1250.0,
          lastSync: "2024-01-15T10:30:00Z",
          status: "connected",
        },
      ],
    },
    {
      id: "2",
      name: "Itaú",
      logo: "/placeholder.svg?height=40&width=40&text=Itaú",
      color: "#EC7000",
      accounts: [
        {
          id: "2-1",
          name: "Conta Corrente",
          type: "checking",
          balance: 1580.25,
          lastSync: "2024-01-15T09:15:00Z",
          status: "error",
        },
        {
          id: "2-2",
          name: "Poupança",
          type: "savings",
          balance: 5200.0,
          lastSync: "2024-01-14T18:45:00Z",
          status: "disconnected",
        },
      ],
    },
    {
      id: "3",
      name: "Banco do Brasil",
      logo: "/placeholder.svg?height=40&width=40&text=BB",
      color: "#FFF100",
      accounts: [
        {
          id: "3-1",
          name: "Conta Corrente",
          type: "checking",
          balance: 750.8,
          lastSync: "2024-01-15T11:00:00Z",
          status: "syncing",
        },
      ],
    },
  ])

  const handleAddBank = (bankData: { name: string; logo: string; color: string }) => {
    const newBank: Bank = {
      id: Date.now().toString(),
      ...bankData,
      accounts: [],
    }
    setBanks([...banks, newBank])
  }

  const handleAddAccount = (accountData: { name: string; type: "checking" | "savings" | "credit" }) => {
    setBanks(
      banks.map((bank) =>
        bank.id === selectedBankId
          ? {
              ...bank,
              accounts: [
                ...bank.accounts,
                {
                  id: `${bank.id}-${Date.now()}`,
                  ...accountData,
                  balance: 0,
                  lastSync: new Date().toISOString(),
                  status: "disconnected" as const,
                },
              ],
            }
          : bank,
      ),
    )
  }

  const handleSyncAccount = (bankId: string, accountId: string) => {
    setBanks(
      banks.map((bank) =>
        bank.id === bankId
          ? {
              ...bank,
              accounts: bank.accounts.map((account) =>
                account.id === accountId ? { ...account, status: "syncing" as const } : account,
              ),
            }
          : bank,
      ),
    )

    // Simular sincronização
    setTimeout(() => {
      setBanks(
        banks.map((bank) =>
          bank.id === bankId
            ? {
                ...bank,
                accounts: bank.accounts.map((account) =>
                  account.id === accountId
                    ? {
                        ...account,
                        status: "connected" as const,
                        lastSync: new Date().toISOString(),
                      }
                    : account,
                ),
              }
            : bank,
        ),
      )
    }, 2000)
  }

  const handleRemoveAccount = (bankId: string, accountId: string) => {
    setBanks(
      banks.map((bank) =>
        bank.id === bankId
          ? {
              ...bank,
              accounts: bank.accounts.filter((account) => account.id !== accountId),
            }
          : bank,
      ),
    )
  }

  const handleRemoveBank = (bankId: string) => {
    setBanks(banks.filter((bank) => bank.id !== bankId))
  }

  const getStatusIcon = (status: BankAccount["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "disconnected":
        return <WifiOff className="h-4 w-4 text-gray-400" />
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusText = (status: BankAccount["status"]) => {
    switch (status) {
      case "connected":
        return "Conectado"
      case "disconnected":
        return "Desconectado"
      case "syncing":
        return "Sincronizando"
      case "error":
        return "Erro"
    }
  }

  const getStatusVariant = (status: BankAccount["status"]) => {
    switch (status) {
      case "connected":
        return "default"
      case "disconnected":
        return "secondary"
      case "syncing":
        return "default"
      case "error":
        return "destructive"
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
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

  const totalBalance = banks.reduce(
    (total, bank) =>
      total +
      bank.accounts
        .filter((account) => account.type !== "credit")
        .reduce((bankTotal, account) => bankTotal + account.balance, 0),
    0,
  )

  const totalAccounts = banks.reduce((total, bank) => total + bank.accounts.length, 0)
  const connectedAccounts = banks.reduce(
    (total, bank) => total + bank.accounts.filter((account) => account.status === "connected").length,
    0,
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Total</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat">{formatCurrency(totalBalance)}</div>
                <p className="text-xs text-muted-foreground">Excluindo cartões de crédito</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Contas Conectadas</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat">
                  {connectedAccounts}/{totalAccounts}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((connectedAccounts / totalAccounts) * 100)}% sincronizadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bancos</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-montserrat">{banks.length}</div>
                <p className="text-xs text-muted-foreground">Instituições conectadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Add Bank Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold font-montserrat">Seus Bancos</h3>
              <p className="text-sm text-muted-foreground">Gerencie suas instituições financeiras e contas</p>
            </div>
            <Button onClick={() => setAddBankOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Banco
            </Button>
          </div>

          {/* Banks List */}
          <div className="space-y-6">
            {banks.map((bank) => (
              <Card key={bank.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: bank.color }}
                      >
                        <img src={bank.logo || "/placeholder.svg"} alt={bank.name} className="w-8 h-8 rounded" />
                      </div>
                      <div>
                        <CardTitle className="font-montserrat">{bank.name}</CardTitle>
                        <CardDescription>{bank.accounts.length} conta(s) configurada(s)</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBankId(bank.id)
                          setAddAccountOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Conta
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveBank(bank.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bank.accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(account.status)}
                            <div>
                              <p className="font-medium">{account.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {account.type === "checking"
                                  ? "Conta Corrente"
                                  : account.type === "savings"
                                    ? "Poupança"
                                    : "Cartão de Crédito"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(account.balance)}</p>
                            <p className="text-xs text-muted-foreground">Última sync: {formatDate(account.lastSync)}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusVariant(account.status)}>{getStatusText(account.status)}</Badge>

                            {account.status !== "syncing" && (
                              <Button variant="ghost" size="sm" onClick={() => handleSyncAccount(bank.id, account.id)}>
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}

                            <Button variant="ghost" size="sm" onClick={() => handleRemoveAccount(bank.id, account.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {bank.accounts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma conta configurada</p>
                        <p className="text-sm">Adicione uma conta para começar a sincronizar</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {banks.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">Nenhum banco configurado</h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione seu primeiro banco para começar a gerenciar suas finanças
                  </p>
                  <Button onClick={() => setAddBankOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Banco
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

      <AddBankDialog open={addBankOpen} onOpenChange={setAddBankOpen} onAddBank={handleAddBank} />
      <AddAccountDialog
        open={addAccountOpen}
        onOpenChange={setAddAccountOpen}
        onAddAccount={handleAddAccount}
        bankName={banks.find((b) => b.id === selectedBankId)?.name || ""}
      />
    </div>
  )
}
