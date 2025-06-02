import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormCheck, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react';
import { ReduxState, getAuthTokenName, getLang, getRecordTypes, getUserSetting } from '../../reducer/Selector';
import { SetNotifyDispatcher, SetUserSettingDispatcher } from '../../reducer/PropsMapper';
import AuthApi, { UserSetting } from '../../api/auth';
import * as AppUtil from '../../util/AppUtil';
import { Action, Lang, Option } from '../../util/Interface';
import { StockType } from '../../util/Enum';

export interface SettingPageProps {
    lang: Lang;
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
        const { username, userSetting } = props;
        this.state = {
            userForm: {
                username: username,
                userPwd: '',
                conmfirmPwd: ''
            },
            settingForm: {
                stockType: userSetting?.stockType,
                predictDays: userSetting?.predictDays,
                stockFeeRate: userSetting?.stockFeeRate,
                fundFeeRate: userSetting?.fundFeeRate,
                accountRecordType: userSetting?.accountRecordType,
                accountRecordDeletable: userSetting?.accountRecordDeletable
            }
        };
    }

    private updatePwd = async () => {
        const { notify } = this.props;
        const { userForm } = this.state;
        if (userForm.userPwd !== userForm.conmfirmPwd) {
            notify('Please check field \'Confirm Password\' and \'New Password\' values are the same.');
            return;
        }
        const response = await AuthApi.changePwd(userForm.userPwd);
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
        const { lang, recordTypeOptions } = this.props;
        const { userForm, settingForm } = this.state;
        return (
            <CRow>
                <CCol sm={6}>
                    <CCard className='mb-4'>
                        <CCardHeader>
                            <strong>
                                <FormattedMessage id='SettingPage.userSetting.title' />
                            </strong>
                        </CCardHeader>
                        <CCardBody>
                            <CForm onKeyDown={AppUtil.bindEnterKey(this.updatePwd)}>
                                <CRow className='mb-3'>
                                    <CCol xs={5} md={4}>
                                        <CFormLabel htmlFor='type' className='col-form-label'>
                                            <FormattedMessage id='SettingPage.userSetting.name' />
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
                                            <FormattedMessage id='SettingPage.userSetting.newPassword' />
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
                                            <FormattedMessage id='SettingPage.userSetting.confirmPassword' />
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
                                <FormattedMessage id='SettingPage.userSetting.saveBtn' />
                            </CButton>
                            <CButton color='secondary' variant='outline'>
                                <FormattedMessage id='SettingPage.userSetting.clearBtn' />
                            </CButton>
                        </CCardFooter>
                    </CCard>
                </CCol>
                <CCol sm={6}>
                    <CCard className='mb-4'>
                        <CCardHeader>
                            <strong>
                                <FormattedMessage id='SettingPage.investSetting.title' />
                            </strong>
                            &nbsp;
                            <small>
                                <FormattedMessage id='SettingPage.investSetting.subtitle' />
                            </small>
                        </CCardHeader>
                        <CCardBody>
                            <CForm onKeyDown={AppUtil.bindEnterKey(this.updateUserSetting)}>
                                <CRow className='mb-3'>
                                    <CCol xs={5} md={4}>
                                        <CFormLabel htmlFor='chartStyle' className='col-form-label'>
                                            <FormattedMessage id='SettingPage.investSetting.chartStyle' />
                                        </CFormLabel>
                                    </CCol>
                                    <CCol xs={7} md={8}>
                                        {
                                            [
                                                {value: 'TW', label: AppUtil.getFormattedMessage(lang, 'SettingPage.investSetting.tw')},
                                                {value: 'US', label: AppUtil.getFormattedMessage(lang, 'SettingPage.investSetting.us')}
                                            ].map(style =>
                                                <CFormCheck
                                                    key={`chartStyle-${style.value}`}
                                                    className='col-form-label'
                                                    type='radio'
                                                    name='chartStyle'
                                                    id={`chartStyle-${style.value}`}
                                                    label={style.label}
                                                    value={style.value}
                                                    checked={style.value === settingForm.stockType}
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
                                            <FormattedMessage id='SettingPage.investSetting.predictDays' />
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
                                            <FormattedMessage id='SettingPage.investSetting.stockFeeRate' />
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
                                            <FormattedMessage id='SettingPage.investSetting.fundFeeRate' />
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
                                <FormattedMessage id='SettingPage.investSetting.saveBtn' />
                            </CButton>
                            <CButton color='secondary' variant='outline' onClick={this.resetUserSetting('invest')}>
                                <FormattedMessage id='SettingPage.investSetting.clearBtn' />
                            </CButton>
                        </CCardFooter>
                    </CCard>
                </CCol>
                <CCol sm={6}>
                    <CCard className='mb-4'>
                        <CCardHeader>
                            <strong>
                                <FormattedMessage id='SettingPage.accountRecordSetting.title' />
                            </strong>
                        </CCardHeader>
                        <CCardBody>
                            <CForm onKeyDown={AppUtil.bindEnterKey(this.updateUserSetting)}>
                                <CRow className='mb-3'>
                                    <CCol xs={5} md={4}>
                                        <CFormLabel htmlFor='chartStyle' className='col-form-label'>
                                            <FormattedMessage id='SettingPage.accountRecordSetting.defaultRecordType' />
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
                                            <FormattedMessage id='SettingPage.accountRecordSetting.recordDeletable' />
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
                                                    label={d ? AppUtil.getFormattedMessage(lang, 'SettingPage.accountRecordSetting.yes') : AppUtil.getFormattedMessage(lang, 'SettingPage.accountRecordSetting.no')}
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
                                <FormattedMessage id='SettingPage.accountRecordSetting.saveBtn' />
                            </CButton>
                            <CButton color='secondary' variant='outline' onClick={this.resetUserSetting('account')}>
                                <FormattedMessage id='SettingPage.accountRecordSetting.clearBtn' />
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
        lang: getLang(state),
        username: getAuthTokenName(state),
        userSetting: getUserSetting(state),
        recordTypeOptions: getRecordTypes(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<string | UserSetting | undefined>>) => {
    return {
        notify: SetNotifyDispatcher(dispatch),
        setUserSetting: SetUserSettingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingPage);
