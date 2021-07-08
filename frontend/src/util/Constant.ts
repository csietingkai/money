import { ToastOptions, ToastPosition } from 'react-toastify';

import { CalendarAltIcon, ChartLineIcon, CogIcon, CogsIcon, HandHoldingUsdIcon, TachometerAltIcon, UserIcon } from 'component/common/Icons';

import AccountManagementPage from 'view/settings/AccountManagementPage';
import DashBoard from 'view/DashBoard';

import { isArrayEmpty } from 'util/AppUtil';
import { Record, SidebarItem } from 'util/Interface';
import StockQuerier from 'view/investment/StockQuerier';
import PersonalSettingPage from 'view/settings/PersonalSettingPage';
import StockRecordUpdater from 'view/investment/StockRecordUpdater';
import ExchangeRateQuerier from 'view/investment/ExchangeRateQuerier';


// localStorage
export const AUTH_TOKEN_KEY: string = 'AUTH_TOKEN';
export const STOCK_STYLE_KEY: string = 'STOCK_STYLE';

// notify position
export const NOTIFICATION_POSTITION: ToastPosition = 'bottom-right';
export const NOTIFICATION_SHOW_POGRESS_BAR: boolean = false;
export const NOTIFICATION_PAUSE_ON_HOVER: boolean = true;
export const NOTIFICATION_CLOSE_DELAY_SECONDS: number = 2;

export const NOTIFICATION_DEFAULT_CONFIG: ToastOptions = {
    style: { fontSize: '16px' },
    position: NOTIFICATION_POSTITION,
    hideProgressBar: !NOTIFICATION_SHOW_POGRESS_BAR,
    pauseOnHover: NOTIFICATION_PAUSE_ON_HOVER,
    autoClose: NOTIFICATION_CLOSE_DELAY_SECONDS * 2000
};

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
                name: 'Stock Querier',
                level: 1,
                url: '/stockQuerier',
                icon: ChartLineIcon(),
                component: StockQuerier
            },
            {
                name: 'Stock Updater',
                level: 1,
                url: '/stockUpdater',
                icon: CalendarAltIcon(),
                component: StockRecordUpdater
            },
            {
                name: 'Exchange Rate Querier',
                level: 1,
                url: '/exchangeRateQuerier',
                icon: ChartLineIcon(),
                component: ExchangeRateQuerier
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
