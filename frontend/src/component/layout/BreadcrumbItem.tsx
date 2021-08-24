import * as React from 'react';
import { BreadcrumbItem as RbBreadcrumbItem } from 'react-bootstrap';
import { Link, RouteChildrenProps } from 'react-router-dom';

import { BREADCRUMBS_ROUTES } from 'component/layout/RouteSetting';

import { convert, find } from 'util/AppUtil';

export interface BreadcrumbItemProps extends RouteChildrenProps<any> { }

export interface BreadcrumbItemState { }

export default class BreadcrumbItem extends React.Component<BreadcrumbItemProps, BreadcrumbItemState> {

    constructor(props: BreadcrumbItemProps) {
        super(props);
    }

    render(): JSX.Element {
        const { match } = this.props;
        if (find(BREADCRUMBS_ROUTES, match.url)) {
            const routeName: string = convert(BREADCRUMBS_ROUTES, match.url);
            return (
                match.isExact ?
                    (
                        <RbBreadcrumbItem active>{routeName}</RbBreadcrumbItem>
                    )
                    :
                    (
                        <li className='breadcrumb-item active'>
                            <Link to={match.url || ''}>
                                {routeName}
                            </Link>
                        </li>
                    )
            );
        }
        return null;
    }
}
