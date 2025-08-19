package infrastructure

import (
	"automation-hub/internal/domain"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type BankItemRepository struct {
	Db *pgxpool.Pool
}

func (r *BankItemRepository) GetAll(ctx context.Context) ([]domain.BankItem, error) {
	rows, err := r.Db.Query(ctx, "SELECT id, bank_id, name, status, execution_status, created_at, updated_at FROM bank_item")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.BankItem
	for rows.Next() {
		var i domain.BankItem
		err := rows.Scan(&i.ID, &i.BankID, &i.Name, &i.Status, &i.ExecutionStatus, &i.CreatedAt, &i.UpdatedAt)
		if err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}
