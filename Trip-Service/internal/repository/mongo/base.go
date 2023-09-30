package mongoRepository

import (
	"Trip-Service/internal/domain"
	"context"

	"go.mongodb.org/mongo-driver/mongo"
)

func MgDatabase() string {
	return "demand"
}

type Repository struct {
	TripRepository        domain.TripRepository
	TripHistoryRepository domain.TripHistoryRepository
}

func InitialRepository(
	ctx context.Context,
	mg_store *mongo.Client,
) Repository {
	tripRepository := NewTripRepository(ctx, mg_store)
	tripHistoryRepository := NewTripHistoryRepository(ctx, mg_store)
	return Repository{
		TripRepository:        tripRepository,
		TripHistoryRepository: tripHistoryRepository,
	}
}
