package commands

import (
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"os"
	"testing"
)

func TestReadLocalFile(t *testing.T) {
	sentinel := "Hello, world!"

	file, err := ioutil.TempFile(os.TempDir(), "")
	if err != nil {
		panic(err)
	}
	defer func() {
		_ = os.Remove(file.Name())
	}()

	_, _ = file.WriteString(sentinel)
	_ = file.Sync()

	data, err := readLocalFile(file.Name())
	if string(data) != sentinel {
		t.Errorf("Test data did not match (err = %v)! Expected \"%s\" and received \"%s\"", err, sentinel, string(data))
	}
}

func TestReadRemoteFile(t *testing.T) {
	sentinel := "Hello, world!"

	server := func(c chan<- string) {
		listener, err := net.Listen("tcp", ":0")
		if err != nil {
			panic(err)
		}

		c <- listener.Addr().String()

		http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			fmt.Fprint(w, sentinel)
		})

		panic(http.Serve(listener, nil))
	}

	c := make(chan string, 1)

	// run a local webserver to test data retrieval
	go server(c)

	address := <-c
	data, err := readRemoteFile("http://" + address)
	t.Logf("Listening at address: %s", address)
	if string(data) != sentinel {
		t.Errorf("Test data did not match (err = %v)! Expected \"%s\" and received \"%s\"", err, sentinel, string(data))
	}
}
