package dto

import (
	"demand-service/internal/common"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type (
	CustomerDTO struct {
		ID         primitive.ObjectID `json:"id"`
		Avatar     string             `json:"avatar"`
		Background string             `json:"background"`
		FirstName  string             `json:"firstName"`
		LastName   string             `json:"lastName"`
		Phone      string             `json:"phone"`
		Birthday   string             `json:"birthday"`
		Gender     common.Gender      `json:"gender"`
		IsActive   bool               `json:"isActive"`
		IsVip      bool               `json:"isVip"`
	}

	CustomerRes struct {
		ID        primitive.ObjectID `json:"id"`
		Username  string             `json:"username"`
		Avatar    string             `json:"avatar"`
		FirstName string             `json:"firstName"`
		LastName  string             `json:"lastName"`
		Email     string             `json:"email"`
		Phone     string             `json:"phone"`
		Birthday  string             `json:"birthday"`
		Gender    common.Gender      `json:"gender"`
		IsActive  *bool              `json:"isActive"`
		IsVIP     *bool              `json:"isVip"`
	}

	CustomerList struct {
		Items []CustomerRes `json:"items"`
		Total int64         `json:"total"`
	}

	CustomerQuery struct {
		Name      string         `json:"name,omitempty" bson:"name,omitempty"`
		Page      int            `json:"page,omitempty"`
		Limit     int            `json:"limit,omitempty"`
		OrderBy   common.OrderBy `json:"orderBy,omitempty" bson:"orderBy,omitempty"`
		SortOrder string         `json:"sortOrder,omitempty" bson:"sortOrder,omitempty"`
	}
)

func (p *CustomerDTO) Validate() error {

	return nil
}
