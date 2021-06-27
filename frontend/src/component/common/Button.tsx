import * as React from 'react';
import { Button as RbButton } from 'react-bootstrap';

import { Variant } from 'util/Enum';

export interface ButtonProps {
    className?: string;
    variant: Variant;
    outline?: boolean;
    icon?: JSX.Element;
    size?: 'sm' | 'lg';
    disable?: boolean;
    active?: boolean;
    block?: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export interface ButtonState { }

export default class Button extends React.Component<ButtonProps, ButtonState> {

    public static defaultProps: Partial<ButtonProps> = {
        outline: false,
        disable: false,
        active: false,
        block: false
    };

    constructor(props: ButtonProps) {
        super(props);
        this.state = {};
    }

    render(): JSX.Element {
        const { className, variant, outline, icon, size, disable, active, block, onClick, children } = this.props;
        return (
            <RbButton
                className={className}
                variant={outline ? `outline-${variant}` : variant}
                size={size}
                disabled={disable}
                active={active}
                block={block}
                onClick={onClick}
            >
                {icon}
                {icon ? ' ' : null}
                {children}
            </RbButton>
        );
    }
}
