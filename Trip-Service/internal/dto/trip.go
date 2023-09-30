package dto

import (
	"Trip-Service/internal/common"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type (
	TripDTO struct {
		ID       string `json:"_id"`
		UserID   string `json:"userId"`
		DriverID string `json:"driverId"`

		//Location From
		LongitudeFrom string `json:"longitudeFrom"`
		LatitudeFrom  string `json:"latitudeFrom"`
		AddressFrom   string `json:"addressFrom"`

		//Location To
		LongitudeTo string `json:"longitudeTo"`
		LatitudeTo  string `json:"latitudeTo"`
		AddressTo   string `json:"addressTo"`

		Price float32 `json:"price"`

		TripHistories []TripHistoryDTO `json:"tripHistories"`
		PhoneNumber   string           `json:"phone"`
	}

	TripRes struct {
		ID       primitive.ObjectID `json:"_id"`
		UserID   primitive.ObjectID `json:"userId"`
		DriverID primitive.ObjectID `json:"driverId"`

		//Location From
		LongitudeFrom string `json:"longitudeFrom"`
		LatitudeFrom  string `json:"latitudeFrom"`
		AddressFrom   string `json:"addressFrom"`

		//Location To
		LongitudeTo string `json:"longitudeTo"`
		LatitudeTo  string `json:"latitudeTo"`
		AddressTo   string `json:"addressTo"`

		Price float32 `json:"price"`

		PhoneNumber string    `json:"phone"`
		CreatedAt   time.Time `json:"createdAt,omitempty"`
		UpdatedAt   time.Time `json:"updatedAt,omitempty"`
	}

	TripList struct {
		Items []TripRes `json:"items"`
		Total int64     `json:"total"`
	}

	TripQuery struct {
		Name      string             `json:"name,omitempty" bson:"name,omitempty"`
		Page      int                `json:"page,omitempty"`
		Limit     int                `json:"limit,omitempty"`
		OrderBy   common.OrderBy     `json:"orderBy,omitempty" bson:"orderBy,omitempty"`
		SortOrder int                `json:"sortOrder,omitempty" bson:"sortOrder,omitempty"`
		UserType  string             `json:"userType,omitempty" bson:"userType,omitempty"`
		Phone     string             `json:"phone,omitempty" bson:"phone,omitempty"`
		UserId    primitive.ObjectID `json:"userId,omitempty" bson:"userId,omitempty"`
		DriverID  primitive.ObjectID `json:"driverId,omitempty" bson:"driverId,omitempty"`
		Year      int                `json:"year,omitempty" bson:"year,omitempty"`
		Quarter   int                `json:"quarter,omitempty" bson:"quarter,omitempty"`
		Month     int                `json:"month,omitempty" bson:"month,omitempty"`
	}

	CreateTripDTO struct {
		ID       string `bson:"_id,omitempty"`
		UserID   string `bson:"userId,omitempty"`
		DriverID string `bson:"driverId,omitempty"`

		//Location From
		LongitudeFrom string `bson:"longitudeFrom,omitempty"`
		LatitudeFrom  string `bson:"latitudeFrom,omitempty"`
		AddressFrom   string `bson:"addressFrom,omitempty"`

		//Location To
		LongitudeTo string `bson:"longitudeTo,omitempty"`
		LatitudeTo  string `bson:"latitudeTo,omitempty"`
		AddressTo   string `bson:"addressTo,omitempty"`

		Price       float32 `json:"price,omitempty"`
		PhoneNumber string  `json:"phone,omitempty"`
	}
)

func (p *TripDTO) Validate() error {

	return nil
}

func (p *CreateTripDTO) Validate() error {
	// if p.Username == "" {
	// 	return fmt.Errorf("seller username cannot be empty")
	// }

	return nil
}
