import { ChartBarIcon, ChartLineIcon, CogIcon, CogsIcon, CommentsDollarIcon, HandHoldingUsdIcon, TachometerAltIcon, UserIcon } from 'component/common/Icons';

import DashBoard from 'view/DashBoard';
import ExchangeRatePage from 'view/investment/ExchangeRate';
import FundView from 'view/investment/FundView';
import StockView from 'view/investment/StockView';
import AccountManagementPage from 'view/settings/AccountManagementPage';
import PersonalSettingPage from 'view/settings/PersonalSettingPage';

import { isArrayEmpty } from 'util/AppUtil';
import { Record, SidebarItem } from 'util/Interface';

// sidebar
export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        name: 'Dashboard',
        level: 0,
        url: '/dashboard',
        icon: TachometerAltIcon(),
        component: DashBoard
    },
    {
        name: 'Investment',
        level: 0,
        url: '/investment',
        type: 'dropdown',
        icon: HandHoldingUsdIcon(),
        children: [
            {
                name: 'Stock',
                level: 1,
                url: '/stockView',
                icon: ChartBarIcon(),
                component: StockView
            },
            {
                name: 'Fund',
                level: 1,
                url: '/fundView',
                icon: ChartLineIcon(),
                component: FundView
            },
            {
                name: 'Exchange Rate',
                level: 1,
                url: '/exchangeRate',
                icon: ChartLineIcon(),
                component: ExchangeRatePage
            }
        ]
    },
    {
        name: 'Settings',
        level: 0,
        url: '/setting',
        type: 'dropdown',
        icon: CogsIcon(),
        children: [
            {
                name: 'Account Management',
                level: 1,
                url: '/account',
                icon: UserIcon(),
                component: AccountManagementPage
            },
            {
                name: 'Personal Setting',
                level: 1,
                url: '/personalSetting',
                icon: CogIcon(),
                component: PersonalSettingPage
            }
        ]
    }
];

// breadcrumbs
const getBreadcrumbsRoutes = (items: SidebarItem[]): Record<string, string>[] => {
    return items.reduce((current: Record<string, string>[], item: SidebarItem) => {
        if (item.url) {
            current = current.concat({ key: item.url, value: item.name });
            if (!isArrayEmpty(item.children)) {
                current = current.concat(
                    getBreadcrumbsRoutes(item.children.map(child => {
                        return child.url ? { ...child, url: item.url + child.url } : { ...child };
                    }))
                );
            }
        }
        return current;
    }, []);
};
export const BREADCRUMBS_ROUTES: Record<string, string>[] = [{ key: '/', value: 'Home' }].concat(getBreadcrumbsRoutes(SIDEBAR_ITEMS));

// app routes
const getAppRoutes = (items: SidebarItem[]) => {
    return items.reduce((current: any[], item: SidebarItem) => {
        if (item.url) {
            if (!isArrayEmpty(item.children)) {
                current = current.concat(
                    getAppRoutes(item.children.map(child => {
                        return child.url ? { ...child, url: item.url + child.url } : { ...child };
                    }))
                );
            } else {
                current = current.concat({ path: item.url, name: item.name, component: item.component });
            }
        }
        return current;
    }, []);
};
export const APP_ROUTES = getAppRoutes(SIDEBAR_ITEMS);
