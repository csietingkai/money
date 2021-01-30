import * as React from 'react';
import { Breadcrumb as RbBreadcrumb } from 'react-bootstrap';
import { Route, RouteChildrenProps } from 'react-router-dom';

import BreadcrumbItem from 'component/layout/BreadcrumbItem';

export interface BreadcrumbProps extends RouteChildrenProps<any> { }

export interface BreadcrumbState { }

export default class Breadcrumb extends React.Component<BreadcrumbProps, BreadcrumbState> {

    constructor(props: BreadcrumbProps) {
        super(props);
    }

    private getPaths = (pathname: string): string[] => {
        const paths = ['/'];

        if (pathname === '/') {
            return paths;
        }

        pathname.split('/').reduce((prev, curr) => {
            const currPath = `${prev}/${curr}`;
            paths.push(currPath);
            return currPath;
        });
        return paths;
    };

    render() {
        const paths: string[] = this.getPaths(this.props.location.pathname);
        const breadcrumbItems = paths.map((path, idx) => {
            return (
                <Route key={`breadcrumb-item-${idx}`} path={path} component={BreadcrumbItem} />
            );
        });
        return (
            <div>
                <RbBreadcrumb>
                    {breadcrumbItems}
                </RbBreadcrumb>
            </div>
        );
    }
}
