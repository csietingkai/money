import React from 'react';
import { connect } from 'react-redux';
import { CFooter } from '@coreui/react';

export interface AppFooterProps { }

export interface AppFooterState { }

class AppFooter extends React.Component<AppFooterProps, AppFooterState> {
    render(): React.ReactNode {
        return (
            <CFooter className='px-4'>
                <div>
                    <a href='https://github.com/csietingkai/money' target='_blank' rel='noopener noreferrer'>
                        Tingkai Money App
                    </a>
                </div>
                <div className='ms-auto'>
                    <span className='me-1'>Powered by</span>
                    <a href='https://coreui.io/react' target='_blank' rel='noopener noreferrer'>
                        CoreUI
                    </a>
                </div>
            </CFooter>
        );
    }
}

export default connect()(AppFooter);
