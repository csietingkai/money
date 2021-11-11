import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faChartBar, faChartLine, faCheck, faCog, faCogs, faHandHoldingUsd, faInfoCircle, faLock, faMinus, faPencilAlt, faPiggyBank, faPlayCircle, faPlus, faSearch, faSignInAlt, faSignOutAlt, faStar, faSyncAlt, faTable, faTachometerAlt, faTimes, faTrashAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { IconProp, library } from '@fortawesome/fontawesome-svg-core';

library.add(faAngleDown, faAngleUp, faChartBar, faChartLine, faCheck, faCog, faCogs, faHandHoldingUsd, faInfoCircle, faLock, faMinus, faPencilAlt,
    faPiggyBank, faPlayCircle, faPlus, faSearch, faSignInAlt, faSignOutAlt, faStar, faSyncAlt, faTable, faTachometerAlt, faTimes, faTrashAlt,
    faUser);

const Icon = (icon: IconProp) => (props?: { className?: string; }) => <span className={`icon ${props?.className}`}><FontAwesomeIcon icon={icon} /></span>;
export const AngleDownIcon = Icon('angle-down');
export const AngleUpIcon = Icon('angle-up');
export const ChartBarIcon = Icon('chart-bar');
export const ChartLineIcon = Icon('chart-line');
export const CheckIcon = Icon('check');
export const CogIcon = Icon('cog');
export const CogsIcon = Icon('cogs');
export const HandHoldingUsdIcon = Icon('hand-holding-usd');
export const InfoCircleIcon = Icon('info-circle');
export const LockIcon = Icon('lock');
export const MinusIcon = Icon('minus');
export const PencilAltIcon = Icon('pencil-alt');
export const PiggyBankIcon = Icon('piggy-bank');
export const PlusIcon = Icon('plus');
export const SearchIcon = Icon('search');
export const SignInAltIcon = Icon('sign-in-alt');
export const SignOutAltIcon = Icon('sign-out-alt');
export const StarIcon = Icon('star');
export const SyncAltIcon = Icon('sync-alt');
export const TableIcon = Icon('table');
export const TachometerAltIcon = Icon('tachometer-alt');
export const TimesIcon = Icon('times');
export const TrashAltIcon = Icon('trash-alt');
export const UserIcon = Icon('user');

const Flag = (countryCode: string) => (props?: { className?: string; }) => <i className={`flag-icon flag-icon-${countryCode} ${props?.className}`} title={countryCode} id={countryCode}></i>;
export const TwFlag = Flag('tw');
export const UsFlag = Flag('us');
