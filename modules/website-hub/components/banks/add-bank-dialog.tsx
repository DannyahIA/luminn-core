"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"

interface AddBankDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddBank: (bankData: { name: string; logo: string; color: string }) => void
}

const popularBanks = [
  { name: "Nubank", color: "#8A05BE", logo: "/placeholder.svg?height=40&width=40&text=Nu" },
  { name: "Itaú", color: "#EC7000", logo: "/placeholder.svg?height=40&width=40&text=Itaú" },
  { name: "Banco do Brasil", color: "#FFF100", logo: "/placeholder.svg?height=40&width=40&text=BB" },
  { name: "Bradesco", color: "#CC092F", logo: "/placeholder.svg?height=40&width=40&text=Bradesco" },
  { name: "Santander", color: "#EC0000", logo: "/placeholder.svg?height=40&width=40&text=Santander" },
  { name: "Caixa", color: "#0066B3", logo: "/placeholder.svg?height=40&width=40&text=Caixa" },
  { name: "Inter", color: "#FF7A00", logo: "/placeholder.svg?height=40&width=40&text=Inter" },
  { name: "C6 Bank", color: "#000000", logo: "/placeholder.svg?height=40&width=40&text=C6" },
]

export function AddBankDialog({ open, onOpenChange, onAddBank }: AddBankDialogProps) {
  const [selectedBank, setSelectedBank] = useState<(typeof popularBanks)[0] | null>(null)
  const [customBank, setCustomBank] = useState({ name: "", color: "#164e63" })
  const [isCustom, setIsCustom] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedBank && !isCustom) {
      onAddBank(selectedBank)
    } else if (isCustom && customBank.name) {
      onAddBank({
        name: customBank.name,
        color: customBank.color,
        logo: `/placeholder.svg?height=40&width=40&text=${customBank.name.slice(0, 3)}`,
      })
    }

    // Reset form
    setSelectedBank(null)
    setCustomBank({ name: "", color: "#164e63" })
    setIsCustom(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-montserrat">Adicionar Banco</DialogTitle>
          <DialogDescription>Escolha um banco da lista ou adicione um personalizado</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isCustom ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {popularBanks.map((bank) => (
                  <button
                    key={bank.name}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedBank?.name === bank.name
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: bank.color }}
                      >
                        <img src={bank.logo || "/placeholder.svg"} alt={bank.name} className="w-6 h-6 rounded" />
                      </div>
                      <span className="text-sm font-medium">{bank.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center">
                <Button type="button" variant="link" onClick={() => setIsCustom(true)}>
                  Não encontrou seu banco? Adicionar personalizado
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="bank-name">Nome do Banco</Label>
                <Input
                  id="bank-name"
                  placeholder="Ex: Meu Banco"
                  value={customBank.name}
                  onChange={(e) => setCustomBank({ ...customBank, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-color">Cor do Banco</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="bank-color"
                    type="color"
                    value={customBank.color}
                    onChange={(e) => setCustomBank({ ...customBank, color: e.target.value })}
                    className="w-12 h-10 rounded border border-input"
                  />
                  <Input
                    value={customBank.color}
                    onChange={(e) => setCustomBank({ ...customBank, color: e.target.value })}
                    placeholder="#164e63"
                  />
                </div>
              </div>

              <div className="text-center">
                <Button type="button" variant="link" onClick={() => setIsCustom(false)}>
                  Voltar para lista de bancos
                </Button>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedBank && (!isCustom || !customBank.name)} className="flex-1">
              <Building2 className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
