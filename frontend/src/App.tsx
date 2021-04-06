import * as React from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Route, Redirect, Switch, RouteChildrenProps } from 'react-router-dom';

import { LoginDispatcher, LogoutDispatcher } from 'reducer/PropsMapper';
import { getAuthToken, getAuthTokenString } from 'reducer/Selector';
import { removeAuthToken } from 'reducer/StateHolder';

import Form from 'component/common/Form';
import Modal from 'component/common/Modal';
import Breadcrumb from 'component/layout/Breadcrumb';
import Footer from 'component/layout/Footer';
import Header from 'component/layout/Header';
import Sidebar from 'component/layout/Sidebar';

import AuthApi, { AuthResponse, AuthToken } from 'api/auth';

import Notify from 'util/Notify';
import { InputType } from 'util/Enum';
import { APP_ROUTES } from 'util/Constant';

export interface AppProps extends RouteChildrenProps<any> {
    authToken?: AuthToken;
    authTokenString?: string;
    logout: () => void;
}

export interface AppState { }

class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {};
    }

    private onLogoutClick = () => {
        this.props.logout();
    };

    render() {
        const app = (
            <div className='app'>
                <Header {...this.props} authToken={this.props.authToken} onLogoutClick={this.onLogoutClick} />
                <div className='app-body'>
                    <Sidebar {...this.props} authToken={this.props.authToken} />
                    <main className='main'>
                        <Breadcrumb {...this.props} />
                        <Container fluid>
                            <Switch>
                                {
                                    APP_ROUTES.map((route, idx) => {
                                        return <Route key={`route-${idx}-${route.path}`} path={route.path} name={route.name} component={route.component} />;
                                    })
                                }
                                <Redirect from='/' to='/login' />
                            </Switch>
                        </Container>
                    </main>
                </div>
                <Footer {...this.props} />
            </div>
        );
        return app;
    }
}

const mapStateToProps = (state: any) => {
    return {
        authToken: getAuthToken(state),
        authTokenString: getAuthTokenString(state)
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        logout: LogoutDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
