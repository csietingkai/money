import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Card, CardGroup, Col, Container, FormControl, InputGroup, Row } from 'react-bootstrap';
import { RouteChildrenProps } from 'react-router-dom';

import { LockIcon, UserIcon } from 'component/common/Icons';

import { removeAuthToken } from 'reducer/StateHolder';
import { LoginDispatcher, SetAccountListDispatcher } from 'reducer/PropsMapper';

import AccountApi, { Account, AccountsResponse } from 'api/account';
import AuthApi, { AuthResponse, AuthToken } from 'api/auth';

import Notify from 'util/Notify';

export interface LoginPageProps extends RouteChildrenProps<any> {
    login: (authToken: AuthToken) => void;
    setAccountList: (accounts: Account[]) => void;
}

export interface LoginPageState {
    username: string;
    password: string;
}

class LoginPage extends React.Component<LoginPageProps, LoginPageState> {

    constructor(props: LoginPageProps) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }

    private onFormFieldChange = (name: string) => (event: any) => {
        const newState: any = {};
        newState[name] = event.target.value;
        this.setState(newState);
    };

    private onLoginClick = async () => {
        const { username, password } = this.state;
        const response: AuthResponse = await AuthApi.login(username, password);
        const { success, data, message } = response;
        if (success) {
            this.props.login(data);
            const response2: AccountsResponse = await AccountApi.getAccounts(data.name);
            const { success: success2, data: data2 } = response2;
            if (success2) {
                this.props.setAccountList(data2);
            }
            Notify.success(message);
            this.setState({ username: '', password: '' });
        } else {
            removeAuthToken();
            Notify.error(message);
        }
    };

    private onRegisterClick = () => {
        window.location.replace('/#/register');
    };

    render() {
        const { username, password } = this.state;
        return (
            <div className='app flex-row align-items-center'>
                <Container>
                    <Row className='justify-content-center'>
                        <Col md='8'>
                            <CardGroup>
                                <Card className='p-4'>
                                    <Card.Body>
                                        <h1>Login</h1>
                                        <p className='text-muted'>Sign In to your account</p>
                                        <InputGroup className='mb-3'>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>
                                                    <UserIcon />
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <FormControl type='text' placeholder='Username' value={username} onChange={this.onFormFieldChange('username')} />
                                        </InputGroup>
                                        <InputGroup className='mb-4'>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>
                                                    <LockIcon />
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <FormControl type='password' placeholder='Password' value={password} onChange={this.onFormFieldChange('password')} />
                                        </InputGroup>
                                        <Row>
                                            <Col xs='6'>
                                                <Button color='primary' className='px-4' onClick={this.onLoginClick}>Login</Button>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Card className='text-white bg-primary py-5 d-md-down-none' style={{ width: 44 + '%' }}>
                                    <Card.Body className='text-center'>
                                        <div>
                                            <h2>Sign up</h2>
                                            <p>Doesn't have a account?</p>
                                            <br />
                                            <br />
                                            <br />
                                            <Button color='primary' className='mt-3' active onClick={this.onRegisterClick}>Register Now!</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </CardGroup>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

const mapStateToProps = (state: any) => {
    return {};
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        login: LoginDispatcher(dispatch),
        setAccountList: SetAccountListDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
