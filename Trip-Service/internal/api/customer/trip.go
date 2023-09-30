package customerApi

import (
	"Trip-Service/internal/common"
	"Trip-Service/internal/dto"
	"Trip-Service/internal/helper"
	"Trip-Service/internal/helper/logger"
	"Trip-Service/internal/helper/objectID"
	"Trip-Service/internal/usecase"
	"context"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TripHandler struct {
	tripUsecase usecase.TripUsecase
	jwtUsecase  usecase.JwtUsecase
	//notificationUsecase usecase.NotificationUseCase
}

func NewTripHandler(
	ctx context.Context,
	Trip usecase.TripUsecase,
	jwtUsecase usecase.JwtUsecase,
	//notificationUsecase usecase.NotificationUseCase,

) TripHandler {
	return TripHandler{
		tripUsecase: Trip,
		jwtUsecase:  jwtUsecase,
		//notificationUsecase: notificationUsecase,
	}
}

func (h *TripHandler) createTrip() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {
		var req dto.CreateTripDTO
		if err := ctx.ShouldBindJSON(&req); err != nil {
			logger.Log.Errorf("add Trip: failed to bind JSON: %v", err)
			ctx.BadRequest(err)
			return
		}

		if err := req.Validate(); err != nil {
			logger.Log.Errorf("add Trip, error validating data %w", err)
			ctx.BadRequest(err)
			return
		}

		id, err := h.tripUsecase.CreateTrip(ctx, req)
		if err != nil {
			logger.Log.Errorf("add Trip: failed to create Trip: %v", err)
			ctx.BadLogic(err)
			return
		}
		// message := dto.PushNotificationMessage{
		// 	Title:    "Notification",
		// 	Body:     "Create User Successfully",
		// 	DeviceId: "eanENJU4QuqMN5EFlpnrzo:APA91bGx8E6-2CP2VZMRgoy2VjDfymg61-RFlb2BpxONwFQXnOyEVQjIzK_976GluT-KfBjP5tjAKegsmDqSCnpq_YJD-MpOCK5JIsaCK7a_eonx4BX46hZWJWVbPX_UQPM1XICc5cpk",
		// }
		// msByte, _ := json.Marshal(message)

		// err = h.notificationUsecase.SendMessage("notification", msByte, []kafka.Header{{Key: "myTestHeader", Value: []byte("header values are binary")}})
		// if err != nil {
		// 	logger.Log.Errorf("add Trip: failed to send notification: %v", err)
		// }
		ctx.OKResponse(id)
	})
}

func (h *TripHandler) getTrip() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {
		objectID, err := primitive.ObjectIDFromHex(ctx.Param("id"))
		if err != nil {
			logger.Log.Errorf("invalid Trip ID format: %s", objectID)
			return
		}

		Trip, err := h.tripUsecase.GetByID(ctx, objectID)
		if err != nil {
			logger.Log.Errorf("get Trip: failed to get Trip: %v", err)
			ctx.BadLogic(err)
			return
		}

		ctx.OKResponse(Trip)
	})
}

func (h *TripHandler) updateTrip() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {
		var req dto.TripDTO
		if err := ctx.ShouldBindJSON(&req); err != nil {
			logger.Log.Errorf("update Trip, error while bind json %w", err)
			ctx.BadRequest(err)
			return
		}

		if err := req.Validate(); err != nil {
			logger.Log.Errorf("update Trip, error validating data %w", err)
			ctx.BadRequest(err)
			return
		}

		if err := h.tripUsecase.UpdateTrip(ctx, req); err != nil {
			logger.Log.Errorf("update Trip, error while updating %w", err)
			ctx.BadLogic(err)
			return
		}
		ctx.OKResponse(nil)
	})
}

func (h *TripHandler) deleteTrip() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {
		objectID, err := primitive.ObjectIDFromHex(ctx.Param("id"))
		if err != nil {
			logger.Log.Errorf("invalid Trip ID format: %s", objectID)
			return
		}

		if err := h.tripUsecase.DeleteTrip(ctx, objectID); err != nil {
			logger.Log.Errorf("failed to delete Trip: %v", err)
			ctx.BadLogic(err)
			return
		}

		ctx.OKResponse(nil)
	})
}

func (h *TripHandler) listTrip() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {
		var TripList dto.TripList

		page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
		sortOrder, _ := strconv.Atoi(ctx.DefaultQuery("sortOrder", "-1"))
		orderBy := ctx.DefaultQuery("orderBy", "createdAt")
		userId := objectID.ReturnObjectID(ctx.DefaultQuery("userId", ""))
		driverId := objectID.ReturnObjectID(ctx.DefaultQuery("driverId", ""))

		userType := "user"
		if driverId != primitive.NilObjectID {
			userType = "driver"
		}

		TripList, err := h.tripUsecase.ListTrip(ctx, dto.TripQuery{
			Page:      page,
			Limit:     limit,
			SortOrder: sortOrder,
			OrderBy:   common.OrderBy(orderBy),
			UserType:  userType,
			UserId:    userId,
			DriverID:  driverId,
		})
		if err != nil {
			logger.Log.Error("list Trip, error %w", err)
			ctx.BadLogic(err)
			return
		}

		ctx.OKResponse(TripList)
	})
}

func (h *TripHandler) listGuestTrip() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {
		var TripList dto.TripList

		page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
		sortOrder, _ := strconv.Atoi(ctx.DefaultQuery("sortOrder", "-1"))
		orderBy := ctx.DefaultQuery("orderBy", "createdAt")
		phone := ctx.DefaultQuery("phone", "")

		TripList, err := h.tripUsecase.ListTrip(ctx, dto.TripQuery{
			Page:      page,
			Limit:     limit,
			SortOrder: sortOrder,
			OrderBy:   common.OrderBy(orderBy),
			UserType:  "guest",
			Phone:     phone,
		})
		if err != nil {
			logger.Log.Error("list Trip, error %w", err)
			ctx.BadLogic(err)
			return
		}

		ctx.OKResponse(TripList)
	})
}

func (h *TripHandler) listTopUser() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {

		limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
		month, _ := strconv.Atoi(ctx.DefaultQuery("month", "0"))
		year, _ := strconv.Atoi(ctx.DefaultQuery("year", "2023"))
		quarter, _ := strconv.Atoi(ctx.DefaultQuery("quarter", "0"))
		usertype := ctx.DefaultQuery("userType", "user")

		TripList, err := h.tripUsecase.ListTopUser(ctx, dto.TripQuery{
			Limit:    limit,
			Month:    month,
			Year:     year,
			Quarter:  quarter,
			UserType: usertype,
		})
		if err != nil {
			logger.Log.Error("list top user, error %w", err)
			ctx.BadLogic(err)
			return
		}

		ctx.OKResponse(TripList)
	})
}

func (h *TripHandler) statisticPrice() gin.HandlerFunc {
	return helper.WithContext(func(ctx *helper.ContextGin) {

		month, _ := strconv.Atoi(ctx.DefaultQuery("month", "0"))
		year, _ := strconv.Atoi(ctx.DefaultQuery("year", "2023"))
		quarter, _ := strconv.Atoi(ctx.DefaultQuery("quarter", "0"))

		r, err := h.tripUsecase.StatisticPrice(ctx, dto.TripQuery{
			Month:   month,
			Year:    year,
			Quarter: quarter,
		})
		if err != nil {
			logger.Log.Error("statistic price, error %w", err)
			ctx.BadLogic(err)
			return
		}

		ctx.OKResponse(r)
	})
}
