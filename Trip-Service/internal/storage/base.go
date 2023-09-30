package storage

import (
	"Trip-Service/config"
	"context"
	"log"

	"github.com/go-redis/redis/v8"
	"go.mongodb.org/mongo-driver/mongo"
)

func InitStorage(ctx context.Context, config *config.Config) (*mongo.Client, *redis.Client) {
	// TODO: connect to mongo
	mongo_store, err := InitMongoStore(ctx, config.Mongo)
	if err != nil {
		log.Panicf("connect to mongo error: %v", err)
	}

	redis_store, err := InitRedisStore(ctx, config.Redis)
	if err != nil {
		log.Panicf("connect to redis error: %v", err)
	}

	return mongo_store, redis_store
}
