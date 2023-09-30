package mongoRepository

import (
	"context"
	"fmt"

	"Trip-Service/internal/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const tripHistoriesCollection = "trip_histories"

type tripHistoryRepository struct {
	mg *mongo.Client
}

func NewTripHistoryRepository(
	ctx context.Context,
	mg *mongo.Client,
) domain.TripHistoryRepository {
	return &tripHistoryRepository{
		mg: mg,
	}
}

func (r *tripHistoryRepository) CreateTripHistory(ctx context.Context, trip *domain.TripHistory) (*domain.TripHistory, error) {
	res, err := r.mg.Database(MgDatabase()).Collection(tripHistoriesCollection).InsertOne(ctx, trip)
	if err != nil {
		return nil, err
	}

	id, ok := res.InsertedID.(primitive.ObjectID)
	if !ok {
		return nil, fmt.Errorf("unexpected type of inserted ID: %T", id)
	}
	trip.ID = id
	return trip, nil
}

func (r *tripHistoryRepository) UpdateTripHistory(ctx context.Context, id primitive.ObjectID, trip domain.TripHistory) error {
	coll := r.mg.Database(MgDatabase()).Collection(tripHistoriesCollection)
	filter := bson.M{"_id": id}
	update := bson.M{"$set": trip}
	result, err := coll.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.ModifiedCount == 0 {
		return fmt.Errorf("no trip found to update with id %s", id)
	}

	return err
}
