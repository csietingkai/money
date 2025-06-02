import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { CButton, CButtonGroup, CCard, CCardBody, CCardHeader, CCol, CDropdown, CDropdownToggle, CFormSwitch, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowCircleBottom, cilArrowCircleTop, cilOptions, cilPencil, cilPlus, cilTrash } from '@coreui/icons';
import { ReduxState, getAuthTokenId, getFundOwnList, getStockType, getUserSetting } from '../../reducer/Selector';
import AccountApi, { Account } from '../../api/account';
import AuthApi, { UserSetting } from '../../api/auth';
import FundApi, { UserFundRecordVo, UserFundVo } from '../../api/fund';
import { SetAccountListDispatcher, SetFundTradeConditionDispatcher, SetLoadingDispatcher, SetNotifyDispatcher, SetOwnFundListDispatcher, SetOwnStockListDispatcher, SetUserSettingDispatcher } from '../../reducer/PropsMapper';
import AppConfirmModal from '../../components/AppConfirmModal';
import AppPagination from '../../components/AppPagination';
import * as AppUtil from '../../util/AppUtil';
import { DATA_COUNT_PER_PAGE, DEFAULT_DECIMAL_PRECISION } from '../../util/Constant';
import { StockType } from '../../util/Enum';
import { Action } from '../../util/Interface';
import FundTradeCondition, { TradeType } from './interface/FundTradeCondition';

export interface FundOwnPageProps {
    userSetting: UserSetting;
    userId: string;
    stockType: StockType;
    ownFundList: UserFundVo[];
    setUserSetting: (setting: UserSetting) => void;
    setFundTradeCondition: (tradeCondition?: FundTradeCondition) => void;
    setAccountList: (accountList: Account[]) => void;
    setOwnFundList: (ownFundList: UserFundVo[]) => void;
    notify: (message: string) => void;
    setLoading: (loading: boolean) => void;
}

export interface FundOwnPageState {
    show: { [stockCode: string]: boolean; };
    currentOwnFundRecords: UserFundRecordVo[];
    ownFundRecordPage: number;
    showDeleteRecordModal: boolean;
    holdingRecordId: string;
    holdingUserFundId: string;
}

class FundOwnPage extends React.Component<FundOwnPageProps, FundOwnPageState> {

    constructor(props: FundOwnPageProps) {
        super(props);
        this.state = {
            show: props.ownFundList.reduce((acc, curr) => {
                acc[curr.fundCode] = false;
                return acc;
            }, {}),
            currentOwnFundRecords: [],
            ownFundRecordPage: 1,
            showDeleteRecordModal: false,
            holdingRecordId: '',
            holdingUserFundId: ''
        };
    }

    private toggleInfo = async (ownFundInfo: UserFundVo) => {
        const { setLoading } = this.props;
        const { show } = this.state;
        const { id, fundCode } = ownFundInfo;
        for (const key in show) {
            if (key !== fundCode) {
                show[key] = false;
            }
        }
        show[fundCode] = !show[fundCode];
        if (show[fundCode]) {
            setLoading(true);
            await this.fetchUserFundRecords(id);
            setLoading(false);
        }
        this.setState({ show, ownFundRecordPage: 1 });
    };

    private toggleShowOwn = async (checked: boolean) => {
        const { userSetting, setUserSetting } = this.props;
        const newSetting: UserSetting = {
            ...userSetting,
            onlyShowOwnFund: checked
        }
        const { success } = await AuthApi.updateUserSetting(newSetting);
        if (success) {
            setUserSetting(newSetting);
            this.fetchUserFunds();
        }
    };

    private fetchUserFundRecords = async (userFundId: string) => {
        const response = await FundApi.getOwnRecords(userFundId);
        const { success, data } = response;
        if (success) {
            data.sort((a, b) => b.date.getTime() - a.date.getTime());
            this.setState({ currentOwnFundRecords: data });
        }
    };

    private getCard = (ownFundInfo: UserFundVo) => {
        const { userId, stockType } = this.props;
        const { show, currentOwnFundRecords, ownFundRecordPage } = this.state;
        const currentValue: number = AppUtil.toNumber((ownFundInfo.price * ownFundInfo.amount).toFixed(DEFAULT_DECIMAL_PRECISION));
        const benefit: number = AppUtil.toNumber((currentValue - ownFundInfo.cost).toFixed(DEFAULT_DECIMAL_PRECISION));
        let benefitColor: string = 'secondary';
        const postiveSign: string = benefit > 0 ? '+' : '';
        let benefitRate: number = 0;
        const showOwnFundRecords = currentOwnFundRecords.slice((ownFundRecordPage - 1) * DATA_COUNT_PER_PAGE, ownFundRecordPage * DATA_COUNT_PER_PAGE);
        if (ownFundInfo.amount) {
            benefitColor = AppUtil.getBenifitColor(benefit, stockType);
            benefitRate = AppUtil.toNumber((benefit * 100 / ownFundInfo.cost).toFixed(DEFAULT_DECIMAL_PRECISION));
        }
        return (
            <React.Fragment key={`${userId}-${ownFundInfo.fundCode}`}>
                <CCol sm={6} md={4}>
                    <CCard key={`own-stock-${ownFundInfo.fundCode}`} className={`bg-${benefitColor} text-white ${show[ownFundInfo.fundCode] ? `detailed-${benefitColor}` : ''}`}>
                        <CCardBody className='pb-0 mb-3 d-flex justify-content-between align-items-start'>
                            <div>
                                <div className='fs-4 fw-semibold'>
                                    {AppUtil.numberComma(currentValue)}{' '}
                                    <span className='fs-6 fw-normal'>
                                        ({postiveSign}{AppUtil.numberComma(benefit)} | {postiveSign}{AppUtil.numberComma(benefitRate)}% <CIcon icon={benefit > 0 ? cilArrowCircleTop : cilArrowCircleBottom} />)
                                    </span>
                                </div>
                                <div>
                                    {ownFundInfo.fundCode} {ownFundInfo.fundName} | {AppUtil.numberComma(ownFundInfo.amount)}股
                                </div>
                            </div>
                            <CDropdown alignment='end'>
                                <CDropdownToggle color='transparent' caret={false} className='text-white p-0' onClick={() => this.toggleInfo(ownFundInfo)}>
                                    <CIcon icon={cilOptions} />
                                </CDropdownToggle>
                            </CDropdown>
                        </CCardBody>
                    </CCard>
                </CCol>
                {
                    show[ownFundInfo.fundCode] &&
                    <CCol sm={12}>
                        <CCard>
                            <CCardHeader>
                                <strong>
                                    {ownFundInfo.fundName}
                                </strong>
                                &nbsp;
                                <small>
                                    <FormattedMessage id='FundOwnPage.record.subtitle' />
                                </small>
                            </CCardHeader>
                            <CCardBody>
                                <CRow>
                                    <CCol xs={12} className='mb-2 d-grid gap-2 d-md-flex justify-content-md-end'>
                                        <CButtonGroup role='group'>
                                            <CButton
                                                color='danger'
                                                variant='outline'
                                                onClick={() => this.tradeFundPage(ownFundInfo, 'buy')}
                                            >
                                                <FormattedMessage id='FundOwnPage.buyBtn' />
                                            </CButton>
                                            <CButton
                                                color='success'
                                                variant='outline'
                                                onClick={() => this.tradeFundPage(ownFundInfo, 'sell')}
                                            >
                                                <FormattedMessage id='FundOwnPage.sellBtn' />
                                            </CButton>
                                            <CButton
                                                color='info'
                                                variant='outline'
                                                onClick={() => this.tradeFundPage(ownFundInfo, 'bonus')}
                                            >
                                                <FormattedMessage id='FundOwnPage.bonusBtn' />
                                            </CButton>
                                        </CButtonGroup>
                                    </CCol>
                                </CRow>
                                <CRow>
                                    <CCol xs={12}>
                                        <CTable align='middle' responsive hover>
                                            <CTableHead>
                                                <CTableRow>
                                                    <CTableHeaderCell scope='col'>
                                                        <FormattedMessage id='FundOwnPage.th.tradeType' />
                                                    </CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>
                                                        <FormattedMessage id='FundOwnPage.th.date' />
                                                    </CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>
                                                        <FormattedMessage id='FundOwnPage.th.price' />
                                                    </CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>
                                                        <FormattedMessage id='FundOwnPage.th.share' />
                                                    </CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>
                                                        <FormattedMessage id='FundOwnPage.th.fee' />
                                                    </CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>
                                                        <FormattedMessage id='FundOwnPage.th.total' />
                                                    </CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'></CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                                {
                                                    showOwnFundRecords.map(r =>
                                                        <CTableRow key={r.id}>
                                                            <CTableDataCell>{r.type}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.toDateStr(r.date)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.price)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.share)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.fee)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.total)}</CTableDataCell>
                                                            <CTableDataCell>
                                                                <CButtonGroup role='group'>
                                                                    <CButton
                                                                        color='info'
                                                                        variant='outline'
                                                                        size='sm'
                                                                        onClick={() => {
                                                                            this.tradeFundPage(ownFundInfo, r.type.toLowerCase() as TradeType, r);
                                                                        }}
                                                                    >
                                                                        <CIcon icon={cilPencil}></CIcon>
                                                                    </CButton>
                                                                    <CButton
                                                                        color='danger'
                                                                        variant='outline'
                                                                        size='sm'
                                                                        onClick={() => this.setState({ showDeleteRecordModal: true, holdingRecordId: r.id, holdingUserFundId: ownFundInfo.id })}
                                                                    >
                                                                        <CIcon icon={cilTrash}></CIcon>
                                                                    </CButton>
                                                                </CButtonGroup>
                                                            </CTableDataCell>
                                                        </CTableRow>
                                                    )
                                                }
                                            </CTableBody>
                                        </CTable>
                                    </CCol>
                                </CRow>
                                <AppPagination totalDataCount={currentOwnFundRecords.length} currentPage={ownFundRecordPage} onChange={(page: number) => this.setState({ ownFundRecordPage: page })} className='justify-content-center'></AppPagination>
                            </CCardBody>
                        </CCard>
                    </CCol>
                }
            </React.Fragment>
        );
    };

    private tradeFundPage = (fundInfo?: UserFundVo, type?: TradeType, record?: UserFundRecordVo) => {
        const { setFundTradeCondition } = this.props;
        if (fundInfo && type) {
            if (type === 'buy') {
                const tradeCondition: FundTradeCondition = {
                    recordId: record?.id,
                    type,
                    code: fundInfo.fundCode,
                    name: fundInfo.fundName,
                    accountId: record?.accountId,
                    date: record?.date || new Date(),
                    debitAmount: (record && (record?.total - record?.fee)) || 0,
                    rate: record?.rate || 1,
                    price: record?.price || fundInfo.price,
                    share: record?.share,
                    fee: record?.fee,
                    accountRecordId: record?.accountRecordId,
                    fileId: record?.fileId
                };
                setFundTradeCondition(tradeCondition);
            } else {
                const tradeCondition: FundTradeCondition = {
                    recordId: record?.id,
                    type,
                    code: fundInfo.fundCode,
                    name: fundInfo.fundName,
                    accountId: record?.accountId,
                    date: record?.date || new Date(),
                    price: fundInfo.price,
                    rate: record?.rate || 1,
                    share: record?.share || fundInfo.amount,
                    total: record?.total,
                    accountRecordId: record?.accountRecordId,
                    fileId: record?.fileId
                };
                setFundTradeCondition(tradeCondition);
            }
        }
        window.location.assign('/#/fundTrade');
    };

    private removeRecord = async (recordId: string) => {
        const { notify } = this.props;
        const { message } = await FundApi.deleteRecord(recordId);
        notify(message);
    };

    private fetchUserFunds = async () => {
        const { setOwnFundList } = this.props;
        const { success, data } = await FundApi.getOwn();
        if (success) {
            setOwnFundList(data);
        } else {
            setOwnFundList([]);
        }
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

    render(): React.ReactNode {
        const { userSetting: { onlyShowOwnFund, lang }, ownFundList } = this.props;
        const { showDeleteRecordModal } = this.state;
        return (
            <React.Fragment>
                <CRow className='mb-4'>
                    <CCol sm={12} className='d-flex justify-content-end'>
                        <CButton color='secondary' variant='outline' onClick={() => this.toggleShowOwn(!onlyShowOwnFund)}>
                            <CFormSwitch
                                label={AppUtil.getFormattedMessage(lang, 'FundOwnPage.onlyShowOwn')}
                                checked={onlyShowOwnFund}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.toggleShowOwn(event.target.checked)}
                            />
                        </CButton>
                    </CCol>
                </CRow>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    {
                        ownFundList.map(s => this.getCard(s))
                    }
                </CRow>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    <CCol sm={12}>
                        <div className='d-grid gap-2 col-xs-8 col-md-6 mx-auto'>
                            <CButton size='lg' color='secondary' shape='rounded-pill' variant='outline' onClick={() => this.tradeFundPage()}>
                                <CIcon icon={cilPlus} className='me-2' />
                                <FormattedMessage id='FundOwnPage.tradeBtn' />
                            </CButton>
                        </div>
                    </CCol>
                </CRow>
                <AppConfirmModal
                    showModal={showDeleteRecordModal}
                    headerText='Remove Record'
                    onConfirm={async (result: boolean) => {
                        if (result) {
                            const { holdingRecordId, holdingUserFundId } = this.state;
                            await this.removeRecord(holdingRecordId);
                            this.fetchUserFunds();
                            this.fetchAccounts();
                            this.fetchUserFundRecords(holdingUserFundId);
                        }
                        this.setState({ showDeleteRecordModal: false, holdingRecordId: '', holdingUserFundId: '' });
                    }}
                />
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        userSetting: getUserSetting(state),
        userId: getAuthTokenId(state),
        ownFundList: getFundOwnList(state),
        stockType: getStockType(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<UserSetting | FundTradeCondition | undefined | Account[] | UserFundVo[] | string | boolean>>) => {
    return {
        setUserSetting: SetUserSettingDispatcher(dispatch),
        setFundTradeCondition: SetFundTradeConditionDispatcher(dispatch),
        setAccountList: SetAccountListDispatcher(dispatch),
        setOwnFundList: SetOwnFundListDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FundOwnPage);
