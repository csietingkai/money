import * as React from 'react';
import { connect } from 'react-redux';
import { Card as RbCard, Row, Col, ProgressBar } from 'react-bootstrap';

import { getAccountList, getAuthToken } from 'reducer/Selector';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';

import { PiggyBankIcon } from 'component/common/Icons';
import { numberComma, sum } from 'util/AppUtil';

const ACCOUNT_CARD_AMOUNT_PER_ROW: number = 4;

export interface DashBoardProps {
    authToken?: AuthToken;
    userAccounts?: Account[];
}

export interface DashBoardState { }

class DashBoard extends React.Component<DashBoardProps, DashBoardState> {

    constructor(props: DashBoardProps) {
        super(props);
        this.state = {};
    }

    private accountInfoCards = (accounts: Account[]) => {
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
                            <h3 className={`mb-0 text-${variant} mt-2`}>{`$${numberComma(x.balance)}`}</h3>
                            <p className='text-muted text-uppercase font-weight-bold font-xs'>{x.name}</p>
                            <ProgressBar now={percent} label={`${percent}%`} variant={variant} />
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

    render() {
        const { userAccounts } = this.props;
        return (
            <div className='animated fadeIn'>
                {this.accountInfoCards(userAccounts)}
            </div>
        );
    }
}

const mapStateToProps = (state: any) => {
    return {
        authToken: getAuthToken(state),
        userAccounts: getAccountList(state)
    };
};

export default connect(mapStateToProps)(DashBoard);;
