package hook

import (
	"testing"

	"github.com/argoproj/argo-cd/test"

	"github.com/stretchr/testify/assert"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"

	. "github.com/argoproj/argo-cd/pkg/apis/application/v1alpha1"
)

func TestNoHooks(t *testing.T) {
	obj := &unstructured.Unstructured{}
	assert.False(t, IsHook(obj))
	assert.Nil(t, HookTypes(obj))
}

func TestOneHook(t *testing.T) {
	obj := example("Sync")
	assert.True(t, IsHook(obj))
	assert.Equal(t, []HookType{HookTypeSync}, HookTypes(obj))
}

// peculiar case of something marked with "Skip" cannot, by definition, be a hook
// IMHO this is bad design  as it conflates a flag on something that can never be a hook, with something that is
// always a hook, creating a nasty exception we always need to check for, and a bunch of horrible edge cases
func TestSkipHook(t *testing.T) {
	obj := example("Skip")
	assert.False(t, IsHook(obj))
	assert.Nil(t, HookTypes(obj))
}

// we treat garbage as the user intended you to be a hook, but spelled it wrong, so you are a hook, but we don't
// know what phase you're a part of
func TestGarbageHook(t *testing.T) {
	obj := example("Garbage")
	assert.True(t, IsHook(obj))
	assert.Nil(t, HookTypes(obj))
}

func TestTwoHooks(t *testing.T) {
	obj := example("PreSync,PostSync")
	assert.True(t, IsHook(obj))
	assert.Equal(t, []HookType{HookTypePreSync, HookTypePostSync}, HookTypes(obj))
}

// horrible edge case
func TestSkipAndHook(t *testing.T) {
	obj := example("PreSync,Skip,PostSync")
	assert.True(t, IsHook(obj))
	assert.Equal(t, []HookType{HookTypePreSync, HookTypePostSync}, HookTypes(obj))
}

func TestGarbageAndHook(t *testing.T) {
	obj := example("Sync,Garbage")
	assert.True(t, IsHook(obj))
	assert.Equal(t, []HookType{HookTypeSync}, HookTypes(obj))
}

func example(hook string) *unstructured.Unstructured {
	pod := test.NewPod()
	pod.SetAnnotations(map[string]string{"argocd.argoproj.io/hook": hook})
	return pod
}
