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

import AccountApi, { Account, AccountRecord, AccountsResponse } from 'api/account';
import { ExchangeRate } from 'api/exchangeRate';

import { find, toDateStr } from 'util/AppUtil';
import Notify from 'util/Notify';
import Table from 'component/common/Table';
import Button from 'component/common/Button';
import { PencilAltIcon, PlusIcon, TrashAltIcon } from 'component/common/Icons';
import Modal from 'component/common/Modal';
import Form, { Input } from 'component/common/Form';
import { InputType } from 'util/Enum';
import { SimpleResponse } from 'util/Interface';

export interface AccountManagementProps {
    username: string;
    exchangeRateList: ExchangeRate[];
}

export interface AccountManagementState {
    accounts: Account[];
    currentAccount: Account;
    accountRecords: AccountRecord[];
    currentAccountRecord: AccountRecord;
    accountModalOpen: boolean;
    deleteAccountModalOpen: boolean;
}

class AccountManagement extends React.Component<AccountManagementProps, AccountManagementState> {

    constructor(props: AccountManagementProps) {
        super(props);
        this.state = {
            accounts: [],
            currentAccount: undefined,
            accountRecords: [],
            currentAccountRecord: undefined,
            accountModalOpen: false,
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

    private toggleAccountModal = (rowData?: Account) => (event?: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
        if (event) {
            event.stopPropagation();
        }
        this.setState({ accountModalOpen: !this.state.accountModalOpen, currentAccount: rowData ? { ...rowData } : undefined });
    };

    private toggleDeleteAccountModal = (rowData?: Account) => (event?: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
        if (event) {
            event.stopPropagation();
        }
        this.setState({ deleteAccountModalOpen: !this.state.deleteAccountModalOpen, currentAccount: { ...rowData } });
    };

    private onAccountCreateClick = async () => {
        const { accounts, currentAccount: entity } = this.state;
        const resposne: SimpleResponse = await AccountApi.createAccount(entity);
        const { success, message } = resposne;
        if (success) {
            Notify.success(message);
            this.setState({ accounts });
        } else {
            Notify.error(message);
        }
        await this.fetchAccounts();
        this.toggleAccountModal()();
    };

    private onAccountEditClick = async () => {
        const { accounts, currentAccount } = this.state;
        if (currentAccount.balance !== 0) {
            Notify.warning('Balance is not ZERO, can not change currency');
            return;
        }
        const idx = accounts.findIndex(x => x.id === currentAccount.id);
        if (idx >= 0) {
            const entity: Account = { ...accounts[idx] };
            entity.currency = currentAccount.currency;
            entity.name = currentAccount.name;
            const resposne: SimpleResponse = await AccountApi.updateAccount(entity);
            const { success, message } = resposne;
            if (success) {
                Notify.success(message);
                this.setState({ accounts });
            } else {
                Notify.error(message);
            }
        }
        await this.fetchAccounts();
        this.toggleAccountModal()();
    };

    private onAccountDeleteClick = async () => {
        const { accounts, currentAccount } = this.state;
        if (currentAccount.balance !== 0) {
            Notify.warning('Balance is not ZERO, can not change currency');
            return;
        }
        const idx = accounts.findIndex(x => x.id === currentAccount.id);
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

    private onAccountTableRowClick = async (selectedRow: number) => {
        const { accounts } = this.state;
        const { id } = accounts[selectedRow];
        const resposne = await AccountApi.getRecords(id);
        console.log(resposne);
    };

    private toggleAccountRecordModal = (rowData?: AccountRecord) => (event?: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
        if (event) {
            event.stopPropagation();
        }
        this.setState({ accountModalOpen: !this.state.accountModalOpen, currentAccountRecord: rowData ? { ...rowData } : undefined });
    };

    render() {
        const { username, exchangeRateList } = this.props;
        const { accounts, currentAccount, accountRecords, currentAccountRecord, accountModalOpen, deleteAccountModalOpen } = this.state;

        const accountModal = (
            <Modal
                headerText='Edit Account'
                isShow={accountModalOpen}
                okBtnText='Submit'
                onOkClick={(currentAccount && currentAccount.id) ? this.onAccountEditClick : this.onAccountCreateClick}
                onCancelClick={this.toggleAccountModal()}
                verticalCentered={true}
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
            </Modal>
        );
        const deleteAccountModal = (
            <Modal
                headerText='Dedete Account'
                isShow={deleteAccountModalOpen}
                onOkClick={this.onAccountDeleteClick}
                onCancelClick={this.toggleDeleteAccountModal()}
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
                                    onClick={this.toggleAccountModal({ id: '', ownerName: this.props.username, currency: exchangeRateList[0]?.currency, name: '', balance: 0 })}
                                >
                                    <PlusIcon />
                                    {' Create'}
                                </Button>
                            </div>
                            <Table
                                id='account'
                                header={['name', 'ownerName', 'currency', 'balance', 'functions']}
                                data={accounts}
                                onRowClick={this.onAccountTableRowClick}
                                columnConverter={(header: string, rowData: any) => {
                                    if (header === 'functions') {
                                        return (
                                            <>
                                                <Button size='sm' variant='info' outline onClick={this.toggleAccountModal(rowData)}><PencilAltIcon /></Button>
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
                <Row>
                    <Col>
                        <Card
                            title='Account Records'
                        >
                            <div style={{ textAlign: 'right', marginBottom: '5px' }}>
                                <Button
                                    variant='primary'
                                    outline
                                    onClick={this.toggleAccountRecordModal({ id: '', transDate: new Date(), transAmount: 0, transFrom: '', transTo: '', description: '' })}
                                >
                                    <PlusIcon />
                                    {' Create'}
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
                {accountModal}
                {deleteAccountModal}
            </div>
        );
    }
}

const mapStateToProps = (state: any) => {
    return {
        username: getAuthTokenName(state),
        exchangeRateList: getExchangeRateList(state)
    };
};

export default connect(mapStateToProps)(AccountManagement);
