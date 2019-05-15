package redis

import (
	"bufio"
	"fmt"
	"net"
	"strings"

	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

func FlushAll(server string) error {
	log.Info("flushing redis")
	conn, err := net.Dial("tcp", server)
	if err != nil {
		return err
	}
	_, err = fmt.Fprint(conn, "FLUSHALL\n")
	if err != nil {
		return err
	}
	text, err := bufio.NewReader(conn).ReadString('\n')
	if err != nil {
		return err
	}
	if !strings.Contains(text, "OK") {
		return errors.New(text)
	}
	return nil
}
