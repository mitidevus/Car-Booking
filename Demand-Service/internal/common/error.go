package common

import "errors"

// postgres code
var (
	DuplicateKeyValue string = "23505"
)

var (
	ErrCommon           = errors.New("common error")
	ErrWrong            = errors.New("wrong username or password")
	ErrCache            = errors.New("cache error")
	ErrDatabase         = errors.New("database error")
	ErrInvalidRequest   = errors.New("invalid request")
	ErrRecordNotFound   = errors.New("record not found")
	ErrNoRecordModified = errors.New("no record modified")
	ErrInvalidIdFormat  = errors.New("invalid ID format")

	ErrUnauthorized   = errors.New("user unauthorized")
	ErrTokenNotFound  = errors.New("token not found")
	ErrInvalidType    = errors.New("invalid type")
	ErrTokenExpired   = errors.New("token expired")
	ErrTokenInvalid   = errors.New("token invalid")
	ErrUserNotFound   = errors.New("user not found")
	ErrUsernameExists = errors.New("username already exists")
	ErrPhoneExists    = errors.New("phone already exists")
)

var ErrorCodeValue = map[error]string{
	ErrCommon:         "001",
	ErrDatabase:       "002",
	ErrRecordNotFound: "003",
}

func ErrorMessage(err error) string {
	return err.Error()
}

func ErrorCode(err error) string {
	code, ok := ErrorCodeValue[err]
	if !ok {
		return "400"
	}
	return code
}
