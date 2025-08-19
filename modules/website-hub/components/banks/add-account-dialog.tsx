"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Wallet, PiggyBank } from "lucide-react"

interface AddAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddAccount: (accountData: { name: string; type: "checking" | "savings" | "credit" }) => void
  bankName: string
}

const accountTypes = [
  { value: "checking", label: "Conta Corrente", icon: Wallet },
  { value: "savings", label: "Poupança", icon: PiggyBank },
  { value: "credit", label: "Cartão de Crédito", icon: CreditCard },
]

export function AddAccountDialog({ open, onOpenChange, onAddAccount, bankName }: AddAccountDialogProps) {
  const [accountData, setAccountData] = useState({
    name: "",
    type: "" as "checking" | "savings" | "credit" | "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (accountData.name && accountData.type) {
      onAddAccount({
        name: accountData.name,
        type: accountData.type,
      })

      // Reset form
      setAccountData({ name: "", type: "" })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-montserrat">Adicionar Conta</DialogTitle>
          <DialogDescription>Adicione uma nova conta para {bankName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-name">Nome da Conta</Label>
            <Input
              id="account-name"
              placeholder="Ex: Conta Corrente, Nu Empresa, Poupança"
              value={accountData.name}
              onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-type">Tipo de Conta</Label>
            <Select
              value={accountData.type}
              onValueChange={(value) => setAccountData({ ...accountData, type: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de conta" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> Após adicionar a conta, você precisará conectá-la usando suas credenciais bancárias
              para sincronizar os dados.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={!accountData.name || !accountData.type} className="flex-1">
              Adicionar Conta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
