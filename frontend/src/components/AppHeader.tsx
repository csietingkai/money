import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { CContainer, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CHeader, CHeaderNav, CHeaderToggler } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cifTw, cifUs, cilAccountLogout, cilCog, cilMenu, cilTranslate, cilUser } from '@coreui/icons';
import { SetFileTypeOptions, SetRecordTypeOptions, SetStockTypeOptions } from '../reducer/Action';
import { ReduxState, getUserSetting, isSidebarShow } from '../reducer/Selector';
import store from '../reducer/Store';
import { LogoutDispatcher, SetSidebarShowDispatcher, SetUserSettingDispatcher } from '../reducer/PropsMapper';
import AuthApi, { UserSetting } from '../api/auth';
import OptionApi from '../api/option';
import { Action, Lang } from '../util/Interface';

export interface AppHeaderProps {
    isSidebarShow: boolean;
    userSetting: UserSetting;
    setSidebarShow: (val: boolean) => void;
    setUserSetting: (userSetting: UserSetting) => void;
    logout: () => void;
}

export interface AppHeaderState { }

class AppHeader extends React.Component<AppHeaderProps, AppHeaderState> {

    constructor(props: AppHeaderProps) {
        super(props);
        this.state = {};
    }

    private setLanguage = async (lang: Lang) => {
        const { userSetting, setUserSetting } = this.props;
        const newSetting: UserSetting = { ...userSetting, lang }
        const response = await AuthApi.updateUserSetting(newSetting);
        const { success } = response;
        if (success) {
            setUserSetting(newSetting);
            OptionApi.getFileTypes().then(resp => store.dispatch(SetFileTypeOptions(resp.data)));
            OptionApi.getStockTypes().then(resp => store.dispatch(SetStockTypeOptions(resp.data)));
            OptionApi.getRecordTypes().then(resp => store.dispatch(SetRecordTypeOptions(resp.data)));
        }
    }

    render(): React.ReactNode {
        const { isSidebarShow, setSidebarShow, logout } = this.props;
        return (
            <CHeader position='sticky' className='mb-4 p-0'>
                <CContainer className='border-bottom px-4' fluid>
                    <CHeaderToggler
                        onClick={() => setSidebarShow(!isSidebarShow)}
                        style={{ marginInlineStart: '-14px' }}
                    >
                        <CIcon icon={cilMenu} size='lg' />
                    </CHeaderToggler>
                    <CHeaderNav>
                        <li className='nav-item py-1'>
                            <div className='vr h-100 mx-2 text-body text-opacity-75'></div>
                        </li>
                        <CDropdown variant='nav-item' placement='bottom-end'>
                            <CDropdownToggle caret={false}>
                                <CIcon icon={cilTranslate} size='lg' />
                            </CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem className='d-flex align-items-center' as='button' type='button' onClick={() => this.setLanguage('zh')}>
                                    <CIcon className='me-2' icon={cifTw} size='lg' /> 繁體中文
                                </CDropdownItem>
                                <CDropdownItem className='d-flex align-items-center' as='button' type='button' onClick={() => this.setLanguage('en')}>
                                    <CIcon className='me-2' icon={cifUs} size='lg' /> English
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                        <li className='nav-item py-1'>
                            <div className='vr h-100 mx-2 text-body text-opacity-75'></div>
                        </li>
                        <CDropdown variant='nav-item' placement='bottom-end'>
                            <CDropdownToggle caret={false}>
                                <CIcon icon={cilUser} size='lg' />
                            </CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem className='d-flex align-items-center' as='button' type='button' onClick={() => window.location.assign('#/setting')}>
                                    <CIcon className='me-2' icon={cilCog} size='lg' />
                                    <FormattedMessage id='AppHeader.settingText'/>
                                </CDropdownItem>
                                <CDropdownItem className='d-flex align-items-center' as='button' type='button' onClick={() => logout()}>
                                    <CIcon className='me-2' icon={cilAccountLogout} size='lg' />
                                    <FormattedMessage id='AppHeader.logoutText'/>
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </CHeaderNav>
                </CContainer>
            </CHeader>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        isSidebarShow: isSidebarShow(state),
        userSetting: getUserSetting(state)
    };
};

const mapDispatchToProps = (dispatch: React.Dispatch<Action<boolean | UserSetting | undefined>>) => {
    return {
        setSidebarShow: SetSidebarShowDispatcher(dispatch),
        setUserSetting: SetUserSettingDispatcher(dispatch),
        logout: LogoutDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
