import * as React from 'react';

export interface SidebarMinimizerProps { }

export interface SidebarMinimizerState { }

export default class SidebarMinimizer extends React.Component<SidebarMinimizerProps, SidebarMinimizerState> {

    constructor(props: SidebarMinimizerProps) {
        super(props);
    }

    private sidebarMinimize = () => {
        document.body.classList.toggle('sidebar-minimized');
    };

    private brandMinimize = () => {
        document.body.classList.toggle('brand-minimized');
    };

    render(): JSX.Element {
        return (
            <button className='sidebar-minimizer' type='button' onClick={(event) => { this.sidebarMinimize(); this.brandMinimize(); }}></button>
        );
    }
}
