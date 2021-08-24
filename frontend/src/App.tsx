import * as React from 'react';
import { Dispatch } from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Route, Redirect, Switch, RouteChildrenProps } from 'react-router-dom';

import { LogoutDispatcher } from 'reducer/PropsMapper';
import { getAuthToken, getAuthTokenString, isLoading, ReduxState } from 'reducer/Selector';

import Breadcrumb from 'component/layout/Breadcrumb';
import Footer from 'component/layout/Footer';
import Header from 'component/layout/Header';
import Loading from 'component/layout/Loading';
import { APP_ROUTES } from 'component/layout/RouteSetting';
import Sidebar from 'component/layout/Sidebar';

import { AuthToken } from 'api/auth';

import { Action } from 'util/Interface';

export interface AppProps extends RouteChildrenProps<any> {
    authToken?: AuthToken;
    authTokenString?: string;
    loading: boolean;
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
        const { loading } = this.props;
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
                                        return <Route key={`route-${idx}-${route.path}`} path={route.path} component={route.component} />;
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
        return (
            <>
                {app}
                {loading && <Loading />}
            </>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        authToken: getAuthToken(state),
        authTokenString: getAuthTokenString(state),
        loading: isLoading(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<undefined>>) => {
    return {
        logout: LogoutDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
