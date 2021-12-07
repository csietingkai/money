import * as React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Badge } from 'react-bootstrap';

import { getAccountList, getAuthToken, getFundTrackingList, getStockOwnList, getStockStyle, getStockTrackingList, ReduxState } from 'reducer/Selector';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';
import { UserStockVo, UserTrackingStockVo } from 'api/stock';
import { UserTrackingFundVo } from 'api/fund';

import AccountBalanceChart from 'component/common/chart/AccountBalanceChart';
import StockOwnChart from 'component/common/chart/StockOwnChart';
import Card from 'component/common/Card';

import { numberComma, sum, sumByKey } from 'util/AppUtil';
import { StockStyle } from 'util/Enum';

export interface DashBoardProps {
    authToken: AuthToken;
    stockOwnList: UserStockVo[];
    stockTrackingList: UserTrackingStockVo[];
    fundTrackingList: UserTrackingFundVo[];
    userAccounts: Account[];
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
        return (
            <div className="chart-wrapper">
                <Card
                    title={'Stocks'}
                >
                    <h2 className='text-center'>
                        <Badge className='mb-2' variant='secondary' pill>
                            Total Stock Value: ${numberComma(this.sumStockValue(stockOwnList))}
                        </Badge>
                    </h2>
                    <StockOwnChart ownList={stockOwnList} />
                </Card>
            </div>
        );
    };

    render(): JSX.Element {
        const { stockOwnList, userAccounts } = this.props;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        {this.accountChart(userAccounts)}
                    </Col>
                    <Col>
                        {this.stockChart(stockOwnList)}
                    </Col>
                    <Col></Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        authToken: getAuthToken(state),
        stockOwnList: getStockOwnList(state),
        stockTrackingList: getStockTrackingList(state),
        fundTrackingList: getFundTrackingList(state),
        userAccounts: getAccountList(state),
        stockStyle: getStockStyle(state)
    };
};

export default connect(mapStateToProps)(DashBoard);
