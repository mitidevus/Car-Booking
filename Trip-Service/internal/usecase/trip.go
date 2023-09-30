package usecase

import (
	"Trip-Service/config"
	"Trip-Service/internal/common"
	"Trip-Service/internal/domain"
	"Trip-Service/internal/dto"
	"Trip-Service/internal/helper/logger"
	"Trip-Service/internal/helper/objectID"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/jinzhu/copier"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type tripUsecase struct {
	cfg            *config.Config
	tripRepository domain.TripRepository
	redis          *redis.Client
}

type TripUsecase interface {
	GetByID(context.Context, primitive.ObjectID) (*dto.TripDTO, error)
	CreateTrip(context.Context, dto.CreateTripDTO) (*dto.TripDTO, error)
	UpdateTrip(context.Context, dto.TripDTO) error

	DeleteTrip(context.Context, primitive.ObjectID) error
	ListTrip(context.Context, dto.TripQuery) (dto.TripList, error)
	ListTopUser(ctx context.Context, req dto.TripQuery) ([]domain.StatisticTopUser, error)
	StatisticPrice(ctx context.Context, req dto.TripQuery) (*domain.StatisticPrice, error)
}

func NewTripUsecase(
	cfg *config.Config,
	tripRepository domain.TripRepository,
	redis *redis.Client,
) *tripUsecase {
	return &tripUsecase{
		cfg:            cfg,
		tripRepository: tripRepository,
		redis:          redis,
	}
}

func (u *tripUsecase) UpdateTrip(ctx context.Context, req dto.TripDTO) error {
	Trip := domain.Trip{
		ID:       objectID.ReturnObjectID(req.ID),
		DriverID: objectID.ReturnObjectID(req.DriverID),
		UserID:   objectID.ReturnObjectID(req.UserID),

		LongitudeFrom: req.LongitudeFrom,
		LatitudeFrom:  req.LatitudeFrom,
		AddressFrom:   req.AddressFrom,

		LongitudeTo: req.LongitudeTo,
		LatitudeTo:  req.LatitudeTo,
		AddressTo:   req.AddressTo,

		Price: req.Price,
	}

	//Trip.ID = primitive.NilObjectID
	if err := u.tripRepository.UpdateTrip(ctx, objectID.ReturnObjectID(req.ID), Trip); err != nil {
		return err
	}

	return nil
}

func (u *tripUsecase) UpdateTripCallCenter(ctx context.Context, req dto.TripDTO) error {
	Trip := domain.Trip{
		LongitudeTo: req.LongitudeTo,
		LatitudeTo:  req.LatitudeTo,
		AddressTo:   req.AddressTo,

		Price: req.Price,
	}

	//Trip.ID = primitive.NilObjectID
	if err := u.tripRepository.UpdateTrip(ctx, objectID.ReturnObjectID(req.ID), Trip); err != nil {
		return err
	}

	return nil
}

func TripHistoryDomainToDTO(domain []domain.TripHistory) []dto.TripHistoryDTO {
	dto := make([]dto.TripHistoryDTO, len(domain))

	for i, v := range domain {
		dto[i].ID = v.ID
		dto[i].TripID = v.TripID
		dto[i].Status = v.Status
		dto[i].Note = v.Note
		dto[i].CreatedAt = v.CreatedAt
	}

	return dto

}

func (u *tripUsecase) GetByID(ctx context.Context, id primitive.ObjectID) (*dto.TripDTO, error) {
	tripModel, err := u.tripRepository.GetByID(ctx, id)
	if err != nil {
		logger.Log.Errorf("get user by id error while call database error %v", err)
		if err == mongo.ErrNoDocuments {
			return nil, common.ErrRecordNotFound
		}
		return nil, common.ErrDatabase
	}

	tripHis := TripHistoryDomainToDTO(tripModel.TripHistory)

	trip := &dto.TripDTO{
		ID:       tripModel.ID.Hex(),
		DriverID: tripModel.DriverID.Hex(),
		UserID:   tripModel.UserID.Hex(),

		LongitudeFrom: tripModel.LongitudeFrom,
		LatitudeFrom:  tripModel.LatitudeFrom,
		AddressFrom:   tripModel.AddressFrom,

		LongitudeTo: tripModel.LongitudeTo,
		LatitudeTo:  tripModel.LatitudeTo,
		AddressTo:   tripModel.AddressTo,

		Price: tripModel.Price,

		TripHistories: tripHis,

		PhoneNumber: tripModel.PhoneNumber,
	}
	return trip, nil
}

func (u *tripUsecase) CreateTrip(ctx context.Context, req dto.CreateTripDTO) (*dto.TripDTO, error) {

	TripModel := &domain.Trip{
		ID:       primitive.NewObjectID(),
		UserID:   objectID.ReturnObjectID(req.UserID),
		DriverID: objectID.ReturnObjectID(req.DriverID),

		LongitudeFrom: req.LongitudeFrom,
		LatitudeFrom:  req.LatitudeFrom,
		AddressFrom:   req.AddressFrom,

		LongitudeTo: req.LongitudeTo,
		LatitudeTo:  req.LatitudeTo,
		AddressTo:   req.AddressTo,

		Price:  req.Price,
		Status: common.TRIP_STATUS_CREATE,

		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),

		PhoneNumber: req.PhoneNumber,
	}

	pgTrip, err := u.tripRepository.CreateTrip(ctx, TripModel)
	if err != nil {
		logger.Log.Errorf("Create Trip, error while call database error %v", err)
		return nil, common.ErrDatabase
	}

	trip := &dto.TripDTO{
		ID:       pgTrip.ID.Hex(),
		UserID:   pgTrip.UserID.Hex(),
		DriverID: pgTrip.DriverID.Hex(),

		LongitudeFrom: pgTrip.LongitudeFrom,
		LatitudeFrom:  pgTrip.LatitudeFrom,
		AddressFrom:   pgTrip.AddressFrom,

		LongitudeTo: pgTrip.LongitudeTo,
		LatitudeTo:  pgTrip.LatitudeTo,
		AddressTo:   pgTrip.AddressTo,

		Price: pgTrip.Price,

		PhoneNumber: pgTrip.PhoneNumber,
	}

	return trip, nil
}

func (u *tripUsecase) DeleteTrip(ctx context.Context, objectID primitive.ObjectID) error {
	err := u.tripRepository.DeleteTrip(ctx, objectID)
	if err != nil {
		return err
	}

	return nil
}

func (u *tripUsecase) ListTrip(ctx context.Context, req dto.TripQuery) (dto.TripList, error) {
	TripList, err := u.tripRepository.ListTrip(ctx, req)
	if err != nil {
		return dto.TripList{}, err
	}

	TripListRes := make([]dto.TripRes, len(TripList.Items))
	copier.Copy(&TripListRes, &TripList.Items)

	return dto.TripList{
		Items: TripListRes,
		Total: TripList.Total,
	}, nil
}

func (u *tripUsecase) ListTopUser(ctx context.Context, req dto.TripQuery) ([]domain.StatisticTopUser, error) {
	TripList, err := u.tripRepository.ListTopUser(ctx, req)
	if err != nil {
		return []domain.StatisticTopUser{}, err
	}
	var wg sync.WaitGroup
	results := make(chan domain.StatisticTopUser, len(TripList))
	if req.UserType == "driver" {
		for _, t := range TripList {
			t.TotalPrice = t.TotalPrice * 90 / 100
			wg.Add(1)
			go func(u domain.StatisticTopUser) {
				defer wg.Done()
				apiURL := fmt.Sprintf("http://localhost:8080/driver/find/%s", u.ID.Hex())
				req, err := http.NewRequest("GET", apiURL, nil)
				if err != nil {
					fmt.Printf("Failed to create request for user %s: %v\n", u.ID, err)
					return
				}

				// Đặt các header trong yêu cầu
				//req.Header.Set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZDhmMWI5ODY2NmQzNDA3YjIzYjgzOSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjkyNjgxMDExLCJleHAiOjE2OTk2OTQ5MTl9.ILrJJxwF8XW4Qq1Jy6uil4RT0tst_jojj1PB5SikE3s")
				// Đặt các header khác nếu cần

				// Gửi yêu cầu HTTP tùy chỉnh
				resp, err := http.DefaultClient.Do(req)
				if err != nil {
					log.Println(err)
					return
				}

				if resp.StatusCode != http.StatusOK {
					fmt.Printf("API call for user %s returned status code %d\n", u.ID, resp.StatusCode)
					return
				}

				var userData domain.StatisticTopUser
				err = json.NewDecoder(resp.Body).Decode(&userData)
				if err != nil {
					fmt.Printf("Failed to decode API response for user %s: %v\n", u.ID, err)
					return
				}
				copier.CopyWithOption(&u, &userData, copier.Option{
					IgnoreEmpty: true,
				})
				results <- u

			}(t)
		}
		go func() {
			wg.Wait()
			close(results)
		}()

		fetchedUsers := []domain.StatisticTopUser{}
		for user := range results {
			fetchedUsers = append(fetchedUsers, user)
		}
		return fetchedUsers, nil

	} else if req.UserType == "user" {
		for _, t := range TripList {
			wg.Add(1)
			go func(u domain.StatisticTopUser) {
				defer wg.Done()
				apiURL := fmt.Sprintf("http://localhost:8086/v1/admin/customers/%s", u.ID.Hex())
				req, err := http.NewRequest("GET", apiURL, nil)
				if err != nil {
					fmt.Printf("Failed to create request for user %s: %v\n", u.ID, err)
					return
				}

				// Đặt các header trong yêu cầu
				req.Header.Set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZDhmMWI5ODY2NmQzNDA3YjIzYjgzOSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjkyNjgxMDExLCJleHAiOjE2OTk2OTQ5MTl9.ILrJJxwF8XW4Qq1Jy6uil4RT0tst_jojj1PB5SikE3s")
				// Đặt các header khác nếu cần

				// Gửi yêu cầu HTTP tùy chỉnh
				resp, err := http.DefaultClient.Do(req)
				if err != nil {
					log.Println(err)
					return
				}

				if resp.StatusCode != http.StatusOK {
					fmt.Printf("API call for user %s returned status code %d\n", u.ID, resp.StatusCode)
					return
				}

				var userData domain.ResponseUserFromDemand
				err = json.NewDecoder(resp.Body).Decode(&userData)
				if err != nil {
					fmt.Printf("Failed to decode API response for user %s: %v\n", u.ID, err)
					return
				}
				copier.CopyWithOption(&u, &userData.Data, copier.Option{
					IgnoreEmpty: true,
				})
				results <- u

			}(t)
		}

		go func() {
			wg.Wait()
			close(results)
		}()

		fetchedUsers := []domain.StatisticTopUser{}
		for user := range results {
			fetchedUsers = append(fetchedUsers, user)
		}
		return fetchedUsers, nil
	}

	return TripList, nil

}

func (u *tripUsecase) StatisticPrice(ctx context.Context, req dto.TripQuery) (*domain.StatisticPrice, error) {
	r, err := u.tripRepository.StatisticPrice(ctx, req)
	if err != nil {
		return nil, err
	}
	r.TotalProfit = r.TotalPrice * 10 / 100

	return r, nil
}
