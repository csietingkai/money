import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormCheck, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react';
import { ReduxState, getAuthTokenId, getAuthTokenName, getRecordTypes, getUserSetting } from '../../reducer/Selector';
import { SetNotifyDispatcher, SetUserSettingDispatcher } from '../../reducer/PropsMapper';
import AuthApi, { UserSetting } from '../../api/auth';
import * as AppUtil from '../../util/AppUtil';
import { Action, Option } from '../../util/Interface';
import { StockType } from '../../util/Enum';

export interface SettingPageProps {
    userId: string;
    username: string;
    userSetting: UserSetting;
    recordTypeOptions: Option[];
    setUserSetting: (setting: UserSetting) => void;
    notify: (message: string) => void;
}

export interface SettingPageState {
    userForm: {
        username: string;
        userPwd: string;
        conmfirmPwd: string;
    };
    settingForm: {
        stockType: string;
        predictDays: number;
        stockFeeRate: number;
        fundFeeRate: number;
        accountRecordType: string;
        accountRecordDeletable: boolean;
    };
}

class SettingPage extends React.Component<SettingPageProps, SettingPageState> {

    constructor(props: SettingPageProps) {
        super(props);
        const { username, userSetting, recordTypeOptions } = props;
        this.state = {
            userForm: {
                username: username,
                userPwd: '',
                conmfirmPwd: ''
            },
            settingForm: {
                stockType: userSetting.stockType,
                predictDays: userSetting.predictDays,
                stockFeeRate: userSetting.stockFeeRate,
                fundFeeRate: userSetting.fundFeeRate,
                accountRecordType: userSetting.accountRecordType,
                accountRecordDeletable: userSetting.accountRecordDeletable
            }
        };
    }

    private updatePwd = async () => {
        const { userId, notify } = this.props;
        const { userForm } = this.state;
        if (userForm.userPwd !== userForm.conmfirmPwd) {
            notify('Please check field \'Confirm Password\' and \'New Password\' values are the same.');
            return;
        }
        const response = await AuthApi.changePwd(userId, userForm.userPwd);
        const { message } = response;
        notify(message);
        this.setState({ userForm: { ...userForm, userPwd: '', conmfirmPwd: '' } });
    };

    private updateUserSetting = async () => {
        const { userSetting, notify, setUserSetting } = this.props;
        const { settingForm } = this.state;
        const newSetting: UserSetting = {
            ...userSetting,
            stockType: settingForm.stockType as StockType,
            predictDays: settingForm.predictDays,
            stockFeeRate: settingForm.stockFeeRate,
            fundFeeRate: settingForm.fundFeeRate,
            accountRecordDeletable: settingForm.accountRecordDeletable,
            accountRecordType: settingForm.accountRecordType
        }
        const response = await AuthApi.updateUserSetting(newSetting);
        const { success, message } = response;
        notify(message);
        if (success) {
            setUserSetting(newSetting);
        }
    };

    private resetUserSetting = (part: 'invest' | 'account') => () => {
        const { userSetting, recordTypeOptions } = this.props;
        const { settingForm } = this.state;
        if (part === 'invest') {
            this.setState({
                settingForm: {
                    ...settingForm,
                    stockType: userSetting.stockType,
                    predictDays: userSetting.predictDays,
                    stockFeeRate: userSetting.stockFeeRate,
                    fundFeeRate: userSetting.fundFeeRate
                }
            });
        } else {
            this.setState({
                settingForm: {
                    ...settingForm,
                    accountRecordType: recordTypeOptions[0].key,
                    accountRecordDeletable: userSetting.accountRecordDeletable
                }
            });
        }
    };

    render(): React.ReactNode {
        const { recordTypeOptions } = this.props;
        const { userForm, settingForm } = this.state;
        return (
            <CRow>
                <CCol sm={6}>
                    <CCard className='mb-4'>
                        <CCardHeader>
                            <strong>Change User Info</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CForm>
                                <CRow className='mb-3'>
                                    <CCol xs={5} md={4}>
                                        <CFormLabel htmlFor='type' className='col-form-label'>
                                            Name
                                        </CFormLabel>
                                    </CCol>
                                    <CCol xs={7} md={8}>
                                        <CFormInput
                                            type='text'
                                            value={userForm.username}
                                            disabled
                                        />
                                    </CCol>
                                </CRow>
                                <CRow className='mb-3'>
                                    <CCol xs={5} md={4}>
                                        <CFormLabel htmlFor='type' className='col-form-label'>
                                            New Password
                                        </CFormLabel>
                                    </CCol>
                                    <CCol xs={7} md={8}>
                                        <CFormInput
                                            type='password'
                                            autoComplete='off'
                                            value={userForm.userPwd}
                                            onChange={(event) => this.setState({ userForm: { ...userForm, userPwd: event.target.value as string } })}
                                        />
                                    </CCol>
                                </CRow>
                                <CRow className='mb-3'>
                                    <CCol xs={5} md={4}>
                                        <CFormLabel htmlFor='type' className='col-form-label'>
                                            Confirm Password
                                        </CFormLabel>
                                    </CCol>
                                    <CCol xs={7} md={8}>
                                        <CFormInput
                                            type='password'
                                            autoComplete='off'
                                            value={userForm.conmfirmPwd}
                                            onChange={(event) => this.setState({ userForm: { ...userForm, conmfirmPwd: event.target.value as string } })}
                                        />
                                    </CCol>
                                </CRow>
                            </CForm>
                        </CCardBody>
                        <CCardFooter className='text-end'>
                            <CButton className='me-2' color='success' variant='outline' onClick={this.updatePwd}>
                                Save
                            </CButton>
                            <CButton color='secondary' variant='outline'>
                                Clear
                            </CButton>
                        </CCardFooter>
                    </CCard>
                </CCol>
                <CCol sm={6}>
                    <CCard className='mb-4'>
                        <CCardHeader>
                            <strong>Investment Setting</strong> <small>Stock / Fund</small>
                        </CCardHeader>
                        <CCardBody>
                            <CForm>
                                <CRow className='mb-3'>
                                    <CCol xs={5} md={4}>
                                        <CFormLabel htmlFor='chartStyle' className='col-form-label'>
                                            Chart Style
                                        </CFormLabel>
                                    </CCol>
                                    <CCol xs={7} md={8}>
                                        {
                                            ['TW', 'US'].map(style =>
                                                <CFormCheck
                                                    key={`chartStyle-${style}`}
                                                    className='col-form-label'
                                                    type='radio'
                                                    name='chartStyle'
                                                    id={`chartStyle-${style}`}
                                                    label={style}
                                                    value={style}
                                                    checked={style === settingForm.stockType}
                                                    inline
                                                    onChange={(event) => this.setState({ settingForm: { ...settingForm, stockType: event.target.value as string } })}
                                                />
                                            )
                                        }
                                    </CCol>
                                </CRow>
                                <CRow className='mb-3'>
                                    <CCol xs={5} md={4}>
                                        <CFormLabel className='col-form-label'>
                                            Predict Days
                                        </CFormLabel>
                                    </CCol>
                                    <CCol xs={7} md={8}>
                                        <CFormInput
                                            type='number'
                                            min={1}
                                            step={1}
                                            value={settingForm.predictDays}
                                            onChange={(event) => this.setState({ settingForm: { ...settingForm, predictDays: AppUtil.toNumber(event.target.value) } })}
                                        />
                                    </CCol>
                                </CRow>
                                <CRow className='mb-3'>
                                    <CCol xs={5} md={4}>
                                        <CFormLabel className='col-form-label'>
                                            Stock Fee Rate
                                        </CFormLabel>
                                    </CCol>
                                    <CCol xs={7} md={8}>
                                        <CFormInput
                                            type='number'
                                            value={settingForm.stockFeeRate}
                                            min={0.1}
                                            max={1}
                                            step={0.01}
                                            onChange={(event) => this.setState({ settingForm: { ...settingForm, stockFeeRate: AppUtil.toNumber(event.target.value) } })}
                                        />
                                    </CCol>
                                </CRow>
                                <CRow className='mb-3'>
                                    <CCol xs={5} md={4}>
                                        <CFormLabel className='col-form-label'>
                                            Fund Fee Rate
                                        </CFormLabel>
                                    </CCol>
                                    <CCol xs={7} md={8}>
                                        <CFormInput
                                            type='number'
                                            value={settingForm.fundFeeRate}
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            onChange={(event) => this.setState({ settingForm: { ...settingForm, fundFeeRate: AppUtil.toNumber(event.target.value) } })}
                                        />
                                    </CCol>
                                </CRow>
                            </CForm>
                        </CCardBody>
                        <CCardFooter className='text-end'>
                            <CButton className='me-2' color='success' variant='outline' onClick={this.updateUserSetting}>
                                Save
                            </CButton>
                            <CButton color='secondary' variant='outline' onClick={this.resetUserSetting('invest')}>
                                Clear
                            </CButton>
                        </CCardFooter>
                    </CCard>
                </CCol>
                <CCol sm={6}>
                    <CCard className='mb-4'>
                        <CCardHeader>
                            <strong>Account Setting</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CForm>
                                <CRow className='mb-3'>
                                    <CCol xs={5} md={4}>
                                        <CFormLabel htmlFor='chartStyle' className='col-form-label'>
                                            Default Recprd Type
                                        </CFormLabel>
                                    </CCol>
                                    <CCol xs={7} md={8}>
                                        <CFormSelect
                                            id='type'
                                            value={settingForm.accountRecordType}
                                            onChange={(event: any) => this.setState({ settingForm: { ...settingForm, accountRecordType: event.target.value as string } })}
                                        >
                                            {recordTypeOptions.map(o => <option key={`recordtype-option-${o.key}`} value={o.key}>{o.value}</option>)}
                                        </CFormSelect>
                                    </CCol>
                                    <CCol xs={5} md={4}>
                                        <CFormLabel className='col-form-label'>
                                            Record Deletable?
                                        </CFormLabel>
                                    </CCol>
                                    <CCol xs={7} md={8}>
                                        {
                                            [true, false].map(d =>
                                                <CFormCheck
                                                    key={`recorddeletable-${d}`}
                                                    className='col-form-label'
                                                    type='radio'
                                                    name='recorddeletable'
                                                    id={`recorddeletable-${d}`}
                                                    label={d ? 'Yes' : 'No'}
                                                    value={`${d}`}
                                                    checked={d === settingForm.accountRecordDeletable}
                                                    inline
                                                    onChange={() => this.setState({ settingForm: { ...settingForm, accountRecordDeletable: d } })}
                                                />
                                            )
                                        }
                                    </CCol>
                                </CRow>
                            </CForm>
                        </CCardBody>
                        <CCardFooter className='text-end'>
                            <CButton className='me-2' color='success' variant='outline' onClick={this.updateUserSetting}>
                                Save
                            </CButton>
                            <CButton color='secondary' variant='outline' onClick={this.resetUserSetting('account')}>
                                Clear
                            </CButton>
                        </CCardFooter>
                    </CCard>
                </CCol>
            </CRow>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        userId: getAuthTokenId(state),
        username: getAuthTokenName(state),
        userSetting: getUserSetting(state),
        recordTypeOptions: getRecordTypes(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<string | UserSetting>>) => {
    return {
        notify: SetNotifyDispatcher(dispatch),
        setUserSetting: SetUserSettingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingPage);
