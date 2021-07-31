import * as moment from 'moment';
import * as React from 'react';

import * as models from '../../models';

require('./events-list.scss');

export const EventsList = (props: {events: models.Event[]}) => {
    const events = props.events.sort((first, second) => moment(second.lastTimestamp).diff(first.lastTimestamp));

    return (
        <div className='events-list'>
            {(events.length === 0 && <p>No events available</p>) || (
                <div className='argo-table-list'>
                    <div className='argo-table-list__head'>
                        <div className='row'>
                            <div className='columns small-2 xxlarge-2'>REASON</div>
                            <div className='columns small-4 xxlarge-5'>MESSAGE</div>
                            <div className='columns small-2 xxlarge-1'>COUNT</div>
                            <div className='columns small-2 xxlarge-2'>FIRST OCCURRED</div>
                            <div className='columns small-2 xxlarge-2'>LAST OCCURRED</div>
                        </div>
                    </div>
                    {events.map(event => (
                        <div className={`argo-table-list__row events-list__event events-list__event--${event.type}`} key={event.metadata.uid}>
                            <div className='row'>
                                <div className='columns small-2 xxlarge-2'>{event.reason}</div>
                                <div className='columns small-4 xxlarge-5'>{event.message}</div>
                                <div className='columns small-2 xxlarge-1'>{event.count}</div>
                                <div className='columns small-2 xxlarge-2'>{event.firstTimestamp}</div>
                                <div className='columns small-2 xxlarge-2'>{event.lastTimestamp}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
