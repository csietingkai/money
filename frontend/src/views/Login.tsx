import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { CButton, CCard, CCardBody, CCardGroup, CCol, CContainer, CForm, CFormInput, CInputGroup, CInputGroupText, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import AuthApi, { AuthResponse, AuthToken } from '../api/auth';
import { LoginDispatcher, SetNotifyDispatcher } from '../reducer/PropsMapper';
import store, { init } from '../reducer/Store';
import * as AppUtil from '../util/AppUtil';
import { Action } from '../util/Interface';

export interface LoginProps {
    login: (vo: AuthToken) => void;
    notify: (message: string) => void;
}

export interface LoginState {
    username: string;
    password: string;
}

class Login extends React.Component<LoginProps, LoginState> {

    constructor(props: LoginProps) {
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
        const { login, notify } = this.props;
        const { username, password } = this.state;
        const response: AuthResponse = await AuthApi.login(username, password);
        const { success, data, message } = response;
        if (success) {
            login(data);
            init(store.dispatch, store.getState);
            notify(message);
        } else {
            this.setState({ username: '', password: '' });
        }
    };

    render(): React.ReactNode {
        const { username, password } = this.state;
        return (
            <div className='bg-body-tertiary min-vh-100 d-flex flex-row align-items-center'>
                <CContainer>
                    <CRow className='justify-content-center'>
                        <CCol lg={6} md={8} xs={12}>
                            <CCardGroup>
                                <CCard className='p-4'>
                                    <CCardBody>
                                        <CForm onKeyDown={AppUtil.bindEnterKey(this.onLoginClick)}>
                                            <h1>Login</h1>
                                            <p className='text-body-secondary'>Sign In to your account</p>
                                            <CInputGroup className='mb-3'>
                                                <CInputGroupText>
                                                    <CIcon icon={cilUser} />
                                                </CInputGroupText>
                                                <CFormInput
                                                    placeholder='Username'
                                                    autoComplete='username'
                                                    value={username}
                                                    onChange={this.onFormFieldChange('username')}
                                                />
                                            </CInputGroup>
                                            <CInputGroup className='mb-4'>
                                                <CInputGroupText>
                                                    <CIcon icon={cilLockLocked} />
                                                </CInputGroupText>
                                                <CFormInput
                                                    type='password'
                                                    placeholder='Password'
                                                    autoComplete='current-password'
                                                    value={password}
                                                    onChange={this.onFormFieldChange('password')}

                                                />
                                            </CInputGroup>
                                            <CRow>
                                                <CCol xs={6}>
                                                    <CButton color='primary' className='px-4' onClick={this.onLoginClick}>
                                                        Login
                                                    </CButton>
                                                </CCol>
                                            </CRow>
                                        </CForm>
                                    </CCardBody>
                                </CCard>
                            </CCardGroup>
                        </CCol>
                    </CRow>
                </CContainer>
            </div>
        );
    }
}



const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = (dispatch: Dispatch<Action<AuthToken | string>>) => {
    return {
        login: LoginDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
