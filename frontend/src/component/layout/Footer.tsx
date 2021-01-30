import * as React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

export interface FooterProps extends RouteChildrenProps<any> { }

export interface FooterState { }

export default class Footer extends React.Component<FooterProps, FooterState> {

    constructor(props: FooterProps) {
        super(props);
    }

    render() {
        return (
            <footer className='app-footer'>
                <span><a href='https://github.com/csietingkai/prototype'>Prototype</a> &copy; 2021.</span>
                <span className='ml-auto'>Powered by <a href='http://coreui.io'>CoreUI</a></span>
            </footer>
        );
    }
}
