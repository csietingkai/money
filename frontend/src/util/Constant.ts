import { ToastOptions, ToastPosition } from 'react-toastify';

import { AddressCardIcon, BoxesIcon, ChartPieIcon, ImagesIcon, PlayCircleIcon, TableIcon, TachometerAltIcon, TextHeightIcon, TintIcon } from 'component/common/Icons';

import ButtonExample from 'view/ButtonExample';
import CardsExample from 'view/CardExample';
import ChartExample from 'view/ChartExample';
import ColorExample from 'view/ColorExample';
import DashBoard from 'view/DashBoard';
import FormExample from 'view/FormExample';
import ImageExample from 'view/ImageExample';
import TableExample from 'view/TableExample';

import { isArrayEmpty } from 'util/AppUtil';
import { Record, SidebarItem } from 'util/Interface';

// general
export const API_URL: string = process.env.API_URL;

// api auth
export const AUTH_LOGIN_PATH: string = '/login';
export const AUTH_REGISTER_PATH: string = '/register';
export const AUTH_VALIDATE_PATH: string = '/validate';

// api file
const FILE_API_PREFIX: string = '/file';
export const FILE_UPLOAD_PATH: string = FILE_API_PREFIX + '/upload';
export const FILE_DOWNLOAD_PATH: string = FILE_API_PREFIX + '/download';

// api item
const ITEM_API_PREFIX: string = '/item';
export const ITEM_GET_ALL_PATH: string = ITEM_API_PREFIX + '/getAll';

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
        component: DashBoard
    },
    {
        name: 'Theme',
        type: 'wrapper'
    },
    {
        name: 'Colors',
        url: '/color',
        icon: TintIcon(),
        component: ColorExample
    },
    {
        name: 'Component',
        type: 'wrapper'
    },
    {
        name: 'Base',
        type: 'dropdown',
        url: '/base',
        icon: BoxesIcon(),
        children: [
            {
                name: 'Buttons',
                url: '/button',
                icon: PlayCircleIcon(),
                component: ButtonExample
            },
            {
                name: 'Cards',
                url: '/card',
                icon: AddressCardIcon(),
                component: CardsExample
            },
            {
                name: 'Forms',
                url: '/form',
                icon: TextHeightIcon(),
                component: FormExample
            },
            {
                name: 'Image',
                url: '/image',
                icon: ImagesIcon(),
                component: ImageExample
            },
            {
                name: 'Tables',
                url: '/table',
                icon: TableIcon(),
                component: TableExample
            }
        ]
    },
    {
        name: 'Charts',
        url: '/chart',
        icon: ChartPieIcon(),
        component: ChartExample
    },
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
