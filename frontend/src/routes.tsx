import React from 'react';
import CIcon from '@coreui/icons-react';
import { cilBank, cilBell, cilCalculator, cilCart, cilChartPie, cilCode, cilCog, cilCursor, cilDescription, cilDollar, cilDrop, cilMonitor, cilNotes, cilPencil, cilPuzzle, cilSearch, cilSpeedometer, cilStar } from '@coreui/icons';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react';
import { PolymorphicRefForwardingComponent } from '@coreui/react/dist/esm/helpers';
import { CNavTitleProps } from '@coreui/react/dist/esm/components/nav/CNavTitle';
import { CNavItemProps } from '@coreui/react/dist/esm/components/nav/CNavItem';
import { CNavGroupProps } from '@coreui/react/dist/esm/components/nav/CNavGroup';

export type RouteItem = {
    type: 'item';
    name: string;
    path: string;
    icon: React.ReactNode;
    component: React.LazyExoticComponent<React.ComponentType<any>>;
};

export type RouteParentItem = {
    type: 'parent';
    name: string;
    path: string;
    icon: React.ReactNode;
    items: RouteChildItem[];
};

export type RouteChildItem = {
    type: 'child';
    name: string;
    path: string;
    component: React.LazyExoticComponent<React.ComponentType<any>>;
};

export type RouteLink = {
    type: 'link';
    name: string;
    href: string;
    icon: React.ReactNode;
};

export type RouteTitle = {
    type: 'title';
    name: string,
};

export type Route = RouteItem | RouteParentItem | RouteChildItem | RouteLink | RouteTitle;

const routes: Route[] = [
    {
        type: 'item',
        name: 'Dashboard',
        path: 'dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/Dashboard'))
    },
    {
        type: 'item',
        name: 'Accounts',
        path: 'account',
        icon: <CIcon icon={cilBank} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/AccountPage'))
    },
    {
        type: 'title',
        name: 'Stock',
    },
    {
        type: 'item',
        name: 'Your Stock',
        path: 'stock',
        icon: <CIcon icon={cilDollar} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/stock/StockOwnPage'))
    },
    {
        type: 'item',
        name: 'Stock Query',
        path: 'stockQuery',
        icon: <CIcon icon={cilSearch} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/stock/StockQueryPage'))
    },
    {
        type: 'item',
        name: 'Stock Trade',
        path: 'stockTrade',
        icon: <CIcon icon={cilCart} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/stock/StockTradePage'))
    },
    // {
    //     type: 'parent',
    //     name: 'Icons',
    //     path: '',
    //     icon: <CIcon icon={cilStar} customClassName='nav-icon' />,
    //     items: [
    //         {
    //             type: 'child',
    //             name: 'CoreUI Free',
    //             path: 'login',
    //             component: React.lazy(() => import('./views/Login'))
    //         },
    //         {
    //             type: 'child',
    //             name: 'CoreUI Flags',
    //             path: '404',
    //             component: React.lazy(() => import('./views/Page404'))
    //         },
    //         {
    //             type: 'child',
    //             name: 'CoreUI Brands',
    //             path: '500',
    //             component: React.lazy(() => import('./views/Page500'))
    //         },
    //     ],
    // },
    {
        type: 'title',
        name: 'Fund',
    },
    {
        type: 'item',
        name: 'Your Fund',
        path: 'fund',
        icon: <CIcon icon={cilDollar} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/fund/FundOwnPage'))
    },
    {
        type: 'item',
        name: 'Fund Query',
        path: 'fundQuery',
        icon: <CIcon icon={cilSearch} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/fund/FundQueryPage'))
    },
    {
        type: 'item',
        name: 'Fund Trade',
        path: 'fundTrade',
        icon: <CIcon icon={cilCart} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/fund/FundTradePage'))
    },
    {
        type: 'title',
        name: 'Currency',
    },
    {
        type: 'title',
        name: 'Extras',
    },
    {
        type: 'item',
        name: 'Financial Files',
        path: 'files',
        icon: <CIcon icon={cilMonitor} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/extras/FileManagePage'))
    },
    {
        type: 'item',
        name: 'User Setting',
        path: 'setting',
        icon: <CIcon icon={cilCog} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/extras/SettingPage'))
    },
    {
        type: 'link',
        name: 'Source Code',
        href: 'https://github.com/csietingkai/money',
        icon: <CIcon icon={cilCode} customClassName='nav-icon' />
    }
];

export default routes;
