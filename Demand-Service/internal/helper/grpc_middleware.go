package helper

import (
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var GrpcRecovery grpc_recovery.RecoveryHandlerFunc = func(p interface{}) (err error) {
	return status.Errorf(codes.Internal, "Internal server error")
}
