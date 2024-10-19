import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { CButton, CButtonGroup, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CFormInput, CFormLabel, CFormSelect, CLink, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { cilArrowRight, cilPencil, cilPlus, cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import moment from 'moment';
import { SetAccountListDispatcher, SetLoadingDispatcher, SetNotifyDispatcher } from '../reducer/PropsMapper';
import { ReduxState, getAccountList, getAuthTokenId, getBankInfos, getCurrencies, getDefaultRecordType, getRecordTypes, getStockType, isAccountRecordDeletable } from '../reducer/Selector';
import AccountApi, { Account, AccountRecordVo } from '../api/account';
import FinancailFileApi from '../api/financailFile';
import AppConfirmModal from '../components/AppConfirmModal';
import AppPagination from '../components/AppPagination';
import * as AppUtil from '../util/AppUtil';
import { Action, SimpleResponse, Option } from '../util/Interface';
import { StockType } from '../util/Enum';
import currencyIcon from '../assets/currency';
import { DATA_COUNT_PER_PAGE } from '../util/Constant';

export interface AccountPageProps {
    userId: string,
    accountList: Account[],
    accountRecordDeletable: boolean,
    stockType: StockType,
    defaultRecordType: string;
    currencyOptions: Option[];
    recordTypeOptions: Option[];
    bankCodeOptions: Option[];
    setAccountList: (accountList: Account[]) => void;
    notify: (message: string) => void;
    setLoading: (loading: boolean) => void;
}

export interface AccountPageState {
    recordTypeMap: { [key: string]: string; };
    showDetail: { [accountId: string]: boolean; };
    showAddAccountModal: boolean;
    addAccountForm: {
        currency: string;
        name: string;
        bankCode: string;
        bankNo: string;
    };
    showEditAccountModal: boolean;
    editAccountForm: {
        id: string;
        currency: string;
        name: string;
        bankCode: string;
        bankNo: string;
    };
    currentAccountRecords: AccountRecordVo[];
    accountRecordsPage: number;
    showRecordIncomeModal: boolean;
    incomeForm: {
        accountId: string;
        recordId: string;
        date: Date;
        type: string;
        amount: number;
        description: string;
        fileId?: string;
    };
    showRecordTransferModal: boolean;
    transferForm: {
        accountId: string;
        recordId: string;
        to: string;
        date: Date;
        type: string;
        amount: number;
        description: string;
        fileId?: string;
    };
    showRecordExpendModal: boolean;
    expendForm: {
        accountId: string;
        recordId: string;
        date: Date;
        type: string;
        amount: number;
        description: string;
        fileId?: string;
    };
    fileOptions: Option[];
    showDeleteRecordModal: boolean;
    holdingAccountId: string;
    holdingRecordId: string;
}

class AccountPage extends React.Component<AccountPageProps, AccountPageState> {

    constructor(props: AccountPageProps) {
        super(props);
        this.state = {
            recordTypeMap: props.recordTypeOptions.reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {}),
            showDetail: props.accountList.reduce((acc, curr) => { acc[curr.id] = false; return acc; }, {}),
            showAddAccountModal: false,
            addAccountForm: {
                currency: props.currencyOptions[0]?.key,
                name: '',
                bankCode: '',
                bankNo: ''
            },
            showEditAccountModal: false,
            editAccountForm: {
                id: '',
                currency: props.currencyOptions[0]?.key,
                name: '',
                bankCode: '',
                bankNo: ''
            },
            currentAccountRecords: [],
            accountRecordsPage: 1,
            showRecordIncomeModal: false,
            incomeForm: {
                accountId: '',
                recordId: '',
                date: new Date(),
                type: props.defaultRecordType,
                amount: 0,
                description: ''
            },
            showRecordTransferModal: false,
            transferForm: {
                accountId: '',
                recordId: '',
                date: new Date(),
                to: '',
                type: props.defaultRecordType,
                amount: 0,
                description: ''
            },
            showRecordExpendModal: false,
            expendForm: {
                accountId: '',
                recordId: '',
                date: new Date(),
                type: props.defaultRecordType,
                amount: 0,
                description: ''
            },
            fileOptions: [],
            showDeleteRecordModal: false,
            holdingAccountId: '',
            holdingRecordId: ''
        };
    }

    private toggleRecord = async (accountId: string) => {
        const { setLoading } = this.props;
        const { showDetail } = this.state;
        for (const key in showDetail) {
            if (key !== accountId) {
                showDetail[key] = false;
            }
        }
        showDetail[accountId] = !showDetail[accountId];
        if (showDetail[accountId]) {
            setLoading(true);
            await this.fetchAccountRecords(accountId);
            setLoading(false);
        }
        this.setState({ accountRecordsPage: 1, showDetail });
    };

    private getCard = (account: Account) => {
        const { showDetail } = this.state;
        return (
            <CCard className={showDetail[account.id] ? 'detailed-primary' : ''}>
                <CCardBody className='d-flex align-items-center'>
                    <div className='me-3 text-white bg-primary p-4'>
                        <CIcon icon={currencyIcon[account.currency.toLocaleLowerCase()]} height={24} />
                    </div>
                    <div>
                        <div className='s-6 fw-semibold text-'>
                            {AppUtil.numberComma(account.balance)}{' '}
                        </div>
                        <div className='text-body-secondary text-uppercase fw-semibold small'>
                            {account.name}
                        </div>
                    </div>
                </CCardBody>
                <CCardFooter>
                    <CRow>
                        <CCol>
                            <CLink
                                className='font-weight-bold font-xs text-body-secondary'
                                onClick={() => {
                                    const editAccountForm = {
                                        id: account.id,
                                        currency: account.currency,
                                        name: account.name,
                                        bankCode: account.bankCode || '',
                                        bankNo: account.bankNo || ''
                                    };
                                    this.setState({ showEditAccountModal: true, editAccountForm });
                                }}
                            >
                                <CIcon icon={cilPencil} className='float-start' width={22} />
                            </CLink>
                        </CCol>
                        <CCol>
                            <CLink
                                className='font-weight-bold font-xs text-body-secondary'
                                onClick={() => this.toggleRecord(account.id)}
                            >
                                <CIcon icon={cilArrowRight} className='float-end' width={22} />
                            </CLink>
                        </CCol>
                    </CRow>
                </CCardFooter>
            </CCard>
        );
    };

    private getAddAccountModal = (): React.ReactNode => {
        const { currencyOptions, bankCodeOptions } = this.props;
        const { showAddAccountModal, addAccountForm } = this.state;
        return (
            <CModal alignment='center' visible={showAddAccountModal} onClose={this.closeAddAccountModal}>
                <CModalHeader>
                    <CModalTitle>New Account</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='currency' className='col-sm-3 col-form-label'>
                            Currency
                        </CFormLabel>
                        <div className='col-sm-9'>
                            <CFormSelect
                                value={addAccountForm.currency}
                                onChange={(event: any) => this.setState({ addAccountForm: { ...addAccountForm, currency: event.target.value as string } })}
                            >
                                {currencyOptions.map(o => <option key={`currency-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='account-name' className='col-sm-3 col-form-label'>
                            Name
                        </CFormLabel>
                        <div className='col-sm-9'>
                            <CFormInput
                                type='text'
                                placeholder='Enter your new account name'
                                value={addAccountForm.name}
                                onChange={(event: any) => this.setState({ addAccountForm: { ...addAccountForm, name: event.target.value as string } })}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='account-name' className='col-sm-3 col-form-label'>
                            Bank
                        </CFormLabel>
                        <div className='col-sm-9'>
                            <CFormSelect
                                value={addAccountForm.bankCode}
                                onChange={(event: any) => this.setState({ addAccountForm: { ...addAccountForm, bankCode: event.target.value as string } })}
                            >
                                {bankCodeOptions.map(o => <option key={`bankcode-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='account-name' className='col-sm-3 col-form-label'>
                            Bank No.
                        </CFormLabel>
                        <div className='col-sm-9'>
                            <CFormInput
                                type='text'
                                placeholder='Enter your new 16 digitals bank number'
                                value={addAccountForm.bankNo}
                                onChange={(event: any) => this.setState({ addAccountForm: { ...addAccountForm, bankNo: event.target.value as string } })}
                            />
                        </div>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color='primary' onClick={this.addAccount}>Save</CButton>
                    <CButton color='secondary' onClick={this.closeAddAccountModal}>Close</CButton>
                </CModalFooter>
            </CModal>
        );
    };

    private getEditAccountModal = (): React.ReactNode => {
        const { currencyOptions, bankCodeOptions } = this.props;
        const { showEditAccountModal, editAccountForm } = this.state;
        return (
            <CModal alignment='center' visible={showEditAccountModal} onClose={this.closeEditAccountModal}>
                <CModalHeader>
                    <CModalTitle>Edit Account</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='currency' className='col-sm-3 col-form-label'>
                            Currency
                        </CFormLabel>
                        <div className='col-sm-9'>
                            <CFormSelect
                                value={editAccountForm.currency}
                                disabled
                            >
                                {currencyOptions.map(o => <option key={`currency-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='account-name' className='col-sm-3 col-form-label'>
                            Name
                        </CFormLabel>
                        <div className='col-sm-9'>
                            <CFormInput
                                type='text'
                                placeholder='Enter your new account name'
                                value={editAccountForm.name}
                                onChange={(event: any) => this.setState({ editAccountForm: { ...editAccountForm, name: event.target.value as string } })}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='account-name' className='col-sm-3 col-form-label'>
                            Bank
                        </CFormLabel>
                        <div className='col-sm-9'>
                            <CFormSelect
                                value={editAccountForm.bankCode}
                                onChange={(event: any) => this.setState({ editAccountForm: { ...editAccountForm, bankCode: event.target.value as string } })}
                            >
                                {bankCodeOptions.map(o => <option key={`bankcode-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='account-name' className='col-sm-3 col-form-label'>
                            Bank No.
                        </CFormLabel>
                        <div className='col-sm-9'>
                            <CFormInput
                                type='text'
                                placeholder='Enter your new 16 digitals bank number'
                                value={editAccountForm.bankNo}
                                onChange={(event: any) => this.setState({ editAccountForm: { ...editAccountForm, bankNo: event.target.value as string } })}
                            />
                        </div>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color='primary' onClick={this.editAccount}>Save</CButton>
                    <CButton color='secondary' onClick={this.closeEditAccountModal}>Close</CButton>
                </CModalFooter>
            </CModal>
        );
    };

    private fetchAccounts = async () => {
        const { userId, setAccountList } = this.props;
        const response = await AccountApi.getAccounts(userId);
        const { success, data } = response;
        if (success) {
            setAccountList(data);
        } else {
            setAccountList([]);
        }
    };

    private addAccount = async () => {
        const { notify } = this.props;
        const { addAccountForm } = this.state;
        const response: SimpleResponse = await AccountApi.createAccount(addAccountForm.name, addAccountForm.currency, addAccountForm.bankCode, addAccountForm.bankNo);
        const { success, message } = response;
        if (success) {
            notify(message);
            await this.fetchAccounts();
            this.closeAddAccountModal();
        } else {
            notify(message);
        }
    };

    private editAccount = async () => {
        const { notify } = this.props;
        const { editAccountForm } = this.state;
        const response: SimpleResponse = await AccountApi.updateAccount(editAccountForm.id, editAccountForm.name, editAccountForm.bankCode, editAccountForm.bankNo);
        const { success, message } = response;
        if (success) {
            notify(message);
            await this.fetchAccounts();
            this.closeEditAccountModal();
        } else {
            notify(message);
        }
    };

    private closeAddAccountModal = () => {
        const addAccountForm = {
            currency: this.props.currencyOptions[0]?.key,
            name: '',
            bankCode: '',
            bankNo: ''
        };
        this.setState({ showAddAccountModal: false, addAccountForm });
    };

    private closeEditAccountModal = () => {
        const editAccountForm = {
            id: '',
            currency: this.props.currencyOptions[0]?.key,
            name: '',
            bankCode: '',
            bankNo: ''
        };
        this.setState({ showEditAccountModal: false, editAccountForm });
    };

    private fetchAccountRecords = async (accountId: string) => {
        const response = await AccountApi.getRecords(accountId);
        const { success, data } = response;
        if (success) {
            this.setState({ currentAccountRecords: data });
        }
    };

    private getIncomeModal = (): React.ReactNode => {
        const { recordTypeOptions } = this.props;
        const { showRecordIncomeModal, incomeForm, fileOptions } = this.state;
        return (
            <CModal size='lg' alignment='center' visible={showRecordIncomeModal} onClose={this.closeIncomeModal}>
                <CModalHeader>
                    <CModalTitle>Income</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='income-date' className='col-sm-4 col-form-label'>
                            Transaction Date
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <input
                                type='date'
                                id='income-date'
                                className='form-control'
                                value={moment(incomeForm.date).format('YYYY-MM-DD')}
                                onChange={async (event) => {
                                    const d = new Date(event.target.value);
                                    const fs = await this.getFilesByDate(d);
                                    this.setState({ incomeForm: { ...incomeForm, date: d, fileId: '' }, fileOptions: fs });
                                }}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='income-record-type' className='col-sm-4 col-form-label'>
                            Record Type
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormSelect
                                value={incomeForm.type}
                                id='income-record-type'
                                onChange={(event: any) => this.setState({ incomeForm: { ...incomeForm, type: event.target.value as string } })}
                            >
                                {recordTypeOptions.map(o => <option key={`income-record-type-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='income-amount' className='col-sm-4 col-form-label'>
                            Transaction Amount
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormInput
                                type='number'
                                id='income-amount'
                                value={incomeForm.amount}
                                onChange={(event) => this.setState({ incomeForm: { ...incomeForm, amount: AppUtil.toNumber(event.target.value) } })}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='income-description' className='col-sm-4 col-form-label'>
                            Description
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormInput
                                type='text'
                                id='income-description'
                                value={incomeForm.description}
                                onChange={(event: any) => this.setState({ incomeForm: { ...incomeForm, description: event.target.value as string } })}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='income-file' className='col-sm-4 col-form-label'>
                            Linked File
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormSelect
                                value={incomeForm.fileId}
                                id='income-file'
                                onChange={(event: any) => this.setState({ incomeForm: { ...incomeForm, fileId: event.target.value as string } })}
                            >
                                <option value=''></option>
                                {fileOptions.map(o => <option key={`income-file-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color='primary' onClick={this.income}>Save</CButton>
                    <CButton color='secondary' onClick={this.closeIncomeModal}>Close</CButton>
                </CModalFooter>
            </CModal>
        );
    };

    private openIncomeModal = (accountId: string, recordId: string = '') => async () => {
        const { currentAccountRecords, incomeForm } = this.state;
        let transDate = new Date();
        if (recordId) {
            const accountRecord = currentAccountRecords.find(x => x.id === recordId);
            if (accountRecord) {
                incomeForm.date = accountRecord.transDate;
                incomeForm.type = accountRecord.recordType;
                incomeForm.amount = Math.abs(accountRecord.transAmount);
                incomeForm.description = accountRecord.description || '';
                incomeForm.fileId = accountRecord.fileId;
            }
        }
        const fileOptions = await this.getFilesByDate(transDate);
        this.setState({ showRecordIncomeModal: true, incomeForm: { ...incomeForm, accountId, recordId }, fileOptions });
    };

    private income = async () => {
        const { notify } = this.props;
        const { incomeForm } = this.state;
        const { accountId, recordId, date, amount, type, description, fileId } = incomeForm;
        let api: Promise<SimpleResponse>;
        if (!recordId) {
            api = AccountApi.income(accountId, date, amount, type, description, fileId);
        } else {
            api = AccountApi.updateRecord(recordId, date, amount, type, description, undefined, fileId);
        }
        const resposne: SimpleResponse = await api;
        const { success, message } = resposne;
        notify(message);
        if (success) {
            this.fetchAccounts();
            this.fetchAccountRecords(accountId);
            this.closeIncomeModal();
        }
    };

    private closeIncomeModal = () => {
        const { defaultRecordType } = this.props;
        this.setState({ showRecordIncomeModal: false, incomeForm: { accountId: '', recordId: '', date: new Date(), type: defaultRecordType, amount: 0, description: '' } });
    };

    private getTransferModal = (): React.ReactNode => {
        const { recordTypeOptions, accountList } = this.props;
        const { showRecordTransferModal, transferForm, fileOptions } = this.state;
        const currAccount = accountList.find(a => a.id === transferForm.accountId);
        const showAccountList = accountList.filter(a => a.id !== transferForm.accountId && a.currency === currAccount?.currency);
        return (
            <CModal size='lg' alignment='center' visible={showRecordTransferModal} onClose={this.closeTransferModal}>
                <CModalHeader>
                    <CModalTitle>Transfer</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='transfer-to' className='col-sm-4 col-form-label'>
                            Transfer To
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormSelect
                                value={transferForm.to}
                                id='transfer-to'
                                onChange={(event: any) => this.setState({ transferForm: { ...transferForm, to: event.target.value as string } })}
                            >
                                {showAccountList.map(a => <option key={`transfer-to-option-${a.id}`} value={a.id}>{a.name}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='transfer-date' className='col-sm-4 col-form-label'>
                            Transaction Date
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <input
                                type='date'
                                id='transfer-date'
                                className='form-control'
                                value={moment(transferForm.date).format('YYYY-MM-DD')}
                                onChange={async (event) => {
                                    const d = new Date(event.target.value);
                                    const fs = await this.getFilesByDate(d);
                                    this.setState({ transferForm: { ...transferForm, date: d, fileId: '' }, fileOptions: fs });
                                }}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='transfer-record-type' className='col-sm-4 col-form-label'>
                            Record Type
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormSelect
                                value={transferForm.type}
                                id='transfer-record-type'
                                onChange={(event: any) => this.setState({ transferForm: { ...transferForm, type: event.target.value as string } })}
                            >
                                {recordTypeOptions.map(o => <option key={`transfer-record-type-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='transfer-amount' className='col-sm-4 col-form-label'>
                            Transaction Amount
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormInput
                                type='number'
                                id='transfer-amount'
                                value={transferForm.amount}
                                onChange={(event) => this.setState({ transferForm: { ...transferForm, amount: AppUtil.toNumber(event.target.value) } })}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='transfer-description' className='col-sm-4 col-form-label'>
                            Description
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormInput
                                type='text'
                                id='transfer-description'
                                value={transferForm.description}
                                onChange={(event: any) => this.setState({ transferForm: { ...transferForm, description: event.target.value as string } })}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='transfer-file' className='col-sm-4 col-form-label'>
                            Linked File
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormSelect
                                value={transferForm.fileId}
                                id='transfer-file'
                                onChange={(event: any) => this.setState({ transferForm: { ...transferForm, fileId: event.target.value as string } })}
                            >
                                <option value=''></option>
                                {fileOptions.map(o => <option key={`transfer-file-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color='primary' onClick={this.transfer}>Save</CButton>
                    <CButton color='secondary' onClick={this.closeTransferModal}>Close</CButton>
                </CModalFooter>
            </CModal>
        );
    };

    private openTransferModal = (accountId: string, recordId: string = '') => async () => {
        const { accountList, notify } = this.props;
        const { currentAccountRecords, transferForm } = this.state;
        const fileOptions = await this.getFilesByDate(new Date());
        const currAccount = accountList.find(a => a.id === accountId);
        const showAccountList = accountList.filter(a => a.id !== accountId && a.currency === currAccount?.currency);
        if (showAccountList.length) {
            const newForm = { ...transferForm, accountId, recordId, to: showAccountList[0].id };
            if (recordId) {
                const currRecord = currentAccountRecords.find(r => r.id === recordId);
                if (currRecord) {
                    newForm.to = currRecord.transTo;
                    newForm.date = currRecord.transDate;
                    newForm.type = currRecord.recordType;
                    newForm.amount = Math.abs(currRecord.transAmount);
                    newForm.description = currRecord.description || '';
                    newForm.fileId = currRecord.fileId;
                }
            }
            this.setState({ showRecordTransferModal: true, transferForm: newForm, fileOptions });
        } else {
            notify('No Other Account to Transfer.');
        }
    };

    private transfer = async () => {
        const { notify } = this.props;
        const { transferForm } = this.state;
        const { accountId, recordId, to, date, amount, type, description, fileId } = transferForm;
        let api: Promise<SimpleResponse>;
        if (!recordId) {
            api = AccountApi.transfer(accountId, to, date, amount, type, description, fileId);
        } else {
            api = AccountApi.updateRecord(recordId, date, amount, type, description, to, fileId);
        }
        const resposne: SimpleResponse = await api;
        const { success, message } = resposne;
        notify(message);
        if (success) {
            this.fetchAccounts();
            this.fetchAccountRecords(accountId);
            this.closeTransferModal();
        }
    };

    private closeTransferModal = () => {
        const { defaultRecordType } = this.props;
        this.setState({ showRecordTransferModal: false, transferForm: { accountId: '', recordId: '', date: new Date(), to: '', type: defaultRecordType, amount: 0, description: '' } });
    };

    private getExpendModal = (): React.ReactNode => {
        const { recordTypeOptions } = this.props;
        const { showRecordExpendModal, expendForm, fileOptions } = this.state;
        return (
            <CModal size='lg' alignment='center' visible={showRecordExpendModal} onClose={this.closeExpendModal}>
                <CModalHeader>
                    <CModalTitle>Expend</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='expend-date' className='col-sm-4 col-form-label'>
                            Transaction Date
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <input
                                type='date'
                                id='expend-date'
                                className='form-control'
                                value={moment(expendForm.date).format('YYYY-MM-DD')}
                                onChange={async (event) => {
                                    const d = new Date(event.target.value);
                                    const fs = await this.getFilesByDate(d);
                                    this.setState({ expendForm: { ...expendForm, date: d, fileId: '' }, fileOptions: fs });
                                }}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='expend-record-type' className='col-sm-4 col-form-label'>
                            Record Type
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormSelect
                                value={expendForm.type}
                                id='expend-record-type'
                                onChange={(event: any) => this.setState({ expendForm: { ...expendForm, type: event.target.value as string } })}
                            >
                                {recordTypeOptions.map(o => <option key={`expend-record-type-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='expend-amount' className='col-sm-4 col-form-label'>
                            Transaction Amount
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormInput
                                type='number'
                                id='expend-amount'
                                value={expendForm.amount}
                                onChange={(event) => this.setState({ expendForm: { ...expendForm, amount: AppUtil.toNumber(event.target.value) } })}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='expend-description' className='col-sm-4 col-form-label'>
                            Description
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormInput
                                type='text'
                                id='expend-description'
                                value={expendForm.description}
                                onChange={(event: any) => this.setState({ expendForm: { ...expendForm, description: event.target.value as string } })}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='expend-file' className='col-sm-4 col-form-label'>
                            Linked File
                        </CFormLabel>
                        <div className='col-sm-8'>
                            <CFormSelect
                                value={expendForm.fileId}
                                id='expend-file'
                                onChange={(event: any) => this.setState({ expendForm: { ...expendForm, fileId: event.target.value as string } })}
                            >
                                <option value=''></option>
                                {fileOptions.map(o => <option key={`expend-file-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color='primary' onClick={this.expend}>Save</CButton>
                    <CButton color='secondary' onClick={this.closeExpendModal}>Close</CButton>
                </CModalFooter>
            </CModal>
        );
    };

    private openExpendModal = (accountId: string, recordId: string = '') => async () => {
        const { currentAccountRecords, expendForm } = this.state;
        let transDate = new Date();
        if (recordId) {
            const accountRecord = currentAccountRecords.find(x => x.id === recordId);
            if (accountRecord) {
                expendForm.date = accountRecord.transDate;
                expendForm.type = accountRecord.recordType;
                expendForm.amount = Math.abs(accountRecord.transAmount);
                expendForm.description = accountRecord.description || '';
                expendForm.fileId = accountRecord.fileId;
            }
        }
        const fileOptions = await this.getFilesByDate(transDate);
        this.setState({ showRecordExpendModal: true, expendForm: { ...expendForm, accountId, recordId }, fileOptions });
    };

    private expend = async () => {
        const { notify } = this.props;
        const { expendForm } = this.state;
        const { accountId, recordId, date, amount, type, description, fileId } = expendForm;
        let api: Promise<SimpleResponse>;
        if (!recordId) {
            api = AccountApi.expend(accountId, date, -amount, type, description, fileId);
        } else {
            api = AccountApi.updateRecord(recordId, date, -amount, type, description, undefined, fileId);
        }
        const resposne: SimpleResponse = await api;
        const { success, message } = resposne;
        notify(message);
        if (success) {
            this.fetchAccounts();
            this.fetchAccountRecords(accountId);
            this.closeExpendModal();
        }
    };

    private closeExpendModal = () => {
        const { defaultRecordType } = this.props;
        this.setState({ showRecordExpendModal: false, expendForm: { accountId: '', recordId: '', date: new Date(), type: defaultRecordType, amount: 0, description: '' } });
    };

    private removeRecord = async (recordId: string) => {
        const { notify } = this.props;
        const { message } = await AccountApi.deleteRecord(recordId);
        notify(message);
    };

    private getFilesByDate = async (date: Date): Promise<Option[]> => {
        const { userId } = this.props;
        const response = await FinancailFileApi.list(userId, date);
        const { success, data } = response;
        if (success) {
            return data.map(f => ({ key: f.id, value: f.filename }));
        }
        return [];
    };

    render(): React.ReactNode {
        const { accountList, accountRecordDeletable } = this.props;
        const { recordTypeMap, showDetail, currentAccountRecords, accountRecordsPage, showDeleteRecordModal } = this.state;
        const showAccountRecords = currentAccountRecords.slice((accountRecordsPage - 1) * DATA_COUNT_PER_PAGE, accountRecordsPage * DATA_COUNT_PER_PAGE);
        return (
            <React.Fragment>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    {
                        accountList.map((account, idx) => {
                            return (
                                <React.Fragment key={`account-card-${idx}`}>
                                    <CCol sm={6} md={4} xl={3}>
                                        {this.getCard(account)}
                                    </CCol>
                                    {
                                        showDetail[account.id] &&
                                        <CCol sm={12}>
                                            <CCard>
                                                <CCardHeader>
                                                    <strong>{account.name}</strong> <small>details</small>
                                                </CCardHeader>
                                                <CCardBody>
                                                    <CRow>
                                                        <CCol xs={12} className='mb-2 d-grid gap-2 d-md-flex justify-content-md-end'>
                                                            <CButtonGroup role='group'>
                                                                <CButton
                                                                    color='success'
                                                                    variant='outline'
                                                                    onClick={this.openIncomeModal(account.id)}
                                                                >
                                                                    Income
                                                                </CButton>
                                                                <CButton
                                                                    color='info'
                                                                    variant='outline'
                                                                    onClick={this.openTransferModal(account.id)}
                                                                >
                                                                    Transfer
                                                                </CButton>
                                                                <CButton
                                                                    color='danger'
                                                                    variant='outline'
                                                                    onClick={this.openExpendModal(account.id)}
                                                                >
                                                                    Expend
                                                                </CButton>
                                                            </CButtonGroup>
                                                        </CCol>
                                                    </CRow>
                                                    <CRow>
                                                        <CCol xs={12}>
                                                            <CTable align='middle' responsive hover>
                                                                <CTableHead>
                                                                    <CTableRow>
                                                                        <CTableHeaderCell scope='col'>Date</CTableHeaderCell>
                                                                        <CTableHeaderCell scope='col'>Amount</CTableHeaderCell>
                                                                        <CTableHeaderCell scope='col'>From</CTableHeaderCell>
                                                                        <CTableHeaderCell scope='col'>To</CTableHeaderCell>
                                                                        <CTableHeaderCell scope='col'>Type</CTableHeaderCell>
                                                                        <CTableHeaderCell scope='col'>Description</CTableHeaderCell>
                                                                        <CTableHeaderCell scope='col'></CTableHeaderCell>
                                                                    </CTableRow>
                                                                </CTableHead>
                                                                <CTableBody>
                                                                    {
                                                                        showAccountRecords.map(r =>
                                                                            <CTableRow key={r.id}>
                                                                                <CTableDataCell>{AppUtil.toDateStr(r.transDate)}</CTableDataCell>
                                                                                <CTableDataCell>{AppUtil.numberComma(r.transAmount)}</CTableDataCell>
                                                                                <CTableDataCell>{r.transFrom === r.transTo ? '' : r.transFromName}</CTableDataCell>
                                                                                <CTableDataCell>{r.transFrom === r.transTo ? '' : r.transToName}</CTableDataCell>
                                                                                <CTableDataCell>{recordTypeMap[r.recordType]}</CTableDataCell>
                                                                                <CTableDataCell>{r.description}</CTableDataCell>
                                                                                <CTableDataCell>
                                                                                    <CButtonGroup role='group'>
                                                                                        {
                                                                                            r.removable &&
                                                                                            <CButton
                                                                                                color='info'
                                                                                                variant='outline'
                                                                                                size='sm'
                                                                                                onClick={() => {
                                                                                                    if (r.transFrom === r.transTo) {
                                                                                                        if (r.transAmount > 0) {
                                                                                                            this.openIncomeModal(account.id, r.id)();
                                                                                                        } else if (r.transAmount < 0) {
                                                                                                            this.openExpendModal(account.id, r.id)();
                                                                                                        }
                                                                                                    } else {
                                                                                                        this.openTransferModal(account.id, r.id)();
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                <CIcon icon={cilPencil}></CIcon>
                                                                                            </CButton>
                                                                                        }
                                                                                        {
                                                                                            accountRecordDeletable && r.removable &&
                                                                                            <CButton
                                                                                                color='danger'
                                                                                                variant='outline'
                                                                                                size='sm'
                                                                                                onClick={() => this.setState({ showDeleteRecordModal: true, holdingAccountId: account.id, holdingRecordId: r.id })}
                                                                                            >
                                                                                                <CIcon icon={cilTrash}></CIcon>
                                                                                            </CButton>
                                                                                        }
                                                                                    </CButtonGroup>
                                                                                </CTableDataCell>
                                                                            </CTableRow>
                                                                        )
                                                                    }
                                                                </CTableBody>
                                                            </CTable>
                                                        </CCol>
                                                    </CRow>
                                                    <AppPagination totalDataCount={currentAccountRecords.length} currentPage={accountRecordsPage} onChange={(page: number) => this.setState({ accountRecordsPage: page })} className='justify-content-center'></AppPagination>
                                                </CCardBody>
                                            </CCard>
                                        </CCol>
                                    }
                                </React.Fragment>
                            );
                        })
                    }
                </CRow>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    <CCol sm={12}>
                        <div className='d-grid gap-2 col-6 mx-auto'>
                            <CButton size='lg' color='secondary' shape='rounded-pill' variant='outline' onClick={() => this.setState({ showAddAccountModal: true })}>
                                <CIcon icon={cilPlus} className='me-2' />
                                Add Account
                            </CButton>
                        </div>
                    </CCol>
                </CRow>
                {this.getAddAccountModal()}
                {this.getEditAccountModal()}
                {this.getIncomeModal()}
                {this.getTransferModal()}
                {this.getExpendModal()}
                <AppConfirmModal
                    showModal={showDeleteRecordModal}
                    headerText='Remove Record'
                    onConfirm={async (result: boolean) => {
                        if (result) {
                            const { holdingRecordId, holdingAccountId } = this.state;
                            await this.removeRecord(holdingRecordId);
                            this.fetchAccounts();
                            this.fetchAccountRecords(holdingAccountId);
                        }
                        this.setState({ showDeleteRecordModal: false, holdingAccountId: '', holdingRecordId: '' });
                    }}
                />
            </React.Fragment>

        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        userId: getAuthTokenId(state),
        accountList: getAccountList(state),
        accountRecordDeletable: isAccountRecordDeletable(state),
        stockType: getStockType(state),
        defaultRecordType: getDefaultRecordType(state),
        currencyOptions: getCurrencies(state),
        recordTypeOptions: getRecordTypes(state),
        bankCodeOptions: getBankInfos(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<Account[] | string | boolean>>) => {
    return {
        setAccountList: SetAccountListDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountPage);
