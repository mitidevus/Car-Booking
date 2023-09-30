package storage

import (
	"context"
	"demand-service/config"
	"log"

	"go.mongodb.org/mongo-driver/mongo"
)

func InitStorage(ctx context.Context, config *config.Config) *mongo.Client {
	// TODO: connect to mongo
	mongo_store, err := InitMongoStore(ctx, config.Mongo)
	if err != nil {
		log.Panicf("connect to mongo error: %v", err)
	}

	return mongo_store
}
