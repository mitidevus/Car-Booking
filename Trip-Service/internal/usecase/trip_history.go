package usecase

import (
	"Trip-Service/config"
	"Trip-Service/internal/common"
	"Trip-Service/internal/domain"
	"Trip-Service/internal/dto"
	"Trip-Service/internal/helper/logger"
	"Trip-Service/internal/helper/objectID"
	"context"
	"time"

	"github.com/go-redis/redis/v8"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type tripHistoryUsecase struct {
	cfg                   *config.Config
	tripHistoryRepository domain.TripHistoryRepository
	redis                 *redis.Client
}

type TripHistoryUsecase interface {
	CreateTripHistory(context.Context, dto.CreateTripHistoryDTO) (*dto.TripHistoryDTO, error)
}

func NewTripHistoryUsecase(
	cfg *config.Config,
	tripHistoryRepository domain.TripHistoryRepository,
	redis *redis.Client,
) *tripHistoryUsecase {
	return &tripHistoryUsecase{
		cfg:                   cfg,
		tripHistoryRepository: tripHistoryRepository,
		redis:                 redis,
	}
}

func (u *tripHistoryUsecase) CreateTripHistory(ctx context.Context, req dto.CreateTripHistoryDTO) (*dto.TripHistoryDTO, error) {
	TripHistoryModel := &domain.TripHistory{
		ID:     primitive.NewObjectID(),
		TripID: objectID.ReturnObjectID(req.TripID),
		Status: req.Status,

		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	pgTrip, err := u.tripHistoryRepository.CreateTripHistory(ctx, TripHistoryModel)
	if err != nil {
		logger.Log.Errorf("Create Trip, error while call database error %v", err)
		return nil, common.ErrDatabase
	}

	trip := &dto.TripHistoryDTO{
		ID:     pgTrip.ID,
		TripID: pgTrip.TripID,
		Status: pgTrip.Status,
	}

	return trip, nil
}
