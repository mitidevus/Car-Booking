package customerApi

import (
	"context"
	"demand-service/internal/dto"
	"demand-service/internal/helper"
	"demand-service/internal/helper/logger"
	"demand-service/internal/usecase"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CustomerHandler struct {
	customerUsecase usecase.CustomerUsecase
	jwtUsecase      usecase.JwtUsecase
}

func NewCustomerHandler(
	ctx context.Context,
	customer usecase.CustomerUsecase,
	jwtUsecase usecase.JwtUsecase,
) CustomerHandler {
	return CustomerHandler{
		customerUsecase: customer,
		jwtUsecase:      jwtUsecase,
	}
}

func (h *CustomerHandler) createCustomer() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {
		var req dto.CreateCustomerDTO
		if err := ctx.ShouldBindJSON(&req); err != nil {
			logger.Log.Errorf("add Customer: failed to bind JSON: %v", err)
			ctx.BadRequest(err)
			return
		}

		if err := req.Validate(); err != nil {
			logger.Log.Errorf("add Customer, error validating data %w", err)
			ctx.BadRequest(err)
			return
		}

		id, err := h.customerUsecase.CreateCustomer(ctx, req)
		if err != nil {
			logger.Log.Errorf("add Customer: failed to create Customer: %v", err)
			ctx.BadLogic(err)
			return
		}
		ctx.OKResponse(id)
	})
}

func (h *CustomerHandler) getCustomer() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {
		objectID, err := primitive.ObjectIDFromHex(ctx.Param("id"))
		if err != nil {
			logger.Log.Errorf("invalid Customer ID format: %s", objectID)
			return
		}

		Customer, err := h.customerUsecase.GetByID(ctx, objectID)
		if err != nil {
			logger.Log.Errorf("get Customer: failed to get Customer: %v", err)
			ctx.BadLogic(err)
			return
		}

		ctx.OKResponse(Customer)
	})
}

func (h *CustomerHandler) updateCustomer() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {
		var req dto.CustomerDTO
		if err := ctx.ShouldBindJSON(&req); err != nil {
			logger.Log.Errorf("update Customer, error while bind json %w", err)
			ctx.BadRequest(err)
			return
		}

		if err := req.Validate(); err != nil {
			logger.Log.Errorf("update Customer, error validating data %w", err)
			ctx.BadRequest(err)
			return
		}

		if err := h.customerUsecase.UpdateCustomer(ctx, req); err != nil {
			logger.Log.Errorf("update Customer, error while updating %w", err)
			ctx.BadLogic(err)
			return
		}
		ctx.OKResponse(nil)
	})
}

func (h *CustomerHandler) deleteCustomer() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {
		objectID, err := primitive.ObjectIDFromHex(ctx.Param("id"))
		if err != nil {
			logger.Log.Errorf("invalid Customer ID format: %s", objectID)
			return
		}

		if err := h.customerUsecase.DeleteCustomer(ctx, objectID); err != nil {
			logger.Log.Errorf("failed to delete Customer: %v", err)
			ctx.BadLogic(err)
			return
		}

		ctx.OKResponse(nil)
	})
}

func (h *CustomerHandler) listCustomer() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {
		var customerList dto.CustomerList

		page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

		customerList, err := h.customerUsecase.ListCustomer(ctx, dto.CustomerQuery{
			Page:  page,
			Limit: limit,
		})
		if err != nil {
			logger.Log.Error("list Customer, error %w", err)
			ctx.BadLogic(err)
			return
		}

		ctx.OKResponse(customerList)
	})
}
