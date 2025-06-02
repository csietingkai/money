import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { CSpinner } from '@coreui/react';
import { ReduxState, getLang, getMessages, isLoading } from './reducer/Selector';
import * as StateHolder from './reducer/StateHolder';
import AppLoading from './components/AppLoading';
import AppNotify from './components/AppNotify';
import { Lang } from './util/Interface';
import './scss/style.scss';

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/Login'));
const Page404 = React.lazy(() => import('./views/Page404'));
const Page500 = React.lazy(() => import('./views/Page500'));

export interface AppProps {
    isLoading: boolean;
    locale: Lang;
    messages: Record<string, string>
}

export interface AppState { }

class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        const { isLoading, locale, messages } = this.props;
        return (
            <IntlProvider
                locale={locale}
                messages={messages}
            >
                <HashRouter>
                    <Suspense
                        fallback={
                            <div className='pt-3 text-center'>
                                <CSpinner color='primary' variant='grow' />
                            </div>
                        }
                    >
                        <Routes>
                            <Route path='/login' element={<Login lang={StateHolder.getLang()} />} />
                            <Route path='/404' element={<Page404 />} />
                            <Route path='/500' element={<Page500 />} />
                            <Route path='*' element={<DefaultLayout />} />
                        </Routes>
                    </Suspense>
                </HashRouter>
                {isLoading && <AppLoading />}
                <AppNotify />
            </IntlProvider>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        isLoading: isLoading(state),
        lang: getLang(state),
        messages: getMessages(state)
    };
};

export default connect(mapStateToProps)(App);
