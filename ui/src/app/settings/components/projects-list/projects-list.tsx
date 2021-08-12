import {FormField, NotificationType, SlidingPanel} from 'argo-ui';
import * as React from 'react';
import {Form, FormApi, Text} from 'react-form';

import {DataLoader, EmptyState, ErrorNotification, Query} from '../../../shared/components';
import {NewPage} from '../../../shared/components/newpage/page';
import {Consumer} from '../../../shared/context';
import {Project} from '../../../shared/models';
import {services} from '../../../shared/services';

export class ProjectsList extends React.Component {
    private formApi: FormApi;

    public render() {
        return (
            <Consumer>
                {ctx => (
                    <NewPage
                        title='Projects'
                        breadcrumbs={[{title: 'Settings', path: '/settings'}, {title: 'Projects'}]}
                        actionMenu={[
                            {
                                icon: 'fa-plus',
                                label: 'New Project',
                                action: () => ctx.navigation.goto('.', {add: true})
                            }
                        ]}>
                        <div className='projects' style={{padding: '0 80px'}}>
                            <DataLoader load={() => services.projects.list()}>
                                {projects =>
                                    (projects.length > 0 && (
                                        <div className='argo-table-list argo-table-list--clickable'>
                                            <div className='argo-table-list__head'>
                                                <div className='row'>
                                                    <div className='columns small-3'>NAME</div>
                                                    <div className='columns small-6'>DESCRIPTION</div>
                                                </div>
                                            </div>
                                            {projects.map(proj => (
                                                <div className='argo-table-list__row' key={proj.metadata.name} onClick={() => ctx.navigation.goto(`./${proj.metadata.name}`)}>
                                                    <div className='row'>
                                                        <div className='columns small-3'>
                                                            <i className='fa fa-object-group' /> {proj.metadata.name}
                                                        </div>
                                                        <div className='columns small-6'>{proj.spec.description}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )) || (
                                        <EmptyState icon='fa fa-object-group'>
                                            <h4>No projects yet</h4>
                                            <h5>Create new projects to group your applications</h5>
                                            <button className='argo-button argo-button--base' onClick={() => ctx.navigation.goto('.', {add: true})}>
                                                New project
                                            </button>
                                        </EmptyState>
                                    )
                                }
                            </DataLoader>
                        </div>
                        <Query>
                            {params => (
                                <SlidingPanel
                                    isShown={params.get('add') === 'true'}
                                    onClose={() => ctx.navigation.goto('.', {add: null})}
                                    isMiddle={true}
                                    header={
                                        <div>
                                            <button onClick={() => ctx.navigation.goto('.', {add: null})} className='argo-button argo-button--base-o'>
                                                Cancel
                                            </button>{' '}
                                            <button onClick={() => this.formApi.submitForm(null)} className='argo-button argo-button--base'>
                                                Create
                                            </button>
                                        </div>
                                    }>
                                    <Form
                                        defaultValues={{metadata: {}, spec: {}}}
                                        getApi={api => (this.formApi = api)}
                                        validateError={(p: Project) => ({
                                            'metadata.name': !p.metadata.name && 'Project name is required'
                                        })}
                                        onSubmit={async (proj: Project) => {
                                            try {
                                                await services.projects.create(proj);
                                                ctx.navigation.goto(`./${proj.metadata.name}`, {add: null});
                                            } catch (e) {
                                                ctx.notifications.show({
                                                    content: <ErrorNotification title='Unable to create project' e={e} />,
                                                    type: NotificationType.Error
                                                });
                                            }
                                        }}>
                                        {api => (
                                            <form onSubmit={api.submitForm} role='form' className='width-control'>
                                                <div className='white-box'>
                                                    <p>GENERAL</p>
                                                    <div className='argo-form-row'>
                                                        <FormField formApi={api} label='Name' field='metadata.name' component={Text} />
                                                    </div>
                                                    <div className='argo-form-row'>
                                                        <FormField formApi={api} label='Description' field='spec.description' component={Text} />
                                                    </div>
                                                </div>
                                            </form>
                                        )}
                                    </Form>
                                </SlidingPanel>
                            )}
                        </Query>
                    </NewPage>
                )}
            </Consumer>
        );
    }
}
