import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { CButton, CButtonGroup, CCard, CCardBody, CCardHeader, CCol, CDropdown, CDropdownToggle, CFormSwitch, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowCircleBottom, cilArrowCircleTop, cilOptions, cilPencil, cilPlus, cilTrash } from '@coreui/icons';
import { ReduxState, getAuthTokenId, getStockOwnList, getStockType, getUserSetting } from '../../reducer/Selector';
import AccountApi, { Account } from '../../api/account';
import AuthApi, { UserSetting } from '../../api/auth';
import StockApi, { UserStockRecordVo, UserStockVo } from '../../api/stock';
import { SetAccountListDispatcher, SetLoadingDispatcher, SetNotifyDispatcher, SetOwnStockListDispatcher, SetStockTradeConditionDispatcher, SetUserSettingDispatcher } from '../../reducer/PropsMapper';
import AppConfirmModal from '../../components/AppConfirmModal';
import AppPagination from '../../components/AppPagination';
import * as AppUtil from '../../util/AppUtil';
import { DATA_COUNT_PER_PAGE, DEFAULT_DECIMAL_PRECISION } from '../../util/Constant';
import { StockType } from '../../util/Enum';
import { Action } from '../../util/Interface';
import StockTradeCondition, { TradeType } from './interface/StockTradeCondition';

export interface StockOwnPageProps {
    userSetting: UserSetting;
    userId: string;
    stockType: StockType;
    ownStockList: UserStockVo[];
    setUserSetting: (setting: UserSetting) => void;
    setStockTradeCondition: (tradeCondition?: StockTradeCondition) => void;
    setAccountList: (accountList: Account[]) => void;
    setOwnStockList: (ownStockList: UserStockVo[]) => void;
    notify: (message: string) => void;
    setLoading: (loading: boolean) => void;
}

export interface StockOwnPageState {
    show: { [stockCode: string]: boolean; };
    currentOwnStockRecords: UserStockRecordVo[];
    ownStockRecordPage: number;
    showDeleteRecordModal: boolean;
    holdingRecordId: string;
    holdingUserStockId: string;
}

class StockOwnPage extends React.Component<StockOwnPageProps, StockOwnPageState> {

    constructor(props: StockOwnPageProps) {
        super(props);
        this.state = {
            show: props.ownStockList.reduce((acc, curr) => {
                acc[curr.stockCode] = false;
                return acc;
            }, {}),
            currentOwnStockRecords: [],
            ownStockRecordPage: 1,
            showDeleteRecordModal: false,
            holdingRecordId: '',
            holdingUserStockId: ''
        };
    }

    private toggleInfo = async (ownStockInfo: UserStockVo) => {
        const { setLoading } = this.props;
        const { show } = this.state;
        const { id, stockCode } = ownStockInfo;
        for (const key in show) {
            if (key !== stockCode) {
                show[key] = false;
            }
        }
        show[stockCode] = !show[stockCode];
        if (show[stockCode]) {
            setLoading(true);
            await this.fetchUserStockRecords(id);
            setLoading(false);
        }
        this.setState({ show, ownStockRecordPage: 1 });
    };

    private toggleShowOwn = async (checked: boolean) => {
        const { userSetting, setUserSetting } = this.props;
        const newSetting: UserSetting = {
            ...userSetting,
            onlyShowOwnStock: checked
        }
        const { success } = await AuthApi.updateUserSetting(newSetting);
        if (success) {
            setUserSetting(newSetting);
            this.fetchUserStocks();
        }
    };

    private fetchUserStockRecords = async (userStockId: string) => {
        const response = await StockApi.getOwnRecords(userStockId);
        const { success, data } = response;
        if (success) {
            data.sort((a, b) => b.date.getTime() - a.date.getTime());
            this.setState({ currentOwnStockRecords: data });
        }
    };

    private getCard = (ownStockInfo: UserStockVo) => {
        const { userId, stockType } = this.props;
        const { show, currentOwnStockRecords, ownStockRecordPage } = this.state;
        const currentValue: number = AppUtil.toNumber((ownStockInfo.price * ownStockInfo.amount).toFixed(DEFAULT_DECIMAL_PRECISION));
        const benefit: number = AppUtil.toNumber((currentValue - ownStockInfo.cost).toFixed(DEFAULT_DECIMAL_PRECISION));
        let benefitColor: string = 'secondary';
        const postiveSign: string = benefit > 0 ? '+' : '';
        let benefitRate: number = 0;
        if (ownStockInfo.amount) {
            benefitColor = AppUtil.getBenifitColor(benefit, stockType);
            benefitRate = AppUtil.toNumber((benefit * 100 / ownStockInfo.cost).toFixed(DEFAULT_DECIMAL_PRECISION));
        }
        const showOwnStockRecords = currentOwnStockRecords.slice((ownStockRecordPage - 1) * DATA_COUNT_PER_PAGE, ownStockRecordPage * DATA_COUNT_PER_PAGE);
        return (
            <React.Fragment key={`${userId}-${ownStockInfo.stockCode}`}>
                <CCol sm={6} md={4}>
                    <CCard key={`own-stock-${ownStockInfo.stockCode}`} className={`bg-${benefitColor} text-white ${show[ownStockInfo.stockCode] ? `detailed-${benefitColor}` : ''}`}>
                        <CCardBody className='pb-0 mb-3 d-flex justify-content-between align-items-start'>
                            <div>
                                <div className='fs-4 fw-semibold'>
                                    {AppUtil.numberComma(currentValue)}{' '}
                                    <span className='fs-6 fw-normal'>
                                        ({postiveSign}{AppUtil.numberComma(benefit)} | {postiveSign}{AppUtil.numberComma(benefitRate)}% <CIcon icon={benefit > 0 ? cilArrowCircleTop : cilArrowCircleBottom} />)
                                    </span>
                                </div>
                                <div>
                                    {ownStockInfo.stockCode} {ownStockInfo.stockName} | {AppUtil.numberComma(ownStockInfo.amount)}股
                                </div>
                            </div>
                            <CDropdown alignment='end'>
                                <CDropdownToggle color='transparent' caret={false} className='text-white p-0' onClick={() => this.toggleInfo(ownStockInfo)}>
                                    <CIcon icon={cilOptions} />
                                </CDropdownToggle>
                            </CDropdown>
                        </CCardBody>
                    </CCard>
                </CCol>
                {
                    show[ownStockInfo.stockCode] &&
                    <CCol sm={12}>
                        <CCard>
                            <CCardHeader>
                                <strong>{ownStockInfo.stockName}</strong> <small>trade records</small>
                            </CCardHeader>
                            <CCardBody>
                                <CRow>
                                    <CCol xs={12} className='mb-2 d-grid gap-2 d-md-flex justify-content-md-end'>
                                        <CButtonGroup role='group'>
                                            <CButton
                                                color='danger'
                                                variant='outline'
                                                onClick={() => this.tradeStockPage(ownStockInfo, 'buy')}
                                            >
                                                Buy
                                            </CButton>
                                            <CButton
                                                color='success'
                                                variant='outline'
                                                onClick={() => this.tradeStockPage(ownStockInfo, 'sell')}
                                            >
                                                Sell
                                            </CButton>
                                            <CButton
                                                color='info'
                                                variant='outline'
                                                onClick={() => this.tradeStockPage(ownStockInfo, 'bonus')}
                                            >
                                                Bonus
                                            </CButton>
                                        </CButtonGroup>
                                    </CCol>
                                </CRow>
                                <CRow>
                                    <CCol xs={12}>
                                        <CTable align='middle' responsive hover>
                                            <CTableHead>
                                                <CTableRow>
                                                    <CTableHeaderCell scope='col'>Trade Type</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>Date</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>Price</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>Share</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>Fee</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>Tax</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>Total</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'></CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                                {
                                                    showOwnStockRecords.map(r =>
                                                        <CTableRow key={r.id}>
                                                            <CTableDataCell>{r.type}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.toDateStr(r.date)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.price)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.share)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.fee)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.tax)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.total)}</CTableDataCell>
                                                            <CTableDataCell>
                                                                <CButtonGroup role='group'>
                                                                    <CButton
                                                                        color='info'
                                                                        variant='outline'
                                                                        size='sm'
                                                                        onClick={() => {
                                                                            this.tradeStockPage(ownStockInfo, r.type.toLowerCase() as TradeType, r);
                                                                        }}
                                                                    >
                                                                        <CIcon icon={cilPencil}></CIcon>
                                                                    </CButton>
                                                                    <CButton
                                                                        color='danger'
                                                                        variant='outline'
                                                                        size='sm'
                                                                        onClick={() => this.setState({ showDeleteRecordModal: true, holdingRecordId: r.id, holdingUserStockId: ownStockInfo.id })}
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
                                <AppPagination totalDataCount={currentOwnStockRecords.length} currentPage={ownStockRecordPage} onChange={(page: number) => this.setState({ ownStockRecordPage: page })} className='justify-content-center'></AppPagination>
                            </CCardBody>
                        </CCard>
                    </CCol>
                }
            </React.Fragment>
        );
    };

    private tradeStockPage = (stockInfo?: UserStockVo, type?: TradeType, record?: UserStockRecordVo) => {
        const { setStockTradeCondition } = this.props;
        if (stockInfo && type) {
            const tradeCondition: StockTradeCondition = {
                recordId: record?.id,
                type,
                code: stockInfo.stockCode,
                name: stockInfo.stockName,
                currency: 'TWD', // TODO
                accountId: record?.accountId,
                date: record?.date || new Date(),
                price: record?.price || stockInfo.price,
                share: record?.share || stockInfo.amount,
                fee: record?.fee,
                tax: record?.tax,
                total: record?.total,
                accountRecordId: record?.accountRecordId,
                fileId: record?.fileId
            };
            setStockTradeCondition(tradeCondition);
        }
        window.location.assign('/#/stockTrade');
    };

    private removeRecord = async (recordId: string) => {
        const { notify } = this.props;
        const { message } = await StockApi.deleteRecord(recordId);
        notify(message);
    };

    private fetchUserStocks = async () => {
        const { setOwnStockList } = this.props;
        const { success, data } = await StockApi.getOwn();
        if (success) {
            setOwnStockList(data);
        } else {
            setOwnStockList([]);
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
        const { userSetting: { onlyShowOwnStock }, ownStockList } = this.props;
        const { showDeleteRecordModal } = this.state;
        return (
            <React.Fragment>
                <CRow className='mb-4'>
                    <CCol sm={12} className='d-flex justify-content-end'>
                        <CButton color='secondary' variant='outline' onClick={() => this.toggleShowOwn(!onlyShowOwnStock)}>
                            <CFormSwitch
                                label='Only Show Own'
                                checked={onlyShowOwnStock}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.toggleShowOwn(event.target.checked)}
                            />
                        </CButton>
                    </CCol>
                </CRow>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    {
                        ownStockList.map(s => this.getCard(s))
                    }
                </CRow>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    <CCol sm={12}>
                        <div className='d-grid gap-2 col-xs-8 col-md-6 mx-auto'>
                            <CButton size='lg' color='secondary' shape='rounded-pill' variant='outline' onClick={() => this.tradeStockPage()}>
                                <CIcon icon={cilPlus} className='me-2' />
                                Trade More Stock
                            </CButton>
                        </div>
                    </CCol>
                </CRow>
                <AppConfirmModal
                    showModal={showDeleteRecordModal}
                    headerText='Remove Record'
                    onConfirm={async (result: boolean) => {
                        if (result) {
                            const { holdingRecordId, holdingUserStockId } = this.state;
                            await this.removeRecord(holdingRecordId);
                            this.fetchUserStocks();
                            this.fetchAccounts();
                            this.fetchUserStockRecords(holdingUserStockId);
                        }
                        this.setState({ showDeleteRecordModal: false, holdingRecordId: '', holdingUserStockId: '' });
                    }}
                />
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        userId: getAuthTokenId(state),
        userSetting: getUserSetting(state),
        ownStockList: getStockOwnList(state),
        stockType: getStockType(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<UserSetting | StockTradeCondition | undefined | Account[] | UserStockVo[] | string | boolean>>) => {
    return {
        setUserSetting: SetUserSettingDispatcher(dispatch),
        setStockTradeCondition: SetStockTradeConditionDispatcher(dispatch),
        setAccountList: SetAccountListDispatcher(dispatch),
        setOwnStockList: SetOwnStockListDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(StockOwnPage);
