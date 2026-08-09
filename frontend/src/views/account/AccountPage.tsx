import React, { Dispatch } from 'react';
import { legacy_connect as connect } from 'react-redux'
import { FormattedMessage } from 'react-intl';
import { CButton, CButtonGroup, CCard, CCardBody, CCardHeader, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CForm, CFormInput, CFormLabel, CFormSelect, CFormSwitch, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { cilListNumbered, cilMoney, cilOptions, cilPencil, cilQrCode, cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import qrcode from 'qrcode';
import { SetAccountListDispatcher, SetLoadingDispatcher, SetNotifyDispatcher } from '../../reducer/PropsMapper';
import { ReduxState, getAccountList, getBankInfoList, getBankInfos, getCurrencies, getDefaultRecordType, getLang, getRecordTypes, isAccountRecordDeletable } from '../../reducer/Selector';
import AccountApi, { AccountRecordVo, AccountVo } from '../../api/account';
import AppConfirmModal from '../../components/AppConfirmModal';
import AppPagination from '../../components/AppPagination';
import * as AppUtil from '../../util/AppUtil';
import { Action, SimpleResponse, Option, Lang } from '../../util/Interface';
import { DATA_COUNT_PER_PAGE } from '../../util/Constant';
import AccountRecordModal, { AccountRecordModalMode } from './modal/AccountRecordModal';
import { BankInfo } from '../../api/bankInfo';

export interface AccountPageProps {
    lang: Lang;
    accountList: AccountVo[],
    accountRecordDeletable: boolean,
    bankInfos: BankInfo[];
    defaultRecordType: string;
    currencyOptions: Option[];
    recordTypeOptions: Option[];
    bankCodeOptions: Option[];
    setAccountList: (accountList: AccountVo[]) => void;
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
            recordTypeMap: props.recordTypeOptions.reduce((acc: { [key: string]: string }, curr: Option) => { acc[curr.key] = curr.value; return acc; }, {}),
            showDetail: props.accountList.reduce((acc: { [key: string]: boolean }, curr: AccountVo) => { acc[curr.id] = false; return acc; }, {}),
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

    private getCard = (account: AccountVo) => {
        const { showDetail } = this.state;
        const hasBankInfo: boolean = !!account.bankCode && !!account.bankNo;
        const bankIcons = this.props.bankInfos.filter((option) => option.hasSvg).reduce((acc: { [key: string]: boolean }, curr: BankInfo) => { acc[curr.code] = true; return acc; }, {});
        const hasBankIcon: boolean = !!account.bankCode && !!bankIcons[account.bankCode];
        return (
            <CCard className={showDetail[account.id] ? 'detailed-primary' : ''}>
                <CCardBody>
                    <div className='d-flex align-items-center gap-3 mb-3'>
                        <div className={`d-flex text-white fs-4 account-icon align-items-center justify-content-center rounded-3 ${hasBankInfo ? 'bank-icon' : 'cash-icon'}`}>
                            {
                                hasBankIcon ?
                                    (<img className='w-75 h-75' src={`bank/${account.bankCode}.svg`} alt={account.bankCode} />) :
                                    (hasBankInfo ? '🏦' : '💵')}
                        </div>
                        <div>
                            <div className='fs-4 fw-bold'>
                                {account.name}
                            </div>
                            <div className='fs-8 text-secondary'>
                                {account?.bankName}
                            </div>
                        </div>
                        <CDropdown variant='dropdown' alignment='end' className='ms-auto'>
                            <CDropdownToggle caret={false} className='p-0'>
                                <CIcon icon={cilOptions} />
                            </CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem onClick={() => {
                                    const editAccountForm = {
                                        id: account.id,
                                        currency: account.currency,
                                        name: account.name,
                                        bankCode: account.bankCode || '',
                                        bankNo: account.bankNo || '',
                                        shown: account.shown || true
                                    };
                                    this.setState({ showEditAccountModal: true, editAccountForm });
                                }}>
                                    <CIcon icon={cilPencil} className='me-1' />
                                    <FormattedMessage id='AccountPage.accountModal.edit.title' />
                                </CDropdownItem>
                                {
                                    hasBankInfo &&
                                    <CDropdownItem onClick={async () => {
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
                                    }}>
                                        <CIcon icon={cilQrCode} className='me-1' />
                                        <FormattedMessage id='AccountPage.accountModal.qrcode.title' />
                                    </CDropdownItem>
                                }
                                {
                                    account.removable &&
                                    <CDropdownItem onClick={() => this.setState({ showDeleteAccountModal: true, holdingAccountId: account.id })}>
                                        <CIcon icon={cilTrash} className='me-1' />
                                        <FormattedMessage id='AccountPage.accountModal.delete.title' />
                                    </CDropdownItem>
                                }
                                <CDropdownItem onClick={() => this.toggleRecord(account.id)}>
                                    <CIcon icon={cilListNumbered} className='me-1' />
                                    <FormattedMessage id='AccountPage.accountDetail' />
                                </CDropdownItem>
                                <CDropdownItem onClick={() => this.setState({ currentRecordMode: 'income', holdingAccountId: account.id })}>
                                    <CIcon icon={cilMoney} className='me-1' />
                                    <FormattedMessage id='AccountPage.incomeBtn' />
                                </CDropdownItem>
                                <CDropdownItem onClick={() => this.setState({ currentRecordMode: 'transfer', holdingAccountId: account.id })}>
                                    <CIcon icon={cilMoney} className='me-1' />
                                    <FormattedMessage id='AccountPage.transferBtn' />
                                </CDropdownItem>
                                <CDropdownItem onClick={() => this.setState({ currentRecordMode: 'expend', holdingAccountId: account.id })}>
                                    <CIcon icon={cilMoney} className='me-1' />
                                    <FormattedMessage id='AccountPage.expendBtn' />
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </div>
                    <div className='fs-7 mb-1 text-secondary'>
                        <FormattedMessage id='AccountPage.accountBalance' />
                    </div>
                    <div className='fs-3 fw-bold '>
                        {AppUtil.numberComma(account.balance)}
                        <span className='fs-7 text-secondary ms-2'>
                            {account.currency}
                        </span>
                    </div>
                    <div className='fs-7 mt-1 text-secondary account-number'>
                        {
                            hasBankInfo &&
                            <React.Fragment>
                                {account.bankCode}-{account.bankNo}
                            </React.Fragment>
                        }
                    </div>
                </CCardBody>
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
                    <CModalTitle>
                        <FormattedMessage id='AccountPage.accountModal.add.title' />
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm onKeyDown={AppUtil.bindEnterKey(this.addAccount)}>
                        <CRow className='mb-3'>
                            <CFormLabel htmlFor='currency' className='col-sm-3 col-form-label'>
                                <FormattedMessage id='AccountPage.accountModal.currency' />
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
                                <FormattedMessage id='AccountPage.accountModal.name' />
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
                                <FormattedMessage id='AccountPage.accountModal.bankCode' />
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
                                <FormattedMessage id='AccountPage.accountModal.bankNo' />
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
                                <FormattedMessage id='AccountPage.accountModal.isShow' />
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
                    <CButton color='primary' onClick={this.addAccount}>
                        <FormattedMessage id='AccountPage.accountModal.saveBtn' />
                    </CButton>
                    <CButton color='secondary' onClick={this.closeAddAccountModal}>
                        <FormattedMessage id='AccountPage.accountModal.cancelBtn' />
                    </CButton>
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
                    <CModalTitle>
                        <FormattedMessage id='AccountPage.accountModal.edit.title' />
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm onKeyDown={AppUtil.bindEnterKey(this.editAccount)}>
                        <CRow className='mb-3'>
                            <CFormLabel htmlFor='currency' className='col-sm-3 col-form-label'>
                                <FormattedMessage id='AccountPage.accountModal.currency' />
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
                                <FormattedMessage id='AccountPage.accountModal.name' />
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
                                <FormattedMessage id='AccountPage.accountModal.bankCode' />
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
                                <FormattedMessage id='AccountPage.accountModal.bankNo' />
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
                                <FormattedMessage id='AccountPage.accountModal.isShow' />
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
                    <CButton color='primary' onClick={this.editAccount}>
                        <FormattedMessage id='AccountPage.accountModal.saveBtn' />
                    </CButton>
                    <CButton color='secondary' onClick={this.closeEditAccountModal}>
                        <FormattedMessage id='AccountPage.accountModal.cancelBtn' />
                    </CButton>
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
                                <FormattedMessage id='AccountPage.accountModal.bankCode' />
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
                                <FormattedMessage id='AccountPage.accountModal.bankNo' />
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
                    <CButton color='secondary' onClick={this.closeQrcodeModal}>
                        <FormattedMessage id='AccountPage.accountModal.closeBtn' />
                    </CButton>
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

    private removeAccount = async (accountId: string) => {
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
        const { accountList, accountRecordDeletable, recordTypeOptions, defaultRecordType, notify, lang } = this.props;
        const { recordTypeMap, showDetail, currentAccountRecords, accountRecordsPage, showDeleteAccountModal, showDeleteRecordModal, currentRecordMode, holdingAccountId, holdingRecordId } = this.state;
        const hasHiddenAccount: boolean = accountList.some(x => !x.shown);
        const currAccount = accountList.find(a => a.id === holdingAccountId);
        const showAccountList = accountList.filter(a => a.id !== holdingAccountId && a.currency === currAccount?.currency).filter(a => a.shown);
        const showAccountRecords = currentAccountRecords.slice((accountRecordsPage - 1) * DATA_COUNT_PER_PAGE, accountRecordsPage * DATA_COUNT_PER_PAGE);
        return (
            <React.Fragment>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    <CCol sm={12} className='d-flex justify-content-end'>
                        {
                            hasHiddenAccount &&
                            <CDropdown variant='btn-group' className='ms-2'>
                                <CDropdownToggle color='secondary' variant='outline'>
                                    <FormattedMessage id='AccountPage.unhideAccountBtn' />
                                </CDropdownToggle>
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
                                    <CCol sm={6} md={4}>
                                        {account.shown && this.getCard(account)}
                                    </CCol>
                                    {
                                        showDetail[account.id] &&
                                        <CCol sm={12}>
                                            <CCard>
                                                <CCardHeader>
                                                    <strong>{account.name}</strong> <small><FormattedMessage id='AccountPage.accountDetail' /></small>
                                                </CCardHeader>
                                                <CCardBody>
                                                    <CRow>
                                                        <CCol xs={12}>
                                                            <CTable align='middle' responsive hover>
                                                                <CTableHead>
                                                                    <CTableRow>
                                                                        <CTableHeaderCell className='text-nowrap' scope='col'>
                                                                            <FormattedMessage id='AccountPage.th.date' />
                                                                        </CTableHeaderCell>
                                                                        <CTableHeaderCell className='text-nowrap' scope='col'>
                                                                            <FormattedMessage id='AccountPage.th.amount' />
                                                                        </CTableHeaderCell>
                                                                        <CTableHeaderCell className='text-nowrap' scope='col'>
                                                                            <FormattedMessage id='AccountPage.th.from' />
                                                                        </CTableHeaderCell>
                                                                        <CTableHeaderCell className='text-nowrap' scope='col'>
                                                                            <FormattedMessage id='AccountPage.th.to' />
                                                                        </CTableHeaderCell>
                                                                        <CTableHeaderCell className='text-nowrap' scope='col'>
                                                                            <FormattedMessage id='AccountPage.th.type' />
                                                                        </CTableHeaderCell>
                                                                        <CTableHeaderCell className='text-nowrap' scope='col'>
                                                                            <FormattedMessage id='AccountPage.th.desc' />
                                                                        </CTableHeaderCell>
                                                                        <CTableHeaderCell className='text-nowrap' scope='col'></CTableHeaderCell>
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
                    <CCol sm={6} md={4}>
                        <CCard color='transparent' className='border border-3 border-dashed add-account-card' onClick={() => this.setState({ showAddAccountModal: true })}>
                            <div className='text-center'>
                                <div className='fs-3 fw-bold'>＋</div>
                                <div className='fs-5'>
                                    <FormattedMessage id='AccountPage.addAccountBtn' />
                                </div>
                            </div>
                        </CCard>
                    </CCol>
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
                    headerText={AppUtil.getFormattedMessage(lang, 'AccountPage.accountModal.delete.title')}
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
                    headerText={AppUtil.getFormattedMessage(lang, 'AccountPage.accountRecordModal.delete.title')}
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
        lang: getLang(state),
        accountList: getAccountList(state),
        accountRecordDeletable: isAccountRecordDeletable(state),
        bankInfos: getBankInfoList(state),
        defaultRecordType: getDefaultRecordType(state),
        currencyOptions: getCurrencies(state),
        recordTypeOptions: getRecordTypes(state),
        bankCodeOptions: getBankInfos(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<AccountVo[] | string | boolean>>) => {
    return {
        setAccountList: SetAccountListDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountPage);
