import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { CCol, CContainer, CRow } from '@coreui/react';

export interface Page500Props { }

export interface Page500State { }

class Page500 extends React.Component<Page500Props, Page500State> {
    render(): React.ReactNode {
        return (
            <div className='bg-body-tertiary min-vh-100 d-flex flex-row align-items-center'>
                <CContainer>
                    <CRow className='justify-content-center'>
                        <CCol md={6}>
                            <span className='clearfix'>
                                <h1 className='float-start display-3 me-4'>500</h1>
                                <h4 className='pt-3'>
                                    <FormattedMessage id='Page500.title'/>
                                </h4>
                                <p className='text-body-secondary float-start'>
                                    <FormattedMessage id='Page500.subtitle'/>
                                </p>
                            </span>
                        </CCol>
                    </CRow>
                </CContainer>
            </div>
        );
    }
}

export default connect()(Page500);
