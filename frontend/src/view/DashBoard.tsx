import * as React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Badge } from 'react-bootstrap';

import { getAccountList, getAuthToken, getExchangeRateList, getFundList, getFundOwnList, getFundTrackingList, getStockOwnList, getStockStyle, getStockTrackingList, ReduxState } from 'reducer/Selector';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';
import { ExchangeRateVo } from 'api/exchangeRate';
import { FundVo, UserFundVo, UserTrackingFundVo } from 'api/fund';
import { UserStockVo, UserTrackingStockVo } from 'api/stock';

import AccountBalanceChart from 'component/common/chart/AccountBalanceChart';
import FundOwnChart from 'component/common/chart/FundOwnChart';
import StockOwnChart from 'component/common/chart/StockOwnChart';
import Card from 'component/common/Card';

import { isArrayEmpty, numberComma, sum, sumByKey, toNumber } from 'util/AppUtil';
import { DEFAULT_DECIMAL_PRECISION } from 'util/Constant';
import { StockStyle, Variant } from 'util/Enum';

export interface DashBoardProps {
    authToken: AuthToken;
    userAccounts: Account[];
    exchangeRateList: ExchangeRateVo[];
    stockOwnList: UserStockVo[];
    stockTrackingList: UserTrackingStockVo[];
    fundList: FundVo[];
    fundOwnList: UserFundVo[];
    fundTrackingList: UserTrackingFundVo[];
    stockStyle: StockStyle;
}

export interface DashBoardState { }

class DashBoard extends React.Component<DashBoardProps, DashBoardState> {

    constructor(props: DashBoardProps) {
        super(props);
        this.state = {};
    }

    private sumBalance = (accounts: Account[]): number => {
        return sumByKey(accounts, 'balance');
    };

    private sumStockValue = (stockOwnList: UserStockVo[]): number => {
        return sum(stockOwnList.map(x => x.price * x.amount));
    };

    private sumFundValue = (fundOwnList: UserFundVo[]): number => {
        const getFundInfo = (fundCode: string): FundVo => this.props.fundList.find(x => x.code === fundCode);
        const getExchangeRate = (currency: string): ExchangeRateVo => this.props.exchangeRateList.find(e => e.currency === currency);
        return sum(fundOwnList.map(x => {
            let rate: number = 1;
            const fund = getFundInfo(x.fundCode);
            const currency = getExchangeRate(fund?.currency);
            if (currency) {
                rate = currency.record.spotSell;
            }
            return x.price * x.amount * rate;
        }));
    };

    private accountChart = (accounts: Account[] = []): JSX.Element => {
        return (
            <div className="chart-wrapper">
                <Card
                    title={'Accounts'}
                >
                    <h2 className='text-center'>
                        <Badge className='mb-2' variant='secondary' pill>
                            Total Balance: ${numberComma(this.sumBalance(accounts))}
                        </Badge>
                    </h2>
                    <AccountBalanceChart accounts={accounts} />
                </Card>
            </div>
        );
    };

    private stockChart = (stockOwnList: UserStockVo[]): JSX.Element => {
        const value = this.sumStockValue(stockOwnList);
        const cost = this.sumStockCost(stockOwnList);
        return (
            <div className="chart-wrapper">
                <Card
                    title={'Stocks'}
                >
                    <h2 className='text-center'>
                        <Badge className='mb-2' variant='secondary' pill>
                            Total Stock Value: ${numberComma(value)}
                        </Badge>
                    </h2>
                    <h4 className='text-center'>
                        <Badge className='mb-2' variant='secondary' pill>
                            Total Stock Cost: ${numberComma(cost)}
                        </Badge>
                        <Badge className='mb-2' variant={this.getVariant(cost, value)} pill>
                            ({numberComma(toNumber(((value - cost) * 100 / cost).toFixed(DEFAULT_DECIMAL_PRECISION)))}%)
                        </Badge>
                    </h4>
                    <StockOwnChart ownList={stockOwnList} />
                </Card>
            </div >
        );
    };

    private sumStockCost = (data: UserStockVo[]): number => {
        return sum(data.map(x => x.cost));
    };

    private fundChart = (fundOwnList: UserFundVo[]): JSX.Element => {
        const { exchangeRateList, fundList } = this.props;
        const value = toNumber(this.sumFundValue(fundOwnList).toFixed(DEFAULT_DECIMAL_PRECISION));
        const cost = toNumber(this.sumFundCost(fundOwnList).toFixed(DEFAULT_DECIMAL_PRECISION));
        return (
            <div className="chart-wrapper">
                <Card
                    title={'Funds'}
                >
                    <h2 className='text-center'>
                        <Badge className='mb-2' variant='secondary' pill>
                            Total Fund Value: ${numberComma(value)}
                        </Badge>
                    </h2>
                    <h4 className='text-center'>
                        <Badge className='mb-2' variant='secondary' pill>
                            Total Fund Cost: ${numberComma(cost)}
                        </Badge>
                        <Badge className='mb-2' variant={this.getVariant(cost, value)} pill>
                            ({numberComma(toNumber(((value - cost) * 100 / cost).toFixed(DEFAULT_DECIMAL_PRECISION)))}%)
                        </Badge>
                    </h4>
                    <FundOwnChart exchangeRateList={exchangeRateList} fundList={fundList} ownList={fundOwnList} />
                </Card>
            </div>
        );
    };

    private sumFundCost = (data: UserFundVo[]): number => {
        return sum(data.map(x => x.cost));
    };

    private getVariant = (cost: number, value: number, stockStyle: StockStyle = this.props.stockStyle): Variant => {
        let variant: Variant = 'secondary';
        if (cost < value) {
            if (stockStyle === StockStyle.TW) {
                variant = 'danger';
            } else if (stockStyle === StockStyle.US) {
                variant = 'success';
            }
        } else if (cost > value) {
            if (stockStyle === StockStyle.TW) {
                variant = 'success';
            } else if (stockStyle === StockStyle.US) {
                variant = 'danger';
            }
        }
        return variant;
    };

    render(): JSX.Element {
        const { userAccounts, stockOwnList, fundOwnList } = this.props;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        {!isArrayEmpty(userAccounts) && this.accountChart(userAccounts)}
                    </Col>
                    <Col>
                        {!isArrayEmpty(stockOwnList) && this.stockChart(stockOwnList)}
                    </Col>
                    <Col>
                        {!isArrayEmpty(fundOwnList) && this.fundChart(fundOwnList)}
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        authToken: getAuthToken(state),
        userAccounts: getAccountList(state),
        exchangeRateList: getExchangeRateList(state, false),
        stockOwnList: getStockOwnList(state),
        stockTrackingList: getStockTrackingList(state),
        fundList: getFundList(state),
        fundOwnList: getFundOwnList(state),
        fundTrackingList: getFundTrackingList(state),
        stockStyle: getStockStyle(state)
    };
};

export default connect(mapStateToProps)(DashBoard);
