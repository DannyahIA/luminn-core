package infrastructure

import (
	"automation-hub/internal/domain"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type BankDataRepository struct {
	Db *pgxpool.Pool
}

func (r *BankDataRepository) GetAll(ctx context.Context) ([]domain.BankData, error) {
	rows, err := r.Db.Query(ctx, "SELECT id, bank_account_id, transfer_number, closing_balance, automatically_invested_balance, overdraft_contracted_limit, overdraft_used_limit, unarranged_overdraft_amount, created_at, updated_at FROM bank_data")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var data []domain.BankData
	for rows.Next() {
		var d domain.BankData
		err := rows.Scan(&d.ID, &d.BankAccountID, &d.TransferNumber, &d.ClosingBalance, &d.AutomaticallyInvestedBalance, &d.OverdraftContractedLimit, &d.OverdraftUsedLimit, &d.UnarrangedOverdraftAmount, &d.CreatedAt, &d.UpdatedAt)
		if err != nil {
			return nil, err
		}
		data = append(data, d)
	}
	return data, nil
}
