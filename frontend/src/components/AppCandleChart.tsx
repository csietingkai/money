import React from 'react';
import { CChartBar } from '@coreui/react-chartjs';
import { cilCheckAlt } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { StockRecordVo } from '../api/stock';
import * as AppUtil from '../util/AppUtil';
import { StockType } from '../util/Enum';
import { CButton, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CRow } from '@coreui/react';
import { Ma, SupportLineType } from '../util/Interface';

export interface AppCandleChartProps {
    stockType: string;
    stockRecords: StockRecordVo[];
}

export interface AppCandleChartState {
    supportLineType: SupportLineType;
    selectedMa: Ma[];
}

class AppCandleChart extends React.Component<AppCandleChartProps, AppCandleChartState> {

    constructor(props: AppCandleChartProps) {
        super(props);
        this.state = {
            supportLineType: '',
            selectedMa: []
        };
    }

    private getStickColor = (record: StockRecordVo, prevRecord?: StockRecordVo, style = this.props.stockType) => {
        let color: string = 'black';
        if (!prevRecord) {
            prevRecord = { ...record, closePrice: record.openPrice };
        }
        if (style === StockType.TW) {
            if (prevRecord.closePrice > record.closePrice) {
                color = 'green';
            } else if (prevRecord.closePrice < record.closePrice) {
                color = 'red';
            }
        } else {
            if (prevRecord.closePrice > record.closePrice) {
                color = 'red';
            } else if (prevRecord.closePrice < record.closePrice) {
                color = 'green';
            }
        }
        return color;
    };

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
        const { stockRecords } = this.props;
        const { supportLineType, selectedMa } = this.state;
        const datasets: any[] = [
            {
                label: 'open and close',
                type: 'bar',
                data: stockRecords.map((x: StockRecordVo) => [x.openPrice, x.closePrice]),
                backgroundColor: stockRecords.map((x: StockRecordVo, idx: number) => this.getStickColor(x, stockRecords[idx - 1])),
                minBarLength: 1
            },
            {
                label: 'high and low',
                type: 'bar',
                barPercentage: 0.1,
                data: stockRecords.map((x: StockRecordVo) => [x.highPrice, x.lowPrice]),
                backgroundColor: stockRecords.map((x: StockRecordVo, idx: number) => this.getStickColor(x, stockRecords[idx - 1]))
            }
        ];
        if (supportLineType === 'ma') {
            if (selectedMa.includes('ma5')) {
                datasets.push({
                    label: 'ma5',
                    type: 'line',
                    data: stockRecords.map((x: StockRecordVo) => x.ma5),
                    borderColor: 'blue',
                    radius: 0,
                    borderWidth: 1
                });
            }
            if (selectedMa.includes('ma10')) {
                datasets.push({
                    label: 'ma10',
                    type: 'line',
                    data: stockRecords.map((x: StockRecordVo) => x.ma10),
                    borderColor: 'green',
                    radius: 0,
                    borderWidth: 1
                });
            }
            if (selectedMa.includes('ma20')) {
                datasets.push({
                    label: 'ma20',
                    type: 'line',
                    data: stockRecords.map((x: StockRecordVo) => x.ma20),
                    borderColor: 'purple',
                    radius: 0,
                    borderWidth: 1
                });
            }
            if (selectedMa.includes('ma40')) {
                datasets.push({
                    label: 'ma40',
                    type: 'line',
                    data: stockRecords.map((x: StockRecordVo) => x.ma40),
                    borderColor: 'pink',
                    radius: 0,
                    borderWidth: 1
                });
            }
            if (selectedMa.includes('ma60')) {
                datasets.push({
                    label: 'ma60',
                    type: 'line',
                    data: stockRecords.map((x: StockRecordVo) => x.ma60),
                    borderColor: 'yellow',
                    radius: 0,
                    borderWidth: 1
                });
            }
        } else if (supportLineType === 'bb') {
            datasets.push({
                label: 'ma20',
                type: 'line',
                data: stockRecords.map((x: StockRecordVo) => x.ma20),
                borderColor: 'purple',
                radius: 0,
                borderWidth: 1
            });
            datasets.push({
                label: 'bbup',
                type: 'line',
                data: stockRecords.map((x: StockRecordVo) => x.bbup),
                borderColor: 'blue',
                radius: 0,
                borderWidth: 1
            });
            datasets.push({
                label: 'bbdown',
                type: 'line',
                data: stockRecords.map((x: StockRecordVo) => x.bbdown),
                borderColor: 'pink',
                radius: 0,
                borderWidth: 1
            });
        }
        const labels = stockRecords.map((x: StockRecordVo) => AppUtil.toDateStr(x.dealDate));
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
                <CChartBar
                    data={{ labels, datasets }}
                    options={{
                        scales: {
                            x: { stacked: true },
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

export default AppCandleChart;
