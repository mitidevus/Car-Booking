package helper

import (
	"demand-service/internal/common"
	"demand-service/internal/usecase"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	tokenParttern = "^Bearer (\\S*)"
)

func ignoreAuthen(arr []string, method string) bool {
	for _, item := range arr {
		if strings.Contains(method, item) {
			return true
		}
	}
	return false
}

func AuthenticationJwt(jwt usecase.JwtUsecase, listIgnore []string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if ignoreAuthen(listIgnore, ctx.Request.RequestURI) {
			ctx.Next()
			return
		}

		token := ctx.Request.Header.Get("Authorization")
		if token == "" {
			ctx.JSON(http.StatusUnauthorized, ResponseData{
				StatusCode: common.Failed,
				Message:    "Authorization miss in header",
			})
			ctx.Abort()
			return
		}
		splitToken := strings.Split(token, " ")
		if len(splitToken) != 2 {
			ctx.JSON(http.StatusUnauthorized, ResponseData{
				StatusCode: common.Failed,
				Message:    "Authorization need bearer",
			})
			ctx.Abort()
			return
		}
		claim, err := jwt.VerifyToken(ctx, splitToken[1])
		if err != nil {
			messageStr := ""
			if err == common.ErrTokenExpired {
				messageStr = err.Error()
			}
			if err == common.ErrTokenInvalid {
				messageStr = err.Error()
			}
			ctx.JSON(http.StatusUnauthorized, ResponseData{
				StatusCode: common.Failed,
				Message:    messageStr,
			})
			ctx.Abort()
			return
		}

		// Only refresh token has claim id -> if exists -> not valid token
		if claim.Id != "" { // id of jwt claim, not user id
			ctx.JSON(http.StatusUnauthorized, ResponseData{
				StatusCode: common.Failed,
				Message:    common.ErrTokenInvalid.Error(),
			})
			ctx.Abort()
			return
		}

		ctx.Set("id", claim.ID)
		ctx.Set("role", claim.Role)
		ctx.Next()
	}
}
