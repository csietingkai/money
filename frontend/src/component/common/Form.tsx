import * as React from 'react';
import { Col, Form as RbForm, Row } from 'react-bootstrap';
import * as moment from 'moment';

import { getValueByKeys, toNumber } from 'util/AppUtil';
import { DivWidth, InputType } from 'util/Enum';
import { Record } from 'util/Interface';

interface BaseInput {
    key: string,
    title: string,
    width?: DivWidth; // default 2
    type?: InputType; // default text
    required?: boolean;
    disabled?: boolean;
    note?: string;
}

export interface TextInput extends BaseInput {
    type?: InputType.text | InputType.email | InputType.password;
    value: string;
    placeholder?: string;
}

export interface NumericInput extends BaseInput {
    type: InputType.numeric;
    value: number;
    step?: number;
    max?: number;
    min?: number;
}

export interface TextareaInput extends BaseInput {
    type: InputType.textarea;
    value: string;
    placeholder?: string;
    lineCnt?: number;
}

export interface SelectInput extends BaseInput {
    type: InputType.select;
    value: string;
    options: Record<string, string>[];
}

export interface RadioInput extends BaseInput {
    type: InputType.radio;
    value: string;
    options: Record<string, string>[];
    inline?: boolean;
}

export interface CheckboxInput extends BaseInput {
    type: InputType.checkbox;
    value: any;
    options: Record<string, string>[];
    inline?: boolean;
}

export interface FileInput extends BaseInput {
    type: InputType.file;
    value: any;
}

export interface DateInput extends BaseInput {
    type: InputType.date;
    value: Date;
}

export interface DateTimeInput extends BaseInput {
    type: InputType.datetime;
    value: Date;
}

export type Input = TextInput | NumericInput | TextareaInput | SelectInput | RadioInput | CheckboxInput | FileInput | DateInput | DateTimeInput;

export interface FormProps {
    singleRow?: boolean;
    formKey: string;
    inputs: Input[];
    onChange: (formState: any, key: string) => void;
}

export interface FormState {
}

export default class Form extends React.Component<FormProps, FormState> {

    formRef = React.createRef<HTMLFormElement>();

    public static defaultProps: Partial<FormProps> = {
        singleRow: false
    };

    constructor(props: FormProps) {
        super(props);
        this.state = {};
    }

    private onFormChange = (key: string) => (event: any) => {
        const { formRef } = this;
        const form = this.getFormValues(this.props.inputs);
        const input = formRef.current.querySelector(`#form-${key}`);
        if (input) {
            form[key] = getValueByKeys(event, 'target', 'value');
            this.props.onChange(form, key);
        }
    };

    private onFormNumericChange = (key: string) => (event: React.FormEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { formRef } = this;
        const form = this.getFormValues(this.props.inputs);
        const input = formRef.current.querySelector(`#form-${key}`);
        if (input) {
            const value = toNumber(getValueByKeys(event, 'target', 'value'));
            form[key] = value;
            this.props.onChange(form, key);
        }
    };

    private onFormRadioChange = (key: string) => (selection: string) => () => {
        const { formRef } = this;
        const form = this.getFormValues(this.props.inputs);
        const input = formRef.current.querySelector(`#form-${key}-${selection}`);
        if (input) {
            form[key] = selection;
            this.props.onChange(form, key);
        }
    };

    private onFormCheckChange = (key: string) => (selection: string) => (event: React.FormEvent<HTMLInputElement>) => {
        const { formRef } = this;
        const form = this.getFormValues(this.props.inputs);
        const input = formRef.current.querySelector(`#form-${key}-${selection}`);
        if (input) {
            form[key] = form[key] ? form[key] : {};
            form[key][selection] = getValueByKeys(event, 'target', 'checked');
            this.props.onChange(form, key);
        }
    };

    private onFileChange = (key: string) => () => {
        const { formRef } = this;
        const form = this.getFormValues(this.props.inputs);
        const input = formRef.current.querySelector(`#form-${key}`);
        if (input) {
            const fileList = getValueByKeys(input, 'files');
            if (fileList.length) {
                form[key] = fileList[0];
            } else {
                form[key] = '';
            }
            this.props.onChange(form, key);
        }
    };

    private onDateChange = (key: string) => (event: any) => {
        const { formRef } = this;
        const form = this.getFormValues(this.props.inputs);
        const input = formRef.current.querySelector(`#form-${key}-date`);
        if (input) {
            const dateStr = getValueByKeys(event, 'target', 'value');
            const selectDate = new Date(dateStr);
            const date: Date = form[key];
            date.setFullYear(selectDate.getFullYear());
            date.setMonth(selectDate.getMonth());
            date.setDate(selectDate.getDate());
            form[key] = date;
            this.props.onChange(form, key);
        }
    };

    private onTimeChange = (key: string) => (event: any) => {
        const { formRef } = this;
        const form = this.getFormValues(this.props.inputs);
        const input = formRef.current.querySelector(`#form-${key}-time`);
        if (input) {
            const timeStrs: string[] = getValueByKeys(event, 'target', 'value').split(':');
            const date: Date = form[key];
            date.setHours(toNumber(timeStrs[0]), toNumber(timeStrs[1]), toNumber(timeStrs[2]));
            form[key] = date;
            this.props.onChange(form, key);
        }
    };

    private getFormValues = (inputs: Input[]): { [key: string]: any; } => {
        return inputs.reduce((acc: any, curr: Input) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
    };

    render(): JSX.Element {
        const { singleRow, formKey, inputs } = this.props;
        const formGroups = inputs.map((input: Input) => {
            const { key, title, value, required, disabled, note } = input;
            let { type, width } = input;
            width = input.width || 2;
            type = input.type || InputType.text;
            const onFormChange = this.onFormChange(key);
            const onFormNumericChange = this.onFormNumericChange(key);
            const onFormRadioChange = this.onFormRadioChange(key);
            const onFormCheckChange = this.onFormCheckChange(key);
            const onFileChange = this.onFileChange(key);
            const onDateChange = this.onDateChange(key);
            const onTimeChange = this.onTimeChange(key);
            let inputElement: JSX.Element = null;
            if (type === InputType.numeric) {
                const numericInput: NumericInput = input as NumericInput;
                const step = numericInput.step || 1;
                const max = numericInput.max || 1000000;
                const min = numericInput.min || -1000000;
                inputElement = (
                    <RbForm.Control
                        id={`form-${key}`}
                        type='number'
                        step={step}
                        max={max}
                        min={min}
                        value={value}
                        disabled={disabled}
                        onChange={onFormNumericChange}
                    />
                );
            } else if (type === InputType.textarea) {
                const textareaInput: TextareaInput = input as TextareaInput;
                const placeholder = textareaInput.placeholder || '';
                const rowSize = textareaInput.lineCnt || 10;
                inputElement = (
                    <RbForm.Control
                        id={`form-${key}`}
                        as='textarea'
                        placeholder={placeholder}
                        rows={rowSize}
                        value={value}
                        onChange={onFormChange}
                        disabled={disabled}
                    />
                );
            } else if (type === InputType.select) {
                const selectInput: SelectInput = input as SelectInput;
                const options: Record<string, string>[] = selectInput.options;
                inputElement = (
                    <RbForm.Control
                        id={`form-${key}`}
                        as='select'
                        value={value}
                        onChange={onFormChange}
                        disabled={disabled}
                    >
                        {
                            options.map((record: Record<string, string>) =>
                                <option
                                    key={`select-${key}-${record.key}`}
                                    value={record.key}
                                >
                                    {record.value}
                                </option>
                            )
                        }
                    </RbForm.Control>
                );
            } else if (type === InputType.radio) {
                const radioInput: RadioInput = input as RadioInput;
                const options: Record<string, string>[] = radioInput.options;
                const inline: boolean = radioInput.inline;
                inputElement = (
                    <RbForm.Group
                        id={`form-${key}`}
                        className='radio'
                    >
                        {
                            options.map((record: Record<string, string>) =>
                                <RbForm.Check
                                    id={`form-${key}-${record.key}`}
                                    key={`form-${key}-${record.key}`}
                                    className='form-check-label'
                                    type='radio'
                                    name={`radio-${key}`}
                                    label={record.value}
                                    inline={inline}
                                    checked={value === record.key}
                                    onChange={onFormRadioChange(record.key)}
                                    disabled={disabled}
                                />
                            )
                        }
                    </RbForm.Group>
                );
            } else if (type === InputType.checkbox) {
                const checkboxInput: CheckboxInput = input as CheckboxInput;
                const options: Record<string, string>[] = checkboxInput.options;
                const inline: boolean = checkboxInput.inline;
                inputElement = (
                    <RbForm.Group
                        id={`form-${key}`}
                        className='checkbox'
                    >
                        {
                            options.map((record: Record<string, string>) =>
                                <RbForm.Check
                                    id={`form-${key}-${record.key}`}
                                    key={`form-${key}-${record.key}`}
                                    type='checkbox'
                                    label={record.value}
                                    inline={inline}
                                    name={`checkbox-${key}`}
                                    checked={!!value[record.key]}
                                    onChange={onFormCheckChange(record.key)}
                                    disabled={disabled}
                                />
                            )
                        }
                    </RbForm.Group>
                );
            } else if (type === InputType.file) {
                inputElement = (
                    <RbForm.File
                        id={`form-${key}`}
                        label={value ? value.name : 'Select Your File'}
                        onChange={onFileChange}
                        disabled={disabled}
                        custom
                    />
                );
            } else if (type === InputType.date) {
                inputElement = (
                    <Row>
                        <Col>
                            <RbForm.Control
                                id={`form-${key}-date`}
                                type='date'
                                value={moment(value).format('YYYY-MM-DD')}
                                disabled={disabled}
                                onChange={onDateChange}
                            />
                        </Col>
                    </Row>
                );
            } else if (type === InputType.datetime) {
                inputElement = (
                    <Row>
                        <Col>
                            <RbForm.Control
                                id={`form-${key}-date`}
                                type='date'
                                value={moment(value).format('YYYY-MM-DD')}
                                disabled={disabled}
                                onChange={onDateChange}
                            />
                        </Col>
                        <Col>
                            <RbForm.Control
                                id={`form-${key}-time`}
                                type='time'
                                value={moment(value).format('HH:mm:ss')}
                                disabled={disabled}
                                onChange={onTimeChange}
                            />
                        </Col>
                    </Row>
                );
            } else {
                const textInput: TextInput = input as TextInput;
                const placeholder = textInput.placeholder || '';
                inputElement = (
                    <RbForm.Control
                        id={`form-${key}`}
                        type={type}
                        placeholder={placeholder}
                        value={value}
                        onChange={onFormChange}
                        disabled={disabled}
                    />
                );
            }
            return (
                <RbForm.Group as={singleRow ? Row : undefined} key={`formInput${key}`}>
                    <Col md={width}>
                        <RbForm.Label>{required ? <span style={{ color: 'red' }}>* </span> : null}{title}</RbForm.Label>
                    </Col>
                    <Col xs={12 - (note ? 4 : 0)} md={12 - width - (note ? 2 : 0)}>
                        {inputElement}
                    </Col>
                    {
                        note &&
                        <Col xs={4} md={2}> {note}</Col>
                    }
                </RbForm.Group >
            );
        });

        return (
            <RbForm className='form-horizontal' id={formKey} key={formKey} ref={this.formRef}>
                {formGroups}
            </RbForm >
        );
    }
}
