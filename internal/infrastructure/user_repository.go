package infrastructure

import (
	"automation-hub/internal/domain"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	Db *pgxpool.Pool
}

func (r *UserRepository) GetAll(ctx context.Context) ([]domain.User, error) {
	rows, err := r.Db.Query(ctx, "SELECT id, name, email, password, phone_number, create_at, updated_at FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []domain.User
	for rows.Next() {
		var u domain.User
		err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Password, &u.PhoneNumber, &u.CreatedAt, &u.UpdatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}
