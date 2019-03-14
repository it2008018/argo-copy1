package v1alpha1

import (
	time "time"

	application_v1alpha1 "github.com/argoproj/argo-cd/pkg/apis/application/v1alpha1"
	versioned "github.com/argoproj/argo-cd/pkg/client/clientset/versioned"
	internalinterfaces "github.com/argoproj/argo-cd/pkg/client/informers/externalversions/internalinterfaces"
	v1alpha1 "github.com/argoproj/argo-cd/pkg/client/listers/application/v1alpha1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	runtime "k8s.io/apimachinery/pkg/runtime"
	watch "k8s.io/apimachinery/pkg/watch"
	cache "k8s.io/client-go/tools/cache"
)

// AppProjectInformer provides access to a shared informer and lister for
// AppProjects.
type AppProjectInformer interface {
	Informer() cache.SharedIndexInformer
	Lister() v1alpha1.AppProjectLister
}

type appProjectInformer struct {
	factory          internalinterfaces.SharedInformerFactory
	tweakListOptions internalinterfaces.TweakListOptionsFunc
	namespace        string
}

// NewAppProjectInformer constructs a new informer for AppProject type.
// Always prefer using an informer factory to get a shared informer instead of getting an independent
// one. This reduces memory footprint and number of connections to the server.
func NewAppProjectInformer(client versioned.Interface, namespace string, resyncPeriod time.Duration, indexers cache.Indexers) cache.SharedIndexInformer {
	return NewFilteredAppProjectInformer(client, namespace, resyncPeriod, indexers, nil)
}

// NewFilteredAppProjectInformer constructs a new informer for AppProject type.
// Always prefer using an informer factory to get a shared informer instead of getting an independent
// one. This reduces memory footprint and number of connections to the server.
func NewFilteredAppProjectInformer(client versioned.Interface, namespace string, resyncPeriod time.Duration, indexers cache.Indexers, tweakListOptions internalinterfaces.TweakListOptionsFunc) cache.SharedIndexInformer {
	return cache.NewSharedIndexInformer(
		&cache.ListWatch{
			ListFunc: func(options v1.ListOptions) (runtime.Object, error) {
				if tweakListOptions != nil {
					tweakListOptions(&options)
				}
				return client.ArgoprojV1alpha1().AppProjects(namespace).List(options)
			},
			WatchFunc: func(options v1.ListOptions) (watch.Interface, error) {
				if tweakListOptions != nil {
					tweakListOptions(&options)
				}
				return client.ArgoprojV1alpha1().AppProjects(namespace).Watch(options)
			},
		},
		&application_v1alpha1.AppProject{},
		resyncPeriod,
		indexers,
	)
}

func (f *appProjectInformer) defaultInformer(client versioned.Interface, resyncPeriod time.Duration) cache.SharedIndexInformer {
	return NewFilteredAppProjectInformer(client, f.namespace, resyncPeriod, cache.Indexers{cache.NamespaceIndex: cache.MetaNamespaceIndexFunc}, f.tweakListOptions)
}

func (f *appProjectInformer) Informer() cache.SharedIndexInformer {
	return f.factory.InformerFor(&application_v1alpha1.AppProject{}, f.defaultInformer)
}

func (f *appProjectInformer) Lister() v1alpha1.AppProjectLister {
	return v1alpha1.NewAppProjectLister(f.Informer().GetIndexer())
}
