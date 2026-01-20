import React from 'react';
import CIcon from '@coreui/icons-react';
import { cilBank, cilCart, cilCode, cilCog, cilDollar, cilList, cilMonitor, cilPin, cilSearch, cilSpeedometer, cilSwapHorizontal } from '@coreui/icons';

export type RouteItem = {
    type: 'item';
    path: string;
    icon: React.ReactNode;
    component: React.LazyExoticComponent<React.ComponentType<any>>;
};

export type RouteParentItem = {
    type: 'parent';
    path: string;
    icon: React.ReactNode;
    items: RouteChildItem[];
};

export type RouteChildItem = {
    type: 'child';
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
        path: 'dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/Dashboard'))
    },
    {
        type: 'title',
        name: 'accountTitle',
    },
    {
        type: 'item',
        path: 'account',
        icon: <CIcon icon={cilBank} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/account/AccountPage'))
    },
    {
        type: 'item',
        path: 'recordQuery',
        icon: <CIcon icon={cilList} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/account/AccountRecordQueryPage'))
    },
    {
        type: 'title',
        name: 'stockTitle',
    },
    {
        type: 'item',
        path: 'stock',
        icon: <CIcon icon={cilDollar} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/stock/StockOwnPage'))
    },
    {
        type: 'item',
        path: 'stockTrack',
        icon: <CIcon icon={cilPin} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/stock/StockTrackPage'))
    },
    {
        type: 'item',
        path: 'stockQuery',
        icon: <CIcon icon={cilSearch} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/stock/StockQueryPage'))
    },
    {
        type: 'item',
        path: 'stockTrade',
        icon: <CIcon icon={cilCart} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/stock/StockTradePage'))
    },
    {
        type: 'title',
        name: 'fundTitle',
    },
    {
        type: 'item',
        path: 'fund',
        icon: <CIcon icon={cilDollar} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/fund/FundOwnPage'))
    },
    {
        type: 'item',
        path: 'fundTrack',
        icon: <CIcon icon={cilPin} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/fund/FundTrackPage'))
    },
    {
        type: 'item',
        path: 'fundQuery',
        icon: <CIcon icon={cilSearch} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/fund/FundQueryPage'))
    },
    {
        type: 'item',
        path: 'fundTrade',
        icon: <CIcon icon={cilCart} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/fund/FundTradePage'))
    },
    {
        type: 'title',
        name: 'currencyTitle',
    },
    {
        type: 'item',
        path: 'exchangeRateQuery',
        icon: <CIcon icon={cilSearch} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/exchangeRate/ExchangeRateQueryPage'))
    },
    {
        type: 'item',
        path: 'exchangeRateTrade',
        icon: <CIcon icon={cilSwapHorizontal} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/exchangeRate/ExchangeRateTradePage'))
    },
    {
        type: 'title',
        name: 'extrasTitle',
    },
    {
        type: 'item',
        path: 'files',
        icon: <CIcon icon={cilMonitor} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/extras/FileManagePage'))
    },
    {
        type: 'item',
        path: 'setting',
        icon: <CIcon icon={cilCog} customClassName='nav-icon' />,
        component: React.lazy(() => import('./views/extras/SettingPage'))
    },
    {
        type: 'link',
        name: 'sourceCode',
        href: 'https://github.com/csietingkai/money',
        icon: <CIcon icon={cilCode} customClassName='nav-icon' />
    }
];

export default routes;
