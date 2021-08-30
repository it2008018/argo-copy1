package e2e

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	. "github.com/argoproj/argo-cd/v2/test/e2e/fixture"
	clusterFixture "github.com/argoproj/argo-cd/v2/test/e2e/fixture/cluster"
	. "github.com/argoproj/argo-cd/v2/util/errors"
)

func TestClusterList(t *testing.T) {
	SkipIfAlreadyRun(t)
	defer RecordTestRun(t)

	clusterFixture.
		Given(t).
		Project(ProjectName).
		When().
		List().
		Then().
		AndCLIOutput(func(output string, err error) {
			assert.Equal(t, fmt.Sprintf(`SERVER                          NAME        VERSION  STATUS      MESSAGE  PROJECT
https://kubernetes.default.svc  in-cluster  %v    Successful           `, GetVersions().ServerVersion), output)
		})
}

func TestClusterAdd(t *testing.T) {
	SkipIfAlreadyRun(t)
	defer RecordTestRun(t)

	clusterFixture.
		Given(t).
		Project(ProjectName).
		Upsert(true).
		Server(KubernetesAPIServerAddr).
		When().
		Create().
		List().
		Then().
		AndCLIOutput(func(output string, err error) {
			assert.Equal(t, fmt.Sprintf(`SERVER                          NAME              VERSION  STATUS      MESSAGE  PROJECT
https://kubernetes.default.svc  test-cluster-add  %v    Successful           %s`, GetVersions().ServerVersion, ProjectName), output)
		})
}

func TestClusterGet(t *testing.T) {
	SkipIfAlreadyRun(t)
	defer RecordTestRun(t)
	output := FailOnErr(RunCli("cluster", "get", "https://kubernetes.default.svc")).(string)

	assert.Contains(t, output, fmt.Sprintf(`
name: in-cluster
server: https://kubernetes.default.svc
serverVersion: "%v"`, GetVersions().ServerVersion))

	assert.Contains(t, output, `config:
  tlsClientConfig:
    insecure: false`)

	assert.Contains(t, output, `status: Successful`)
}
