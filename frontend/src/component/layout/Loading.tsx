import * as React from 'react';

export interface LoadingProps {
    text: string;
}

export interface LoadingState { }

export default class Loading extends React.Component<LoadingProps, LoadingState> {

    public static defaultProps: Partial<LoadingProps> = {
        text: 'Loading...'
    };

    constructor(props: LoadingProps) {
        super(props);
        this.state = {};
    }

    render(): JSX.Element {
        const { text } = this.props;
        return (
            <div className='loading-overlay'>
                <div className='spinner-border' role='status'>
                    <span className='sr-only'>{text}</span>
                </div>
                <h2 className='ml-2'>{text}</h2>
            </div>
        );
    }
}
