import * as React from 'react';

import FileApi from 'api/file';

export interface ImageProps {
    filename: string;
}

export interface ImageState {
    source: any;
}

export default class Image extends React.Component<ImageProps, ImageState> {

    constructor(props: ImageProps) {
        super(props);
        this.state = {
            source: null
        };
        this.refresh();
    }

    componentDidUpdate(previousProps: ImageProps) {
        if (previousProps.filename !== this.props.filename) {
            this.refresh();
        }
    }

    private refresh = async () => {
        const { filename } = this.props;
        if (filename) {
            const base64 = await FileApi.image(this.props.filename);
            this.setState({ source: 'data:;base64,' + base64 });
        }
    };

    render() {
        return (
            <img style={{ width: '100%' }} src={this.state.source} />
        );
    }
}
