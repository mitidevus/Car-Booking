package customerApi

import (
	"Trip-Service/config"
	"Trip-Service/internal/usecase"
	"context"

	"github.com/gin-gonic/gin"
)

type CustomerApi struct {
	config   *config.Config
	routerV1 *gin.RouterGroup

	tripHandler TripHandler
}

func NewCustomerApi(ctx context.Context, config *config.Config, router *gin.RouterGroup, usecase *usecase.Usecase) *CustomerApi {
	routerV1 := router.Group("/user")
	customerHandler := NewTripHandler(ctx, usecase.TripUsecase, usecase.JwtUsecase)

	return &CustomerApi{
		config:      config,
		routerV1:    routerV1,
		tripHandler: customerHandler,
	}
}

func (s *CustomerApi) SetupRouter() {

	{
		handler := s.tripHandler

		s.routerV1.POST("/trips", handler.createTrip())
		s.routerV1.GET("/trips/:id", handler.getTrip())
		s.routerV1.PATCH("/trips", handler.updateTrip())
		s.routerV1.DELETE("/trips/:id", handler.deleteTrip())
		s.routerV1.GET("/trips", handler.listTrip())

		s.routerV1.GET("/guest-trips", handler.listGuestTrip())

		s.routerV1.GET("/top-users", handler.listTopUser())
		s.routerV1.GET("/statistic-price", handler.statisticPrice())

	}

}
