package domain

import "time"

type BankItem struct {
	ID              string    `json:"id"`
	BankID          string    `json:"bank_id"`
	Name            string    `json:"name"`
	Status          string    `json:"status"`
	ExecutionStatus string    `json:"execution_status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
