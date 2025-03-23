import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { CButton, CButtonGroup, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CForm, CFormInput, CFormLabel, CFormSelect, CFormSwitch, CLink, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { cilArrowRight, cilPencil, cilPlus, cilQrCode, cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import moment from 'moment';
import qrcode from 'qrcode';
import { SetAccountListDispatcher, SetLoadingDispatcher, SetNotifyDispatcher } from '../../reducer/PropsMapper';
import { ReduxState, getAccountList, getBankInfos, getCurrencies, getDefaultRecordType, getRecordTypes, getStockType, isAccountRecordDeletable } from '../../reducer/Selector';
import AccountApi, { Account, AccountRecordVo } from '../../api/account';
import FinancailFileApi from '../../api/financailFile';
import AppConfirmModal from '../../components/AppConfirmModal';
import AppPagination from '../../components/AppPagination';
import * as AppUtil from '../../util/AppUtil';
import { Action, SimpleResponse, Option } from '../../util/Interface';
import { StockType } from '../../util/Enum';
import { DATA_COUNT_PER_PAGE } from '../../util/Constant';
import currencyIcon from '../../assets/currency';
import AccountRecordModal, { AccountRecordModalMode } from './modal/AccountRecordModal';

export interface AccountPageProps {
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
        shown: boolean;
    };
    showEditAccountModal: boolean;
    editAccountForm: {
        id: string;
        currency: string;
        name: string;
        bankCode: string;
        bankNo: string;
        shown: boolean;
    };
    showQrcodeModal: boolean;
    qrcodeForm: {
        accountName: string;
        bankCode: string;
        bankNo: string;
        img: string;
    };
    currentAccountRecords: AccountRecordVo[];
    accountRecordsPage: number;
    showRecordIncomeModal: boolean;
    showRecordTransferModal: boolean;
    showRecordExpendModal: boolean;
    showDeleteAccountModal: boolean;
    showDeleteRecordModal: boolean;
    currentRecordMode: AccountRecordModalMode;
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
                bankNo: '',
                shown: true
            },
            showEditAccountModal: false,
            editAccountForm: {
                id: '',
                currency: props.currencyOptions[0]?.key,
                name: '',
                bankCode: '',
                bankNo: '',
                shown: true
            },
            showQrcodeModal: false,
            qrcodeForm: {
                accountName: '',
                bankCode: '',
                bankNo: '',
                img: ''
            },
            currentAccountRecords: [],
            accountRecordsPage: 1,
            showRecordIncomeModal: false,
            showRecordTransferModal: false,
            showRecordExpendModal: false,
            showDeleteAccountModal: false,
            showDeleteRecordModal: false,
            currentRecordMode: '',
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
                                        bankNo: account.bankNo || '',
                                        shown: account.shown || true
                                    };
                                    this.setState({ showEditAccountModal: true, editAccountForm });
                                }}
                            >
                                <CIcon icon={cilPencil} className='float-start' width={22} />
                            </CLink>
                            {
                                account.bankCode && account.bankNo &&
                                <CLink
                                    className='font-weight-bold font-xs text-body-secondary'
                                    onClick={async () => {
                                        const fullBankNo: string = `0000000000000000${account.bankNo}`.slice(-16);
                                        // `TWQRP://銀行轉帳/158/02/V1?D5=${account.bankCode}&D6=${fullBankNo}&D10=901`
                                        const twqr = `TWQRP%3A%2F%2F%E9%8A%80%E8%A1%8C%E8%BD%89%E5%B8%B3%2F158%2F02%2FV1%3FD5%3D${account.bankCode}%26D6%3D${fullBankNo}%26D10%3D901`;
                                        const img = await qrcode.toDataURL(twqr, { errorCorrectionLevel: 'H' });
                                        const qrcodeForm = {
                                            accountName: account.name,
                                            bankCode: account.bankCode || '',
                                            bankNo: account.bankNo || '',
                                            img
                                        };
                                        this.setState({ showQrcodeModal: true, qrcodeForm });
                                    }}
                                >
                                    <CIcon icon={cilQrCode} className='float-start ms-2' width={22} />
                                </CLink>
                            }
                            {
                                account.removable &&
                                <CLink
                                    className='font-weight-bold font-xs text-body-secondary'
                                    onClick={() => this.setState({ showDeleteAccountModal: true, holdingAccountId: account.id })}
                                >
                                    <CIcon icon={cilTrash} className='float-start ms-2' width={22} />
                                </CLink>
                            }
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

    private fetchAccounts = async () => {
        const { setAccountList } = this.props;
        const response = await AccountApi.getAccounts();
        const { success, data } = response;
        if (success) {
            setAccountList(data);
        } else {
            setAccountList([]);
        }
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
                    <CForm onKeyDown={AppUtil.bindEnterKey(this.addAccount)}>
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
                                    <option value=''></option>
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
                        <CRow className='mb-3'>
                            <CFormLabel htmlFor='account-shown' className='col-sm-3 col-form-label'>
                                Show / Hide
                            </CFormLabel>
                            <div className='col-sm-9'>
                                <CFormSwitch
                                    size='xl'
                                    id='account-shown'
                                    checked={addAccountForm.shown}
                                    onChange={(event) => this.setState({ addAccountForm: { ...addAccountForm, shown: event.target.checked } })}
                                />
                            </div>
                        </CRow>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color='primary' onClick={this.addAccount}>Save</CButton>
                    <CButton color='secondary' onClick={this.closeAddAccountModal}>Close</CButton>
                </CModalFooter>
            </CModal>
        );
    };

    private addAccount = async () => {
        const { notify } = this.props;
        const { addAccountForm } = this.state;
        const response: SimpleResponse = await AccountApi.createAccount(addAccountForm.name, addAccountForm.currency, addAccountForm.bankCode, addAccountForm.bankNo, addAccountForm.shown);
        const { success, message } = response;
        if (success) {
            notify(message);
            await this.fetchAccounts();
            this.closeAddAccountModal();
        } else {
            notify(message);
        }
    };

    private closeAddAccountModal = () => {
        const addAccountForm = {
            currency: this.props.currencyOptions[0]?.key,
            name: '',
            bankCode: '',
            bankNo: '',
            shown: true
        };
        this.setState({ showAddAccountModal: false, addAccountForm });
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
                    <CForm onKeyDown={AppUtil.bindEnterKey(this.editAccount)}>
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
                                    <option value=''></option>
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
                        <CRow className='mb-3'>
                            <CFormLabel htmlFor='account-shown' className='col-sm-3 col-form-label'>
                                Show / Hide
                            </CFormLabel>
                            <div className='col-sm-9'>
                                <CFormSwitch
                                    size='xl'
                                    id='account-shown'
                                    checked={editAccountForm.shown}
                                    onChange={(event) => this.setState({ editAccountForm: { ...editAccountForm, shown: event.target.checked } })}
                                />
                            </div>
                        </CRow>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color='primary' onClick={this.editAccount}>Save</CButton>
                    <CButton color='secondary' onClick={this.closeEditAccountModal}>Close</CButton>
                </CModalFooter>
            </CModal>
        );
    };

    private editAccount = async () => {
        const { notify } = this.props;
        const { editAccountForm } = this.state;
        const response: SimpleResponse = await AccountApi.updateAccount(editAccountForm.id, editAccountForm.name, editAccountForm.bankCode, editAccountForm.bankNo, editAccountForm.shown);
        const { success, message } = response;
        notify(message);
        if (success) {
            await this.fetchAccounts();
            this.closeEditAccountModal();
        }
    };

    private closeEditAccountModal = () => {
        const editAccountForm = {
            id: '',
            currency: this.props.currencyOptions[0]?.key,
            name: '',
            bankCode: '',
            bankNo: '',
            shown: true
        };
        this.setState({ showEditAccountModal: false, editAccountForm });
    };

    private getQrcodeModal = (): React.ReactNode => {
        const { bankCodeOptions } = this.props;
        const { showQrcodeModal, qrcodeForm } = this.state;
        return (
            <CModal alignment='center' visible={showQrcodeModal} onClose={this.closeQrcodeModal}>
                <CModalHeader>
                    <CModalTitle>{qrcodeForm.accountName}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className='mb-3'>
                        <CCol>
                            <CFormLabel htmlFor='account-name' className='col-form-label'>
                                Bank
                            </CFormLabel>
                            <CFormSelect
                                value={qrcodeForm.bankCode}
                                disabled
                            >
                                <option value=''></option>
                                {bankCodeOptions.map(o => <option key={`bankcode-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </CCol>
                        <CCol>
                            <CFormLabel htmlFor='account-name' className='col-form-label'>
                                Bank No.
                            </CFormLabel>
                            <CFormInput
                                type='text'
                                value={qrcodeForm.bankNo}
                                disabled
                            />
                        </CCol>
                    </CRow>
                    <CRow className='mb-3'>
                        <img src={qrcodeForm.img}></img>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color='secondary' onClick={this.closeQrcodeModal}>Close</CButton>
                </CModalFooter>
            </CModal>
        );
    };

    private closeQrcodeModal = () => {
        const qrcodeForm = {
            accountName: '',
            bankCode: '',
            bankNo: '',
            img: ''
        };
        this.setState({ showQrcodeModal: false, qrcodeForm });
    };

    private removeAccount = async (accountId) => {
        const { notify } = this.props;
        const response = await AccountApi.deleteAccount(accountId);
        const { message } = response;
        notify(message);
    };

    private fetchAccountRecords = async (accountId: string) => {
        const response = await AccountApi.getRecords(accountId);
        const { success, data } = response;
        if (success) {
            this.setState({ currentAccountRecords: data });
        }
    };

    private removeRecord = async (recordId: string) => {
        const { notify } = this.props;
        const { message } = await AccountApi.deleteRecord(recordId);
        notify(message);
    };

    private unhideAccount = (accountId: string) => async () => {
        const { accountList } = this.props;
        const account = accountList.find(acc => acc.id === accountId);
        if (account) {
            account.shown = true;
            const response: SimpleResponse = await AccountApi.updateAccount(account.id, account.name, account.bankCode, account.bankNo, account.shown);
            const { success } = response;
            if (success) {
                await this.fetchAccounts();
            }
        }
    };

    render(): React.ReactNode {
        const { accountList, accountRecordDeletable, recordTypeOptions, defaultRecordType, notify } = this.props;
        const { recordTypeMap, showDetail, currentAccountRecords, accountRecordsPage, showDeleteAccountModal, showDeleteRecordModal, currentRecordMode, holdingAccountId, holdingRecordId } = this.state;
        const hasHiddenAccount: boolean = accountList.some(x => !x.shown);
        const currAccount = accountList.find(a => a.id === holdingAccountId);
        const showAccountList = accountList.filter(a => a.id !== holdingAccountId && a.currency === currAccount?.currency);
        const showAccountRecords = currentAccountRecords.slice((accountRecordsPage - 1) * DATA_COUNT_PER_PAGE, accountRecordsPage * DATA_COUNT_PER_PAGE);
        return (
            <React.Fragment>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    <CCol sm={12} className='d-flex justify-content-end'>
                        <CButton color='secondary' variant='outline' onClick={() => this.setState({ showAddAccountModal: true })}>
                            <CIcon icon={cilPlus} className='me-2' />
                            Add Account
                        </CButton>
                        {
                            hasHiddenAccount &&
                            <CDropdown variant='btn-group' className='ms-2'>
                                <CDropdownToggle color='secondary' variant='outline'>Unhide Account</CDropdownToggle>
                                <CDropdownMenu>
                                    {accountList.filter(account => !account.shown).map(account => (
                                        <CDropdownItem
                                            key={`hiding-account-${account.id}`}
                                            onClick={this.unhideAccount(account.id)}
                                        >
                                            {account.name}
                                        </CDropdownItem>
                                    ))}
                                </CDropdownMenu>
                            </CDropdown>
                        }
                    </CCol>
                </CRow>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    {
                        accountList.filter(account => account.shown).map((account, idx) => {
                            return (
                                <React.Fragment key={`account-card-${idx}`}>
                                    <CCol sm={6} md={4} xl={3}>
                                        {account.shown && this.getCard(account)}
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
                                                                    onClick={() => this.setState({ currentRecordMode: 'income', holdingAccountId: account.id })}
                                                                >
                                                                    Income
                                                                </CButton>
                                                                <CButton
                                                                    color='info'
                                                                    variant='outline'
                                                                    onClick={() => this.setState({ currentRecordMode: 'transfer', holdingAccountId: account.id })}
                                                                >
                                                                    Transfer
                                                                </CButton>
                                                                <CButton
                                                                    color='danger'
                                                                    variant='outline'
                                                                    onClick={() => this.setState({ currentRecordMode: 'expend', holdingAccountId: account.id })}
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
                                                                                            r.editable &&
                                                                                            <CButton
                                                                                                color='info'
                                                                                                variant='outline'
                                                                                                size='sm'
                                                                                                onClick={() => {
                                                                                                    if (r.transFrom === r.transTo) {
                                                                                                        if (r.transAmount > 0) {
                                                                                                            this.setState({ currentRecordMode: 'income', holdingAccountId: account.id, holdingRecordId: r.id });
                                                                                                        } else if (r.transAmount < 0) {
                                                                                                            this.setState({ currentRecordMode: 'expend', holdingAccountId: account.id, holdingRecordId: r.id });
                                                                                                        }
                                                                                                    } else {
                                                                                                        this.setState({ currentRecordMode: 'transfer', holdingAccountId: account.id, holdingRecordId: r.id });
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
                {this.getAddAccountModal()}
                {this.getEditAccountModal()}
                {this.getQrcodeModal()}
                <AccountRecordModal
                    mode={currentRecordMode}
                    accountId={holdingAccountId}
                    recordId={holdingRecordId}
                    accountOptions={showAccountList}
                    recordTypeOptions={recordTypeOptions}
                    defaultRecordType={defaultRecordType}
                    notify={notify}
                    onClose={() => this.setState({ currentRecordMode: '', holdingAccountId: '', holdingRecordId: '' })}
                    afterSubmit={() => {
                        this.fetchAccounts();
                        this.fetchAccountRecords(holdingAccountId);
                    }}
                />
                <AppConfirmModal
                    showModal={showDeleteAccountModal}
                    headerText='Remove Account'
                    onConfirm={async (result: boolean) => {
                        if (result) {
                            const { holdingAccountId } = this.state;
                            await this.removeAccount(holdingAccountId);
                            this.fetchAccounts();
                        }
                        this.setState({ showDeleteAccountModal: false, holdingAccountId: '' });
                    }}
                />
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
