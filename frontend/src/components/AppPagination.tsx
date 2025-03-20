import React from 'react';
import { CPagination, CPaginationItem } from '@coreui/react';
import { DATA_COUNT_PER_PAGE } from '../util/Constant';
import CIcon from '@coreui/icons-react';
import { cilChevronLeft, cilChevronRight } from '@coreui/icons';

const PAGE_DELTA: number = 2;
const MAX_SHOW_PAGE: number = 2 * PAGE_DELTA + 1;

export interface AppPaginationProps {
	className: string;
	totalDataCount: number;
	currentPage: number;
	onChange: (page: number) => void;
}

export interface AppPaginationState { }

class AppPagination extends React.Component<AppPaginationProps, AppPaginationState> {

	constructor(props: AppPaginationProps) {
		super(props);
	}

	render(): React.ReactNode {
		const { className, totalDataCount, currentPage, onChange } = this.props;
		const maxPage = Math.ceil(totalDataCount / DATA_COUNT_PER_PAGE);
		const pages: React.ReactNode[] = [];
		let startPage: number = 1;
		let endPage: number = maxPage;
		let hasStartEllpsis: boolean = false;
		let hasEndEllpsis: boolean = false;
		if (maxPage > MAX_SHOW_PAGE) {
			if (currentPage > PAGE_DELTA && currentPage <= maxPage - PAGE_DELTA) {
				startPage = currentPage - PAGE_DELTA;
				endPage = startPage + MAX_SHOW_PAGE - 1;
			}
			if (currentPage <= PAGE_DELTA) {
				startPage = 1;
				endPage = MAX_SHOW_PAGE;
			} else if (currentPage > maxPage - PAGE_DELTA) {
				startPage = maxPage - MAX_SHOW_PAGE + 1;
				endPage = maxPage;
			}
			if (currentPage < maxPage - PAGE_DELTA) {
				hasEndEllpsis = true;
			}
			if (currentPage > PAGE_DELTA + 1) {
				hasStartEllpsis = true;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			pages.push(<CPaginationItem key={`page-${i}`} active={i === currentPage} onClick={() => onChange(i)}>{i}</CPaginationItem>);
		}
		return (
			<CPagination className={className}>
				<CPaginationItem aria-label='Previous' disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>
					<span aria-hidden='true'>
						<CIcon icon={cilChevronLeft}></CIcon>
					</span>
				</CPaginationItem>
				{hasStartEllpsis ? <CPaginationItem disabled>…</CPaginationItem> : <React.Fragment></React.Fragment>}
				{pages}
				{hasEndEllpsis ? <CPaginationItem disabled>…</CPaginationItem> : <React.Fragment></React.Fragment>}
				<CPaginationItem aria-label='Next' disabled={currentPage === maxPage || totalDataCount === 0} onClick={() => onChange(currentPage + 1)}>
					<span aria-hidden='true'>
						<CIcon icon={cilChevronRight}></CIcon></span>
				</CPaginationItem>
			</CPagination>
		);
	}
}

export default AppPagination;
