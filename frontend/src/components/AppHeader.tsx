import React from 'react';
import { connect } from 'react-redux';
import { CContainer, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CHeader, CHeaderNav, CHeaderToggler } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilAccountLogout, cilCog, cilMenu, cilUser } from '@coreui/icons';
import { ReduxState, isSidebarShow } from '../reducer/Selector';
import { LogoutDispatcher, SetSidebarShowDispatcher } from '../reducer/PropsMapper';
import { Action } from '../util/Interface';

export interface AppHeaderProps {
    isSidebarShow: boolean;
    setSidebarShow: (val: boolean) => void;
    logout: () => void;
}

export interface AppHeaderState { }

class AppHeader extends React.Component<AppHeaderProps, AppHeaderState> {

    constructor(props: AppHeaderProps) {
        super(props);
        this.state = {};
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
                                <CIcon icon={cilUser} size='lg' />
                            </CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem className='d-flex align-items-center' as='button' type='button' onClick={() => window.location.assign('#/setting')}>
                                    <CIcon className='me-2' icon={cilCog} size='lg' /> Setting
                                </CDropdownItem>
                                <CDropdownItem className='d-flex align-items-center' as='button' type='button' onClick={() => logout()}>
                                    <CIcon className='me-2' icon={cilAccountLogout} size='lg' /> Logout
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
        isSidebarShow: isSidebarShow(state)
    };
};

const mapDispatchToProps = (dispatch: React.Dispatch<Action<boolean | undefined>>) => {
    return {
        setSidebarShow: SetSidebarShowDispatcher(dispatch),
        logout: LogoutDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
