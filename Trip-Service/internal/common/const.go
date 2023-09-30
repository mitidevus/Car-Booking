package common

// Code response data api
const (
	Failed = "FAILED"
	OK     = "ACCEPT"
)

type Gender string

const (
	MALE   Gender = "male"
	FEMALE Gender = "female"
	OTHER  Gender = "other"
)

type OrderBy string

const (
	SUGGESTION OrderBy = "suggestion"
	SOLD       OrderBy = "sold"
	NEW        OrderBy = "new"
	DAY        OrderBy = "day"
	WEEK       OrderBy = "week"
	MONTH      OrderBy = "month"
	PRICE_UP   OrderBy = "priceUp"
	PRICE_DOWN OrderBy = "priceDown"
)

var (
	ADMIN    = "ADMIN"
	CUSTOMER = "CUSTOMER"
)

var (
	CUSTOMER_STATUS_BOOKING   = "BOOKING"
	CUSTOMER_STATUS_CANCELLED = "CANCELLED"
	CUSTOMER_STATUS_COMPLETED = "COMPLETED"
	CUSTOMER_STATUS_ON_TRIP   = "ON_TRIP"
	CUSTOMER_STATUS_WAIT      = "WAIT"
)

var (
	TRIP_STATUS_CREATE = "CREATED"
)
