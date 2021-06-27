import * as React from 'react';

export interface LoadingProps { }

export interface LoadingState { }

export default class Loading extends React.Component<LoadingProps, LoadingState> {

    constructor(props: LoadingProps) {
        super(props);
        this.state = {};
    }

    render(): JSX.Element {
        return (
            <div className='spinner-border' role='status'>
                <span className='sr-only'>Loading...</span>
            </div>
        );
    }
}
