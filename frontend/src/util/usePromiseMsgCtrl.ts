import * as React from 'react';
import useMsgCtrl from './useMsgCtrl';
import { render } from 'react-dom';

const usePromiseMsgCtrl = (confirmHandler: (arg0: any) => void, cancelHandler: (arg0: any) => void, closeHandler?: (arg0: any) => any): [
    { isShow: boolean; message: string; },
    (message?: string) => Promise<any>,
    () => void,
    () => void,
    () => void,
] => {
    const [confirmModal, openConfirmModal, closeConfirmModal] = useMsgCtrl({ isShow: false, message: '' });
    const confirmResolver = React.useRef<any>({});
    const openActionConfirm = React.useCallback((message?: string) => {
        return message
            ? new Promise<any>(function (this: { current: any; }, resolve: any, reject: any) {
                openConfirmModal(message);
                this.current = { resolve, reject };
            }.bind(confirmResolver))
            : Promise.resolve({});
    }, []);
    const handleConfirm = React.useCallback(() => {
        confirmHandler(confirmResolver.current);
        closeConfirmModal();
    }, [confirmHandler]);

    const handleCancel = React.useCallback(() => {
        cancelHandler(confirmResolver.current);
        closeConfirmModal();
    }, [cancelHandler]);

    const handleClose = React.useCallback(() => {
        closeHandler(confirmResolver.current);
        closeConfirmModal();
    }, []);
    return [confirmModal, openActionConfirm, handleConfirm, handleCancel, handleClose];
};

export default usePromiseMsgCtrl;

// usage
// const [confirmModal, openActionConfirm, handleConfirm, handleCancel] = usePromiseMsgCtrl(p => p.resolve({ closeAgain: 'Y', printFlag: 'Y' }), p => p.resolve({ closeAgain: 'Y', printFlag: 'N' }));
// const newQuery = await (message ? openActionConfirm(message) : {});
// render() {
//     // ...
//     <ConfirmModal
//         isOpen={confirmModal.isShow}
//         title='訊息'
//         closeIcon={true}
//         message={confirmModal.message}
//         handleConfirm={handleConfirm}
//         handleCancel={handleCancel}
//         handleClose={handleCancel}
//     />
//     // ...
// }
