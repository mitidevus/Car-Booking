package dto

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type (
	TripHistoryDTO struct {
		ID     primitive.ObjectID `json:"_id,omitempty"`
		TripID primitive.ObjectID `json:"tripId,omitempty"`

		Status string `json:"status,omitempty"`
		Note   string `json:"string,omitempty"`

		CreatedAt time.Time `json:"createdAt,omitempty"`
		//UpdatedAt time.Time `json:"updatedAt,omitempty"`
	}

	CreateTripHistoryDTO struct {
		ID     primitive.ObjectID `json:"_id,omitempty"`
		TripID string             `json:"tripId,omitempty"`

		Status string `json:"status,omitempty"`
		Note   string `json:"string,omitempty"`

		CreatedAt time.Time `json:"createdAt,omitempty"`
		//UpdatedAt time.Time `json:"updatedAt,omitempty"`
	}
)
