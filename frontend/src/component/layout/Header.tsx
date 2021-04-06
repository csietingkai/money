import * as React from 'react';
import { Nav, NavbarBrand, NavItem, NavLink, Navbar } from 'react-bootstrap';
import { RouteChildrenProps } from 'react-router-dom';

import { SignOutAltIcon } from 'component/common/Icons';

import { AuthToken } from 'api/auth';

import Notify from 'util/Notify';

export interface HeaderProps extends RouteChildrenProps<any> {
    authToken?: AuthToken;
    onLogoutClick: () => void;
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

    private logout = () => {
        this.props.onLogoutClick();
        Notify.success('Lougout Success');
    };

    render() {
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
                    <NavItem className='d-md-down-none' onClick={this.logout}>
                        <NavLink href='#'>
                            <SignOutAltIcon />
                            {' Logout'}
                        </NavLink>
                    </NavItem>
                </Nav>
            </header>
        );
    }
}
