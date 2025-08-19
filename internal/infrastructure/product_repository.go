package infrastructure

import (
	"automation-hub/internal/domain"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ProductRepository struct {
	Db *pgxpool.Pool
}

func (r *ProductRepository) GetAll(ctx context.Context) ([]domain.Product, error) {
	rows, err := r.Db.Query(ctx, "SELECT id, bank_item_id, name, created_at, updated_at FROM products")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []domain.Product
	for rows.Next() {
		var p domain.Product
		err := rows.Scan(&p.ID, &p.BankItemID, &p.Name, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, nil
}
