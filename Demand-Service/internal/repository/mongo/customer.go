package mongoRepository

import (
	"context"
	"fmt"
	"time"

	"demand-service/internal/domain"
	"demand-service/internal/dto"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const customersCollection = "customers"

type customerRepository struct {
	mg *mongo.Client
}

func NewCustomerRepository(
	ctx context.Context,
	mg *mongo.Client,
) domain.CustomerRepository {
	return &customerRepository{
		mg: mg,
	}
}

func (r *customerRepository) CreateCustomer(ctx context.Context, customer *domain.Customer) (*domain.Customer, error) {
	fmt.Println(*customer)
	res, err := r.mg.Database(MgDatabase()).Collection(customersCollection).InsertOne(ctx, customer)
	if err != nil {
		return nil, err
	}

	id, ok := res.InsertedID.(primitive.ObjectID)
	if !ok {
		return nil, fmt.Errorf("unexpected type of inserted ID: %T", id)
	}
	customer.ID = id
	return customer, nil
}

func (r *customerRepository) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Customer, error) {
	var customer domain.Customer
	filter := bson.M{"_id": id}
	opts := options.FindOne().SetMaxTime(time.Second * 5)
	err := r.mg.Database(MgDatabase()).Collection(customersCollection).FindOne(ctx, filter, opts).Decode(&customer)
	if err != nil {
		return nil, err
	}

	return &customer, nil
}

func (r *customerRepository) GetByPhone(ctx context.Context, phone string) (*domain.Customer, error) {
	var customer domain.Customer

	filter := bson.M{"phone": phone}
	opts := options.FindOne().SetMaxTime(time.Second * 5)
	err := r.mg.Database(MgDatabase()).Collection(customersCollection).FindOne(ctx, filter, opts).Decode(&customer)
	if err != nil {
		return nil, err
	}
	return &customer, err
}

func (r *customerRepository) UpdateCustomer(ctx context.Context, customer domain.Customer) error {
	coll := r.mg.Database(MgDatabase()).Collection(customersCollection)
	filter := bson.M{"_id": customer.ID}
	updateData := bson.M{}
	if customer.Avatar != "" {
		updateData["avatar"] = customer.Avatar
	}

	if customer.Background != "" {
		updateData["background"] = customer.Background
	}

	if customer.FirstName != "" {
		updateData["firstName"] = customer.FirstName
	}

	if customer.LastName != "" {
		updateData["lastName"] = customer.LastName
	}

	if customer.Gender != "" {
		updateData["gender"] = customer.Gender
	}

	if customer.Phone != "" {
		updateData["phone"] = customer.Phone
	}

	if customer.Birthday != "" {
		updateData["birthday"] = customer.Birthday
	}

	updateData["updatedAt"] = time.Now()

	update := bson.M{"$set": updateData}
	fmt.Println(update)

	_, err := coll.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	return err
}

func (r *customerRepository) DeleteCustomer(ctx context.Context, objectID primitive.ObjectID) error {
	filter := bson.M{"_id": objectID, "isActive": true}
	update := bson.M{"$set": bson.M{"isActive": false}}
	res, err := r.mg.Database(MgDatabase()).Collection(customersCollection).UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	if res.ModifiedCount == 0 {
		return fmt.Errorf("no customer found to delete with id %s", objectID.Hex())
	}

	return nil
}
func ConvertStructToBSONM(data interface{}) (bson.M, error) {
	bsonData, err := bson.Marshal(data)
	if err != nil {
		return nil, err
	}

	var bsonM bson.M
	err = bson.Unmarshal(bsonData, &bsonM)
	if err != nil {
		return nil, err
	}

	return bsonM, nil
}

func (r *customerRepository) ListCustomer(ctx context.Context, query dto.CustomerQuery) (domain.CustomerList, error) {
	// Create a filter based on the query parameters
	filter := bson.M{}

	if query.Name != "" {
		filter["$or"] = []bson.M{
			{"firstName": bson.M{"$regex": primitive.Regex{Pattern: query.Name, Options: "i"}}},
			{"lastName": bson.M{"$regex": primitive.Regex{Pattern: query.Name, Options: "i"}}},
			{"phone": bson.M{"$regex": primitive.Regex{Pattern: query.Name, Options: "i"}}},
		}
	}

	// Set the options for pagination and sorting
	opts := options.Find()
	opts.SetSkip(int64(query.Page-1) * int64(query.Limit))
	opts.SetLimit(int64(query.Limit))

	// Execute the query
	cursor, err := r.mg.Database(MgDatabase()).Collection(customersCollection).Find(ctx, filter, opts)
	if err != nil {
		return domain.CustomerList{}, err
	}
	defer cursor.Close(ctx)

	// Initialize slice with the same capacity as limit
	customers := make([]domain.Customer, 0, query.Limit)

	for cursor.Next(ctx) {
		var customer domain.Customer
		err := cursor.Decode(&customer)
		if err != nil {
			return domain.CustomerList{}, fmt.Errorf("failed to decode customer: %v", err)
		}

		customers = append(customers, customer)
	}

	if err := cursor.Err(); err != nil {
		return domain.CustomerList{}, fmt.Errorf("failed to iterate customers cursor: %v", err)
	}

	// Return an empty slice if no customers are found
	if len(customers) == 0 {
		return domain.CustomerList{}, nil
	}

	// Get the total count of blogs
	count, err := r.mg.Database(MgDatabase()).Collection(customersCollection).CountDocuments(ctx, filter)

	if err != nil {
		return domain.CustomerList{}, err
	}

	return domain.CustomerList{
		Items: customers,
		Total: count,
	}, nil
}
