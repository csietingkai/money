import React from 'react';
import ReactECharts, { EChartsOption } from 'echarts-for-react';
import { FundRecordVo } from '../api/fund';
import { StockRecordVo } from '../api/stock';
import * as AppUtil from '../util/AppUtil';
import { StockType } from '../util/Enum';
import { CButton, CCol, CFormSwitch, CRow } from '@coreui/react';
import { CHART_COLORS } from '../util/Constant';
import { SupportLineType } from '../util/Interface';

interface AppStockChartProps {
    stockType: string;
    chartType: 'stock';
    info: { name: string; };
    records: StockRecordVo[];
}

interface AppFundChartProps {
    chartType: 'fund';
    info: { name: string; };
    records: FundRecordVo[];
}

export type AppPriceChartProps = AppStockChartProps | AppFundChartProps;

type DateRange = '3m' | '6m' | 'ytd' | '1y' | '5y' | 'all';

export interface AppPriceChartState {
    dateRange: DateRange,
    supportLineType: SupportLineType;
}

class AppCandleChart extends React.Component<AppPriceChartProps, AppPriceChartState> {

    constructor(props: AppPriceChartProps) {
        super(props);
        this.state = {
            dateRange: '3m',
            supportLineType: '',
        };
    }

    private getStickColor = (style: string): [string, string] => {
        if (style === StockType.TW) {
            return ['#00da3c', '#ec0000'];
        } else {
            return ['#ec0000', '#00da3c'];
        }
    };

    private getZoomRatio = (): number => {
        const { chartType, records } = this.props;
        const { dateRange } = this.state;
        let zoomStart = 0;
        if (dateRange === 'all') {
            return zoomStart;
        }
        let dateDiff: number = 0;
        if (dateRange === 'ytd') {
            const today: Date = new Date();
            const firstDay: Date = new Date(today.getFullYear(), 0, 1);
            let firstDayData: StockRecordVo | FundRecordVo | undefined = undefined;
            if (chartType === 'stock') {
                firstDayData = records.filter(r => r.dealDate.getTime() >= firstDay.getTime())[0];
            } else if (chartType === 'fund') {
                firstDayData = records.filter(r => r.date.getTime() >= firstDay.getTime())[0];
            }
            if (firstDayData) {
                const firstDayDataIdx: number = records.findIndex(r => r.id === firstDayData.id);
                dateDiff = records.length - firstDayDataIdx - 1;
            } else {
                dateDiff = 0;
            }
        } else {
            const recordCntMap: { [dateRange: string]: number } = {
                '3m': 60,
                '6m': 120,
                '1y': 240,
                '5y': 1200
            }
            dateDiff = recordCntMap[dateRange];
        }
        return AppUtil.toNumber((100 - dateDiff / records.length * 100).toFixed(1));
    }

    private getSupportSeries = (): any[] => {
        const { records } = this.props;
        const { supportLineType } = this.state;
        const mas: string[] = ['ma5', 'ma10', 'ma20', 'ma40', 'ma60'];
        const bbs: string[] = ['bbup', 'ma20', 'bbdown'];
        let series: string[] = [];
        if (supportLineType === 'ma') {
            series = mas;
        }
        if (supportLineType === 'bb') {
            series = bbs;
        }
        return series.map(s => ({
            name: s.toUpperCase(),
            type: 'line',
            data: records.map(r => r[s]),
            smooth: true,
            showSymbol: false,
            lineStyle: {
                opacity: 0.5,
                width: 1
            }
        }));
    };

    private getChartOption = (): EChartsOption => {
        const { chartType, info, records } = this.props;
        const option: EChartsOption = {
            animation: false,
            color: CHART_COLORS,
            legend: {
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                textStyle: {
                    color: '#000'
                },
                position: (pos, params, el, elRect, size) => {
                    const obj = { top: 10 };
                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                    return obj;
                }
            },
            axisPointer: {
                link: [
                    {
                        xAxisIndex: 'all'
                    }
                ],
                label: {
                    backgroundColor: '#777'
                }
            },
            visualMap: {
                show: false,
                seriesIndex: 5,
                dimension: 2
            },
            grid: [
                {
                    left: '10%',
                    right: '8%',
                    height: '50%'
                },
                {
                    left: '10%',
                    right: '8%',
                    top: '63%',
                    height: '16%'
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: [],
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    splitLine: { show: false },
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {
                        z: 100
                    }
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: [],
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    min: 'dataMin',
                    max: 'dataMax'
                }
            ],
            yAxis: [
                {
                    scale: true,
                    splitArea: {
                        show: true
                    }
                },
                {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: { show: false },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false }
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: this.getZoomRatio(),
                    end: 100
                },
                {
                    show: true,
                    xAxisIndex: [0, 1],
                    type: 'slider',
                    top: '85%',
                    start: this.getZoomRatio(),
                    end: 100
                }
            ]
        };

        if (chartType === 'stock') {
            const { stockType } = this.props;
            const [upColor, downColor] = this.getStickColor(stockType);
            option.visualMap.pieces = [
                {
                    value: 1,
                    color: downColor
                },
                {
                    value: -1,
                    color: upColor
                }
            ];
            option.xAxis.forEach(x => {
                x.data = records.map(r => AppUtil.toDateStr(r.dealDate) || '');
            });
            option.series = [
                {
                    name: info.name,
                    type: 'candlestick',
                    data: records.map(r => [r.openPrice, r.closePrice, r.lowPrice, r.highPrice]),
                    itemStyle: {
                        color: upColor,
                        color0: downColor,
                        borderColor: undefined,
                        borderColor0: undefined
                    }
                },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: records.map(r => r.dealShare)
                }
            ];
        } else if (chartType === 'fund') {
            option.xAxis.forEach(x => {
                x.data = records.map(r => AppUtil.toDateStr(r.date) || '');
            });
            option.series = [
                {
                    name: info.name,
                    type: 'line',
                    data: records.map(r => r.price)
                }
            ];
        }
        option.series.push(...this.getSupportSeries());
        return option;
    };

    render(): React.ReactNode {
        const { dateRange, supportLineType } = this.state;
        const dateRangeRadios: DateRange[] = ['3m', '6m', 'ytd', '1y', '5y', 'all'];
        const supportLineRadios: { label: string, value: SupportLineType; }[] = [
            { label: 'None', value: '' },
            { label: 'Moving Average', value: 'ma' },
            { label: 'Bollinger Bands', value: 'bb' }
        ];
        return (
            <React.Fragment>
                <CRow className='mb-1'>
                    <CCol sm={12} className='text-center'>
                        {
                            dateRangeRadios.map((r, ri) =>
                                <CButton
                                    key={`date-range-radio-${r}-${ri}`}
                                    className='ms-1 mb-1'
                                    color='info'
                                    variant='outline'
                                    onClick={() => this.setState({ dateRange: r })}
                                >
                                    <CFormSwitch
                                        type='radio'
                                        label={r.toUpperCase()}
                                        name='dateRange'
                                        value={r}
                                        checked={dateRange === r}
                                        onChange={() => this.setState({ dateRange: r })}
                                    />
                                </CButton>
                            )
                        }
                    </CCol>
                </CRow>
                <CRow className='mb-1'>
                    <CCol sm={12} className='text-center'>
                        {
                            supportLineRadios.map((r, ri) =>
                                <CButton
                                    key={`support-line-radio-${r.value}-${ri}`}
                                    className='ms-1 mb-1'
                                    color='secondary'
                                    size='sm'
                                    variant='outline'
                                    onClick={() => this.setState({ supportLineType: r.value })}
                                >
                                    <CFormSwitch
                                        type='radio'
                                        className='mb-0'
                                        label={r.label}
                                        name='supportLineType'
                                        value={r.value}
                                        checked={supportLineType === r.value}
                                        onChange={() => this.setState({ supportLineType: r.value })}
                                    />
                                </CButton>
                            )
                        }
                    </CCol>
                </CRow>
                <ReactECharts
                    option={this.getChartOption()}
                    notMerge={true}
                    style={{ height: '500px' }}
                />
            </React.Fragment>
        );
    }
}

export default AppCandleChart;
