import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Card from 'component/common/Card';
import Form, { Input } from 'component/common/Form';

import { Record } from 'util/Interface';
import { isNull } from 'util/AppUtil';
import { InputType } from 'util/Enum';

export interface FormExampleProps { }

export interface FormExampleState {
    values: any;
}

const selectRecords: Record<string, string>[] = [
    { key: '1', value: 'option1' },
    { key: '2', value: 'option2' },
    { key: '3', value: 'option3' }
];

const radioRecords: Record<string, string>[] = [
    { key: '1', value: 'option1' },
    { key: '2', value: 'option2' },
    { key: '3', value: 'option3' }
];

const checkboxRecords: Record<string, string>[] = [
    { key: 'a', value: 'option1' },
    { key: 'b', value: 'option2' },
    { key: 'c', value: 'option3' }
];

class FormExample extends React.Component<FormExampleProps, FormExampleState> {

    constructor(props: FormExampleProps) {
        super(props);
        this.state = {
            values: {}
        };
    }

    render() {
        const { values } = this.state;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col xs={12} sm={12}>
                        <Card
                            title='Example Form'
                        >
                            <Form
                                singleRow
                                inputs={[
                                    { key: 'text', title: 'Text Input', type: InputType.text },
                                    { key: 'email', title: 'Email Input', type: InputType.email },
                                    { key: 'password', title: 'Password', type: InputType.password, helpText: 'Please enter a complex password' },
                                    { key: 'textarea', title: 'Textarea', type: InputType.textarea },
                                    { key: 'select', title: 'Select', type: InputType.select, options: selectRecords },
                                    { key: 'radio', title: 'Radios', type: InputType.radio, options: radioRecords },
                                    { key: 'checkbox', title: 'Checkboxes', type: InputType.checkbox, options: checkboxRecords },
                                    { key: 'file', title: 'File input', type: InputType.file }
                                ].map(x => {
                                    const input: Input = { ...x, value: values[x.key] } as Input;
                                    if (input.type === 'checkbox' && isNull(input.value)) {
                                        input.value = {};
                                    } else if (isNull(input.value)) {
                                        input.value = '';
                                    }
                                    return input;
                                })}
                                onChange={(formState: any) => { this.setState({ values: { ...formState } }); }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = () => {
    return {};
};

export default connect(mapStateToProps)(FormExample);;
