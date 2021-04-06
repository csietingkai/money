import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Card from 'component/common/Card';
import LineChart from 'component/common/chart/LineChart';
import BarChart from 'component/common/chart/BarChart';
import BubbleChart from 'component/common/chart/BubbleChart';
import PieChart from 'component/common/chart/PieChart';
import RadarChart from 'component/common/chart/RadarChart';
import ScatterChart from 'component/common/chart/ScatterChart';

import { getAuthTokenName, getExchangeRateList } from 'reducer/Selector';

import AccountApi, { Account, AccountRecord, AccountRecordsResponse, AccountResponse, AccountsResponse } from 'api/account';
import { ExchangeRate } from 'api/exchangeRate';

import { find, isArrayEmpty, toDateStr } from 'util/AppUtil';
import Notify from 'util/Notify';
import Table from 'component/common/Table';
import Button from 'component/common/Button';
import { CheckIcon, PencilAltIcon, PlusIcon, TimesIcon, TrashAltIcon } from 'component/common/Icons';
import Modal from 'component/common/Modal';
import Form, { Input } from 'component/common/Form';
import { InputType } from 'util/Enum';
import { SimpleResponse } from 'util/Interface';
import account from 'api/account';

export interface AccountManagementProps {
    username: string;
    exchangeRateList: ExchangeRate[];
}

export interface AccountManagementState {
    accounts: Account[];
    currentAccount: Account;
    accountRecords: AccountRecord[];
    currentAccountRecord: AccountRecord;
    deleteAccountModalOpen: boolean;
    page?: 'account-create' | 'account-edit' | 'record-income' | 'record-expend';
}

class AccountManagement extends React.Component<AccountManagementProps, AccountManagementState> {

    constructor(props: AccountManagementProps) {
        super(props);
        this.state = {
            accounts: [],
            currentAccount: undefined,
            accountRecords: [],
            currentAccountRecord: undefined,
            deleteAccountModalOpen: false
        };
        this.init();
    }

    private init = async () => {
        await this.fetchAccounts();
    };

    private fetchAccounts = async (username: string = this.props.username) => {
        const response: AccountsResponse = await AccountApi.getAccounts(username);
        const { success, data: accounts, message } = response;
        if (success) {
            this.setState({ accounts });
        } else {
            Notify.warning(message);
        }
    };

    private onAccountTableRowClick = async (selectedRow: number) => {
        const { accounts } = this.state;
        const currentAccount: Account = accounts[selectedRow];
        const { id } = currentAccount;
        const resposne: AccountRecordsResponse = await AccountApi.getRecords(id);
        const accountRecords: AccountRecord[] = resposne.data || [];
        this.setState({ currentAccount, accountRecords });
    };

    private toPage = (page?: 'account-create' | 'account-edit' | 'record-income' | 'record-expend') => {
        this.setState({ page });
    };

    private createAccount = () => (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const currentAccount: Account = {
            id: '',
            name: '',
            ownerName: this.props.username,
            currency: this.props.exchangeRateList[0].currency,
            balance: 0
        };
        this.setState({ currentAccount }, () => this.toPage('account-create'));
    };

    private editAccount = (rowData: Account) => (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        this.setState({ currentAccount: rowData }, () => this.toPage('account-edit'));
    };

    private toggleDeleteAccountModal = (rowData?: Account) => (event?: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
        this.setState({ deleteAccountModalOpen: !this.state.deleteAccountModalOpen, currentAccount: rowData });
    };

    private onAccountCreateClick = async () => {
        const { currentAccount } = this.state;
        const resposne: SimpleResponse = await AccountApi.createAccount(currentAccount);
        const { success, message } = resposne;
        if (success) {
            Notify.success(message);
            await this.fetchAccounts();
            this.toPage();
        } else {
            Notify.error(message);
        }
    };

    private onAccountEditClick = async () => {
        const { currentAccount } = this.state;
        if (currentAccount.balance !== 0) {
            Notify.warning('Balance is not ZERO, can not change currency');
            return;
        }
        const resposne: SimpleResponse = await AccountApi.updateAccount(currentAccount);
        const { success, message } = resposne;
        if (success) {
            Notify.success(message);
            await this.fetchAccounts();
            this.toPage();
        } else {
            Notify.error(message);
        }
    };

    private onAccountDeleteClick = async () => {
        const { accounts, currentAccount } = this.state;
        if (currentAccount.balance !== 0) {
            Notify.warning('Balance is not ZERO, can not change currency');
            return;
        }
        const idx: number = accounts.findIndex(x => x.id === currentAccount.id);
        if (idx >= 0) {
            const resposne: SimpleResponse = await AccountApi.deleteAccount(accounts[idx].id);
            const { success, message } = resposne;
            if (success) {
                Notify.success(message);
            } else {
                Notify.error(message);
            }
        }
        await this.fetchAccounts();
        this.toggleDeleteAccountModal()();
    };

    private onAccountRecordCreateClick = async () => {
        const { accounts, currentAccount, currentAccountRecord } = this.state;
        const resposne: SimpleResponse = await AccountApi.addRecord(currentAccountRecord);
        const { success, message } = resposne;
        if (success) {
            Notify.success(message);
            await this.onAccountTableRowClick(accounts.findIndex(x => x.id === currentAccount.id));
            this.toPage();
        } else {
            Notify.error(message);
        }
    };

    private createAccountRecordIncome = () => (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const { currentAccount } = this.state;
        const currentAccountRecord: AccountRecord = {
            id: '',
            transDate: new Date(),
            transAmount: 0,
            transFrom: currentAccount.id,
            transTo: currentAccount.id,
            description: ''
        };
        this.setState({ currentAccountRecord }, () => this.toPage('record-income'));
    };

    private renderMainPage = (): JSX.Element => {
        const { accounts, currentAccount, accountRecords, currentAccountRecord, deleteAccountModalOpen } = this.state;
        const deleteAccountModal = (
            <Modal
                headerText='Dedete Account'
                isShow={deleteAccountModalOpen}
                onOkClick={this.onAccountDeleteClick}
                onCancelClick={this.toggleDeleteAccountModal(currentAccount)}
                verticalCentered={true}
            >
                Are you sure to <span style={{ color: 'red' }}>DELETE</span> this Account?
            </Modal>
        );
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        <Card
                            title='Your Accounts'
                        >
                            <div style={{ textAlign: 'right', marginBottom: '5px' }}>
                                <Button
                                    variant='primary'
                                    outline
                                    onClick={this.createAccount()}
                                >
                                    <PlusIcon />
                                    {' Create'}
                                </Button>
                            </div>
                            <Table
                                id='account'
                                header={['name', 'ownerName', 'currency', 'balance', 'functions']}
                                data={accounts}
                                selectedRow={accounts.findIndex(x => x.id === currentAccount?.id)}
                                onRowClick={this.onAccountTableRowClick}
                                columnConverter={(header: string, rowData: any) => {
                                    if (header === 'functions') {
                                        return (
                                            <>
                                                <Button size='sm' variant='info' outline onClick={this.editAccount(rowData)}><PencilAltIcon /></Button>
                                                <Button size='sm' variant='danger' outline onClick={this.toggleDeleteAccountModal(rowData)}><TrashAltIcon /></Button>
                                            </>
                                        );
                                    } else {
                                        return rowData[header];
                                    }
                                }}
                            />
                        </Card>
                    </Col>
                </Row>
                {
                    currentAccount &&
                    <Row>
                        <Col>
                            <Card
                                title='Account Records'
                            >
                                <div style={{ textAlign: 'right', marginBottom: '5px' }}>
                                    <Button
                                        variant='success'
                                        outline
                                        onClick={this.createAccountRecordIncome()}
                                    >
                                        <PlusIcon />
                                        {' Income'}
                                    </Button>
                                    <Button
                                        variant='danger'
                                        outline
                                    // onClick={this.toPage('record-income')}
                                    >
                                        <PlusIcon />
                                        {' Expend'}
                                    </Button>
                                </div>
                                <Table
                                    id='account-record'
                                    header={['ownerName', 'currency', 'balance', 'functions']}
                                    data={accountRecords}
                                />
                            </Card>
                        </Col>
                    </Row>
                }
                {deleteAccountModal}
            </div>
        );
    };

    private renderAccountFormPage = (): JSX.Element => {
        const { username, exchangeRateList } = this.props;
        const { currentAccount, page } = this.state;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        <Card
                            title={`${page === 'account-create' ? 'Create' : 'Edit'} Account`}
                        >
                            <Form
                                singleRow
                                inputs={[
                                    { key: 'ownerName', title: 'Owner Name', type: InputType.text, disabled: true, value: username, width: 3 },
                                    { key: 'currency', title: 'Currency', type: InputType.select, options: exchangeRateList.map(x => ({ key: x.currency, value: x.currency })), value: currentAccount?.currency, width: 3 },
                                    { key: 'name', title: 'Alias Name', type: InputType.text, value: currentAccount ? currentAccount.name : '', width: 3 },
                                    { key: 'balance', title: 'Balance', type: InputType.numeric, disabled: true, value: currentAccount ? currentAccount.balance : 0, width: 3 }
                                ]}
                                onChange={(formState: any) => {
                                    currentAccount.currency = formState.currency;
                                    currentAccount.name = formState.name;
                                    this.setState({ currentAccount });
                                }}
                            />
                            <div className='mr-1' style={{ textAlign: 'right', marginBottom: '5px' }}>
                                <Button
                                    variant='success'
                                    outline
                                    onClick={page === 'account-create' ? this.onAccountCreateClick : this.onAccountEditClick}
                                >
                                    <CheckIcon />
                                    {' Confirm'}
                                </Button>
                                <span style={{ marginRight: '5px' }}></span>
                                <Button
                                    variant='secondary'
                                    outline
                                    onClick={() => this.toPage()}
                                >
                                    <TimesIcon />
                                    {' Cancel'}
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    private renderAccountRecordFormPage = (): JSX.Element => {
        const { username, exchangeRateList } = this.props;
        const { currentAccountRecord, page } = this.state;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        <Card
                            title='Income'
                        >
                            <Form
                                singleRow
                                inputs={[
                                    { key: 'transDate', title: 'Transaction Date', type: InputType.date, value: currentAccountRecord?.transDate, width: 3 },
                                    { key: 'transAmount', title: 'Transaction Amount', type: InputType.numeric, value: currentAccountRecord?.transAmount, width: 3 },
                                    { key: 'description', title: 'Description', type: InputType.text, value: currentAccountRecord?.description, width: 3 }
                                ]}
                                onChange={(formState: any) => {
                                    currentAccountRecord.transDate = formState.transDate;
                                    currentAccountRecord.transAmount = formState.transAmount;
                                    currentAccountRecord.description = formState.description;
                                    this.setState({ currentAccountRecord });
                                }}
                            />
                            <div className='mr-1' style={{ textAlign: 'right', marginBottom: '5px' }}>
                                <Button
                                    variant='success'
                                    outline
                                    onClick={this.onAccountRecordCreateClick}
                                >
                                    <CheckIcon />
                                    {' Confirm'}
                                </Button>
                                <span style={{ marginRight: '5px' }}></span>
                                <Button
                                    variant='secondary'
                                    outline
                                    onClick={() => this.toPage()}
                                >
                                    <TimesIcon />
                                    {' Cancel'}
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    render() {
        const { username, exchangeRateList } = this.props;
        const { accounts, accountRecords, deleteAccountModalOpen, page } = this.state;

        let element = null;
        if (page === 'account-create' || page === 'account-edit') {
            element = this.renderAccountFormPage();
        } else if (page === 'record-income') {
            element = this.renderAccountRecordFormPage();
        } else {
            element = this.renderMainPage();
        }
        return element;
    }
}

const mapStateToProps = (state: any) => {
    return {
        username: getAuthTokenName(state),
        exchangeRateList: getExchangeRateList(state)
    };
};

export default connect(mapStateToProps)(AccountManagement);
