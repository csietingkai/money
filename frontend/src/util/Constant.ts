import { ToastOptions, ToastPosition } from 'react-toastify';

import { CogsIcon, HandHoldingUsdIcon, TachometerAltIcon, UserIcon, VolleyBallIcon } from 'component/common/Icons';

import AccountManagementPage from 'view/AccountManagementPage';
import DashBoard from 'view/DashBoard';
import SportLotteryPage from 'view/SportLotteryPage';

import { isArrayEmpty } from 'util/AppUtil';
import { Record, SidebarItem } from 'util/Interface';


// localStorage
export const AUTH_TOKEN_KEY: string = 'AUTH_TOKEN';

// notify position
export const NOTIFICATION_POSTITION: ToastPosition = 'bottom-right';
export const NOTIFICATION_SHOW_POGRESS_BAR: boolean = false;
export const NOTIFICATION_PAUSE_ON_HOVER: boolean = true;
export const NOTIFICATION_CLOSE_DELAY_SECONDS: number = 2;

export const NOTIFICATION_DEFAULT_CONFIG: ToastOptions = {
    position: NOTIFICATION_POSTITION,
    hideProgressBar: !NOTIFICATION_SHOW_POGRESS_BAR,
    pauseOnHover: NOTIFICATION_PAUSE_ON_HOVER,
    autoClose: NOTIFICATION_CLOSE_DELAY_SECONDS * 2000
};

// sidebar
export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        name: 'Dashboard',
        url: '/dashboard',
        icon: TachometerAltIcon(),
        component: DashBoard,
        needAuth: false
    },
    {
        name: 'Investment',
        url: '/investment',
        type: 'dropdown',
        icon: HandHoldingUsdIcon(),
        needAuth: true,
        children: [
            {
                name: 'Sport Lottery',
                url: '/sportLottery',
                icon: VolleyBallIcon(),
                component: SportLotteryPage,
                needAuth: true
            }
        ]
    },
    {
        name: 'Settings',
        url: '/setting',
        type: 'dropdown',
        icon: CogsIcon(),
        needAuth: true,
        children: [
            {
                name: 'Account Management',
                url: '/account',
                icon: UserIcon(),
                component: AccountManagementPage,
                needAuth: true
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
