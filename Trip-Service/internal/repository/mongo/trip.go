package mongoRepository

import (
	"context"
	"fmt"
	"log"
	"time"

	"Trip-Service/internal/domain"
	"Trip-Service/internal/dto"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const tripsCollection = "trips"

type tripRepository struct {
	mg *mongo.Client
}

func NewTripRepository(
	ctx context.Context,
	mg *mongo.Client,
) domain.TripRepository {
	return &tripRepository{
		mg: mg,
	}
}

func (r *tripRepository) CreateTrip(ctx context.Context, trip *domain.Trip) (*domain.Trip, error) {
	res, err := r.mg.Database(MgDatabase()).Collection(tripsCollection).InsertOne(ctx, trip)
	if err != nil {
		return nil, err
	}

	id, ok := res.InsertedID.(primitive.ObjectID)
	if !ok {
		return nil, fmt.Errorf("unexpected type of inserted ID: %T", id)
	}
	trip.ID = id
	return trip, nil
}

func (r *tripRepository) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.TripDetail, error) {
	//var trip domain.TripDetail
	//filter := bson.M{"_id": id}
	// opts := options.FindOne().SetMaxTime(time.Second * 5)
	// err := r.mg.Database(MgDatabase()).Collection(tripsCollection).FindOne(ctx, filter, opts).Decode(&trip)
	// if err != nil {
	// 	return nil, err
	// }

	coll := r.mg.Database(MgDatabase()).Collection(tripsCollection)

	pipeline := bson.A{
		bson.M{
			"$lookup": bson.M{
				"from":         tripHistoriesCollection, // The target collection name
				"localField":   "_id",                   // The field from the source collection
				"foreignField": "tripId",                // The field from the target collection
				"as":           "tripHistories",         // The alias for the joined data
			},
		},
		bson.M{
			"$match": bson.M{
				"_id": id, // Match condition for the "status" field
			},
		},
		// Add more stages if needed
	}

	cursor, err := coll.Aggregate(context.Background(), pipeline)
	if err != nil {
		log.Println(err)
	}
	defer cursor.Close(context.Background())

	var results []domain.TripDetail
	if err := cursor.All(context.Background(), &results); err != nil {
		return nil, err
	}

	if len(results) == 0 {
		return nil, mongo.ErrNoDocuments
	}

	return &results[0], nil
}

func (r *tripRepository) UpdateTrip(ctx context.Context, id primitive.ObjectID, trip domain.Trip) error {
	coll := r.mg.Database(MgDatabase()).Collection(tripsCollection)
	filter := bson.M{"_id": id}
	update := bson.M{"$set": trip}
	result, err := coll.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.ModifiedCount == 0 {
		return fmt.Errorf("no trip found to update with id %s", id)
	}

	return err
}

func (r *tripRepository) DeleteTrip(ctx context.Context, objectID primitive.ObjectID) error {
	filter := bson.M{"_id": objectID, "isActive": true}
	update := bson.M{"$set": bson.M{"isActive": false}}
	res, err := r.mg.Database(MgDatabase()).Collection(tripsCollection).UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	if res.ModifiedCount == 0 {
		return fmt.Errorf("no customer found to delete with id %s", objectID.Hex())
	}

	return nil
}

func (r *tripRepository) ListTrip(ctx context.Context, query dto.TripQuery) (domain.TripList, error) {
	// Create a filter based on the query parameters
	filter := bson.M{}
	if query.UserType == "guest" {
		filter["$and"] = []bson.M{
			bson.M{"phone": bson.M{"$ne": nil}},
			bson.M{"userId": nil},
		}
		if query.Phone != "" {
			filter["phone"] = query.Phone
		}

	} else if query.UserType == "driver" {
		if query.UserId != primitive.NilObjectID {
			filter["driverId"] = query.DriverID
		}
	} else {
		filter["userId"] = bson.M{"$ne": nil}
		if query.UserId != primitive.NilObjectID {
			filter["userId"] = query.UserId
		}
	}

	// Set the options for pagination and sorting
	opts := options.Find()
	opts.SetSkip(int64(query.Page-1) * int64(query.Limit))
	opts.SetLimit(int64(query.Limit))
	opts.SetSort(bson.D{{string(query.OrderBy), query.SortOrder}})

	// Execute the query
	cursor, err := r.mg.Database(MgDatabase()).Collection(tripsCollection).Find(ctx, filter, opts)
	if err != nil {
		return domain.TripList{}, err
	}
	defer cursor.Close(ctx)

	// Initialize slice with the same capacity as limit
	trips := make([]domain.Trip, 0, query.Limit)

	for cursor.Next(ctx) {
		var Trip domain.Trip
		err := cursor.Decode(&Trip)
		if err != nil {
			return domain.TripList{}, fmt.Errorf("failed to decode Trip: %v", err)
		}

		trips = append(trips, Trip)
	}

	if err := cursor.Err(); err != nil {
		return domain.TripList{}, fmt.Errorf("failed to iterate trips cursor: %v", err)
	}

	// Return an empty slice if no trips are found
	if len(trips) == 0 {
		return domain.TripList{}, nil
	}

	// Get the total count of blogs
	count, err := r.mg.Database(MgDatabase()).Collection(tripsCollection).CountDocuments(ctx, filter)

	if err != nil {
		return domain.TripList{}, err
	}

	return domain.TripList{
		Items: trips,
		Total: count,
	}, nil
}

func (r *tripRepository) ListTopUser(ctx context.Context, query dto.TripQuery) ([]domain.StatisticTopUser, error) {
	// Create a filter based on the query parameters
	filter := bson.M{}
	group := bson.M{}
	project := bson.M{}

	if query.UserType == "guest" {
		filter["$and"] = []bson.M{
			bson.M{"phone": bson.M{"$ne": nil}},
			bson.M{"userId": nil},
		}
		if query.Phone != "" {
			filter["phone"] = query.Phone
		}
		group["_id"] = "$phone"
		project["$project"] = bson.M{
			"phone":      "$_id", // Đổi tên trường _id thành phone
			"totalPrice": 1,
			"count":      1,
			"_id":        0, // Loại bỏ trường _id
		}
	} else if query.UserType == "user" {
		filter["userId"] = bson.M{"$ne": nil}
		if query.UserId != primitive.NilObjectID {
			filter["userId"] = query.UserId
		}
		group["_id"] = "$userId"
	} else {
		group["_id"] = "$driverId"
	}

	filterCreatedAt := bson.M{}
	if query.Month != 0 && query.Year != 0 {
		filterCreatedAt["createdAt"] = bson.M{
			"$gte": time.Date(query.Year, time.Month(query.Month), 1, 0, 0, 0, 0, time.UTC),
			"$lt":  time.Date(query.Year, time.Month(query.Month)+1, 1, 0, 0, 0, 0, time.UTC),
		}
	} else if query.Quarter != 0 && query.Year != 0 {
		filterCreatedAt["createdAt"] = bson.M{
			"$gte": time.Date(query.Year, time.Month(3*query.Quarter-2), 1, 0, 0, 0, 0, time.UTC),
			"$lt":  time.Date(query.Year, time.Month(3*query.Quarter)+1, 1, 0, 0, 0, 0, time.UTC),
		}
	} else {
		filterCreatedAt["createdAt"] = bson.M{
			"$gte": time.Date(query.Year, time.Month(1), 1, 0, 0, 0, 0, time.UTC),
			"$lt":  time.Date(query.Year+1, time.Month(1), 1, 0, 0, 0, 0, time.UTC),
		}
	}

	group["totalPrice"] = bson.M{"$sum": "$price"}
	group["count"] = bson.M{"$sum": 1}

	pipeline := []bson.M{
		{
			"$match": bson.M{"$and": []bson.M{
				filterCreatedAt,
				filter,
			}},
		},
		{
			"$group": group,
		},
		{
			"$sort": bson.M{"totalPrice": -1},
		},
		{
			"$limit": query.Limit, // Thay đổi giá trị 5 thành số n bạn muốn lấy top n người dùng.
		},
	}

	if query.UserType == "guest" {
		pipeline = append(pipeline, project)
	}

	cursor, err := r.mg.Database(MgDatabase()).Collection(tripsCollection).Aggregate(context.Background(), pipeline)
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(context.Background())

	trips := make([]domain.StatisticTopUser, 0, query.Limit)

	for cursor.Next(ctx) {
		var Trip domain.StatisticTopUser
		err := cursor.Decode(&Trip)
		if err != nil {
			return []domain.StatisticTopUser{}, fmt.Errorf("failed to decode top user: %v", err)
		}

		trips = append(trips, Trip)
	}

	if err := cursor.Err(); err != nil {
		return []domain.StatisticTopUser{}, fmt.Errorf("failed to iterate top user cursor: %v", err)
	}

	// Return an empty slice if no trips are found
	if len(trips) == 0 {
		return []domain.StatisticTopUser{}, nil
	}
	return trips, nil
}

func (r *tripRepository) StatisticPrice(ctx context.Context, query dto.TripQuery) (*domain.StatisticPrice, error) {

	filterCreatedAt := bson.M{}
	if query.Month != 0 && query.Year != 0 {
		filterCreatedAt["createdAt"] = bson.M{
			"$gte": time.Date(query.Year, time.Month(query.Month), 1, 0, 0, 0, 0, time.UTC),
			"$lt":  time.Date(query.Year, time.Month(query.Month)+1, 1, 0, 0, 0, 0, time.UTC),
		}
	} else if query.Quarter != 0 && query.Year != 0 {
		filterCreatedAt["createdAt"] = bson.M{
			"$gte": time.Date(query.Year, time.Month(3*query.Quarter-2), 1, 0, 0, 0, 0, time.UTC),
			"$lt":  time.Date(query.Year, time.Month(3*query.Quarter)+1, 1, 0, 0, 0, 0, time.UTC),
		}
	} else {
		filterCreatedAt["createdAt"] = bson.M{
			"$gte": time.Date(query.Year, time.Month(1), 1, 0, 0, 0, 0, time.UTC),
			"$lt":  time.Date(query.Year+1, time.Month(1), 1, 0, 0, 0, 0, time.UTC),
		}
	}

	pipeline := []bson.M{
		{
			"$match": bson.M{"$and": []bson.M{
				filterCreatedAt,
			}},
		},
		{
			"$group": bson.M{
				"_id":        nil,
				"totalPrice": bson.M{"$sum": "$price"},
			},
		},
		{
			"$project": bson.M{
				"_id":        0,
				"totalPrice": 1,
			},
		},
	}

	cursor, err := r.mg.Database(MgDatabase()).Collection(tripsCollection).Aggregate(context.Background(), pipeline)
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(context.Background())

	result := &domain.StatisticPrice{}

	if cursor.Next(context.Background()) {
		if err := cursor.Decode(result); err != nil {
			return nil, err
		}
	}

	return result, nil
}
