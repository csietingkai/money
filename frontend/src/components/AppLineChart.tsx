import React from 'react';
import { CChartLine } from '@coreui/react-chartjs';
import { cilCheckAlt } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { FundRecordVo } from '../api/fund';
import * as AppUtil from '../util/AppUtil';
import { CButton, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CRow } from '@coreui/react';
import { Ma, SupportLineType } from '../util/Interface';

export interface AppLineChartProps {
    fundRecords: FundRecordVo[];
}

export interface AppLineChartState {
    supportLineType: SupportLineType;
    selectedMa: Ma[];
}

class AppLineChart extends React.Component<AppLineChartProps, AppLineChartState> {

    constructor(props: AppLineChartProps) {
        super(props);
        this.state = {
            supportLineType: '',
            selectedMa: []
        };
    }

    private toggleMa = (ma: Ma) => {
        let { selectedMa } = this.state;
        if (selectedMa.includes(ma)) {
            selectedMa = selectedMa.filter(x => x !== ma);
        } else {
            selectedMa.push(ma);
        }
        this.setState({ supportLineType: 'ma', selectedMa });
    };

    render(): React.ReactNode {
        const { fundRecords } = this.props;
        const { supportLineType, selectedMa } = this.state;
        const datasets: any[] = [
            {
                label: '',
                data: fundRecords.map((x: FundRecordVo) => x.price),
                backgroundColor: 'rgba(151, 187, 205, 0.2)',
                borderColor: 'rgba(151, 187, 205, 1)',
                pointBackgroundColor: 'rgba(151, 187, 205, 1)',
                pointBorderColor: '#fff'
            }
        ];
        if (supportLineType === 'ma') {
            if (selectedMa.includes('ma5')) {
                datasets.push({
                    label: 'ma5',
                    type: 'line',
                    data: fundRecords.map((x: FundRecordVo) => x.ma5),
                    borderColor: 'blue',
                    radius: 0,
                    borderWidth: 1
                });
            }
            if (selectedMa.includes('ma10')) {
                datasets.push({
                    label: 'ma10',
                    type: 'line',
                    data: fundRecords.map((x: FundRecordVo) => x.ma10),
                    borderColor: 'green',
                    radius: 0,
                    borderWidth: 1
                });
            }
            if (selectedMa.includes('ma20')) {
                datasets.push({
                    label: 'ma20',
                    type: 'line',
                    data: fundRecords.map((x: FundRecordVo) => x.ma20),
                    borderColor: 'purple',
                    radius: 0,
                    borderWidth: 1
                });
            }
            if (selectedMa.includes('ma40')) {
                datasets.push({
                    label: 'ma40',
                    type: 'line',
                    data: fundRecords.map((x: FundRecordVo) => x.ma40),
                    borderColor: 'pink',
                    radius: 0,
                    borderWidth: 1
                });
            }
            if (selectedMa.includes('ma60')) {
                datasets.push({
                    label: 'ma60',
                    type: 'line',
                    data: fundRecords.map((x: FundRecordVo) => x.ma60),
                    borderColor: 'yellow',
                    radius: 0,
                    borderWidth: 1
                });
            }
        } else if (supportLineType === 'bb') {
            datasets.push({
                label: 'ma20',
                type: 'line',
                data: fundRecords.map((x: FundRecordVo) => x.ma20),
                borderColor: 'purple',
                radius: 0,
                borderWidth: 1
            });
            datasets.push({
                label: 'bbup',
                type: 'line',
                data: fundRecords.map((x: FundRecordVo) => x.bbup),
                borderColor: 'blue',
                radius: 0,
                borderWidth: 1
            });
            datasets.push({
                label: 'bbdown',
                type: 'line',
                data: fundRecords.map((x: FundRecordVo) => x.bbdown),
                borderColor: 'pink',
                radius: 0,
                borderWidth: 1
            });
        }
        const labels = fundRecords.map((x: FundRecordVo) => AppUtil.toDateStr(x.date));
        return (
            <React.Fragment>
                <CRow className='mb-2'>
                    <CCol>
                        <CDropdown variant='btn-group' className='me-2'>
                            <CButton color='info' variant='outline' onClick={() => this.setState({ supportLineType: 'ma' })}>Moving Average</CButton>
                            <CDropdownToggle color='info' variant='outline' split />
                            <CDropdownMenu>
                                <CDropdownItem onClick={() => this.toggleMa('ma5')}>{selectedMa.includes('ma5') && <CIcon icon={cilCheckAlt} />} MA5</CDropdownItem>
                                <CDropdownItem onClick={() => this.toggleMa('ma10')}>{selectedMa.includes('ma10') && <CIcon icon={cilCheckAlt} />} MA10</CDropdownItem>
                                <CDropdownItem onClick={() => this.toggleMa('ma20')}>{selectedMa.includes('ma20') && <CIcon icon={cilCheckAlt} />} MA20</CDropdownItem>
                                <CDropdownItem onClick={() => this.toggleMa('ma40')}>{selectedMa.includes('ma40') && <CIcon icon={cilCheckAlt} />} MA40</CDropdownItem>
                                <CDropdownItem onClick={() => this.toggleMa('ma60')}>{selectedMa.includes('ma60') && <CIcon icon={cilCheckAlt} />} MA60</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                        <CButton color='info' variant='outline' onClick={() => this.setState({ supportLineType: 'bb' })}>Bollinger Bands</CButton>
                    </CCol>
                </CRow>
                <CChartLine
                        data={{ labels, datasets }}
                        options={{
                            scales: {
                                y: { beginAtZero: false }
                            },
                            interaction: {
                                intersect: true,
                                mode: 'index'
                            },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    enabled: true,
                                }
                            },
                            animation: false
                        }}
                    />
            </React.Fragment>
        );
    }
}

export default AppLineChart;
