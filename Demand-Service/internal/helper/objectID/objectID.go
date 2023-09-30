package objectID

import (
	"demand-service/internal/helper/logger"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func ReturnObjectID(id string) primitive.ObjectID {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		logger.Log.Errorf("invalid object ID format: %s", objectID)
		return primitive.NilObjectID
	}

	return objectID
}
