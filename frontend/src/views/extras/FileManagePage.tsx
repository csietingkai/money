import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { CButton, CButtonGroup, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { cilCloudUpload, cilPencil, cilTrash, cilZoom } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import AppConfirmModal from '../../components/AppConfirmModal';
import AppPagination from '../../components/AppPagination';
import FinancailFileApi, { FinancialFile } from '../../api/financailFile';
import { ReduxState, getAuthTokenId, getFileTypes, isMobile } from '../../reducer/Selector';
import { SetNotifyDispatcher } from '../../reducer/PropsMapper';
import * as AppUtil from '../../util/AppUtil';
import { DATA_COUNT_PER_PAGE } from '../../util/Constant';
import { Action, Option } from '../../util/Interface';

export interface FileManagePageProps {
    fileTypeOptions: Option[];
    isMobile: boolean;
    notify: (message: string) => void;
}

export interface FileManagePageState {
    files: FinancialFile[];
    fileType: string;
    showUploadModal: boolean;
    showEditModal: boolean;
    showPreviewModal: boolean;
    showDeleteModal: boolean;
    holdingFileId: string;
    uploadForm: {
        type: string;
        date: Date;
        file: any;
    };
    editForm: {
        id: string;
        type: string;
        date: Date;
        file: string;
    };
    page: number;
    fileTypeMap: { [key: string]: string; };
    pdfData: string;
}

class FileManagePage extends React.Component<FileManagePageProps, FileManagePageState> {

    constructor(props: FileManagePageProps) {
        super(props);
        const { fileTypeOptions } = props;
        this.state = {
            files: [],
            fileType: '',
            showUploadModal: false,
            showEditModal: false,
            showPreviewModal: false,
            showDeleteModal: false,
            holdingFileId: '',
            uploadForm: { type: fileTypeOptions[0].key, date: new Date(), file: null },
            editForm: { id: '', type: fileTypeOptions[0].key, date: new Date(), file: '' },
            page: 1,
            fileTypeMap: fileTypeOptions.reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {}),
            pdfData: ''
        };
        this.init();
    }

    private init = async () => {
        const { notify } = this.props;
        const response = await FinancailFileApi.list();
        const { success, data, message } = response;
        if (success) {
            this.setState({ files: data });
        } else {
            notify(message);
        }
    };

    private upload = async () => {
        const { notify } = this.props;
        const { uploadForm } = this.state;
        const response = await FinancailFileApi.upload(uploadForm.file, uploadForm.date, uploadForm.type);
        const { success, message } = response;
        notify(message);
        if (success) {
            this.init();
        }
        this.closeUploadModal();
    };

    private update = async () => {
        const { notify } = this.props;
        const { editForm } = this.state;
        const response = await FinancailFileApi.update(editForm.id, editForm.type, editForm.date);
        const { success, message } = response;
        notify(message);
        if (success) {
            this.init();
        }
        this.closeEditModal();
    };

    private preview = async (fileId: string) => {
        const { isMobile, notify } = this.props;
        const [filename, data] = await FinancailFileApi.download(fileId);
        if (!data) {
            notify(filename);
            return;
        }
        this.setState({ showPreviewModal: true, pdfData: URL.createObjectURL(new Blob([data], { type: 'application/pdf' })) });
    };

    private remove = async (fileId: string) => {
        const { notify } = this.props;
        const { success, message } = await FinancailFileApi.remove(fileId);
        notify(message);
        if (success) {
            this.init();
        }
    };

    private closeUploadModal = () => {
        const { fileTypeOptions } = this.props;
        this.setState({ showUploadModal: false, uploadForm: { type: fileTypeOptions[0].key, date: new Date(), file: null } });
    };

    private closeEditModal = () => {
        const { fileTypeOptions } = this.props;
        this.setState({ showEditModal: false, editForm: { id: '', type: fileTypeOptions[0].key, date: new Date(), file: '' } });
    };

    private closePreviewModal = () => {
        this.setState({ showPreviewModal: false, pdfData: '' });
    };

    private getUploadModal = (): React.ReactNode => {
        const { fileTypeOptions } = this.props;
        const { showUploadModal, uploadForm } = this.state;
        return (<CModal alignment='center' visible={showUploadModal} onClose={this.closeUploadModal}>
            <CModalHeader>
                <CModalTitle>
                    <FormattedMessage id='FileManagePage.uploadModal.upload.title' />
                </CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm onKeyDown={AppUtil.bindEnterKey(this.upload)}>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='type' className='col-sm-2 col-form-label'>
                            <FormattedMessage id='FileManagePage.uploadModal.type' />
                        </CFormLabel>
                        <div className='col-sm-10'>
                            <CFormSelect
                                id='type'
                                value={uploadForm.type}
                                onChange={(event: any) => this.setState({ uploadForm: { ...uploadForm, type: event.target.value as string } })}
                            >
                                {fileTypeOptions.map(o => <option key={`file-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='date' className='col-sm-2 col-form-label'>
                            <FormattedMessage id='FileManagePage.uploadModal.date' />
                        </CFormLabel>
                        <div className='col-sm-10'>
                            <input
                                type='date'
                                id='date'
                                className='form-control'
                                value={moment(uploadForm.date).format('YYYY-MM-DD')}
                                onChange={(event) => this.setState({ uploadForm: { ...uploadForm, date: new Date(event.target.value) } })}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='file' className='col-sm-2 col-form-label'>
                            <FormattedMessage id='FileManagePage.uploadModal.file' />
                        </CFormLabel>
                        <div className='col-sm-10'>
                            <CFormInput
                                type='file'
                                id='file'
                                accept='application/pdf'
                                onChange={(event: any) => this.setState({ uploadForm: { ...uploadForm, file: event.target.files[0] } })}
                            />
                        </div>
                    </CRow>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton color='primary' onClick={this.upload}>
                    <FormattedMessage id='FileManagePage.uploadModal.saveBtn' />
                </CButton>
                <CButton color='secondary' onClick={this.closeUploadModal}>
                    <FormattedMessage id='FileManagePage.uploadModal.closeBtn' />
                </CButton>
            </CModalFooter>
        </CModal>
        );
    };

    private getEditModal = (): React.ReactNode => {
        const { fileTypeOptions } = this.props;
        const { showEditModal, editForm } = this.state;
        return (
            <CModal alignment='center' visible={showEditModal} onClose={this.closeEditModal}>
                <CModalHeader>
                    <CModalTitle>
                        <FormattedMessage id='FileManagePage.uploadModal.edit.title' />
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='type' className='col-sm-2 col-form-label'>
                            <FormattedMessage id='FileManagePage.uploadModal.type' />
                        </CFormLabel>
                        <div className='col-sm-10'>
                            <CFormSelect
                                id='type'
                                value={editForm.type}
                                onChange={(event: any) => this.setState({ editForm: { ...editForm, type: event.target.value as string } })}
                            >
                                {fileTypeOptions.map(o => <option key={`file-option-${o.key}`} value={o.key}>{o.value}</option>)}
                            </CFormSelect>
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='date' className='col-sm-2 col-form-label'>
                            <FormattedMessage id='FileManagePage.uploadModal.date' />
                        </CFormLabel>
                        <div className='col-sm-10'>
                            <input
                                type='date'
                                id='date'
                                className='form-control'
                                value={moment(editForm.date).format('YYYY-MM-DD')}
                                onChange={(event) => this.setState({ editForm: { ...editForm, date: new Date(event.target.value) } })}
                            />
                        </div>
                    </CRow>
                    <CRow className='mb-3'>
                        <CFormLabel htmlFor='file' className='col-sm-2 col-form-label'>
                            <FormattedMessage id='FileManagePage.uploadModal.file' />
                        </CFormLabel>
                        <div className='col-sm-10'>
                            <CFormInput
                                type='text'
                                value={editForm.file}
                                disabled
                            />
                        </div>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color='primary' onClick={this.update}>
                        <FormattedMessage id='FileManagePage.uploadModal.saveBtn' />
                    </CButton>
                    <CButton color='secondary' onClick={this.closeEditModal}>
                        <FormattedMessage id='FileManagePage.uploadModal.closeBtn' />
                    </CButton>
                </CModalFooter>
            </CModal>
        );
    };

    private getPreviewModal = (): React.ReactNode => {
        const { showPreviewModal, pdfData } = this.state;
        return (
            <CModal size='xl' scrollable alignment='center' visible={showPreviewModal} onClose={this.closePreviewModal}>
                <CModalBody>
                    <CRow className='mb-3'>
                        <object data={pdfData} type='application/pdf' style={{ height: '75vh' }} />
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color='secondary' onClick={this.closePreviewModal}>
                        <FormattedMessage id='FileManagePage.uploadModal.closeBtn' />
                    </CButton>
                </CModalFooter>
            </CModal>
        );
    };

    render(): React.ReactNode {
        const { fileTypeOptions, isMobile } = this.props;
        const { files, fileType, showDeleteModal, editForm, page, fileTypeMap } = this.state;
        const filteredFiles = files.filter(f => fileType ? f.type === fileType : true);
        const showFiles = filteredFiles.slice((page - 1) * DATA_COUNT_PER_PAGE, page * DATA_COUNT_PER_PAGE);
        return (
            <React.Fragment>
                <CRow>
                    <CCol xs={12}>
                        <CCard className='mb-4'>
                            <CCardHeader>
                                <strong>
                                    <FormattedMessage id='FileManagePage.title' />
                                </strong>
                            </CCardHeader>
                            <CCardBody>
                                <CRow>
                                    <CCol xs={8}>
                                        <CButton
                                            color='info'
                                            variant='outline'
                                            className='mb-2'
                                            onClick={() => this.setState({ showUploadModal: true })}
                                        >
                                            <CIcon icon={cilCloudUpload} className='me-2'></CIcon>
                                            <FormattedMessage id='FileManagePage.uploadBtn' />
                                        </CButton>
                                    </CCol>
                                    <CCol xs={4}>
                                        {
                                            files.length ?
                                                <CFormSelect
                                                    id='type'
                                                    value={fileType}
                                                    onChange={(event: any) => this.setState({ fileType: event.target.value as string, page: 1 })}
                                                >
                                                    <option value=''>
                                                        <FormattedMessage id='FileManagePage.fileTypeAll' />
                                                    </option>
                                                    {fileTypeOptions.map(o => <option key={`filetype-option-${o.key}`} value={o.key}>{o.value}</option>)}
                                                </CFormSelect>
                                                : <React.Fragment></React.Fragment>
                                        }
                                    </CCol>
                                </CRow>
                                {
                                    filteredFiles.length ?
                                        <React.Fragment>
                                            <CRow className='mb-2'>
                                                <CCol>
                                                    <CTable align='middle' responsive hover>
                                                        <CTableHead>
                                                            <CTableRow>
                                                                <CTableHeaderCell className='text-nowrap' scope='col'>
                                                                    <FormattedMessage id='FileManagePage.th.filename' />
                                                                </CTableHeaderCell>
                                                                <CTableHeaderCell className='text-nowrap' scope='col'>
                                                                    <FormattedMessage id='FileManagePage.th.type' />
                                                                </CTableHeaderCell>
                                                                <CTableHeaderCell className='text-nowrap' scope='col'>
                                                                    <FormattedMessage id='FileManagePage.th.date' />
                                                                </CTableHeaderCell>
                                                                <CTableHeaderCell className='text-nowrap' scope='col'></CTableHeaderCell>
                                                            </CTableRow>
                                                        </CTableHead>
                                                        <CTableBody>
                                                            {
                                                                showFiles.map(f =>
                                                                    <CTableRow key={f.id}>
                                                                        <CTableDataCell>{f.filename}</CTableDataCell>
                                                                        <CTableDataCell>{fileTypeMap[f.type]}</CTableDataCell>
                                                                        <CTableDataCell>{AppUtil.toDateStr(f.date)}</CTableDataCell>
                                                                        <CTableDataCell>
                                                                            <CButtonGroup role='group'>
                                                                                <CButton
                                                                                    color='info'
                                                                                    variant='outline'
                                                                                    size='sm'
                                                                                    onClick={() => this.setState({ showEditModal: true, editForm: { ...editForm, id: f.id, type: f.type, date: f.date, file: f.filename } })}
                                                                                >
                                                                                    <CIcon icon={cilPencil}></CIcon>
                                                                                </CButton>
                                                                                {
                                                                                    !isMobile &&
                                                                                    <CButton
                                                                                        color='info'
                                                                                        variant='outline'
                                                                                        size='sm'
                                                                                        onClick={() => this.preview(f.id)}
                                                                                    >
                                                                                        <CIcon icon={cilZoom}></CIcon>
                                                                                    </CButton>
                                                                                }
                                                                                <CButton
                                                                                    color='danger'
                                                                                    variant='outline'
                                                                                    size='sm'
                                                                                    onClick={() => this.setState({ showDeleteModal: true, holdingFileId: f.id })}
                                                                                >
                                                                                    <CIcon icon={cilTrash}></CIcon>
                                                                                </CButton>
                                                                            </CButtonGroup>
                                                                        </CTableDataCell>
                                                                    </CTableRow>
                                                                )
                                                            }
                                                        </CTableBody>
                                                    </CTable>
                                                </CCol>
                                            </CRow>
                                            <AppPagination totalDataCount={filteredFiles.length} currentPage={page} onChange={(page: number) => this.setState({ page })} className='justify-content-center'></AppPagination>
                                        </React.Fragment>
                                        :
                                        <React.Fragment></React.Fragment>
                                }
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
                {this.getUploadModal()}
                {this.getEditModal()}
                {this.getPreviewModal()}
                <AppConfirmModal
                    showModal={showDeleteModal}
                    headerText='Remove File'
                    onConfirm={async (result: boolean) => {
                        if (result) {
                            await this.remove(this.state.holdingFileId);
                        }
                        this.setState({ showDeleteModal: false, holdingFileId: '' });
                    }}
                />
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        fileTypeOptions: getFileTypes(state),
        isMobile: isMobile(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<string | FinancialFile[]>>) => {
    return {
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FileManagePage);
