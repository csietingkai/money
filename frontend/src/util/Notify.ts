// react
import { toast, ToastOptions } from 'react-toastify';

import { NOTIFICATION_DEFAULT_CONFIG } from 'util/Constant';

const info = (msg: string, options: ToastOptions = NOTIFICATION_DEFAULT_CONFIG): void => {
    toast.info(msg, options);
};

const success = (msg: string, options: ToastOptions = NOTIFICATION_DEFAULT_CONFIG): void => {
    toast.success(msg, options);
};

const warning = (msg: string, options: ToastOptions = NOTIFICATION_DEFAULT_CONFIG): void => {
    toast.warning(msg, options);
};

const error = (msg: string, options: ToastOptions = NOTIFICATION_DEFAULT_CONFIG): void => {
    toast.error(msg, options);
};

const dark = (msg: string, options: ToastOptions = NOTIFICATION_DEFAULT_CONFIG): void => {
    toast.dark(msg, options);
};

export default { info, success, warning, error, dark };
