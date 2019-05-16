package app

import (
	"time"

	log "github.com/sirupsen/logrus"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/argoproj/argo-cd/errors"
	. "github.com/argoproj/argo-cd/pkg/apis/application/v1alpha1"
	"github.com/argoproj/argo-cd/test/e2e/fixture"
)

// this implements the "then" part of given/when/then
type Consequences struct {
	context *Context
	actions *Actions
}

func (c *Consequences) Expect(e Expectation) *Consequences {
	var message string
	var state state
	for start := time.Now(); time.Since(start) < 30*time.Second; time.Sleep(2 * time.Second) {
		state, message = e(c)
		log.WithFields(log.Fields{"message": message, "state": state}).Info("polling for expectation")
		switch state {
		case succeeded:
			return c
		case failed:
			c.context.t.Fatal(message)
			return c
		}
	}
	c.context.t.Fatal("timeout waiting, " + message)
	return c
}

func (c *Consequences) And(block func(app *Application)) *Consequences {
	block(c.app())
	return c
}

func (c *Consequences) When() *Actions {
	return c.actions
}

func (c *Consequences) app() *Application {
	app, err := c.get()
	errors.CheckError(err)
	return app
}

func (c *Consequences) get() (*Application, error) {
	app, err := fixture.AppClientset.ArgoprojV1alpha1().Applications(fixture.ArgoCDNamespace).Get(c.context.name, v1.GetOptions{})
	log.WithFields(log.Fields{"app": app}).Info("app")
	return app, err
}

func (c *Consequences) resource(name string) ResourceStatus {
	for _, r := range c.app().Status.Resources {
		if r.Name == name {
			return r
		}
	}
	return ResourceStatus{
		Health: &HealthStatus{Status: HealthStatusUnknown},
	}
}
