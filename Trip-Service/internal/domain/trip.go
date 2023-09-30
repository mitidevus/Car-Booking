package domain

import (
	"Trip-Service/internal/dto"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Trip struct {
	ID       primitive.ObjectID `bson:"_id,omitempty"`
	UserID   primitive.ObjectID `bson:"userId,omitempty"`
	DriverID primitive.ObjectID `bson:"driverId,omitempty"`

	//Location From
	LongitudeFrom string `bson:"longitudeFrom,omitempty"`
	LatitudeFrom  string `bson:"latitudeFrom,omitempty"`
	AddressFrom   string `bson:"addressFrom,omitempty"`

	//Location To
	LongitudeTo string `bson:"longitudeTo,omitempty"`
	LatitudeTo  string `bson:"latitudeTo,omitempty"`
	AddressTo   string `bson:"addressTo,omitempty"`

	Status string  `bson:"status,omitempty"`
	Price  float32 `bson:"price,omitempty"`

	CreatedAt time.Time `bson:"createdAt,omitempty"`
	UpdatedAt time.Time `bson:"updatedAt,omitempty"`
	DeletedAt time.Time `bson:"deletedAt,omitempty"`

	PhoneNumber string `bson:"phone,omitempty"`
}

type TripDetail struct {
	ID       primitive.ObjectID `bson:"_id,omitempty"`
	UserID   primitive.ObjectID `bson:"userId,omitempty"`
	DriverID primitive.ObjectID `bson:"driverId,omitempty"`

	//Location From
	LongitudeFrom string `bson:"longitudeFrom,omitempty"`
	LatitudeFrom  string `bson:"latitudeFrom,omitempty"`
	AddressFrom   string `bson:"addressFrom,omitempty"`

	//Location To
	LongitudeTo string `bson:"longitudeTo,omitempty"`
	LatitudeTo  string `bson:"latitudeTo,omitempty"`
	AddressTo   string `bson:"addressTo,omitempty"`

	Price float32 `bson:"price,omitempty"`

	CreatedAt time.Time `bson:"createdAt,omitempty"`
	UpdatedAt time.Time `bson:"updatedAt,omitempty"`
	DeletedAt time.Time `bson:"deletedAt,omitempty"`

	TripHistory []TripHistory `json:"tripHistories" bson:"tripHistories"`
	PhoneNumber string        `bson:"phone,omitempty"`
}

type TripList struct {
	Items []Trip `bson:"items,omitempty"`
	Total int64  `bson:"total,omitempty"`
}

type StatisticTopUser struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	TotalPrice float64            `bson:"totalPrice,omitempty" json:"totalPrice,omitempty"`
	TotalTrip  int                `bson:"count,omitempty" json:"totalTrip,omitempty"`
	Phone      string             `bson:"phone,omitempty" json:"phone,omitempty"`

	//User
	Avatar     string `json:"avatar,omitempty"`
	Background string `json:"background,omitempty"`
	FirstName  string `json:"firstName,omitempty"`
	LastName   string `json:"lastName,omitempty"`
	Gender     string `json:"gender,omitempty"`
	Birthday   string `json:"birthday,omitempty"`

	//Driver
	DriverAvatar string `json:"driverAvatar,omitempty"`
	Name         string `json:"name,omitempty"`
	PhoneNumber  string `json:"phoneNumber,omitempty"`
	VehicleType  string `json:"vehicleType,omitempty"`
	VehiclePlate string `json:"vehiclePlate,omitempty"`
	DriverType   string `json:"driverType,omitempty"`
}

type ResponseUserFromDemand struct {
	StatusCode string           `json:"status_code"`
	Message    string           `json:"message,omitempty"`
	Code       string           `json:"code,omitempty"`
	Data       StatisticTopUser `json:"data,omitempty"`
}

type StatisticPrice struct {
	TotalPrice  float64 `bson:"totalPrice,omitempty" json:"totalRevenue"`
	TotalProfit float64 `json:"totalProfit"`
}

type TripRepository interface {
	CreateTrip(context.Context, *Trip) (*Trip, error)
	UpdateTrip(context.Context, primitive.ObjectID, Trip) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*TripDetail, error)

	DeleteTrip(context.Context, primitive.ObjectID) error
	ListTrip(context.Context, dto.TripQuery) (TripList, error)

	ListTopUser(context.Context, dto.TripQuery) ([]StatisticTopUser, error)
	StatisticPrice(context.Context, dto.TripQuery) (*StatisticPrice, error)
}
