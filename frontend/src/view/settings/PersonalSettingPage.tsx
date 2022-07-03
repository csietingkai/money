import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Row } from 'react-bootstrap';

import Card from 'component/common/Card';
import { ExclamationTriangleIcon, ShieldAltIcon, TwFlag, UsFlag } from 'component/common/Icons';

import {
    SetAccountRecordDeletableDispatcher, SetExchangeRateDefaultForeignerCurrencyDispatcher, SetDefaultRecordTypeDispatcher, SetDefaultRoleDispatcher,
    SetPredictDaysDispatcher, SetStockStyleDispatcher
} from 'reducer/PropsMapper';
import {
    getDefaultRecordType, getDefaultRole, getExchangeRateDefaultForeignerCurrency, getExchangeRateList, getPredictDays, getRecordTypes, getRoles,
    getStockStyle, isAccountRecordDeletable, ReduxState
} from 'reducer/Selector';

import { ExchangeRateVo } from 'api/exchangeRate';

import { StockStyle } from 'util/Enum';
import { Action, Record } from 'util/Interface';
import { getValueByKeys } from 'util/AppUtil';

export interface PersonalSettingPageProps {
    stockStyle: StockStyle;
    predictDays: number;
    accountRecordDeletable: boolean;
    roles: string[];
    DEFAULT_ROLE: string;
    recordTypes: string[];
    DEFAULT_RECORD_TYPES: string;
    exchangeRateList: ExchangeRateVo[];
    DEFAULT_FOREIGNER_CURRENCY: string;
    setStockStyle: (style: StockStyle) => void;
    setPredictDays: (days: number) => void;
    setAccountRecordDeletable: (deletable: boolean) => void;
    setDefaultMarketType: (defaultMarketType: string) => void;
    setDefaultRole: (defaultRole: string) => void;
    setDefaultRecordType: (defaultRecordType: string) => void;
    setDefaultForeignerCurrency: (defaultForeignerCurrency: string) => void;
}

export interface PersonalSettingPageState { }

class PersonalSettingPage extends React.Component<PersonalSettingPageProps, PersonalSettingPageState> {

    constructor(props: PersonalSettingPageProps) {
        super(props);
        this.state = {};
    }

    private getStockStyleOptions = (): Record<string, JSX.Element>[] => {
        return [
            { key: StockStyle.US, value: <>{UsFlag()} US Style</> },
            { key: StockStyle.TW, value: <>{TwFlag()} Taiwan Style</> }
        ];
    };

    private onStockStyleChange = (selection: string) => () => {
        this.props.setStockStyle(selection as StockStyle);
    };

    private onPredictDaysChange = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const days = getValueByKeys(event, 'target', 'value');
        this.props.setPredictDays(days);
    };

    private getAccountRecordDeletableOptions = (): Record<boolean, JSX.Element>[] => {
        return [
            { key: true, value: <span className='text-danger'>{ExclamationTriangleIcon()} YES</span> },
            { key: false, value: <span className='text-info'>{ShieldAltIcon()} NO</span> }
        ];
    };

    private onAccountRecordDeletableChange = (selection: boolean) => () => {
        this.props.setAccountRecordDeletable(selection);
    };

    private getRoleOptions = (): Record<string, string>[] => {
        const { roles } = this.props;
        return roles.map(x => ({ key: x, value: x }));
    };

    private onRoleChange = (event: any) => {
        const role = getValueByKeys(event, 'target', 'value');
        this.props.setDefaultRole(role);
    };

    private getRecordTypeOptions = (): Record<string, string>[] => {
        const { recordTypes } = this.props;
        return recordTypes.map(x => ({ key: x, value: x }));
    };

    private onRecordTypeChange = (event: any) => {
        const recordType = getValueByKeys(event, 'target', 'value');
        this.props.setDefaultRecordType(recordType);
    };

    private getCurrencyOptions = (): Record<string, string>[] => {
        const { exchangeRateList } = this.props;
        return exchangeRateList.map(x => ({ key: x.currency, value: x.name }));
    };

    private onDefaultForeignerCurrencyChange = (event: any) => {
        const defaultForeignerCurrency = getValueByKeys(event, 'target', 'value');
        this.props.setDefaultForeignerCurrency(defaultForeignerCurrency);
    };

    render(): JSX.Element {
        const { stockStyle, predictDays, accountRecordDeletable, DEFAULT_ROLE, DEFAULT_RECORD_TYPES, DEFAULT_FOREIGNER_CURRENCY } = this.props;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col md={4} sm={6} xs={12}>
                        <Card
                            title={'Stock Style'}
                        >
                            <Form>
                                <Row>
                                    {
                                        this.getStockStyleOptions().map(option => {
                                            return (
                                                <Col
                                                    key={`radio-stockStyle-${option.key}`}
                                                    md={6}
                                                    xs={12}
                                                >
                                                    <Form.Check
                                                        inline
                                                        label={option.value}
                                                        name='stockStyle'
                                                        type='radio'
                                                        className='md-3'
                                                        id={`radio-stockStyle-${option.key}`}
                                                    >
                                                        <Form.Check.Input
                                                            type='radio'
                                                            name='stockStyle'
                                                            checked={option.key === stockStyle}
                                                            onChange={this.onStockStyleChange(option.key)}
                                                            style={{ width: '16px', height: '16px' }}
                                                        />
                                                        <Form.Check.Label
                                                            style={{ fontSize: '16px' }}
                                                        >
                                                            {option.value}
                                                        </Form.Check.Label>
                                                    </Form.Check>
                                                </Col>
                                            );
                                        })
                                    }
                                </Row>
                            </Form>
                        </Card>
                    </Col>
                    <Col md={4} sm={6} xs={12}>
                        <Card
                            title={'Preidct Config'}
                        >
                            <Form>
                                <Form.Group as={Row}>
                                    <Col md={4}>
                                        <Form.Label>Predict Days</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type='number'
                                            step={1}
                                            max={100}
                                            min={1}
                                            value={predictDays}
                                            onChange={this.onPredictDaysChange}
                                        />
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Card>
                    </Col>
                    <Col md={4} sm={6} xs={12}>
                        <Card
                            title={'Account Record Deletable'}
                        >
                            <Form>
                                <Row>
                                    {
                                        this.getAccountRecordDeletableOptions().map(option => {
                                            return (
                                                <Col
                                                    key={`radio-deletable-${option.key}`}
                                                    md={6}
                                                    xs={12}
                                                >
                                                    <Form.Check
                                                        inline
                                                        label={option.key}
                                                        name='stockStyle'
                                                        type='radio'
                                                        className='md-3'
                                                        id={`radio-deletable-${option.key}`}
                                                    >
                                                        <Form.Check.Input
                                                            type='radio'
                                                            name='deletable'
                                                            checked={option.key === accountRecordDeletable}
                                                            onChange={this.onAccountRecordDeletableChange(option.key)}
                                                            style={{ width: '16px', height: '16px' }}
                                                        />
                                                        <Form.Check.Label
                                                            style={{ fontSize: '16px' }}
                                                        >
                                                            {option.value}
                                                        </Form.Check.Label>
                                                    </Form.Check>
                                                </Col>
                                            );
                                        })
                                    }
                                </Row>
                            </Form>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col md={4} sm={6} xs={12}>
                        <Card
                            title={'Default Selections'}
                        >
                            <Form>
                                <Form.Group as={Row}>
                                    <Col md={5}>
                                        <Form.Label>Default Role</Form.Label>
                                    </Col>
                                    <Col xs={12} md={7}>
                                        <Form.Control
                                            as='select'
                                            value={DEFAULT_ROLE}
                                            onChange={this.onRoleChange}
                                        >
                                            {
                                                this.getRoleOptions().map((record: Record<string, string>) =>
                                                    <option
                                                        key={`select-role-option-${record.key}`}
                                                        value={record.key}
                                                    >
                                                        {record.value}
                                                    </option>
                                                )
                                            }
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Col md={5}>
                                        <Form.Label>Default Record Type</Form.Label>
                                    </Col>
                                    <Col xs={12} md={7}>
                                        <Form.Control
                                            as='select'
                                            value={DEFAULT_RECORD_TYPES}
                                            onChange={this.onRecordTypeChange}
                                        >
                                            {
                                                this.getRecordTypeOptions().map((record: Record<string, string>) =>
                                                    <option
                                                        key={`select-record-type-option-${record.key}`}
                                                        value={record.key}
                                                    >
                                                        {record.value}
                                                    </option>
                                                )
                                            }
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Col md={5}>
                                        <Form.Label>Default Foreigner Currency</Form.Label>
                                    </Col>
                                    <Col xs={12} md={7}>
                                        <Form.Control
                                            as='select'
                                            value={DEFAULT_FOREIGNER_CURRENCY}
                                            onChange={this.onDefaultForeignerCurrencyChange}
                                        >
                                            {
                                                this.getCurrencyOptions().map((record: Record<string, string>) =>
                                                    <option
                                                        key={`select-default-currency-option-${record.key}`}
                                                        value={record.key}
                                                    >
                                                        {record.value}
                                                    </option>
                                                )
                                            }
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        stockStyle: getStockStyle(state),
        predictDays: getPredictDays(state),
        accountRecordDeletable: isAccountRecordDeletable(state),
        roles: getRoles(state),
        DEFAULT_ROLE: getDefaultRole(state),
        recordTypes: getRecordTypes(state),
        DEFAULT_RECORD_TYPES: getDefaultRecordType(state),
        exchangeRateList: getExchangeRateList(state, false),
        DEFAULT_FOREIGNER_CURRENCY: getExchangeRateDefaultForeignerCurrency(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<StockStyle | number | boolean | string>>) => {
    return {
        setStockStyle: SetStockStyleDispatcher(dispatch),
        setPredictDays: SetPredictDaysDispatcher(dispatch),
        setAccountRecordDeletable: SetAccountRecordDeletableDispatcher(dispatch),
        setDefaultRole: SetDefaultRoleDispatcher(dispatch),
        setDefaultRecordType: SetDefaultRecordTypeDispatcher(dispatch),
        setDefaultForeignerCurrency: SetExchangeRateDefaultForeignerCurrencyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PersonalSettingPage);
