package controller

import (
	"context"
	"testing"
	"time"

	"github.com/argoproj/argo-cd/v2/pkg/apis/application/v1alpha1"
	"github.com/stretchr/testify/assert"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/dynamic/fake"
	k8sfake "k8s.io/client-go/kubernetes/fake"
	"k8s.io/client-go/tools/cache"
)

func createUnstructuredObj(obj map[string]interface{}) *unstructured.Unstructured {
	return &unstructured.Unstructured{Object: obj}
}

func TestGetAppProj_validProject(t *testing.T) {
	app := createUnstructuredObj(map[string]interface{}{
		"metadata": map[string]interface{}{"namespace": "projectspace"},
		"spec":     map[string]interface{}{"project": "existing"},
	})

	appProjItems := []*unstructured.Unstructured{createUnstructuredObj(map[string]interface{}{
		"metadata": map[string]interface{}{
			"name":      "existing",
			"namespace": "projectspace"}})}

	indexer := cache.NewIndexer(cache.DeletionHandlingMetaNamespaceKeyFunc, cache.Indexers{})
	for _, item := range appProjItems {
		if err := indexer.Add(item); err != nil {
			t.Fatalf("Failed to add item to indexer: %v", err)
		}
	}

	informer := cache.NewSharedIndexInformer(nil, nil, 0, nil)
	informer.GetIndexer().Replace(indexer.List(), "test_res_ver")

	proj := getAppProj(app, informer)

	assert.NotNil(t, proj)

	metadata, _, _ := unstructured.NestedMap(proj.Object, "metadata")
	expectedMetadata := map[string]interface{}{
		"name":      "existing",
		"namespace": "projectspace",
	}

	assert.Equal(t, expectedMetadata["name"], metadata["name"])
	assert.Equal(t, expectedMetadata["namespace"], metadata["namespace"])
	assert.NotNil(t, metadata["annotations"])
}

func TestGetAppProj_invalidProjectNestedString(t *testing.T) {
	app := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"spec": map[string]interface{}{},
		},
	}
	informer := cache.NewSharedIndexInformer(nil, nil, 0, nil)
	proj := getAppProj(app, informer)

	assert.Nil(t, proj)
}

func TestInit(t *testing.T) {
	scheme := runtime.NewScheme()
	err := v1alpha1.SchemeBuilder.AddToScheme(scheme)
	if err != nil {
		t.Fatalf("Error registering the resource: %v", err)
	}
	dynamicClient := fake.NewSimpleDynamicClient(scheme)
	k8sClient := k8sfake.NewSimpleClientset()
	appLabelSelector := "app=test"

	nc := NewController(
		k8sClient,
		dynamicClient,
		nil,
		"default",
		appLabelSelector,
		nil,
		"my-secret",
		"my-configmap",
	)

	assert.NotNil(t, nc)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = nc.Init(ctx)

	assert.NoError(t, err)
}

func TestInitTimeout(t *testing.T) {
	scheme := runtime.NewScheme()
	err := v1alpha1.SchemeBuilder.AddToScheme(scheme)
	if err != nil {
		t.Fatalf("Error registering the resource: %v", err)
	}
	dynamicClient := fake.NewSimpleDynamicClient(scheme)
	k8sClient := k8sfake.NewSimpleClientset()
	appLabelSelector := "app=test"

	nc := NewController(
		k8sClient,
		dynamicClient,
		nil,
		"default",
		appLabelSelector,
		nil,
		"my-secret",
		"my-configmap",
	)

	assert.NotNil(t, nc)

	// Use a short timeout to simulate a timeout during cache synchronization
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Millisecond)
	defer cancel()

	err = nc.Init(ctx)

	// Expect an error & add assertion for the error message
	assert.Error(t, err)
	assert.Equal(t, "Timed out waiting for caches to sync", err.Error())
}
