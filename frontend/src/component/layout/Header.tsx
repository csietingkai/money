import * as React from 'react';
import { Nav, NavbarBrand, NavItem, NavLink, Navbar } from 'react-bootstrap';
import { RouteChildrenProps } from 'react-router-dom';

import { SignInAltIcon, SignOutAltIcon, UserPlusIcon } from 'component/common/Icons';

import { AuthToken } from 'api/auth';

import Notify from 'util/Notify';

export interface HeaderProps extends RouteChildrenProps<any> {
    authToken?: AuthToken;
    onLogoutClick: () => void;
    toggleLoginModal: () => void;
    toggleRegisterModal: () => void;
}

export interface HeaderState { }

export default class Header extends React.Component<HeaderProps, HeaderState> {

    constructor(props: HeaderProps) {
        super(props);
        this.state = {};
    }

    private sidebarToggle = (event: React.MouseEvent<Element, MouseEvent>) => {
        event.preventDefault();
        document.body.classList.toggle('sidebar-hidden');
    };


    private mobileSidebarToggle = (event: React.MouseEvent<Element, MouseEvent>) => {
        event.preventDefault();
        document.body.classList.toggle('sidebar-mobile-show');
    };

    private login = () => {
        this.props.toggleLoginModal();
    };

    private logout = () => {
        this.props.onLogoutClick();
        Notify.success('Lougout Success');
    };

    private register = () => {
        this.props.toggleRegisterModal();
    };

    render() {
        const { authToken } = this.props;
        return (
            <header className='app-header navbar'>
                <Navbar.Toggle className='d-lg-none' onClick={this.mobileSidebarToggle}>
                    <span className='navbar-toggler-icon'></span>
                </Navbar.Toggle>
                <NavbarBrand href='#'></NavbarBrand>
                <Navbar.Toggle className='d-md-down-none' onClick={this.sidebarToggle}>
                    <span className='navbar-toggler-icon'></span>
                </Navbar.Toggle>
                <Nav className='ml-auto' navbar>
                    <NavItem className='d-md-down-none' onClick={authToken ? this.logout : this.login}>
                        <NavLink href='#'>
                            {authToken ?
                                <>
                                    <SignOutAltIcon />
                                    {' Logout'}
                                </>
                                :
                                <>
                                    <SignInAltIcon />
                                    {' Login'}
                                </>}
                        </NavLink>
                    </NavItem>
                    {
                        !authToken &&
                        <NavItem className='d-md-down-none' onClick={this.register}>
                            <NavLink href='#'>
                                <>
                                    <UserPlusIcon />
                                    {' Register'}
                                </>
                            </NavLink>
                        </NavItem>
                    }
                </Nav>
            </header>
        );
    }
}
