import React from 'react';
import { connect } from 'react-redux';
import { CToast, CToastBody, CToastClose, CToaster } from '@coreui/react';
import { ReduxState, getNotifications } from '../reducer/Selector';
import { Notification } from '../util/Interface';

export interface AppNotifyProps {
    notifications: Notification[];
}

export interface AppNotifyState { }

class AppNotify extends React.Component<AppNotifyProps, AppNotifyState> {

    render(): React.ReactNode {
        const { notifications } = this.props;
        let noti = <React.Fragment></React.Fragment>;
        if (notifications.length) {
            noti = (
                <CToast color='secondary' className='text-white align-items-center'>
                    <div className='d-flex'>
                        <CToastBody>{notifications[notifications.length - 1].message}</CToastBody>
                        <CToastClose className='me-2 m-auto' />
                    </div>
                </CToast>
            );
        }
        return (
            <CToaster className='p-3' placement='bottom-end' push={noti} />
        );
    }
}


const mapStateToProps = (state: ReduxState) => {
    return {
        notifications: getNotifications(state)
    };
};

export default connect(mapStateToProps)(AppNotify);
