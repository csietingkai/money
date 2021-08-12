import * as React from 'react';
import { Pagination, Table as RbTable } from 'react-bootstrap';

/** pages before and after current page */
const SHOW_ELLIPSIS_PAGE_COUNT: number = 2;

export interface TableProps {
    id: string;
    striped?: boolean;
    condensed?: boolean;
    bordered?: boolean;
    header: string[];
    data: any[];
    countPerPage?: number;
    selectedRow?: number;
    onRowClick?: (selectedRow: number) => void;
    columnConverter?: (header: string, rowData: any) => JSX.Element; // TODO
}

export interface TableState {
    current: number; // data start to show at which index
    selectedRow: number;
}

export default class Table extends React.Component<TableProps, TableState> {

    public static defaultProps: Partial<TableProps> = {
        striped: false,
        condensed: false,
        bordered: false,
        countPerPage: 5
    };

    constructor(props: TableProps) {
        super(props);
        this.state = {
            current: 0,
            selectedRow: props.selectedRow || -1
        };
    }

    private onPrevPageClick = (diffPage: number = 1) => () => {
        const { countPerPage } = this.props;
        let { current } = this.state;
        current -= countPerPage * diffPage;
        if (current < 0) {
            current = 0;
        }
        this.setState({ current });
    };

    private onPageNumClick = (page: number) => () => {
        const { countPerPage } = this.props;
        this.setState({ current: this.getIndexByPage(page, countPerPage) });
    };

    private onNextPageClick = (diffPage: number = 1) => () => {
        const { data, countPerPage } = this.props;
        let { current } = this.state;
        current += countPerPage * diffPage;
        if (current > data.length) {
            current = this.getIndexByPage(data.length - 1, countPerPage);
        }
        this.setState({ current });
    };

    private getPageByIndex = (index: number, dataCountPerPage: number): number => {
        return (index - index % dataCountPerPage) / dataCountPerPage;
    };

    /** get first data index on page N */
    private getIndexByPage = (page: number, dataCountPerPage: number): number => {
        return page * dataCountPerPage;
    };

    private onRowClick = (selectedRow: number) => () => {
        const { onRowClick } = this.props;
        this.setState({ selectedRow });
        if (onRowClick) {
            onRowClick(selectedRow);
        }
    };

    render(): JSX.Element {
        const { id, striped, condensed, bordered, header, data, countPerPage, columnConverter } = this.props;

        let { current } = this.state;
        if (current > data.length) {
            current = 0;
        }

        const showData: any[] = data.slice(current, current + countPerPage);

        const firstPage = this.getPageByIndex(0, countPerPage);
        const currentPage = this.getPageByIndex(current, countPerPage);
        const maxPage = this.getPageByIndex(data.length - 1, countPerPage);
        let startPage = firstPage;
        let endPageFix = 0;
        let endPage = maxPage;
        let startPageFix = 0;
        if ((currentPage - SHOW_ELLIPSIS_PAGE_COUNT) >= 0) {
            startPage = currentPage - SHOW_ELLIPSIS_PAGE_COUNT;
        } else {
            endPageFix = SHOW_ELLIPSIS_PAGE_COUNT - currentPage;
        }
        if ((currentPage + SHOW_ELLIPSIS_PAGE_COUNT) <= maxPage) {
            endPage = currentPage + SHOW_ELLIPSIS_PAGE_COUNT;
        } else {
            startPageFix = maxPage - SHOW_ELLIPSIS_PAGE_COUNT - currentPage;
        }
        startPage += startPageFix;
        endPage += endPageFix;
        if (startPage < firstPage) {
            startPage = firstPage;
        }
        if (endPage > maxPage) {
            endPage = maxPage;
        }
        const pagination = [];
        if (data.length) {
            for (let page = startPage; page <= endPage; page++) {
                pagination.push(
                    <Pagination.Item
                        key={`table-${id}-page-${page}`}
                        active={this.getPageByIndex(current, countPerPage) === page}
                        onClick={this.onPageNumClick(page)}
                    >
                        {page + 1}
                    </Pagination.Item>
                );
            }
        }

        return (
            <>
                <RbTable hover bordered={bordered} striped={striped} responsive size={condensed ? 'sm' : undefined}>
                    <thead>
                        <tr>
                            {
                                header.map((th, idx) => {
                                    return <th key={`th${idx}-${th}`}>{th}</th>;
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            showData.length ?
                                showData.map((d, trIdx) => {
                                    return (
                                        <tr key={`table-${id}-tr-${trIdx}`} onClick={this.onRowClick(currentPage * countPerPage + trIdx)} className={currentPage * countPerPage + trIdx === this.state.selectedRow ? 'select-row' : ''}>
                                            {
                                                header.map((h, tdIdx) => {
                                                    return (
                                                        <td key={`table-${id}-tr-${trIdx}-td-${tdIdx}`}>
                                                            {
                                                                columnConverter ?
                                                                    columnConverter(h, d)
                                                                    : d[h]
                                                            }
                                                        </td>
                                                    );
                                                })
                                            }
                                        </tr>
                                    );
                                })
                                : <tr><td style={{ textAlign: 'center' }} colSpan={header.length}><b>No Data</b></td></tr>
                        }
                    </tbody>
                </RbTable>
                <Pagination>
                    {
                        this.getPageByIndex(current, countPerPage) !== 0 &&
                        <Pagination.Prev onClick={this.onPrevPageClick()}>Prev</Pagination.Prev>
                    }
                    {
                        this.getPageByIndex(current, countPerPage) > SHOW_ELLIPSIS_PAGE_COUNT &&
                        <Pagination.Ellipsis onClick={this.onPrevPageClick(SHOW_ELLIPSIS_PAGE_COUNT + 1)} />
                    }
                    {pagination}
                    {
                        this.getPageByIndex(current, countPerPage) < (this.getPageByIndex(data.length - 1, countPerPage) - SHOW_ELLIPSIS_PAGE_COUNT) &&
                        <Pagination.Ellipsis onClick={this.onNextPageClick(SHOW_ELLIPSIS_PAGE_COUNT + 1)} />
                    }
                    {
                        this.getPageByIndex(current, countPerPage) !== this.getPageByIndex(data.length - 1, countPerPage) &&
                        <Pagination.Next onClick={this.onNextPageClick()}>Next</Pagination.Next>
                    }
                </Pagination>
            </>
        );
    }
}
