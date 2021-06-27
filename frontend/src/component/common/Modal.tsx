import * as React from 'react';
import { Modal as RbModal } from 'react-bootstrap';

import Button from 'component/common/Button';

export interface ModalProps {
    headerText?: string;
    okBtnText?: string;
    cancelBtnText?: string;
    isShow: boolean;
    onOkClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    onCancelClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    size?: 'sm' | 'lg' | 'xl';
    verticalCentered?: boolean;
}

export interface ModalState { }

export default class Modal extends React.Component<ModalProps, ModalState> {

    public static defaultProps: Partial<ModalProps> = {
        headerText: 'Notice',
        okBtnText: 'OK',
        cancelBtnText: 'Cancel'
    };

    constructor(props: ModalProps) {
        super(props);
        this.state = {};
    }

    render(): JSX.Element {
        const { headerText, okBtnText, cancelBtnText } = this.props;
        return (
            <RbModal show={this.props.isShow} size={this.props.size} onHide={() => { }} centered={this.props.verticalCentered}>
                <RbModal.Header>{headerText}</RbModal.Header>
                <RbModal.Body>
                    {this.props.children}
                </RbModal.Body>
                <RbModal.Footer>
                    <Button variant='primary' onClick={this.props.onOkClick}>{okBtnText}</Button>{' '}
                    <Button variant='secondary' onClick={this.props.onCancelClick}>{cancelBtnText}</Button>
                </RbModal.Footer>
            </RbModal>
        );
    }
}
