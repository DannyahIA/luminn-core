package domain

import "time"

type Product struct {
	ID         string    `json:"id"`
	BankItemID string    `json:"bank_item_id"`
	Name       string    `json:"name"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
