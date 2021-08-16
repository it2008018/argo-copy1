package git

import (
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// GetError - returns custom grpc error based on error msg
func MapError(err error) error {
	if err == nil {
		return nil
	}
	if _, ok := err.(interface{ GRPCStatus() *status.Status }); ok {
		return err
	}

	switch err.Error() {

	case "repository not found":
		return status.Errorf(codes.NotFound, err.Error())
	default:
		return err
	}

}
