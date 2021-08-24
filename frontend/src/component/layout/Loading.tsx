import * as React from 'react';
import { black } from 'util/AppUtil';

export interface LoadingProps { }

export interface LoadingState { }

export default class Loading extends React.Component<LoadingProps, LoadingState> {

    constructor(props: LoadingProps) {
        super(props);
        this.state = {};
    }

    render(): JSX.Element {
        return (
            <div className='loading-overlay'>
                <div className='spinner-border' style={{ width: '5rem', height: '5rem' }} color={black(0.7)} role='status'>
                    <span className='sr-only'>Loading...</span>
                </div>
            </div>
        );
    }
}
