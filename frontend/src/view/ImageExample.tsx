import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form, { Input } from 'component/common/Form';
import Image from 'component/common/Image';

import FileApi, { FileUploadResponse } from 'api/file';

import { isNull } from 'util/AppUtil';
import { InputType } from 'util/Enum';
import Notify from 'util/Notify';

export interface ImageExampleProps { }

export interface ImageExampleState {
    file: any;
    filename: string;
}

class ImageExample extends React.Component<ImageExampleProps, ImageExampleState> {

    constructor(props: ImageExampleProps) {
        super(props);
        this.state = {
            file: null,
            filename: ''
        };
    }

    private upload = async () => {
        if (this.state.file) {
            const response: FileUploadResponse = await FileApi.upload(this.state.file);
            const { success, message } = response;
            if (success) {
                Notify.success(message);
                this.setState({ filename: this.state.file.name });
            }
        }
    };

    render() {
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col xs='12' sm='12' md='12'>
                        <Card
                            title='Upload Image'
                        >
                            <Form
                                singleRow
                                inputs={[
                                    { key: 'file', title: 'File input', type: InputType.file, accept: 'video' }
                                ].map(x => {
                                    const input: Input = { ...x, value: this.state.file } as Input;
                                    if (input.type === 'checkbox' && isNull(input.value)) {
                                        input.value = {};
                                    } else if (isNull(input.value)) {
                                        input.value = '';
                                    }
                                    return input;
                                })}
                                onChange={(formState: any) => { this.setState({ file: formState.file }); }}
                            />
                            <div className='form-actions'>
                                <Button variant='primary' onClick={this.upload}>Upload</Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' sm='12' md='12'>
                        <Card
                            title='Image Just Uploaded'
                        >
                            <Image filename={this.state.filename} />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: any) => {
    return {};
};

export default connect(mapStateToProps)(ImageExample);;
