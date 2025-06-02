import React from 'react';
import { FormattedMessage } from 'react-intl';
import { CButton, CCol, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow } from '@coreui/react';

export interface AppConfirmModalProps {
    showModal: boolean;
    headerText: string;
    onConfirm: (result: boolean) => void;
}

export interface AppConfirmModalState { }

class AppConfirmModal extends React.Component<AppConfirmModalProps, AppConfirmModalState> {

    constructor(props: AppConfirmModalProps) {
        super(props);
    }

    render(): React.ReactNode {
        const { showModal, headerText, onConfirm } = this.props;
        return (
            <CModal alignment='center' visible={showModal} onClose={() => onConfirm(false)}>
                <CModalHeader>
                    <CModalTitle>{headerText}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className='mb-3'>
                        <CCol sm={12}>
                            <FormattedMessage id='AppConfirmModal.text'/>
                        </CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color='primary' onClick={() => onConfirm(true)}>
                        <FormattedMessage id='AppConfirmModal.confirmBtn'/>
                    </CButton>
                    <CButton color='secondary' onClick={() => onConfirm(false)}>
                        <FormattedMessage id='AppConfirmModal.cancelBtn'/>
                    </CButton>
                </CModalFooter>
            </CModal>
        );
    }
}

export default AppConfirmModal;
