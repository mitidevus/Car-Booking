package storage

import (
	"context"
	"fmt"

	"Trip-Service/config"

	"github.com/go-redis/redis/v8"
)

func InitRedisStore(ctx context.Context, cfg config.Redis) (client *redis.Client, err error) {
	client = redis.NewClient(&redis.Options{
		Addr:     cfg.Addrs[0],
		Password: cfg.Password,
		DB:       cfg.Database,
	})

	// TODO: pint to redis
	_, err = client.Ping(ctx).Result()
	if err != nil {
		return client, err
	}

	fmt.Println("connect to redis successful")

	return client, err
}
