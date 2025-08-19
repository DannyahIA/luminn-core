package infrastructure

import (
	"automation-hub/internal/domain"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type TransactionRepository struct {
	Db *pgxpool.Pool
}

func (r *TransactionRepository) GetAll(ctx context.Context) ([]domain.Transaction, error) {
	rows, err := r.Db.Query(ctx, "SELECT id, bank_id, type, amount, currency, description, transaction_date, created_at, updated_at FROM transaction")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []domain.Transaction
	for rows.Next() {
		var t domain.Transaction
		err := rows.Scan(&t.ID, &t.BankID, &t.Type, &t.Amount, &t.Currency, &t.Description, &t.TransactionDate, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, t)
	}
	return transactions, nil
}
