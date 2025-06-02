import React from 'react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import SimpleBar from 'simplebar-react';
import { CNavGroup, CNavItem, CNavLink, CNavTitle, CSidebarNav } from '@coreui/react';
import { Route, RouteChildItem } from '../routes';
import 'simplebar-react/dist/simplebar.min.css';

export interface AppSidebarNavProps {
    routes: Route[];
}

export interface AppSidebarNavState { }

export default class AppSidebarNav extends React.Component<AppSidebarNavProps, AppSidebarNavState> {

    constructor(props: AppSidebarNavProps) {
        super(props);
        this.state = {};
    }

    private navItem = (icon: React.ReactNode, path: string, indent: boolean = false): React.ReactNode => {
        return (
            <CNavItem as='div' key={`item-${path}`}>
                <CNavLink to={path} as={NavLink}>
                    {icon}
                    <FormattedMessage id={`AppSidebar.${path}`}/>
                </CNavLink>
            </CNavItem>
        );
    };

    private navGroup = (icon: React.ReactNode, path: string, items: RouteChildItem[], indent: boolean = false): React.ReactNode => {
        const nodes: React.ReactNode[] = [];
        items.forEach(item => {
            const node = (
                <CNavItem as='div' key={`item-${item.path}`}>
                    <CNavLink to={`/${item.path}`} as={NavLink}>
                        <span className='nav-icon'>
                            <span className='nav-icon-bullet'></span>
                        </span>
                        <FormattedMessage id={`AppSidebar.${item.path}`}/>
                    </CNavLink>
                </CNavItem>
            );
            nodes.push(node);
        });
        return (
            <CNavGroup
                compact as='div'
                key={`group-${path}`}
                toggler={
                    <React.Fragment>
                        {icon}
                        <FormattedMessage id={`AppSidebar.${path}`}/>
                    </React.Fragment>
                }>
                {nodes}
            </CNavGroup>
        );
    };

    private navLink = (name: string, icon: React.ReactNode, href: string, indent: boolean = false): React.ReactNode => {
        return (
            <CNavItem as='div' key={`navlink-${name}`}>
                <CNavLink href={href}>
                    {icon}
                    <FormattedMessage id={`AppSidebar.${name}`}/>
                </CNavLink>
            </CNavItem>
        );
    };

    private navTitle = (name: string, indent: boolean = false): React.ReactNode => {
        return (
            <CNavTitle as='div' key={`navlink-${name}`}>
                {indent && (
                    <span className='nav-icon'>
                        <span className='nav-icon-bullet'></span>
                    </span>
                )}
                {name && <FormattedMessage id={`AppSidebar.${name}`}/>}
            </CNavTitle>
        );
    };

    private getNavs = (routes: Route[], indent: boolean = false): React.ReactNode[] => {
        const nodes: React.ReactNode[] = [];
        routes.forEach(r => {
            if (r.type === 'item') {
                nodes.push(this.navItem(r.icon, r.path, indent));
            } else if (r.type === 'parent') {
                nodes.push(this.navGroup(r.icon, r.path, r.items, indent));
            } else if (r.type === 'link') {
                nodes.push(this.navLink(r.name, r.icon, r.href, indent));
            } else if (r.type === 'title') {
                nodes.push(this.navTitle(r.name, indent));
            }
        });
        return nodes;
    };

    render(): React.ReactNode {
        const { routes } = this.props;
        return (
            <CSidebarNav as={SimpleBar}>
                {this.getNavs(routes)}
            </CSidebarNav>
        );
    }
}
