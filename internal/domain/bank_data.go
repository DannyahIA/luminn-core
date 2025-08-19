package domain

import "time"

type BankData struct {
	ID                           string    `json:"id"`
	BankAccountID                string    `json:"bank_account_id"`
	TransferNumber               string    `json:"transfer_number"`
	ClosingBalance               float64   `json:"closing_balance"`
	AutomaticallyInvestedBalance float64   `json:"automatically_invested_balance"`
	OverdraftContractedLimit     float64   `json:"overdraft_contracted_limit"`
	OverdraftUsedLimit           float64   `json:"overdraft_used_limit"`
	UnarrangedOverdraftAmount    float64   `json:"unarranged_overdraft_amount"`
	CreatedAt                    time.Time `json:"created_at"`
	UpdatedAt                    time.Time `json:"updated_at"`
}
