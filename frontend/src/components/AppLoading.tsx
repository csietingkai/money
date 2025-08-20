import * as React from 'react';

export interface AppLoadingProps { }

export interface AppLoadingState { }

export default class AppLoading extends React.Component<AppLoadingProps, AppLoadingState> {

    constructor(props: AppLoadingProps) {
        super(props);
        this.state = {};
    }

    render(): React.ReactElement {
        return (
            <div className='loading-overlay'>
                <div className='spinner-border' style={{ width: '5rem', height: '5rem' }} role='status' />
            </div>
        );
    }
}
