package domain

import "time"

type Transaction struct {
	ID              string    `json:"id"`
	BankID          string    `json:"bank_id"`
	Type            string    `json:"type"`
	Amount          float64   `json:"amount"`
	Currency        string    `json:"currency"`
	Description     string    `json:"description"`
	TransactionDate time.Time `json:"transaction_date"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
