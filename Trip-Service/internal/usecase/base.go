package usecase

import (
	"Trip-Service/config"
	mongoRepository "Trip-Service/internal/repository/mongo"
	"context"

	"github.com/go-redis/redis/v8"
)

type Usecase struct {
	JwtUsecase  JwtUsecase
	TripUsecase TripUsecase
	//NotificationUseCase NotificationUseCase

	TripHistoryUsecase TripHistoryUsecase
}

func InitUseCase(
	ctx context.Context,
	cfg *config.Config,
	mg_repo mongoRepository.Repository,
	redis *redis.Client,
) (*Usecase, error) {
	pri, pub, sign, err := ParseKey(cfg)
	if err != nil {
		return nil, err
	}

	jwtUsecase := NewJwtUsecase(cfg, pri, pub, sign)
	TripUsecase := NewTripUsecase(cfg, mg_repo.TripRepository, redis)
	tripHistoryUsecase := NewTripHistoryUsecase(cfg, mg_repo.TripHistoryRepository, redis)

	return &Usecase{
		JwtUsecase:  jwtUsecase,
		TripUsecase: TripUsecase,
		//NotificationUseCase: notificationUseCase,
		TripHistoryUsecase: tripHistoryUsecase,
	}, nil
}
