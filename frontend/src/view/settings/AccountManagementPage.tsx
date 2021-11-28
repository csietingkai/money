import * as React from 'react';
import { Dispatch } from 'react';
import { Badge, Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form from 'component/common/Form';
import { CheckIcon, PencilAltIcon, PlusIcon, TimesIcon, TrashAltIcon } from 'component/common/Icons';
import Modal from 'component/common/Modal';
import Table from 'component/common/Table';

import { SetAccountListDispatcher } from 'reducer/PropsMapper';
import { getAccountList, getAuthTokenName, getExchangeRateList, ReduxState } from 'reducer/Selector';

import AccountApi, { Account, AccountRecord, AccountRecordsResponse, AccountsResponse } from 'api/account';
import { ExchangeRateVo } from 'api/exchangeRate';

import { numberComma, sum, sumByKey, toDateStr, toNumber } from 'util/AppUtil';
import { InputType } from 'util/Enum';
import { Action, Record, SimpleResponse } from 'util/Interface';
import Notify from 'util/Notify';

export interface AccountManagementProps {
    username: string;
    exchangeRateList: ExchangeRateVo[];
    accounts: Account[];
    setAccountList: (accounts: Account[]) => void;
}

type Page = 'account-create' | 'account-edit' | 'record-income' | 'record-transfer' | 'record-expend';
export interface AccountManagementState {
    currentAccount: Account;
    accountRecords: AccountRecord[];
    currentAccountRecord: AccountRecord;
    deleteAccountModalOpen: boolean;
    deleteAccountRecordModalOpen: boolean;
    page?: Page;
}

class AccountManagement extends React.Component<AccountManagementProps, AccountManagementState> {

    constructor(props: AccountManagementProps) {
        super(props);
        this.state = {
            currentAccount: undefined,
            accountRecords: [],
            currentAccountRecord: undefined,
            deleteAccountModalOpen: false,
            deleteAccountRecordModalOpen: false,
        };
        this.init();
    }

    private init = async () => {
        await this.fetchAccounts();
    };

    private calcTotalInTwd = (accounts: Account[], exchangeRateList: ExchangeRateVo[]): number => {
        const rateMap = exchangeRateList.filter(x => x.record).reduce((map, item) => {
            map[item.currency] = item.record.cashSell;
            return map;
        }, {} as { [key: string]: number; });
        const allInTwd: number[] = accounts.map(acc => {
            return toNumber((acc.balance / (rateMap[acc.currency] || 1)).toFixed(3));
        });
        return sum(allInTwd);
    };

    private fetchAccounts = async (username: string = this.props.username) => {
        const response: AccountsResponse = await AccountApi.getAccounts(username);
        const { success, data: accounts, message } = response;
        if (success) {
            const { setAccountList } = this.props;
            setAccountList(accounts);
        } else {
            Notify.warning(message);
        }
    };

    private onAccountTableRowClick = async (selectedRow: number) => {
        const { accounts } = this.props;
        const currentAccount: Account = accounts[selectedRow];
        const { id } = currentAccount;
        const resposne: AccountRecordsResponse = await AccountApi.getRecords(id);
        const accountRecords: AccountRecord[] = resposne.data || [];
        this.setState({ currentAccount, accountRecords });
    };

    private toPage = (page?: Page) => {
        this.setState({ page });
    };

    private createAccount = () => () => {
        const currentAccount: Account = {
            id: '',
            name: '',
            ownerName: this.props.username,
            currency: this.props.exchangeRateList[0].currency,
            balance: 0
        };
        this.setState({ currentAccount }, () => this.toPage('account-create'));
    };

    private editAccount = (rowData: Account) => () => {
        this.setState({ currentAccount: rowData }, () => this.toPage('account-edit'));
    };

    private toggleDeleteAccountModal = (rowData?: Account) => () => {
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
        const { accounts } = this.props;
        const { currentAccount } = this.state;
        if (currentAccount.balance !== 0) {
            Notify.warning('Balance is not ZERO, can not change currency');
            this.toggleDeleteAccountModal(currentAccount)();
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
            this.toggleDeleteAccountModal()();
        }
        await this.fetchAccounts();
    };

    private onAccountRecordIncomeClick = async () => {
        const { accounts } = this.props;
        const { currentAccount, currentAccountRecord } = this.state;
        const resposne: SimpleResponse = await AccountApi.income(currentAccount.id, currentAccountRecord);
        const { success, message } = resposne;
        if (success) {
            Notify.success(message);
            await this.fetchAccounts();
            await this.onAccountTableRowClick(accounts.findIndex(x => x.id === currentAccount.id));
            this.toPage();
        } else {
            Notify.error(message);
        }
    };

    private onAccountRecordTransferClick = async () => {
        const { accounts } = this.props;
        const { currentAccount, currentAccountRecord } = this.state;
        if (currentAccount.balance < currentAccountRecord.transAmount) {
            Notify.error('You don\'t have enough money.');
            return;
        }
        const resposne: SimpleResponse = await AccountApi.transfer(currentAccount.id, currentAccountRecord);
        const { success, message } = resposne;
        if (success) {
            Notify.success(message);
            await this.fetchAccounts();
            await this.onAccountTableRowClick(accounts.findIndex(x => x.id === currentAccount.id));
            this.toPage();
        } else {
            Notify.error(message);
        }
    };

    private onAccountRecordExpendClick = async () => {
        const { accounts } = this.props;
        const { currentAccount, currentAccountRecord } = this.state;
        if (currentAccount.balance < currentAccountRecord.transAmount) {
            Notify.error('You don\'t have enough money.');
            return;
        }
        const resposne: SimpleResponse = await AccountApi.expend(currentAccount.id, currentAccountRecord);
        const { success, message } = resposne;
        if (success) {
            Notify.success(message);
            await this.fetchAccounts();
            await this.onAccountTableRowClick(accounts.findIndex(x => x.id === currentAccount.id));
            this.toPage();
        } else {
            Notify.error(message);
        }
    };

    private createAccountRecordIncome = () => {
        const { currentAccount } = this.state;
        const currentAccountRecord: AccountRecord = {
            id: '',
            transDate: new Date(),
            transAmount: 0,
            rate: 1,
            transFrom: currentAccount.id,
            transTo: currentAccount.id,
            description: ''
        };
        this.setState({ currentAccountRecord }, () => this.toPage('record-income'));
    };

    private createAccountRecordTransfer = () => {
        const { accounts } = this.props;
        const { currentAccount } = this.state;
        const currentAccountRecord: AccountRecord = {
            id: '',
            transDate: new Date(),
            transAmount: 0,
            rate: 1,
            transFrom: currentAccount.id,
            transTo: accounts.filter(x => x.id !== currentAccount.id)[0]?.id,
            description: ''
        };
        this.setState({ currentAccountRecord }, () => this.toPage('record-transfer'));
    };

    private createAccountRecordExpend = () => {
        const { currentAccount } = this.state;
        const currentAccountRecord: AccountRecord = {
            id: '',
            transDate: new Date(),
            transAmount: 0,
            rate: 1,
            transFrom: currentAccount.id,
            transTo: currentAccount.id,
            description: ''
        };
        this.setState({ currentAccountRecord }, () => this.toPage('record-expend'));
    };

    private toggleDeleteAccountRecordModal = (rowData?: AccountRecord) => () => {
        this.setState({ deleteAccountRecordModalOpen: !this.state.deleteAccountRecordModalOpen, currentAccountRecord: rowData });
    };

    private onAccountRecordDeleteClick = async () => {
        const { accounts } = this.props;
        const { currentAccount, currentAccountRecord } = this.state;
        if (currentAccount?.id) {
            const resposne: SimpleResponse = await AccountApi.deleteRecord(currentAccountRecord?.id);
            const { success, message } = resposne;
            if (success) {
                Notify.success(message);
            } else {
                Notify.error(message);
            }
            this.toggleDeleteAccountRecordModal()();
        }
        await this.fetchAccounts();
        const idx: number = accounts.findIndex(x => x.id === currentAccount.id);
        await this.onAccountTableRowClick(idx);
    };

    private renderMainPage = (): JSX.Element => {
        const { accounts, exchangeRateList } = this.props;
        const { currentAccount, accountRecords, deleteAccountModalOpen, currentAccountRecord, deleteAccountRecordModalOpen } = this.state;
        const deleteAccountModal = (
            <Modal
                headerText='Delete Account'
                isShow={deleteAccountModalOpen}
                onOkClick={this.onAccountDeleteClick}
                onCancelClick={this.toggleDeleteAccountModal(currentAccount)}
                verticalCentered={true}
            >
                Are you sure to <span style={{ color: 'red' }}>DELETE</span> the account: [{currentAccount?.name}]?
            </Modal>
        );
        const deleteAccountRecordModal = (
            <Modal
                headerText='Delete Account'
                isShow={deleteAccountRecordModalOpen}
                onOkClick={this.onAccountRecordDeleteClick}
                onCancelClick={this.toggleDeleteAccountRecordModal(currentAccountRecord)}
                verticalCentered={true}
            >
                Are you sure to <span style={{ color: 'red' }}>DELETE</span> the account record: [{currentAccountRecord?.description}]?
            </Modal>
        );
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        <Card
                            title={`Your Accounts (total: ${numberComma(this.calcTotalInTwd(accounts, exchangeRateList))} in TWD)`}
                        >
                            <div className='text-right mb-2'>
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
                                header={['name', 'currency', 'balance', 'functions']}
                                data={accounts}
                                selectedRow={accounts.findIndex(x => x.id === currentAccount?.id)}
                                onRowClick={this.onAccountTableRowClick}
                                columnConverter={(header: string, rowData: any) => {
                                    if (header === 'balance') {
                                        return numberComma(rowData[header]);
                                    } else if (header === 'functions') {
                                        return (
                                            <>
                                                <Button className='mr-2' size='sm' variant='info' outline onClick={this.editAccount(rowData)}><PencilAltIcon /></Button>
                                                <Button className='mr-2' size='sm' variant='danger' outline onClick={this.toggleDeleteAccountModal(rowData)}><TrashAltIcon /></Button>
                                            </>
                                        );
                                    }
                                    return rowData[header];
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
                                title={`[${currentAccount.name}] Account Records`}
                            >
                                <div className='text-right mb-2'>
                                    <Button
                                        className='mr-2'
                                        variant='success'
                                        outline
                                        onClick={this.createAccountRecordIncome}
                                    >
                                        <PlusIcon />
                                        {' Income'}
                                    </Button>
                                    <Button
                                        className='mr-2'
                                        variant='info'
                                        outline
                                        onClick={this.createAccountRecordTransfer}
                                    >
                                        <PlusIcon />
                                        {' Transfer'}
                                    </Button>
                                    <Button
                                        className='mr-2'
                                        variant='danger'
                                        outline
                                        onClick={this.createAccountRecordExpend}
                                    >
                                        <PlusIcon />
                                        {' Expend'}
                                    </Button>
                                </div>
                                <Table
                                    id='account-record'
                                    header={['transDate', 'transAmount', 'rate', 'transFromName', 'transToName', 'description', 'functions']}
                                    data={accountRecords}
                                    columnConverter={(header: string, rowData: any) => {
                                        if (header === 'transDate') {
                                            return toDateStr(rowData[header]);
                                        } else if (header === 'transAmount') {
                                            return numberComma(rowData[header]);
                                        } else if (['transFromName', 'transToName'].indexOf(header) >= 0) {
                                            if (rowData.transFrom === rowData.transTo) {
                                                return '';
                                            }
                                        } else if (header === 'functions') {
                                            return (
                                                <>
                                                    <Button className='mr-2' size='sm' variant='danger' outline onClick={this.toggleDeleteAccountRecordModal(rowData)}><TrashAltIcon /></Button>
                                                </>
                                            );
                                        }
                                        return rowData[header];
                                    }}
                                />
                            </Card>
                        </Col>
                    </Row>
                }
                {deleteAccountModal}
                {deleteAccountRecordModal}
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

    private renderAccountRecordIncomePage = (): JSX.Element => {
        const { currentAccount, currentAccountRecord } = this.state;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        <Card
                            title={`[${currentAccount.name}] Income`}
                        >
                            <h3>
                                <Badge className='mb-2' variant='info' pill>
                                    Your Current Balance: ${numberComma(currentAccount.balance)} (in {currentAccount.currency})
                                </Badge>
                            </h3>
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
                                    onClick={this.onAccountRecordIncomeClick}
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

    private renderAccountRecordTransferPage = (): JSX.Element => {
        const { accounts } = this.props;
        const { currentAccount, currentAccountRecord } = this.state;
        // only same currency
        const accountOptions: Record<string, string>[] = accounts.filter(x => x.id !== currentAccount.id).filter(x => x.currency === currentAccount.currency).map(x => ({ key: x.id, value: x.name }));
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        <Card
                            title={`[${currentAccount.name}] Transfer`}
                        >
                            <h3>
                                <Badge className='mb-2' variant='info' pill>
                                    Your Current Balance: ${numberComma(currentAccount.balance)} (in {currentAccount.currency})
                                </Badge>
                            </h3>
                            <Form
                                singleRow
                                inputs={[
                                    { key: 'transDate', title: 'Transaction Date', type: InputType.date, value: currentAccountRecord?.transDate, width: 3 },
                                    { key: 'transTo', title: 'Transfer To', type: InputType.select, value: currentAccountRecord?.transTo, width: 3, options: accountOptions },
                                    { key: 'transAmount', title: 'Transaction Amount', type: InputType.numeric, value: currentAccountRecord?.transAmount, width: 3 },
                                    { key: 'description', title: 'Description', type: InputType.text, value: currentAccountRecord?.description, width: 3 }

                                ]}
                                onChange={(formState: any) => {
                                    currentAccountRecord.transDate = formState.transDate;
                                    currentAccountRecord.transTo = formState.transTo;
                                    currentAccountRecord.transAmount = formState.transAmount;
                                    currentAccountRecord.description = formState.description;
                                    this.setState({ currentAccountRecord });
                                }}
                            />
                            <div className='mr-1' style={{ textAlign: 'right', marginBottom: '5px' }}>
                                <Button
                                    variant='success'
                                    outline
                                    onClick={this.onAccountRecordTransferClick}
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

    private renderAccountRecordExpendPage = (): JSX.Element => {
        const { currentAccount, currentAccountRecord } = this.state;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        <Card
                            title={`[${currentAccount.name}] Expend`}
                        >
                            <h3>
                                <Badge className='mb-2' variant='info' pill>
                                    Your Current Balance: ${numberComma(currentAccount.balance)} (in {currentAccount.currency})
                                </Badge>
                            </h3>
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
                                    onClick={this.onAccountRecordExpendClick}
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
        const { page } = this.state;
        if (page === 'record-income') {
            return this.renderAccountRecordIncomePage();
        } else if (page === 'record-transfer') {
            return this.renderAccountRecordTransferPage();
        } else if (page === 'record-expend') {
            return this.renderAccountRecordExpendPage();
        }
        return <></>;
    };

    render() {
        const { page } = this.state;

        let element = null;
        if (page === 'account-create' || page === 'account-edit') {
            element = this.renderAccountFormPage();
        } else if (page === 'record-income' || page === 'record-transfer' || page === 'record-expend') {
            element = this.renderAccountRecordFormPage();
        } else {
            element = this.renderMainPage();
        }
        return element;
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        username: getAuthTokenName(state),
        exchangeRateList: getExchangeRateList(state),
        accounts: getAccountList(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<Account[]>>) => {
    return {
        setAccountList: SetAccountListDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountManagement);
