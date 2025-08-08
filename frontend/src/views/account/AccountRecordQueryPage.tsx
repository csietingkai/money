import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormCheck, CFormInput, CFormSelect, CFormSwitch, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { cilChevronDoubleRight, cilMediaSkipForward } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import moment from 'moment';
import { SetLoadingDispatcher, SetNotifyDispatcher } from '../../reducer/PropsMapper';
import { ReduxState, getAccountList, getAccountRecordQueryCondition, getRecordTypes } from '../../reducer/Selector';
import AccountApi, { Account, AccountRecordVo } from '../../api/account';
import AppPagination from '../../components/AppPagination';
import * as AppUtil from '../../util/AppUtil';
import { Action, Option } from '../../util/Interface';
import { DATA_COUNT_PER_PAGE } from '../../util/Constant';
import AccountRecordQueryCondition from './interface/AccountRecordQueryCondition';
import { AccountRecordTransType } from '../../util/Enum';

export interface AccountRecordQueryPageProps {
    accountList: Account[];
    accountRecordQueryCondition: AccountRecordQueryCondition;
    recordTypeOptions: Option[];
    notify: (message: string) => void;
    setLoading: (loading: boolean) => void;
}

interface AccountRecordSearchConditionForm extends AccountRecordQueryCondition {
    useDateRange: boolean;
    startDate: Date;
    endDate: Date;
    useRecordType: boolean;
    recordType: string;
    useAccountId: boolean;
    accountId: string;
    useDesc: boolean;
    desc: string;
    useAmount: boolean;
    amount: AccountRecordTransType[];
}

export interface AccountRecordQueryPageState {
    recordTypeMap: { [key: string]: string; };
    searchConditionForm: AccountRecordSearchConditionForm;
    isSearchConditionFormValid: {
        startDate: boolean;
        endDate: boolean;
        desc: boolean;
        amount: boolean;
    };
    accountRecords: AccountRecordVo[];
    accountRecordsPage: number;
}

class AccountRecordQueryPage extends React.Component<AccountRecordQueryPageProps, AccountRecordQueryPageState> {

    constructor(props: AccountRecordQueryPageProps) {
        super(props);
        const searchConditionForm: AccountRecordSearchConditionForm = this.handleSearchConditionForm(props.accountRecordQueryCondition);
        this.state = {
            recordTypeMap: props.recordTypeOptions.reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {}),
            searchConditionForm,
            isSearchConditionFormValid: {
                startDate: true,
                endDate: true,
                desc: true,
                amount: true
            },
            accountRecords: [],
            accountRecordsPage: 1
        };
    }

    private handleSearchConditionForm = (accountRecordQueryCondition: AccountRecordQueryCondition): AccountRecordSearchConditionForm => {
        const { recordTypeOptions, accountList } = this.props;
        const searchConditionForm: AccountRecordSearchConditionForm = {
            useDateRange: false,
            startDate: new Date(),
            endDate: new Date(),
            useRecordType: false,
            recordType: recordTypeOptions[0]?.key,
            useAccountId: false,
            accountId: accountList[0]?.id,
            useDesc: false,
            desc: '',
            useAmount: false,
            amount: []
        };

        const { startDate, endDate, recordType, accountId, desc, amount } = accountRecordQueryCondition;
        if (AppUtil.isValidDate(startDate)) {
            searchConditionForm.useDateRange = true;
            searchConditionForm.startDate = startDate as Date;
        }
        if (AppUtil.isValidDate(endDate)) {
            searchConditionForm.useDateRange = true;
            searchConditionForm.endDate = endDate as Date;
        }
        if (recordType && recordTypeOptions.find(o => o.key === recordType)) {
            searchConditionForm.useRecordType = true;
            searchConditionForm.recordType = recordType;
        }
        if (accountId && accountList.find(o => o.id === accountId)) {
            searchConditionForm.useAccountId = true;
            searchConditionForm.accountId = accountId;
        }
        if (desc) {
            searchConditionForm.useDesc = true;
            searchConditionForm.desc = desc;
        }
        if (amount?.length) {
            searchConditionForm.useAmount = true;
            searchConditionForm.amount = amount;
        }
        return searchConditionForm;
    };

    private validSearchCondition = (): boolean => {
        const { searchConditionForm, isSearchConditionFormValid } = this.state;
        const { useDateRange, startDate, endDate, useDesc, desc, useAmount, amount } = searchConditionForm;
        if (useDateRange && AppUtil.isValidDate(startDate) && AppUtil.isValidDate(endDate)) {
            const isDateRangeValid = (AppUtil.toDateStr(startDate, 'YYYY-MM-DD') || '') <= (AppUtil.toDateStr(endDate, 'YYYY-MM-DD') || '');
            if (!isDateRangeValid) {
                this.setState({ isSearchConditionFormValid: { ...isSearchConditionFormValid, startDate: false, endDate: false } });
                return false;
            }
        }
        if (useDesc && !desc) {
            this.setState({ isSearchConditionFormValid: { ...isSearchConditionFormValid, desc: false } });
            return false;
        }
        if (useAmount && !amount?.length) {
            this.setState({ isSearchConditionFormValid: { ...isSearchConditionFormValid, amount: false } });
            return false;
        }
        return true;
    };

    private search = async () => {
        const { notify } = this.props;
        if (!this.validSearchCondition()) {
            return;
        }
        const { searchConditionForm } = this.state;
        const { useDateRange, useRecordType, useAccountId, useDesc, useAmount } = searchConditionForm;
        let startDate, endDate, recordType, accountId, desc, amount;
        if (useDateRange) {
            startDate = searchConditionForm.startDate;
            endDate = searchConditionForm.endDate;
        }
        if (useRecordType) {
            recordType = searchConditionForm.recordType;
        }
        if (useAccountId) {
            accountId = searchConditionForm.accountId;
        }
        if (useDesc) {
            desc = searchConditionForm.desc;
        }
        if (useAmount) {
            amount = searchConditionForm.amount;
        }
        const { success, data, message } = await AccountApi.getRecords(accountId, startDate, endDate, recordType, desc, amount);
        if (success) {
            this.setState({ accountRecords: data, accountRecordsPage: 1 });
        } else {
            notify(message);
        }
    };

    private renderSearchCondition = () => {
        const { accountList, recordTypeOptions } = this.props;
        const { searchConditionForm, isSearchConditionFormValid } = this.state;
        return (
            <CRow>
                <CCol xs={12} sm={10} md={8} className='mx-auto'>
                    <CCard className='mb-4'>
                        <CCardHeader>
                            <div className='d-flex'>
                                <CIcon size='lg' className='my-auto' icon={cilChevronDoubleRight} />
                                <strong className='ms-2'>
                                    <FormattedMessage id='AccountRecordQueryPage.searchCondition.title' />
                                </strong>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            <CForm onKeyDown={AppUtil.bindEnterKey(this.search)} onSubmit={(event: React.FormEvent<HTMLFormElement>) => event.preventDefault()}>
                                <CRow className='mb-3'>
                                    <CCol xs={12} sm={4}>
                                        <CFormSwitch
                                            size='xl'
                                            label={<FormattedMessage id='AccountRecordQueryPage.searchCondition.dateRange' />}
                                            id='use-date-range'
                                            checked={searchConditionForm.useDateRange}
                                            onChange={(event) => {
                                                const { checked } = event.target;
                                                if (!checked) {
                                                    isSearchConditionFormValid.startDate = true;
                                                    isSearchConditionFormValid.endDate = true;
                                                } else if (AppUtil.isValidDate(searchConditionForm.startDate) && AppUtil.isValidDate(searchConditionForm.endDate)) {
                                                    const isDateRangeValid = (AppUtil.toDateStr(searchConditionForm.startDate, 'YYYY-MM-DD') || '') <= (AppUtil.toDateStr(searchConditionForm.endDate, 'YYYY-MM-DD') || '');
                                                    isSearchConditionFormValid.startDate = isDateRangeValid;
                                                    isSearchConditionFormValid.endDate = isDateRangeValid;
                                                }

                                                this.setState({ searchConditionForm: { ...searchConditionForm, useDateRange: event.target.checked }, isSearchConditionFormValid });
                                            }}
                                        />
                                    </CCol>
                                    <CCol xs={12} sm={8}>
                                        <CRow className='justify-content-around'>
                                            <CCol>
                                                <input
                                                    type='date'
                                                    id='record-query-start-date'
                                                    className={`form-control${!isSearchConditionFormValid.startDate ? ' is-invalid' : ''}`}
                                                    value={moment(searchConditionForm.startDate).format('YYYY-MM-DD')}
                                                    onChange={(event) => {
                                                        const startDate: Date = new Date(event.target.value);
                                                        if (AppUtil.isValidDate(startDate) && AppUtil.isValidDate(searchConditionForm.endDate)) {
                                                            const isDateRangeValid = (AppUtil.toDateStr(startDate, 'YYYY-MM-DD') || '') <= (AppUtil.toDateStr(searchConditionForm.endDate, 'YYYY-MM-DD') || '');
                                                            isSearchConditionFormValid.startDate = isDateRangeValid;
                                                            isSearchConditionFormValid.endDate = isDateRangeValid;
                                                        }
                                                        this.setState({ searchConditionForm: { ...searchConditionForm, startDate }, isSearchConditionFormValid });
                                                    }}
                                                    disabled={!searchConditionForm.useDateRange}
                                                />
                                            </CCol>
                                            <CCol xs={1} className='pl-0 pr-0 align-self-center text-center'>
                                                <CIcon icon={cilMediaSkipForward} size='lg' />
                                            </CCol>
                                            <CCol>
                                                <input
                                                    type='date'
                                                    id='record-query-end-date'
                                                    className={`form-control${!isSearchConditionFormValid.startDate ? ' is-invalid' : ''}`}
                                                    value={moment(searchConditionForm.endDate).format('YYYY-MM-DD')}
                                                    onChange={(event) => {
                                                        const endDate: Date = new Date(event.target.value);
                                                        if (AppUtil.isValidDate(searchConditionForm.startDate) && AppUtil.isValidDate(endDate)) {
                                                            const isDateRangeValid = (AppUtil.toDateStr(searchConditionForm.startDate, 'YYYY-MM-DD') || '') <= (AppUtil.toDateStr(endDate, 'YYYY-MM-DD') || '');
                                                            isSearchConditionFormValid.startDate = isDateRangeValid;
                                                            isSearchConditionFormValid.endDate = isDateRangeValid;
                                                        }
                                                        this.setState({ searchConditionForm: { ...searchConditionForm, endDate }, isSearchConditionFormValid });
                                                    }}
                                                    disabled={!searchConditionForm.useDateRange}
                                                />
                                            </CCol>
                                        </CRow>
                                    </CCol>
                                </CRow>
                                <CRow className='mb-3'>
                                    <CCol xs={12} sm={4}>
                                        <CFormSwitch
                                            size='xl'
                                            label={<FormattedMessage id='AccountRecordQueryPage.searchCondition.recordType' />}
                                            id='use-record-type'
                                            checked={searchConditionForm.useRecordType}
                                            onChange={(event) => this.setState({ searchConditionForm: { ...searchConditionForm, useRecordType: event.target.checked } })}
                                        />
                                    </CCol>
                                    <CCol xs={12} sm={8}>
                                        <CFormSelect
                                            value={searchConditionForm.recordType}
                                            onChange={(event: any) => this.setState({ searchConditionForm: { ...searchConditionForm, recordType: event.target.value as string } })}
                                            disabled={!searchConditionForm.useRecordType}
                                        >
                                            {recordTypeOptions.map(o => <option key={`record-type-option-${o.key}`} value={o.key}>{o.value}</option>)}
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                                <CRow className='mb-3'>
                                    <CCol xs={12} sm={4}>
                                        <CFormSwitch
                                            size='xl'
                                            label={<FormattedMessage id='AccountRecordQueryPage.searchCondition.account' />}
                                            id='use-account-id'
                                            checked={searchConditionForm.useAccountId}
                                            onChange={(event) => this.setState({ searchConditionForm: { ...searchConditionForm, useAccountId: event.target.checked } })}
                                        />
                                    </CCol>
                                    <CCol xs={12} sm={8}>
                                        <CFormSelect
                                            value={searchConditionForm.accountId}
                                            onChange={(event: any) => this.setState({ searchConditionForm: { ...searchConditionForm, accountId: event.target.value as string } })}
                                            disabled={!searchConditionForm.useAccountId}
                                        >
                                            {accountList.map(o => <option key={`account-option-${o.id}`} value={o.id}>{o.name}</option>)}
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                                <CRow className='mb-3'>
                                    <CCol xs={12} sm={4}>
                                        <CFormSwitch
                                            size='xl'
                                            label={<FormattedMessage id='AccountRecordQueryPage.searchCondition.description' />}
                                            id='use-desc'
                                            checked={searchConditionForm.useDesc}
                                            onChange={(event) => {
                                                const { checked } = event.target;
                                                isSearchConditionFormValid.desc = !checked || !!searchConditionForm.desc;
                                                this.setState({ searchConditionForm: { ...searchConditionForm, useDesc: event.target.checked }, isSearchConditionFormValid });
                                            }}
                                        />
                                    </CCol>
                                    <CCol xs={12} sm={8}>
                                        <CFormInput
                                            value={searchConditionForm.desc}
                                            className={`${!isSearchConditionFormValid.desc ? 'is-invalid' : ''}`}
                                            onChange={(event) => {
                                                const value = event.target.value as string;
                                                isSearchConditionFormValid.desc = !!value;
                                                this.setState({ searchConditionForm: { ...searchConditionForm, desc: value }, isSearchConditionFormValid });
                                            }}
                                            disabled={!searchConditionForm.useDesc}
                                        />
                                    </CCol>
                                </CRow>
                                <CRow className='mb-3'>
                                    <CCol xs={12} sm={4}>
                                        <CFormSwitch
                                            size='xl'
                                            label={<FormattedMessage id='AccountRecordQueryPage.searchCondition.amount.text' />}
                                            id='use-amount'
                                            checked={searchConditionForm.useAmount}
                                            onChange={(event) => {
                                                const { checked } = event.target;
                                                isSearchConditionFormValid.amount = !checked || !!searchConditionForm.amount?.length;
                                                this.setState({ searchConditionForm: { ...searchConditionForm, useAmount: event.target.checked }, isSearchConditionFormValid });
                                            }}
                                        />
                                    </CCol>
                                    <CCol xs={12} sm={8}>
                                        {
                                            Object.values(AccountRecordTransType).map(ct => (
                                                <CFormCheck
                                                    key={`account-record-query-amount-${ct}`}
                                                    className='col-form-label'
                                                    name='account-record-query-amount'
                                                    id={`account-record-query-amount-${ct}`}
                                                    label={<FormattedMessage id={`AccountRecordQueryPage.searchCondition.amount.${ct}`} />}
                                                    value={ct}
                                                    checked={searchConditionForm.amount.includes(ct)}
                                                    inline
                                                    invalid={!isSearchConditionFormValid.amount}
                                                    disabled={!searchConditionForm.useAmount}
                                                    onChange={(event) => {
                                                        const value = event.target.value as AccountRecordTransType;
                                                        if (searchConditionForm.amount.includes(value)) {
                                                            const amount = searchConditionForm.amount;
                                                            amount.splice(amount.indexOf(value), 1);
                                                            this.setState({ searchConditionForm: { ...searchConditionForm, amount }, isSearchConditionFormValid: { ...isSearchConditionFormValid, amount: !!amount.length } })
                                                        } else {
                                                            this.setState({ searchConditionForm: { ...searchConditionForm, amount: [ ...searchConditionForm.amount, ct ] }, isSearchConditionFormValid: { ...isSearchConditionFormValid, amount: true } })
                                                        }
                                                    }}
                                                />
                                            ))
                                        }
                                    </CCol>
                                </CRow>
                            </CForm>
                        </CCardBody>
                        <CCardFooter className='text-end'>
                            <CButton className='me-2' color='success' variant='outline' onClick={this.search}>
                                查詢
                            </CButton>
                        </CCardFooter>
                    </CCard>
                </CCol>
            </CRow>
        );
    };

    private renderSearchResult = (): React.ReactNode => {
        const { recordTypeMap, accountRecords, accountRecordsPage } = this.state;
        const showAccountRecords = accountRecords.slice((accountRecordsPage - 1) * DATA_COUNT_PER_PAGE, accountRecordsPage * DATA_COUNT_PER_PAGE);
        return (
            <CRow>
                <CCol>
                    <CCard>
                        <CCardHeader>
                            <strong>
                                <FormattedMessage id='AccountRecordQueryPage.searchResult.title' />
                            </strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow>
                                <CCol xs={12}>
                                    <CTable align='middle' responsive hover>
                                        <CTableHead>
                                            <CTableRow>
                                                <CTableHeaderCell className='text-nowrap' scope='col'>
                                                    <FormattedMessage id='AccountRecordQueryPage.searchResult.th.date' />
                                                </CTableHeaderCell>
                                                <CTableHeaderCell className='text-nowrap' scope='col'>
                                                    <FormattedMessage id='AccountRecordQueryPage.searchResult.th.amount' />
                                                </CTableHeaderCell>
                                                <CTableHeaderCell className='text-nowrap' scope='col'>
                                                    <FormattedMessage id='AccountRecordQueryPage.searchResult.th.from' />
                                                </CTableHeaderCell>
                                                <CTableHeaderCell className='text-nowrap' scope='col'>
                                                    <FormattedMessage id='AccountRecordQueryPage.searchResult.th.to' />
                                                </CTableHeaderCell>
                                                <CTableHeaderCell className='text-nowrap' scope='col'>
                                                    <FormattedMessage id='AccountRecordQueryPage.searchResult.th.type' />
                                                </CTableHeaderCell>
                                                <CTableHeaderCell className='text-nowrap' scope='col'>
                                                    <FormattedMessage id='AccountRecordQueryPage.searchResult.th.desc' />
                                                </CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {
                                                accountRecords.length == 0 &&
                                                <CTableRow>
                                                    <CTableDataCell colSpan={6} className='text-center'>
                                                        <FormattedMessage id='AccountRecordQueryPage.searchResult.noData' />
                                                    </CTableDataCell>
                                                </CTableRow>
                                            }
                                            {
                                                accountRecords.length > 0 &&
                                                showAccountRecords.map(r =>
                                                    <CTableRow key={r.id}>
                                                        <CTableDataCell>{AppUtil.toDateStr(r.transDate)}</CTableDataCell>
                                                        <CTableDataCell>{AppUtil.numberComma(r.transAmount)}</CTableDataCell>
                                                        <CTableDataCell>{r.transFrom === r.transTo ? '' : r.transFromName}</CTableDataCell>
                                                        <CTableDataCell>{r.transFrom === r.transTo ? '' : r.transToName}</CTableDataCell>
                                                        <CTableDataCell>{recordTypeMap[r.recordType]}</CTableDataCell>
                                                        <CTableDataCell>{r.description}</CTableDataCell>
                                                    </CTableRow>
                                                )
                                            }
                                        </CTableBody>
                                    </CTable>
                                </CCol>
                            </CRow>
                            <AppPagination totalDataCount={accountRecords.length} currentPage={accountRecordsPage} onChange={(page: number) => this.setState({ accountRecordsPage: page })} className='justify-content-center'></AppPagination>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        );
    };

    render(): React.ReactNode {
        const { accountList } = this.props;
        return (
            <React.Fragment>
                {this.renderSearchCondition()}
                {this.renderSearchResult()}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        accountList: getAccountList(state),
        accountRecordQueryCondition: getAccountRecordQueryCondition(state),
        recordTypeOptions: getRecordTypes(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<Account[] | string | boolean>>) => {
    return {
        notify: SetNotifyDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountRecordQueryPage);
