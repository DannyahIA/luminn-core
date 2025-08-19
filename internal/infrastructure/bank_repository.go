package infrastructure

import (
	"automation-hub/internal/domain"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type BankRepository struct {
	Db *pgxpool.Pool
}

func (r *BankRepository) GetAll(ctx context.Context) ([]domain.Bank, error) {
	rows, err := r.Db.Query(ctx, "SELECT id, user_id, name, created_at, updated_at FROM bank")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var banks []domain.Bank
	for rows.Next() {
		var b domain.Bank
		err := rows.Scan(&b.ID, &b.UserID, &b.Name, &b.CreatedAt, &b.UpdatedAt)
		if err != nil {
			return nil, err
		}
		banks = append(banks, b)
	}
	return banks, nil
}
