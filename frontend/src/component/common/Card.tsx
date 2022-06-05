import classNames from 'classnames';
import * as React from 'react';
import { Card as RbCard, Collapse, Form } from 'react-bootstrap';

import Button from 'component/common/Button';
import { AngleDownIcon, AngleUpIcon } from 'component/common/Icons';

import { Variant } from 'util/Enum';

export interface CardProps {
    icon?: JSX.Element;
    title: string;
    accent?: Variant;
    border?: Variant; // notice: if border and accent exist at the same time, accent will become border style and render together
    background?: Variant;
    textCenter?: boolean;
    collapsable?: boolean;
    footer?: string;
    switchable?: { current: boolean, onchange: () => void; };
}

export interface CardState {
    collapseOpen: boolean;
    status: string;
}

export default class Card extends React.Component<CardProps, CardState> {

    public static defaultProps: Partial<CardProps> = {
        textCenter: false,
        collapsable: false
    };

    constructor(props: CardProps) {
        super(props);
        this.state = {
            collapseOpen: true,
            status: ''
        };
    }

    private onEntering = () => {
        this.setState({ status: 'Opening...' });
    };

    private onEntered = () => {
        this.setState({ status: 'Opened' });
    };

    private onExiting = () => {
        this.setState({ status: 'Closing...' });
    };

    private onExited = () => {
        this.setState({ status: 'Closed' });
    };

    private toggle = () => {
        this.setState({ collapseOpen: !this.state.collapseOpen });
    };

    render(): JSX.Element {
        const { icon, title, accent, border, background, textCenter, collapsable, footer, switchable, children } = this.props;
        const { collapseOpen } = this.state;
        const cardClassName = classNames(
            (accent ? `card-accent-${accent}` : ''),
            (border ? `border-${border}` : ''),
            (background ? `bg-${background} text-white` : ''),
            (textCenter ? 'text-center' : '')
        );
        const collapseIcon = collapseOpen ? AngleUpIcon() : AngleDownIcon();
        const cardBody = (
            <RbCard.Body>
                {children}
            </RbCard.Body>
        );
        return (
            <RbCard className={cardClassName}>
                <RbCard.Header>
                    {icon}
                    <strong>{title}</strong>
                    {collapsable && <div className='card-actions' onClick={this.toggle}><Button variant='link'>{collapseIcon}</Button></div>}
                    {
                        switchable &&
                        <Form.Check
                            type='switch'
                            label='Diff Mode'
                            id={`${title}-switch`}
                            checked={switchable.current}
                            onChange={switchable.onchange}
                        />
                    }
                </RbCard.Header>
                {
                    collapsable ?
                        <Collapse
                            in={this.state.collapseOpen}
                            onEntering={this.onEntering}
                            onEntered={this.onEntered}
                            onExiting={this.onExiting}
                            onExited={this.onExited}
                        >
                            <div>{cardBody}</div>
                        </Collapse>
                        :
                        <>{cardBody}</>
                }
                {
                    footer &&
                    <RbCard.Footer>
                        {footer}
                    </RbCard.Footer>
                }
            </RbCard>
        );
    }
}
