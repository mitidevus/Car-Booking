package domain

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TripHistory struct {
	ID     primitive.ObjectID `bson:"_id,omitempty"`
	TripID primitive.ObjectID `bson:"tripId,omitempty"`

	Status string `bson:"status,omitempty"`
	Note   string `bson:"string,omitempty"`

	CreatedAt time.Time `bson:"createdAt,omitempty"`
	UpdatedAt time.Time `bson:"updatedAt,omitempty"`
	DeletedAt time.Time `bson:"deletedAt,omitempty"`
}

type TripHistoryRepository interface {
	CreateTripHistory(context.Context, *TripHistory) (*TripHistory, error)
	UpdateTripHistory(context.Context, primitive.ObjectID, TripHistory) error
}
