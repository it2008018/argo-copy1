// Code generated by mockery v1.0.0. DO NOT EDIT.

package mocks

import (
	context "context"

	"github.com/argoproj/argo-cd/util/settings"
)
import kube "github.com/argoproj/argo-cd/util/kube"
import mock "github.com/stretchr/testify/mock"
import schema "k8s.io/apimachinery/pkg/runtime/schema"
import unstructured "k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
import v1alpha1 "github.com/argoproj/argo-cd/pkg/apis/application/v1alpha1"

// LiveStateCache is an autogenerated mock type for the LiveStateCache type
type LiveStateCache struct {
	mock.Mock
}

// Delete provides a mock function with given fields: server, obj
func (_m *LiveStateCache) Delete(server string, obj *unstructured.Unstructured) error {
	ret := _m.Called(server, obj)

	var r0 error
	if rf, ok := ret.Get(0).(func(string, *unstructured.Unstructured) error); ok {
		r0 = rf(server, obj)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// GetChildren provides a mock function with given fields: server, obj
func (_m *LiveStateCache) GetChildren(server string, obj *unstructured.Unstructured) ([]v1alpha1.ResourceNode, error) {
	ret := _m.Called(server, obj)

	var r0 []v1alpha1.ResourceNode
	if rf, ok := ret.Get(0).(func(string, *unstructured.Unstructured) []v1alpha1.ResourceNode); ok {
		r0 = rf(server, obj)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]v1alpha1.ResourceNode)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(string, *unstructured.Unstructured) error); ok {
		r1 = rf(server, obj)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetManagedLiveObjs provides a mock function with given fields: a, targetObjs
func (_m *LiveStateCache) GetManagedLiveObjs(a *v1alpha1.Application, targetObjs []*unstructured.Unstructured) (map[kube.ResourceKey]*unstructured.Unstructured, error) {
	ret := _m.Called(a, targetObjs)

	var r0 map[kube.ResourceKey]*unstructured.Unstructured
	if rf, ok := ret.Get(0).(func(*v1alpha1.Application, []*unstructured.Unstructured) map[kube.ResourceKey]*unstructured.Unstructured); ok {
		r0 = rf(a, targetObjs)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(map[kube.ResourceKey]*unstructured.Unstructured)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(*v1alpha1.Application, []*unstructured.Unstructured) error); ok {
		r1 = rf(a, targetObjs)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Invalidate provides a mock function with given fields:
func (_m *LiveStateCache) Invalidate() {
	_m.Called()
}

// IsNamespaced provides a mock function with given fields: server, gvk
func (_m *LiveStateCache) IsNamespaced(server string, gvk schema.GroupVersionKind) (bool, error) {
	ret := _m.Called(server, gvk)

	var r0 bool
	if rf, ok := ret.Get(0).(func(string, schema.GroupVersionKind) bool); ok {
		r0 = rf(server, gvk)
	} else {
		r0 = ret.Get(0).(bool)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(string, schema.GroupVersionKind) error); ok {
		r1 = rf(server, gvk)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Run provides a mock function with given fields: ctx
func (_m *LiveStateCache) Run(ctx context.Context, settings *settings.ArgoCDSettings) {
	_m.Called(ctx)
}
