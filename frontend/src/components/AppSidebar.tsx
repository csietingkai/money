import React from 'react';
import { connect } from 'react-redux';
import { CCloseButton, CSidebar, CSidebarBrand, CSidebarFooter, CSidebarHeader, CSidebarToggler } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import AppSidebarNav from './AppSidebarNav';
import routes from '../routes';
import { ReduxState, isSidebarFoldable, isSidebarShow } from '../reducer/Selector';
import { SetSidebarFoldableDispatcher, SetSidebarShowDispatcher } from '../reducer/PropsMapper';
import { Action } from '../util/Interface';
import { logo } from '../assets/brand/logo';
import { sygnet } from '../assets/brand/sygnet';

export interface AppSidebarProps {
    isSidebarShow: boolean;
    isSidebarFoldable: boolean;
    setSidebarShow: (val: boolean) => void;
    setSidebarFoldable: (val: boolean) => void;
}

export interface AppSidebarState { }

class AppSidebar extends React.Component<AppSidebarProps, AppSidebarState> {

    render(): React.ReactNode {
        const { isSidebarShow, isSidebarFoldable, setSidebarShow, setSidebarFoldable } = this.props;
        return (
            <CSidebar
                className='border-end'
                colorScheme='dark'
                position='fixed'
                unfoldable={!isSidebarFoldable}
                visible={isSidebarShow}
                onVisibleChange={(visible) => setSidebarShow(visible)}
            >
                <CSidebarHeader className='border-bottom'>
                    <CSidebarBrand>
                        <CIcon customClassName='sidebar-brand-full' icon={logo} height={32} />
                        <CIcon customClassName='sidebar-brand-narrow' icon={sygnet} height={32} />
                    </CSidebarBrand>
                    <CCloseButton className='d-lg-none' dark
                        onClick={() => setSidebarShow(false)}
                    />
                </CSidebarHeader>
                <AppSidebarNav routes={routes} />
                <CSidebarFooter className='border-top d-none d-lg-flex'>
                    <CSidebarToggler
                        onClick={() => setSidebarFoldable(!isSidebarFoldable)}
                    />
                </CSidebarFooter>
            </CSidebar>
        );
    }
}


const mapStateToProps = (state: ReduxState) => {
    return {
        isSidebarShow: isSidebarShow(state),
        isSidebarFoldable: isSidebarFoldable(state)
    };
};

const mapDispatchToProps = (dispatch: React.Dispatch<Action<boolean>>) => {
    return {
        setSidebarShow: SetSidebarShowDispatcher(dispatch),
        setSidebarFoldable: SetSidebarFoldableDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppSidebar);
