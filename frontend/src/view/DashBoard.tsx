import * as React from 'react';
import { connect } from 'react-redux';
import { Card as RbCard, Row, Col, ProgressBar } from 'react-bootstrap';

import { getAccountList, getAuthToken, getFundTrackingList, getStockStyle, getStockTrackingList, ReduxState } from 'reducer/Selector';

import { PiggyBankIcon, StarIcon } from 'component/common/Icons';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';
import { UserTrackingStockVo } from 'api/stock';

import { numberComma, sum } from 'util/AppUtil';
import { StockStyle } from 'util/Enum';
import { UserTrackingFundVo } from 'api/fund';

const STOCK_CARD_AMOUNT_PER_ROW: number = 4;
const FUND_CARD_AMOUNT_PER_ROW: number = 4;
const ACCOUNT_CARD_AMOUNT_PER_ROW: number = 4;

export interface DashBoardProps {
    authToken: AuthToken;
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

    private trackingStockCards = (stockTrackingList: UserTrackingStockVo[] = [], style: StockStyle = StockStyle.US) => {
        const cards: JSX.Element[] = stockTrackingList.map(x => {
            let variant: string = 'secondary';
            let sign: string = '+';
            if (style === StockStyle.TW) {
                if (x.amplitude > 0) {
                    variant = 'danger';
                } else if (x.amplitude < 0) {
                    variant = 'success';
                    sign = '';
                }
            } else {
                if (x.amplitude > 0) {
                    variant = 'success';
                } else if (x.amplitude < 0) {
                    variant = 'danger';
                    sign = '';
                }
            }
            return (
                <RbCard key={`dashboard-tracking-stock-card-${x.stockCode}`}>
                    <RbCard.Body className='clearfix p-3'>
                        <div className='clearfix'>
                            <h1 className='float-left display-4 mr-4'><StarIcon className={`bg-info p-3`} /></h1>
                            <h4 className='mb-0 text-info mt-2'>{x.stockCode}</h4>
                            <p className='mb-0 text-secondary mt-2'>{x.stockName}</p>
                            <h4 className={`mb-0 text-${variant} mt-2`}>{`${numberComma(x.record.closePrice)} (${sign}${numberComma(x.amplitude)})`}</h4>
                        </div>
                    </RbCard.Body>
                </RbCard>
            );
        });

        const cardGroups: JSX.Element[][] = [];
        while (cards.length) cardGroups.push(cards.splice(0, STOCK_CARD_AMOUNT_PER_ROW));

        return cardGroups.map((group, gIdx) => (
            <Row key={`dashboard-account-row-${gIdx}`}>
                {group.map((card, cIdx) => (
                    <Col xs='12' sm='6' lg='3' key={`dashboard-account-col-${cIdx}`}>
                        {card}
                    </Col>
                ))}
            </Row>
        ));
    };

    private trackingFundCards = (fundTrackingList: UserTrackingFundVo[] = [], style: StockStyle = StockStyle.US) => {
        const cards: JSX.Element[] = fundTrackingList.map(x => {
            let variant: string = 'secondary';
            let sign: string = '+';
            if (style === StockStyle.TW) {
                if (x.amplitude > 0) {
                    variant = 'danger';
                } else if (x.amplitude < 0) {
                    variant = 'success';
                    sign = '';
                }
            } else {
                if (x.amplitude > 0) {
                    variant = 'success';
                } else if (x.amplitude < 0) {
                    variant = 'danger';
                    sign = '';
                }
            }
            return (
                <RbCard key={`dashboard-tracking-fund-card-${x.fundCode}`}>
                    <RbCard.Body className='clearfix p-3'>
                        <div className='clearfix'>
                            <h1 className='float-left display-4 mr-4'><StarIcon className={`bg-info p-3`} /></h1>
                            <h4 className='mb-0 text-info mt-2'>{x.fundCode}</h4>
                            <p className='mb-0 text-secondary mt-2'>{x.fundName}</p>
                            <h4 className={`mb-0 text-${variant} mt-2`}>{`${numberComma(x.record.price)} (${sign}${numberComma(x.amplitude)})`}</h4>
                        </div>
                    </RbCard.Body>
                </RbCard>
            );
        });

        const cardGroups: JSX.Element[][] = [];
        while (cards.length) cardGroups.push(cards.splice(0, STOCK_CARD_AMOUNT_PER_ROW));

        return cardGroups.map((group, gIdx) => (
            <Row key={`dashboard-account-row-${gIdx}`}>
                {group.map((card, cIdx) => (
                    <Col xs='12' sm='6' lg='3' key={`dashboard-account-col-${cIdx}`}>
                        {card}
                    </Col>
                ))}
            </Row>
        ));
    };

    private accountInfoCards = (accounts: Account[] = []) => {
        const allBalance: number = sum(accounts.map(x => x.balance));
        const cards: JSX.Element[] = accounts.map(x => {
            let variant: string = 'danger';
            let percent: number = 0;
            if (allBalance !== 0) {
                percent = x.balance / allBalance * 100;
                if (percent >= 50) {
                    variant = 'success';
                } else if (percent >= 25) {
                    variant = 'warning';
                }
            }
            return (
                <RbCard key={`dashboard-account-card-${x.name}`}>
                    <RbCard.Body className='clearfix p-3'>
                        <div className='clearfix'>
                            <h1 className='float-left display-4 mr-4'><PiggyBankIcon className={`bg-${variant} p-3`} /></h1>
                            <h2 className={`mb-0 text-${variant} mt-2`}>{`$${numberComma(x.balance)}`}</h2>
                            <p className='text-muted text-uppercase font-weight-bold font-xs'>{x.name}</p>
                            <ProgressBar now={percent} label={`${percent.toFixed(2)}%`} variant={variant} />
                        </div>
                    </RbCard.Body>
                </RbCard>
            );
        });
        const cardGroups: JSX.Element[][] = [];
        while (cards.length) cardGroups.push(cards.splice(0, ACCOUNT_CARD_AMOUNT_PER_ROW));

        return cardGroups.map((group, gIdx) => (
            <Row key={`dashboard-account-row-${gIdx}`}>
                {group.map((card, cIdx) => (
                    <Col xs='12' sm='6' lg='3' key={`dashboard-account-col-${cIdx}`}>
                        {card}
                    </Col>
                ))}
            </Row>
        ));
    };

    render(): JSX.Element {
        const { stockTrackingList, fundTrackingList, userAccounts, stockStyle } = this.props;
        return (
            <div className='animated fadeIn'>
                {this.trackingStockCards(stockTrackingList, stockStyle)}
                {this.trackingFundCards(fundTrackingList, stockStyle)}
                {this.accountInfoCards(userAccounts)}
            </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        authToken: getAuthToken(state),
        stockTrackingList: getStockTrackingList(state),
        fundTrackingList: getFundTrackingList(state),
        userAccounts: getAccountList(state),
        stockStyle: getStockStyle(state)
    };
};

export default connect(mapStateToProps)(DashBoard);
