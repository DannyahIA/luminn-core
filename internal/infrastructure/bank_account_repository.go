package infrastructure

import (
	"automation-hub/internal/domain"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type BankAccountRepository struct {
	Db *pgxpool.Pool
}

func (r *BankAccountRepository) GetAll(ctx context.Context) ([]domain.BankAccount, error) {
	rows, err := r.Db.Query(ctx, "SELECT id, user_id, bank_id, account_id, type, balance, currency_code, created_at, updated_at FROM bank_account")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var accounts []domain.BankAccount
	for rows.Next() {
		var a domain.BankAccount
		err := rows.Scan(&a.ID, &a.UserID, &a.BankID, &a.AccountID, &a.Type, &a.Balance, &a.CurrencyCode, &a.CreatedAt, &a.UpdatedAt)
		if err != nil {
			return nil, err
		}
		accounts = append(accounts, a)
	}
	return accounts, nil
}
