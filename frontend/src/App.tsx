import * as React from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Route, Redirect, Switch, RouteChildrenProps } from 'react-router-dom';

import { LoginDispatcher, LogoutDispatcher } from 'reducer/PropsMapper';
import { getAuthToken } from 'reducer/Selector';
import { removeAuthToken } from 'reducer/StateHolder';

import Form from 'component/common/Form';
import Modal from 'component/common/Modal';
import Breadcrumb from 'component/layout/Breadcrumb';
import Footer from 'component/layout/Footer';
import Header from 'component/layout/Header';
import Sidebar from 'component/layout/Sidebar';

import AuthApi, { AuthResponse, AuthToken } from 'api/auth';

import { getAuthHeader } from 'util/AppUtil';
import Notify from 'util/Notify';
import { InputType } from 'util/Enum';
import { API_URL, APP_ROUTES } from 'util/Constant';

export interface AppProps extends RouteChildrenProps<any> {
    authToken?: AuthToken;
    login: (authToken: AuthToken) => void;
    logout: () => void;
}

export interface AppState {
    loginModalOpen: boolean;
    username: string;
    password: string;
}

class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {
            loginModalOpen: false,
            username: '',
            password: ''
        };
        this.setAxios();
    }

    private setAxios = () => {
        axios.defaults.baseURL = API_URL;
        axios.defaults.headers = getAuthHeader();
        axios.interceptors.response.use((response) => response, (error) => {
            const { status } = error.response.data;
            if (status === 403) {
                Notify.warning('Maybe You Need to Login First.');
            } else if (status === 404) {
                this.props.history.push('/404');
            } else if (status === 500) {
                this.props.history.push('/500');
            }
            throw error;
        });
    };


    private togglLoginModal = () => {
        this.setState({ loginModalOpen: !this.state.loginModalOpen });
    };

    private onLoginClick = async () => {
        const { username, password } = this.state;
        const response: AuthResponse = await AuthApi.login(username, password);
        const { success, data, message } = response;
        if (success) {
            this.props.login(data);
            Notify.success(message);
            this.setState({ username: '', password: '' }, this.togglLoginModal);
        } else {
            removeAuthToken();
            Notify.error(message);
        }
    };

    private onLogoutClick = () => {
        this.props.logout();
    };

    render() {
        const { loginModalOpen, username, password } = this.state;

        const loginModal = (
            <Modal
                headerText='Login'
                isShow={loginModalOpen}
                okBtnText='Submit'
                onOkClick={this.onLoginClick}
                onCancelClick={this.togglLoginModal}
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

        const app = (
            <div className='app'>
                <Header {...this.props} authToken={this.props.authToken} onLogoutClick={this.onLogoutClick} toggleLoginModal={this.togglLoginModal} />
                <div className='app-body'>
                    <Sidebar {...this.props} />
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
            </>
        );
    }
}

const mapStateToProps = (state: any) => {
    return {
        authToken: getAuthToken(state)
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        login: LoginDispatcher(dispatch),
        logout: LogoutDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
