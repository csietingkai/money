import React from 'react';
import AppContent from '../components/AppContent';
import AppFooter from '../components/AppFooter';
import AppHeader from '../components/AppHeader';
import AppSidebar from '../components/AppSidebar';

export interface DefaultLayoutProps { }

export interface DefaultLayoutState { }

export default class DefaultLayout extends React.Component<DefaultLayoutProps, DefaultLayoutState> {
    render(): React.ReactNode {

        return (
            <div>
                <AppSidebar />
                <div className='wrapper d-flex flex-column min-vh-100'>
                    <AppHeader />
                    <div className='body flex-grow-1'>
                        <AppContent />
                    </div>
                    <AppFooter />
                </div>
            </div>
        );
    }
}
