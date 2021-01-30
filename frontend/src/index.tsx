// react
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// components
import App from 'App';
import Page404 from 'view/Page404';
import Page500 from 'view/Page500';

// reducer
import store, { validateToken } from 'reducer/Store';

// apis

// utils

// css
import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import 'react-toastify/dist/ReactToastify.css';
import 'assets/scss/style.scss';

// images

// validate token on refresh
store.dispatch(validateToken);

const ROOT = document.querySelector('#root');
const app = (
    <Provider store={store}>
        <Router>
            <Switch>
                <Route exact path='/404' name='Page 404' component={Page404} />
                <Route exact path='/500' name='Page 500' component={Page500} />
                <Route path='/' name='Home' component={App} />
            </Switch>
        </Router>
        <ToastContainer />
    </Provider>
);
ReactDOM.render(app, ROOT);
