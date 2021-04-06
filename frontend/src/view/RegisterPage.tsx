import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Card, CardGroup, Col, Container, FormControl, InputGroup, Row } from 'react-bootstrap';
import { RouteChildrenProps } from 'react-router-dom';

import { LockIcon, UserIcon } from 'component/common/Icons';

import { removeAuthToken } from 'reducer/StateHolder';
import { LoginDispatcher } from 'reducer/PropsMapper';

import AuthApi, { AuthResponse, AuthToken } from 'api/auth';

import Notify from 'util/Notify';

export interface RegisterPageProps extends RouteChildrenProps<any> {
    login: (authToken: AuthToken) => void;
}

export interface RegisterPageState {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
}

class RegisterPage extends React.Component<RegisterPageProps, RegisterPageState> {

    constructor(props: RegisterPageProps) {
        super(props);
        this.state = {
            username: '',
            password: '',
            confirmPassword: '',
            email: ''
        };
    }

    private onFormFieldChange = (name: string) => (event: any) => {
        const newState: any = {};
        newState[name] = event.target.value;
        this.setState(newState);
    };

    private onRegisterClick = async () => {
        const { username, password, confirmPassword, email } = this.state;
        if (password !== confirmPassword) {
            Notify.warning('Passwords are NOT same.');
            return;
        }
        let response: AuthResponse = await AuthApi.register(username, email, password, false);
        const { message } = response;
        if (response.success) {
            response = await AuthApi.login(username, password);
            const { success, data } = response;
            if (success) {
                this.props.login(data);
                Notify.success(message);
            } else {
                removeAuthToken();
                Notify.error(message);
            }
            this.setState({ username: '', password: '', confirmPassword: '', email: '' });
        } else {
            removeAuthToken();
            Notify.error(message);
        }
    };

    render() {
        const { username, password, confirmPassword, email } = this.state;
        return (
            <div className='app flex-row align-items-center'>
                <Container>
                    <Row className='justify-content-center'>
                        <Col md='8'>
                            <CardGroup>
                                <Card>
                                    <Card.Body className="p-4">
                                        <h1>Register</h1>
                                        <p className="text-muted">Create your account</p>
                                        <InputGroup className="mb-3">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>
                                                    <UserIcon/>
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <FormControl type="text" placeholder="Username" value={username} onChange={this.onFormFieldChange('username')}/>
                                        </InputGroup>
                                        <InputGroup className="mb-3">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>@</InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <FormControl type="text" placeholder="Email" value={email} onChange={this.onFormFieldChange('email')}/>
                                        </InputGroup>
                                        <InputGroup className="mb-3">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>
                                                    <LockIcon/>
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <FormControl type="password" placeholder="Password" value={password} onChange={this.onFormFieldChange('password')}/>
                                        </InputGroup>
                                        <InputGroup className="mb-4">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>
                                                <LockIcon/>
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <FormControl type="password" placeholder="Repeat password" value={confirmPassword} onChange={this.onFormFieldChange('confirmPassword')}/>
                                        </InputGroup>
                                        <Button color="success" block onClick={this.onRegisterClick}>Create Account</Button>
                                    </Card.Body>
                                </Card>
                            </CardGroup>
                        </Col>
                    </Row>
                </Container>
            </div >
        );
    }
}

const mapStateToProps = (state: any) => {
    return {};
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        login: LoginDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPage);
