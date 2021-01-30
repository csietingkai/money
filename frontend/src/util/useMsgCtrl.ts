import * as React from 'react';

const initial = { isShow: false, message: '' };
const useMsgCtrl = (defaultValue = initial): [
    { isShow: boolean; message: string; },
    (message?: string) => void,
    () => void
] => {
    const [state, setState] = React.useState(defaultValue);
    const openMessage = React.useCallback(message => setState(s => ({ isShow: true, message: typeof message === 'string' ? message : s.message })), []);
    const closeMessage = React.useCallback(() => setState(s => ({ ...s, isShow: false })), []);
    return [state, openMessage, closeMessage];
}
export default useMsgCtrl;