import {Tooltip} from 'argo-ui';
import * as React from 'react';
import {Timestamp} from '../../../shared/components/timestamp';
import {RevisionMetadata} from '../../../shared/models';

export const RevisionMetadataPanel = (props: {appName: string; type: string; revision: string; metadata: RevisionMetadata; showInfo?: (info: RevisionMetadata) => any}) => {
    if (props.type === 'helm') {
        return <React.Fragment />;
    }
    const m = props.metadata;
    return (
        <Tooltip
            popperOptions={{
                modifiers: {
                    preventOverflow: {
                        enabled: false
                    },
                    flip: {
                        enabled: false
                    }
                }
            }}
            content={
                <span>
                    {m.author && <React.Fragment>Authored by {m.author}</React.Fragment>}
                    <br />
                    {m.date && <Timestamp date={m.date} />}
                    <br />
                    {m.tags && (
                        <span>
                            Tags: {m.tags}
                            <br />
                        </span>
                    )}
                    {m.signatureInfo}
                    <br />
                    {m.message}
                </span>
            }
            placement='bottom'
            allowHTML={true}>
            <div className='application-status-panel__item-name'>
                {m.author && (
                    <div className='application-status-panel__item__row'>
                        <div>Author:</div>
                        <div>
                            {m.author} - {m.signatureInfo}
                        </div>
                    </div>
                )}
                <div className='application-status-panel__item__row'>
                    <div>Comment:</div>
                    <div>{m.message.split('\n')[0].slice(0, 64)}</div>
                </div>
            </div>
        </Tooltip>
    );
};
