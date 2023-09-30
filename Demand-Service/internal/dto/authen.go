package dto

import (
	"demand-service/internal/common"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type (
	CreateCustomerDTO struct {
		ID         primitive.ObjectID `json:"id"`
		Avatar     string             `json:"avatar"`
		Background string             `json:"background"`
		Gender     common.Gender      `json:"gender" binding:"oneof=male female other"`
		Phone      string             `json:"phone" binding:"required,min=10,numeric"`
		FirstName  string             `json:"firstName"`
		LastName   string             `json:"lastName"`
		Birthday   string             `json:"birthday"`
	}
)

func (p *CreateCustomerDTO) Validate() error {
	// if p.Username == "" {
	// 	return fmt.Errorf("seller username cannot be empty")
	// }

	return nil
}
