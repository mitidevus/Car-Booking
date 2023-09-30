package mongoRepository

import (
	"context"
	"demand-service/internal/domain"

	"go.mongodb.org/mongo-driver/mongo"
)

func MgDatabase() string {
	return "demand"
}

type Repository struct {
	CustomerRepository domain.CustomerRepository
}

func InitialRepository(
	ctx context.Context,
	mg_store *mongo.Client,
) Repository {
	customerRepository := NewCustomerRepository(ctx, mg_store)
	return Repository{
		CustomerRepository: customerRepository,
	}
}
