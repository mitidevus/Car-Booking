package helper

import (
	"bytes"
	"demand-service/internal/common"
	"demand-service/internal/helper/logger"
	"io/ioutil"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// func SetRequestID() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		requestID := c.Request.Header.Get("request-id")
// 		if requestID == "" {
// 			requestID = uuid.NewString()
// 		}
// 		// fmt.Println("requestID", requestID)
// 		logger.GetLogger().SetLogginID(requestID)
// 		c.Set("request-id", requestID)
// 		c.Writer.Header().Set("request-id", requestID)
// 	}
// }

const (
	hiddenContent         = "<HIDDEN>"
	ignoreContent         = "<IGNORE>"
	emptyContentTag       = "<EMPTY>"
	contentSizeLimitation = 10000
)

func isIgnoreRequestBody(ctx *gin.Context) bool {
	contentSize := ctx.Request.ContentLength
	// Ingore content too large
	if contentSize == -1 || contentSize >= contentSizeLimitation {
		return true
	}

	contentType := ctx.ContentType()
	// Ignore if content type is multipart form upload
	return contentType == gin.MIMEMultipartPOSTForm
}

func GetRequestBody(ctx *gin.Context) string {
	requestBody := hiddenContent

	if isIgnoreRequestBody(ctx) {
		return requestBody
	}

	buf, err := ioutil.ReadAll(ctx.Request.Body)
	if err != nil {
		zap.S().With("err- ", err).Error("can't read body content from request")
	}
	readCloser1 := ioutil.NopCloser(bytes.NewBuffer(buf))
	// We have to create a new Buffer and transfer it to request body again, because readCloser1 will be read.
	readCloser2 := ioutil.NopCloser(bytes.NewBuffer(buf))
	ctx.Request.Body = readCloser2

	// Convert readCloser1 to String
	bytesBuffer := new(bytes.Buffer)
	_, err = bytesBuffer.ReadFrom(readCloser1)
	if err != nil {
		zap.S().With("err- ", err).Error("can't read byte array from reader")
		return ignoreContent
	}
	requestBody = bytesBuffer.String()
	if requestBody == "" {
		// Return Tag to easy filter
		return emptyContentTag
	}
	return requestBody
}

var re = regexp.MustCompile(`"password"\s?:\s?"([\s\S]+)"`)

type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func Ship(path string) bool {
	skip1 := strings.Contains(path, "/liveness")
	skip2 := strings.Contains(path, "/metrics")
	skip3 := strings.Contains(path, "/readiness")
	if skip1 || skip2 || skip3 {
		return true
	}
	return false
}

func SetupLog() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		if isShip := Ship(path); isShip {
			return
		}
		// log := ctx.GetLoggerWithPrefix("Middleware")
		requestBody := GetRequestBody(c)

		// logger.GetLogger().Infof("Request: \n%s", re.ReplaceAll([]byte(requestBody), []byte(`"password":"<CENSORED>"`)))
		logger.GetLogger().Infof("Request: \n%s", []byte(requestBody))

		blw := &bodyLogWriter{
			body:           bytes.NewBufferString(""),
			ResponseWriter: c.Writer,
		}
		c.Writer = blw

		c.Next()

		logger.GetLogger().Infof("Response: \n%s", blw.body.String())

		// Show all content of Rest API response. Exclude download images/files
		// response := hiddenContent
		// _, ok := c.Writer.Header()["Content-Disposition"]
		// if !ok {
		// 	// Not download images
		// 	response = blw.body.String()
		// }
		// logger.GetLogger().Infof("Response: \n%s", response)
		// log.Infof("Response: \n%s", response)
		// contxt.NewDSBContext(c).RequestFinished()
	}
}

func CheckRole(role string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if ctx.MustGet("role").(string) != role {
			ctx.IndentedJSON(http.StatusForbidden, ResponseData{
				StatusCode: common.Failed,
				Message:    "Permission denied",
			})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}
