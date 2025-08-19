package domain

import "time"

type BankAccount struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	BankID       string    `json:"bank_id"`
	AccountID    string    `json:"account_id"`
	Type         string    `json:"type"`
	Balance      float64   `json:"balance"`
	CurrencyCode string    `json:"currency_code"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
