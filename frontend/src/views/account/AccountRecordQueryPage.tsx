import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormSwitch, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
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
}

export interface AccountRecordQueryPageState {
    recordTypeMap: { [key: string]: string; };
    searchConditionForm: AccountRecordSearchConditionForm;
    isSearchConditionFormValid: {
        startDate: boolean;
        endDate: boolean;
        desc: boolean;
    };
    accountRecords: AccountRecordVo[];
    accountRecordsPage: number;
}

class AccountRecordQueryPage extends React.Component<AccountRecordQueryPageProps, AccountRecordQueryPageState> {

    constructor(props: AccountRecordQueryPageProps) {
        super(props);
        const searchConditionForm: AccountRecordSearchConditionForm = this.handleSearchConditionForm(props.accountRecordQueryCondition)
        this.state = {
            recordTypeMap: props.recordTypeOptions.reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {}),
            searchConditionForm,
            isSearchConditionFormValid: {
                startDate: true,
                endDate: true,
                desc: true
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
            desc: ''
        };

        const {startDate, endDate, recordType, accountId, desc} = accountRecordQueryCondition;
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
        return searchConditionForm;
    }

    private validSearchCondition = (): boolean => {
        const { searchConditionForm, isSearchConditionFormValid } = this.state;
        const { useDateRange, useDesc, startDate, endDate, desc } = searchConditionForm;
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
        return true;
    };

    private search = async () => {
        const { notify } = this.props;
        if (!this.validSearchCondition()) {
            return;
        }
        const { searchConditionForm } = this.state;
        const { useDateRange, useRecordType, useAccountId, useDesc } = searchConditionForm;
        let startDate, endDate, recordType, accountId, desc;
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
        const { success, data, message } = await AccountApi.getRecords(accountId, startDate, endDate, recordType, desc);
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
                <CCol sm={7} className='mx-auto'>
                    <CCard className='mb-4'>
                        <CCardHeader>
                            <div className='d-flex'>
                                <CIcon size='lg' className='my-auto' icon={cilChevronDoubleRight} />
                                <strong className='ms-2'>Search Condition</strong>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            <CForm onKeyDown={AppUtil.bindEnterKey(this.search)}>
                                <CRow className='mb-3'>
                                    <CCol xs={3}>
                                        <CFormSwitch
                                            size='xl'
                                            label='Date Range'
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
                                    <CCol xs={12} sm={9}>
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
                                    <CCol xs={3}>
                                        <CFormSwitch
                                            size='xl'
                                            label='Record Type'
                                            id='use-record-type'
                                            checked={searchConditionForm.useRecordType}
                                            onChange={(event) => this.setState({ searchConditionForm: { ...searchConditionForm, useRecordType: event.target.checked } })}
                                        />
                                    </CCol>
                                    <CCol xs={12} sm={9}>
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
                                    <CCol xs={3}>
                                        <CFormSwitch
                                            size='xl'
                                            label='Account'
                                            id='use-account-id'
                                            checked={searchConditionForm.useAccountId}
                                            onChange={(event) => this.setState({ searchConditionForm: { ...searchConditionForm, useAccountId: event.target.checked } })}
                                        />
                                    </CCol>
                                    <CCol xs={12} sm={9}>
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
                                    <CCol xs={3}>
                                        <CFormSwitch
                                            size='xl'
                                            label='Description'
                                            id='use-desc'
                                            checked={searchConditionForm.useDesc}
                                            onChange={(event) => {
                                                const { checked } = event.target;
                                                isSearchConditionFormValid.desc = !checked || !!searchConditionForm.desc;
                                                this.setState({ searchConditionForm: { ...searchConditionForm, useDesc: event.target.checked }, isSearchConditionFormValid });
                                            }}
                                        />
                                    </CCol>
                                    <CCol xs={12} sm={9}>
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
                            <strong>Query Result</strong>
                        </CCardHeader>
                        <CCardBody>
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
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {
                                                accountRecords.length == 0 &&
                                                <CTableRow>
                                                    <CTableDataCell colSpan={6} className='text-center'>NO DATA</CTableDataCell>
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
