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
import { API_URL } from 'api/Constant';

import { getAuthHeader } from 'util/AppUtil';
import Notify from 'util/Notify';
import { InputType } from 'util/Enum';
import { APP_ROUTES } from 'util/Constant';

export interface AppProps extends RouteChildrenProps<any> {
    authToken?: AuthToken;
    authTokenString?: string;
    login: (authToken: AuthToken) => void;
    logout: () => void;
}

export interface AppState {
    loginModalOpen: boolean;
    registerModalOpen: boolean;
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
}

class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {
            loginModalOpen: false,
            registerModalOpen: false,
            username: '',
            password: '',
            confirmPassword: '',
            email: ''
        };
    }

    private toggleLoginModal = () => {
        this.setState({ loginModalOpen: !this.state.loginModalOpen });
    };

    private onLoginClick = async () => {
        const { username, password } = this.state;
        const response: AuthResponse = await AuthApi.login(username, password);
        const { success, data, message } = response;
        if (success) {
            this.props.login(data);
            Notify.success(message);
            this.setState({ username: '', password: '' }, this.toggleLoginModal);
        } else {
            removeAuthToken();
            Notify.error(message);
        }
    };

    private onLogoutClick = () => {
        this.props.logout();
    };

    private toggleRegisterModal = () => {
        this.setState({ registerModalOpen: !this.state.registerModalOpen });
    };

    private onRegisterClick = async () => {
        const { username, password, confirmPassword, email } = this.state;
        if (password !== confirmPassword) {
            Notify.warning('Passwords are NOT same.');
            return;
        }
        let response: AuthResponse = await AuthApi.register(username, email, password, false);
        const { message } = response;
        if (response.success) {
            response = await AuthApi.login(username, password);
            const { success, data } = response;
            if (success) {
                this.props.login(data);
                Notify.success(message);
            } else {
                removeAuthToken();
                Notify.error(message);
            }
            this.setState({ username: '', password: '', confirmPassword: '', email: '' }, this.toggleRegisterModal);
        } else {
            removeAuthToken();
            Notify.error(message);
        }
    };

    render() {
        const { loginModalOpen, registerModalOpen, username, password, confirmPassword, email } = this.state;

        const loginModal = (
            <Modal
                headerText='Login'
                isShow={loginModalOpen}
                okBtnText='Submit'
                onOkClick={this.onLoginClick}
                onCancelClick={this.toggleLoginModal}
                verticalCentered={true}
            >
                <Form
                    singleRow
                    inputs={[
                        { key: 'username', title: 'Username', value: username },
                        { key: 'password', title: 'Password', type: InputType.password, value: password }
                    ]}
                    onChange={(formState: any) => { this.setState({ ...formState }); }}
                />
            </Modal>
        );

        const registerModal = (
            <Modal
                headerText='Register'
                isShow={registerModalOpen}
                okBtnText='Submit'
                onOkClick={this.onRegisterClick}
                onCancelClick={this.toggleRegisterModal}
                verticalCentered={true}
            >
                <Form
                    singleRow
                    inputs={[
                        { key: 'username', title: 'Username', value: username },
                        { key: 'password', title: 'Password', type: InputType.password, value: password },
                        { key: 'confirmPassword', title: 'Comfirm Password', type: InputType.password, value: confirmPassword },
                        { key: 'email', title: 'Email', type: InputType.email, value: email }
                    ]}
                    onChange={(formState: any) => { this.setState({ ...formState }); }}
                />
            </Modal>
        );

        const app = (
            <div className='app'>
                <Header {...this.props} authToken={this.props.authToken} onLogoutClick={this.onLogoutClick} toggleLoginModal={this.toggleLoginModal} toggleRegisterModal={this.toggleRegisterModal} />
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
                                <Redirect from='/' to='/dashboard' />
                            </Switch>
                        </Container>
                    </main>
                </div>
                <Footer {...this.props} />
            </div>
        );
        return (
            <>
                {app}
                {loginModal}
                {registerModal}
            </>
        );
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
        login: LoginDispatcher(dispatch),
        logout: LogoutDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
