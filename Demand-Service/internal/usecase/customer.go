package usecase

import (
	"context"
	"demand-service/config"
	"demand-service/internal/common"
	"demand-service/internal/domain"
	"demand-service/internal/dto"
	"demand-service/internal/helper/logger"
	"demand-service/utils"
	"fmt"
	"time"

	"github.com/jinzhu/copier"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type customerUsecase struct {
	cfg                *config.Config
	customerRepository domain.CustomerRepository
}

type CustomerUsecase interface {
	GetByID(context.Context, primitive.ObjectID) (*dto.CustomerDTO, error)
	GetByPhone(context.Context, string) (*dto.CustomerDTO, error)
	CreateCustomer(context.Context, dto.CreateCustomerDTO) (*dto.CustomerDTO, error)
	UpdateCustomer(context.Context, dto.CustomerDTO) error

	DeleteCustomer(context.Context, primitive.ObjectID) error
	ListCustomer(context.Context, dto.CustomerQuery) (dto.CustomerList, error)
}

func NewCustomerUsecase(
	cfg *config.Config,
	customerRepository domain.CustomerRepository,
) *customerUsecase {
	return &customerUsecase{
		cfg:                cfg,
		customerRepository: customerRepository,
	}
}

func (u *customerUsecase) UpdateCustomer(ctx context.Context, req dto.CustomerDTO) error {
	customer := domain.Customer{}
	copier.Copy(&customer, &req)
	fmt.Println(customer.IsActive, customer.IsVIP)
	fmt.Println(req)
	if err := u.customerRepository.UpdateCustomer(ctx, customer); err != nil {
		return err
	}

	return nil
}

func (u *customerUsecase) GetByID(ctx context.Context, id primitive.ObjectID) (*dto.CustomerDTO, error) {
	userModel, err := u.customerRepository.GetByID(ctx, id)
	if err != nil {
		logger.Log.Errorf("get user by id error while call database error %v", err)
		if err == mongo.ErrNoDocuments {
			return nil, common.ErrRecordNotFound
		}
		return nil, common.ErrDatabase
	}

	user := &dto.CustomerDTO{}
	copier.Copy(user, userModel)
	return user, nil
}

func (u *customerUsecase) GetByPhone(ctx context.Context, phone string) (*dto.CustomerDTO, error) {
	userModel, err := u.customerRepository.GetByPhone(ctx, phone)
	if err != nil {
		logger.Log.Errorf("get user by phone error while call database error %v", err)
		if err == mongo.ErrNoDocuments {
			return nil, common.ErrRecordNotFound
		}
		return nil, common.ErrDatabase
	}

	user := &dto.CustomerDTO{
		ID:        userModel.ID,
		Avatar:    userModel.Avatar,
		FirstName: userModel.FirstName,
		LastName:  userModel.LastName,
		Phone:     userModel.Phone,
		Birthday:  userModel.Birthday,
		Gender:    common.Gender(userModel.Gender),
	}
	return user, nil
}

func (u *customerUsecase) IsPhoneExists(ctx context.Context, value string) bool {
	if value == "" {
		return false
	}

	_, err := u.customerRepository.GetByPhone(ctx, value)
	return err != mongo.ErrNoDocuments
}

func (u *customerUsecase) CreateCustomer(ctx context.Context, req dto.CreateCustomerDTO) (*dto.CustomerDTO, error) {

	if exist := u.IsPhoneExists(ctx, req.Phone); exist {
		logger.Log.Error("create customer, phone already exists!")
		return nil, common.ErrPhoneExists
	}

	customerModel := &domain.Customer{
		ID:         primitive.NewObjectID(),
		Avatar:     req.Avatar,
		Background: req.Background,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		Gender:     req.Gender,
		Phone:      req.Phone,
		Birthday:   req.Birthday,
		IsActive:   utils.NewBoolPointer(true),
		IsVIP:      utils.NewBoolPointer(false),
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	pgCustomer, err := u.customerRepository.CreateCustomer(ctx, customerModel)
	if err != nil {
		logger.Log.Errorf("Create customer, error while call database error %v", err)
		return nil, common.ErrDatabase
	}

	user := &dto.CustomerDTO{
		ID:        pgCustomer.ID,
		Avatar:    pgCustomer.Avatar,
		FirstName: pgCustomer.FirstName,
		LastName:  pgCustomer.LastName,
		Gender:    common.Gender(pgCustomer.Gender),
		Phone:     pgCustomer.Phone,
		Birthday:  pgCustomer.Birthday,
		IsActive:  *pgCustomer.IsActive,
		IsVip:     *pgCustomer.IsVIP,
	}

	return user, nil
}

func (u *customerUsecase) DeleteCustomer(ctx context.Context, objectID primitive.ObjectID) error {
	err := u.customerRepository.DeleteCustomer(ctx, objectID)
	if err != nil {
		return err
	}

	return nil
}

func (u *customerUsecase) ListCustomer(ctx context.Context, req dto.CustomerQuery) (dto.CustomerList, error) {
	customerList, err := u.customerRepository.ListCustomer(ctx, req)
	if err != nil {
		return dto.CustomerList{}, err
	}

	CustomerListRes := make([]dto.CustomerRes, len(customerList.Items))
	copier.Copy(&CustomerListRes, &customerList.Items)

	return dto.CustomerList{
		Items: CustomerListRes,
		Total: customerList.Total,
	}, nil
}
