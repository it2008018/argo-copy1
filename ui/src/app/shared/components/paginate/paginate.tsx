import {DataLoader, DropDownMenu} from 'argo-ui';

import * as React from 'react';
import ReactPaginate from 'react-paginate';
import {services} from '../../services';

require('./paginate.scss');

export interface PaginateProps<T> {
    page: number;
    onPageChange: (page: number) => any;
    children: (data: T[]) => React.ReactNode;
    data: T[];
    emptyState?: () => React.ReactNode;
    preferencesKey?: string;
    header?: React.ReactNode;
    showHeader?: boolean;
    tools?: React.ReactNode;
}

export function Paginate<T>({page, onPageChange, children, data, emptyState, preferencesKey, header, showHeader, tools}: PaginateProps<T>) {
    return (
        <DataLoader load={() => services.viewPreferences.getPreferences()}>
            {pref => {
                preferencesKey = preferencesKey || 'default';
                const pageSize = pref.pageSizes[preferencesKey] || 10;
                const pageCount = pageSize === -1 ? 1 : Math.ceil(data.length / pageSize);
                if (pageCount <= page) {
                    page = pageCount - 1;
                }

                function paginator() {
                    return (
                        <div style={{marginBottom: '0.5em'}}>
                            <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.5em', paddingLeft: '1em'}}>
                                {pageCount > 1 && (
                                    <ReactPaginate
                                        containerClassName='paginate__paginator'
                                        forcePage={page}
                                        pageCount={pageCount}
                                        pageRangeDisplayed={5}
                                        marginPagesDisplayed={2}
                                        onPageChange={item => onPageChange(item.selected)}
                                    />
                                )}
                                {tools}
                                <div className='paginate__size-menu'>
                                    <DropDownMenu
                                        anchor={() => (
                                            <a>
                                                Items per page: {pageSize === -1 ? 'all' : pageSize} <i className='fa fa-caret-down' />
                                            </a>
                                        )}
                                        items={[5, 10, 15, 20, -1].map(count => ({
                                            title: count === -1 ? 'all' : count.toString(),
                                            action: () => {
                                                pref.pageSizes[preferencesKey] = count;
                                                services.viewPreferences.updatePreferences(pref);
                                            }
                                        }))}
                                    />
                                </div>
                            </div>
                            {showHeader && header}
                        </div>
                    );
                }

                return (
                    <React.Fragment>
                        <div className='paginate'>{paginator()}</div>
                        {data.length === 0 && emptyState ? emptyState() : children(pageSize === -1 ? data : data.slice(pageSize * page, pageSize * (page + 1)))}
                        <div className='paginate'>{pageCount > 1 && paginator()}</div>
                    </React.Fragment>
                );
            }}
        </DataLoader>
    );
}
