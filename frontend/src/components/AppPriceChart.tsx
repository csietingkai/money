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

export interface AppPriceChartState {
    supportLineType: SupportLineType;
}

class AppCandleChart extends React.Component<AppPriceChartProps, AppPriceChartState> {

    constructor(props: AppPriceChartProps) {
        super(props);
        this.state = {
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
        // const dates: string[] = records.map(r => AppUtil.toDateStr(r.dealDate) || '');
        // const data: number[][] = records.map(r => [r.openPrice, r.closePrice, r.lowPrice, r.highPrice])
        // const volumes: number[] = records.map(r => r.dealShare);
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
                    xAxisIndex: [0, 1]
                },
                {
                    show: true,
                    xAxisIndex: [0, 1],
                    type: 'slider',
                    top: '85%'
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
        const { supportLineType } = this.state;
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
                            supportLineRadios.map((r, ri) =>
                                <CButton key={`support-line-radio-${r.value}-${ri}`} className='ms-1 mb-1' color='info' variant='outline' onClick={() => this.setState({ supportLineType: r.value })}>
                                    <CFormSwitch
                                        type='radio'
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
