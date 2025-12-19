import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import 'core-js';
import App from './App';
import { API_URL } from './api/Constant';
import store, { validateToken } from './reducer/Store';
import { SetLoading } from './reducer/Action';
import * as Selector from './reducer/Selector';
import * as StateHolder from './reducer/StateHolder';

axios.defaults.baseURL = API_URL;
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        store.dispatch(SetLoading(false));
        const { status } = error.response.data;
        if (status === 403) {
            // Notify.warning('Maybe You Need to Login First.');
            window.location.assign('/#/login');
        } else if (status === 404) {
            window.location.assign('/#/404');
        } else if (status === 500) {
            window.location.assign('/#/500');
        }
        throw error;
    }
);

validateToken(store.dispatch, store.getState);

createRoot(document.getElementById('root') as Element).render(
    <Provider store={store}>
        <App locale={Selector.getLang(store.getState()) || StateHolder.getLang()} />
    </Provider>
);
