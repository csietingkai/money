import React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { CButton, CForm, CFormInput, CFormLabel, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow } from '@coreui/react';
import AccountApi, { Account, AccountRecordVo } from '../../../api/account';
import FinancailFileApi from '../../../api/financailFile';
import * as AppUtil from '../../../util/AppUtil';
import { SimpleResponse, Option } from '../../../util/Interface';

export type AccountRecordModalMode = 'income' | 'transfer' | 'expend' | '';

export interface AccountRecordModalProps {
    mode: AccountRecordModalMode;
    accountId: string;
    recordId?: string;
    accountOptions: Account[];
    recordTypeOptions: Option[];
    defaultRecordType: string;
    onClose: () => void;
    notify: (message: string) => void;
    afterSubmit?: () => void;
}

interface AccountRecordIncomeForm {
    mode: 'income';
    date: Date;
    type: string;
    amount: number;
    description: string;
    fileId?: string;
}

interface AccountRecordTransferForm {
    mode: 'transfer';
    to: string;
    date: Date;
    type: string;
    amount: number;
    description: string;
    fileId?: string;
}

interface AccountRecordExpendForm {
    mode: 'expend';
    date: Date;
    type: string;
    amount: number;
    description: string;
    fileId?: string;
}

export interface AccountRecordModalState {
    form: AccountRecordIncomeForm | AccountRecordTransferForm | AccountRecordExpendForm | undefined;
    fileOptions: Option[];
}

export default class AccountRecordModal extends React.Component<AccountRecordModalProps, AccountRecordModalState> {

    constructor(props: AccountRecordModalProps) {
        super(props);
        this.state = {
            form: undefined,
            fileOptions: []
        };
    }

    componentDidUpdate(prevProps: Readonly<AccountRecordModalProps>): void {
        const { mode, recordId, defaultRecordType, notify } = this.props;
        if (recordId && recordId !== prevProps.recordId) {
            AccountApi.getRecord(recordId).then(({ success, data, message }) => {
                if (success) {
                    this.initForm(data);
                } else {
                    notify(message);
                }
            });
        } else if (mode !== prevProps.mode || defaultRecordType !== prevProps.defaultRecordType) {
            this.initForm();
        }
    }

    private initForm = (accountRecord?: AccountRecordVo) => {
        let { mode, accountOptions, defaultRecordType } = this.props;
        if (!mode) {
            this.setState({ form: undefined });
            return;
        }
        const form: AccountRecordIncomeForm | AccountRecordTransferForm | AccountRecordExpendForm = {
            mode,
            date: new Date(),
            to: accountOptions[0]?.id || '',
            type: defaultRecordType,
            amount: 0,
            description: ''
        };
        if (accountRecord) {
            if (accountRecord.transFrom === accountRecord.transTo) {
                if (accountRecord.transAmount > 0) {
                    form.mode = 'income';
                } else if (accountRecord.transAmount < 0) {
                    form.mode = 'expend';
                }
            } else {
                form.mode = 'transfer';
                (form as any).to = accountRecord.transTo;
            }
            form.date = accountRecord.transDate;
            form.type = accountRecord.recordType;
            form.amount = Math.abs(accountRecord.transAmount);
            form.description = accountRecord.description || '';
            form.fileId = accountRecord.fileId;
        }
        this.setState({ form });
    };

    private getFilesByDate = async (date: Date): Promise<Option[]> => {
        const response = await FinancailFileApi.list(date);
        const { success, data } = response;
        if (success) {
            return data.map(f => ({ key: f.id, value: f.filename }));
        }
        return [];
    };

    private submit = async () => {
        const { accountId, recordId, notify, afterSubmit } = this.props;
        const { form } = this.state;
        if (!form) {
            return;
        }
        let api: Promise<SimpleResponse> | undefined = undefined;
        const { date, amount, type, description, fileId } = form;
        if (recordId) {
            api = AccountApi.updateRecord(recordId, date, form.mode === 'expend' ? -amount : amount, type, description, form.mode === 'transfer' ? form.to : undefined, fileId);
        } else if (form.mode === 'income') {
            api = AccountApi.income(accountId, date, amount, type, description, fileId);
        } else if (form.mode === 'transfer') {
            api = AccountApi.transfer(accountId, form.to, date, amount, type, description, fileId);
        } else if (form.mode === 'expend') {
            api = AccountApi.expend(accountId, date, -amount, type, description, fileId);
        }
        if (!api) {
            notify('TS Error: api is undefined');
            return;
        }
        const resposne: SimpleResponse = await api;
        const { success, message } = resposne;
        notify(message);
        if (success) {
            if (afterSubmit) {
                afterSubmit();
            }
            this.closeModal();
        }
    };

    private closeModal = () => {
        this.setState({ form: undefined }, this.props.onClose);
    };

    render(): React.ReactNode {
        const { accountOptions, recordTypeOptions } = this.props;
        const { form, fileOptions } = this.state;
        return (
            <CModal size='lg' alignment='center' visible={!!(form?.mode)} onClose={this.closeModal}>
                <CModalHeader>
                    <CModalTitle>
                        <FormattedMessage id={`AccountPage.AccountRecordModal.${form?.mode}.title`} />
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {
                        form &&
                        <CForm onKeyDown={AppUtil.bindEnterKey(this.submit)}>
                            {
                                form?.mode === 'transfer' &&
                                <CRow className='mb-3'>
                                    <CFormLabel htmlFor='transaction-to' className='col-sm-4 col-form-label'>
                                        <FormattedMessage id='AccountPage.AccountRecordModal.transferTo' />
                                    </CFormLabel>
                                    <div className='col-sm-8'>
                                        <CFormSelect
                                            value={form.to}
                                            id='to'
                                            onChange={(event: any) => this.setState({ form: { ...form, to: event.target.value as string } })}
                                        >
                                            {accountOptions.map(a => <option key={`transaction-to-option-${a.id}`} value={a.id}>{a.name}</option>)}
                                        </CFormSelect>
                                    </div>
                                </CRow>
                            }

                            <CRow className='mb-3'>
                                <CFormLabel htmlFor='transaction-date' className='col-sm-4 col-form-label'>
                                    <FormattedMessage id='AccountPage.AccountRecordModal.transactionDate' />
                                </CFormLabel>
                                <div className='col-sm-8'>
                                    <input
                                        type='date'
                                        id='transaction-date'
                                        className='form-control'
                                        value={moment(form.date).format('YYYY-MM-DD')}
                                        onChange={async (event) => {
                                            const d = new Date(event.target.value);
                                            const fs = await this.getFilesByDate(d);
                                            this.setState({ form: { ...form, date: d, fileId: '' }, fileOptions: fs });
                                        }}
                                    />
                                </div>
                            </CRow>
                            <CRow className='mb-3'>
                                <CFormLabel htmlFor='transaction-record-type' className='col-sm-4 col-form-label'>
                                    <FormattedMessage id='AccountPage.AccountRecordModal.recordType' />
                                </CFormLabel>
                                <div className='col-sm-8'>
                                    <CFormSelect
                                        value={form.type}
                                        id='transaction-record-type'
                                        onChange={(event: any) => this.setState({ form: { ...form, type: event.target.value as string } })}
                                    >
                                        {recordTypeOptions.map(o => <option key={`transaction-record-type-option-${o.key}`} value={o.key}>{o.value}</option>)}
                                    </CFormSelect>
                                </div>
                            </CRow>
                            <CRow className='mb-3'>
                                <CFormLabel htmlFor='transaction-amount' className='col-sm-4 col-form-label'>
                                    <FormattedMessage id='AccountPage.AccountRecordModal.transactionAmount' />
                                </CFormLabel>
                                <div className='col-sm-8'>
                                    <CFormInput
                                        type='number'
                                        id='transaction-amount'
                                        value={form.amount}
                                        onChange={(event) => this.setState({ form: { ...form, amount: AppUtil.toNumber(event.target.value) } })}
                                    />
                                </div>
                            </CRow>
                            <CRow className='mb-3'>
                                <CFormLabel htmlFor='transaction-description' className='col-sm-4 col-form-label'>
                                    <FormattedMessage id='AccountPage.AccountRecordModal.description' />
                                </CFormLabel>
                                <div className='col-sm-8'>
                                    <CFormInput
                                        type='text'
                                        id='transaction-description'
                                        value={form.description}
                                        onChange={(event: any) => this.setState({ form: { ...form, description: event.target.value as string } })}
                                    />
                                </div>
                            </CRow>
                            <CRow className='mb-3'>
                                <CFormLabel htmlFor='transaction-file' className='col-sm-4 col-form-label'>
                                    <FormattedMessage id='AccountPage.AccountRecordModal.linkedFile' />
                                </CFormLabel>
                                <div className='col-sm-8'>
                                    <CFormSelect
                                        value={form.fileId}
                                        id='transaction-file'
                                        onChange={(event: any) => this.setState({ form: { ...form, fileId: event.target.value as string } })}
                                    >
                                        <option value=''></option>
                                        {fileOptions.map(o => <option key={`transaction-file-option-${o.key}`} value={o.key}>{o.value}</option>)}
                                    </CFormSelect>
                                </div>
                            </CRow>
                        </CForm>
                    }
                </CModalBody>
                <CModalFooter>
                    <CButton color='primary' onClick={this.submit}>
                        <FormattedMessage id='AccountPage.AccountRecordModal.saveBtn' />
                    </CButton>
                    <CButton color='secondary' onClick={this.closeModal}>
                        <FormattedMessage id='AccountPage.AccountRecordModal.closeBtn' />
                    </CButton>
                </CModalFooter>
            </CModal>
        );
    }
}
