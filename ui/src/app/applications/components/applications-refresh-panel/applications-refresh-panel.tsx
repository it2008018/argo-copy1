import {ErrorNotification, NotificationType, SlidingPanel} from 'argo-ui';
import * as React from 'react';
import {Form, FormApi} from 'react-form';
import {CheckboxField, ProgressPopup} from '../../../shared/components';
import {Consumer} from '../../../shared/context';
import * as models from '../../../shared/models';
import {services} from '../../../shared/services';
import {ComparisonStatusIcon, HealthStatusIcon, OperationPhaseIcon} from '../utils';

interface Progress {
    percentage: number;
    title: string;
}

const RefreshTypes = ['normal', 'hard'];

export const ApplicationsRefreshPanel = ({show, apps, hide}: {show: boolean; apps: models.Application[]; hide: () => void}) => {
    const [form, setForm] = React.useState<FormApi>(null);
    const [progress, setProgress] = React.useState<Progress>(null);
    const getSelectedApps = (params: any) => apps.filter((_, i) => params['app/' + i]);

    return (
        <Consumer>
            {ctx => (
                <SlidingPanel
                    isMiddle={true}
                    isShown={show}
                    onClose={() => hide()}
                    header={
                        <div>
                            <button className='argo-button argo-button--base' onClick={() => form.submitForm(null)}>
                                Refresh
                            </button>{' '}
                            <button onClick={() => hide()} className='argo-button argo-button--base-o'>
                                Cancel
                            </button>
                        </div>
                    }>
                    <Form
                        defaultValues={{refreshType: 'normal'}}
                        onSubmit={async (params: any) => {
                            const selectedApps = getSelectedApps(params);
                            if (selectedApps.length === 0) {
                                ctx.notifications.show({content: `No apps selected`, type: NotificationType.Error});
                                return;
                            }

                            setProgress({percentage: 0, title: 'Starting...'});
                            let i = 0;
                            for (const app of selectedApps) {
                                await services.applications.get(app.metadata.name, params.refreshType).catch(e => {
                                    ctx.notifications.show({
                                        content: <ErrorNotification title={`Unable to refresh ${app.metadata.name}`} e={e} />,
                                        type: NotificationType.Error
                                    });
                                });
                                i++;
                                setProgress({
                                    percentage: i / selectedApps.length,
                                    title: `${i} of ${selectedApps.length} apps now refreshing`
                                });
                            }
                            setProgress({percentage: 100, title: 'Complete'});
                        }}
                        getApi={setForm}>
                        {formApi => (
                            <React.Fragment>
                                <div className='argo-form-row' style={{marginTop: 0}}>
                                    <h4>Refresh app(s)</h4>
                                    {progress !== null && <ProgressPopup onClose={() => setProgress(null)} percentage={progress.percentage} title={progress.title} />}
                                    <div style={{marginBottom: '1em'}}>
                                        <label>Refresh Type</label>
                                        <div className='row application-sync-options'>
                                            {RefreshTypes.map(refreshType => (
                                                <label style={{paddingRight: '1.5em', marginTop: '0.4em'}}>
                                                    <input
                                                        type='radio'
                                                        value={refreshType}
                                                        checked={formApi.values.refreshType === refreshType}
                                                        onChange={() => formApi.setValue('refreshType', refreshType)}
                                                        style={{marginRight: '5px', transform: 'translateY(2px)'}}
                                                    />
                                                    {refreshType}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <label>
                                        Apps (<a onClick={() => apps.forEach((_, i) => formApi.setValue('app/' + i, true))}>all</a>/
                                        <a onClick={() => apps.forEach((app, i) => formApi.setValue('app/' + i, app.status.sync.status === models.SyncStatuses.OutOfSync))}>
                                            out of sync
                                        </a>
                                        /<a onClick={() => apps.forEach((_, i) => formApi.setValue('app/' + i, false))}>none</a>
                                        ):
                                    </label>
                                    <div style={{marginTop: '0.4em'}}>
                                        {apps.map((app, i) => (
                                            <label key={app.metadata.name} style={{marginTop: '0.5em', cursor: 'pointer'}}>
                                                <CheckboxField field={`app/${i}`} />
                                                &nbsp;
                                                {app.metadata.name}
                                                &nbsp;
                                                <ComparisonStatusIcon status={app.status.sync.status} />
                                                &nbsp;
                                                <HealthStatusIcon state={app.status.health} />
                                                &nbsp;
                                                <OperationPhaseIcon app={app} />
                                                <br />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                    </Form>
                </SlidingPanel>
            )}
        </Consumer>
    );
};
