import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CContainer, CSpinner } from '@coreui/react';
import routes, { Route as RouteType } from '../routes';
import { ReduxState, getAuthToken } from '../reducer/Selector';
import { AuthToken } from '../api/auth';

export interface AppContentProps {
	authToken: AuthToken;
}

export interface AppContentState { }

class AppContent extends React.Component<AppContentProps, AppContentState> {

	constructor(props: AppContentProps) {
		super(props);
	}

	private getRoutes = (routes: RouteType[], parentPath: string = '/'): React.ReactNode[] => {
		const nodes: React.ReactNode[] = [];
		routes.forEach(r => {
			if (r.type === 'item') {
				nodes.push(<Route key={`${parentPath}${r.path}`} path={`${parentPath}${r.path}`} element={<r.component />} />);
			} else if (r.type === 'parent') {
				nodes.push(...this.getRoutes(r.items, `${parentPath}${r.path}/`));
			}
		});
		return nodes;
	};

	render(): React.ReactNode {
		const { authToken } = this.props;
		return (
			<CContainer className='px-4' lg>
				<Suspense fallback={<CSpinner color='primary' />}>
					<Routes>
						{this.getRoutes(routes)}
						<Route path='/' element={<Navigate to={authToken ? 'dashboard' : 'login'} replace />} />
					</Routes>
				</Suspense>
			</CContainer>
		);
	}
}

const mapStateToProps = (state: ReduxState) => {
	return {
		authToken: getAuthToken(state)
	};
};

export default connect(mapStateToProps)(AppContent);
