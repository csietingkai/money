import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { CSpinner } from '@coreui/react';
import { ReduxState, isLoading } from './reducer/Selector';
import AppLoading from './components/AppLoading';
import AppNotify from './components/AppNotify';
import './scss/style.scss';

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/Login'));
const Page404 = React.lazy(() => import('./views/Page404'));
const Page500 = React.lazy(() => import('./views/Page500'));

export interface AppProps {
    isLoading: boolean;
}

export interface AppState { }

class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        const { isLoading } = this.props;
        return (
            <React.Fragment>
                <HashRouter>
                    <Suspense
                        fallback={
                            <div className='pt-3 text-center'>
                                <CSpinner color='primary' variant='grow' />
                            </div>
                        }
                    >
                        <Routes>
                            <Route path='/login' element={<Login />} />
                            <Route path='/404' element={<Page404 />} />
                            <Route path='/500' element={<Page500 />} />
                            <Route path='*' element={<DefaultLayout />} />
                        </Routes>
                    </Suspense>
                </HashRouter>
                {isLoading && <AppLoading />}
                <AppNotify />
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        isLoading: isLoading(state)
    };
};

export default connect(mapStateToProps)(App);
