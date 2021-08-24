// node-modules
import axios from 'axios';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// components
import App from 'App';
import LoginPage from 'view/LoginPage';
import Page404 from 'view/Page404';
import Page500 from 'view/Page500';
import RegisterPage from 'view/RegisterPage';

// reducer
import { SetLoading } from 'reducer/Action';
import { getAuthToken } from 'reducer/StateHolder';
import store, { fetchAccountList, fetchExchangeRateList, fetchFundTrackingList, fetchStockTrackingList, validateToken } from 'reducer/Store';

// apis
import { API_URL } from 'api/Constant';

// utils
import { handleRequestDate } from 'util/AppUtil';

// css
import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import 'flag-icon-css/css/flag-icon.min.css';
import 'react-toastify/dist/ReactToastify.css';
import 'assets/scss/style.scss';

// images

axios.defaults.baseURL = API_URL;
axios.defaults.headers = { 'X-Auth-Token': getAuthToken()?.tokenString };
axios.interceptors.request.use(
    (config) => {
        // system loading = true
        SetLoading(true);
        // transform date format
        config.headers = { ...config.headers, 'Content-Type': 'application/json;charset=utf-8' };
        config.transformRequest = [].concat((data: any) => {
            data = handleRequestDate(data);
            return JSON.stringify(data);
        });
        return config;
    }
);
axios.interceptors.response.use(
    (response) => {
        // system loading = false
        SetLoading(false);
        return response;
    },
    (error) => {
        const { status } = error.response.data;
        if (status === 403) {
            // Notify.warning('Maybe You Need to Login First.');
            window.location.replace('/#/login');
        } else if (status === 404) {
            window.location.replace('/#/404');
        } else if (status === 500) {
            window.location.replace('/#/500');
        }
        throw error;
    }
);

// validate token on refresh
store.dispatch(validateToken);
// get exchange rate list on refresh
store.dispatch(fetchExchangeRateList);
// get user's accounts
store.dispatch(fetchAccountList);
// get user's stock tracking list
store.dispatch(fetchStockTrackingList);
// get user's fund tracking list
store.dispatch(fetchFundTrackingList);

const ROOT = document.querySelector('#root');
const app = (
    <Provider store={store}>
        <Router>
            <Switch>
                <Route exact path='/login' component={LoginPage} />
                <Route exact path='/register' component={RegisterPage} />
                <Route exact path='/404' component={Page404} />
                <Route exact path='/500' component={Page500} />
                <Route path='/' component={App} />
            </Switch>
        </Router>
        <ToastContainer />
    </Provider>
);
ReactDOM.render(app, ROOT);
