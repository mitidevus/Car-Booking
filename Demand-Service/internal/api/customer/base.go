package customerApi

import (
	"context"
	"demand-service/config"
	"demand-service/internal/usecase"

	"github.com/gin-gonic/gin"
)

type CustomerApi struct {
	config   *config.Config
	routerV1 *gin.RouterGroup

	customerHandler CustomerHandler
}

func NewCustomerApi(ctx context.Context, config *config.Config, router *gin.RouterGroup, usecase *usecase.Usecase) *CustomerApi {
	routerV1 := router.Group("/user")
	customerHandler := NewCustomerHandler(ctx, usecase.CustomerUsecase, usecase.JwtUsecase)

	return &CustomerApi{
		config:          config,
		routerV1:        routerV1,
		customerHandler: customerHandler,
	}
}

func (s *CustomerApi) SetupRouter() {

	{
		handler := s.customerHandler

		s.routerV1.POST("/customers", handler.createCustomer())
		s.routerV1.GET("/customers/:id", handler.getCustomer())
		s.routerV1.PATCH("/customers", handler.updateCustomer())
		s.routerV1.DELETE("/customers/:id", handler.deleteCustomer())
		s.routerV1.GET("/customers", handler.listCustomer())
	}
}
