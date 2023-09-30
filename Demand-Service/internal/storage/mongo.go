package storage

import (
	"context"
	"demand-service/config"
	"fmt"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

func InitMongoStore(ctx context.Context, m config.Mongo) (*mongo.Client, error) {
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(m.Url))
	if err != nil {
		return nil, err
	}

	// TODO: Ping the primary
	if err := client.Ping(context.TODO(), readpref.Primary()); err != nil {
		return nil, err
	}

	fmt.Println("Successfully connected mongo database.")

	return client, err
}
