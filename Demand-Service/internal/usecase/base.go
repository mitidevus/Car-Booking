package usecase

import (
	"context"
	"demand-service/config"
	mongoRepository "demand-service/internal/repository/mongo"
)

type Usecase struct {
	JwtUsecase      JwtUsecase
	CustomerUsecase CustomerUsecase
}

func InitUseCase(
	ctx context.Context,
	cfg *config.Config,
	mg_repo mongoRepository.Repository,
) (*Usecase, error) {
	pri, pub, sign, err := ParseKey(cfg)
	if err != nil {
		return nil, err
	}

	jwtUsecase := NewJwtUsecase(cfg, pri, pub, sign)
	customerUsecase := NewCustomerUsecase(cfg, mg_repo.CustomerRepository)

	return &Usecase{
		JwtUsecase:      jwtUsecase,
		CustomerUsecase: customerUsecase,
	}, nil
}
