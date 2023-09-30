package domain

import (
	"context"
	"demand-service/internal/common"
	"demand-service/internal/dto"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Customer struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	Avatar     string             `bson:"avatar,omitempty"`
	Background string             `bson:"background,omitempty"`
	FirstName  string             `bson:"firstName,omitempty"`
	LastName   string             `bson:"lastName,omitempty"`
	Gender     common.Gender      `bson:"gender,omitempty"`
	Phone      string             `bson:"phone,omitempty"`
	Birthday   string             `bson:"birthday,omitempty"`
	IsActive   *bool              `bson:"isActive,omitempty"`
	IsVIP      *bool              `bson:"isVip,omitempty"`
	CreatedAt  time.Time          `bson:"createdAt,omitempty"`
	UpdatedAt  time.Time          `bson:"updatedAt,omitempty"`
	DeletedAt  time.Time          `bson:"deletedAt,omitempty"`
}

type CustomerList struct {
	Items []Customer `bson:"items,omitempty"`
	Total int64      `bson:"total,omitempty"`
}

type CustomerRepository interface {
	CreateCustomer(context.Context, *Customer) (*Customer, error)
	UpdateCustomer(context.Context, Customer) error
	GetByID(context.Context, primitive.ObjectID) (*Customer, error)
	GetByPhone(context.Context, string) (*Customer, error)

	DeleteCustomer(context.Context, primitive.ObjectID) error
	ListCustomer(context.Context, dto.CustomerQuery) (CustomerList, error)
}
