package ginwrapper

import (
	"Trip-Service/internal/common"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ContextGin struct {
	*gin.Context
}
type ResponseData struct {
	StatusCode string      `json:"status_code"`
	Message    string      `json:"message,omitempty"`
	Code       string      `json:"code,omitempty"`
	Data       interface{} `json:"data,omitempty"`
}

type HandlerFunc func(ctx *ContextGin)

func WithContext(handler HandlerFunc) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		handler(&ContextGin{
			ctx,
		})
	}
}

func (c *ContextGin) BadRequest(err error) {
	resp := ResponseData{
		StatusCode: common.Failed,
		Message:    common.ErrorMessage(err),
	}
	c.responseJson(http.StatusBadRequest, resp)
}

func (c *ContextGin) BadLogic(err error) {
	resp := ResponseData{
		StatusCode: common.Failed,
		Message:    common.ErrorMessage(err),
		Code:       common.ErrorCode(err),
	}
	// code 400 or 200
	c.responseJson(http.StatusBadRequest, resp)
}

func (c *ContextGin) OKResponse(data interface{}) {
	resp := ResponseData{
		StatusCode: common.OK,
	}
	if data != nil {
		resp.Data = data
	}
	c.responseJson(http.StatusOK, resp)
}

func (c *ContextGin) responseJson(code int, data interface{}) {
	c.JSON(code, data)
	if code != http.StatusOK {
		c.Abort()
	}
}

func (c *ContextGin) TokenNotFound() {
}
