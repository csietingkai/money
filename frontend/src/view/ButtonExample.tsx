import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Button from 'component/common/Button';
import Card from 'component/common/Card';
import { BoltIcon, ExclamationCircleIcon, InfoCircle, LightbulbIcon, LinkIcon, MagicIcon, MoonIcon, SkullIcon, StarIcon } from 'component/common/Icons';

import { Variant } from 'util/Enum';
import { firstDigitUppercase } from 'util/AppUtil';

export interface ButtonExampleProps { }

export interface ButtonExampleState { }

class ButtonExample extends React.Component<ButtonExampleProps, ButtonExampleState> {

    constructor(props: ButtonExampleProps) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Options'
                        >
                            {(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark', 'link'] as Variant[]).map(variant =>
                                <React.Fragment key={`btn-${variant}`}>
                                    <Button variant={variant} >{firstDigitUppercase(variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Options'
                        >
                            {(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'] as Variant[]).map(variant =>
                                <React.Fragment key={`btn-outline-${variant}`}>
                                    <Button variant={variant} outline >{firstDigitUppercase(variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' lg='6'>
                        <Card
                            title='With Icons'
                        >
                            {([
                                { variant: 'primary', icon: StarIcon() },
                                { variant: 'secondary', icon: LightbulbIcon() },
                                { variant: 'success', icon: MagicIcon() },
                                { variant: 'info', icon: InfoCircle() },
                                { variant: 'warning', icon: ExclamationCircleIcon() },
                                { variant: 'danger', icon: SkullIcon() },
                                { variant: 'light', icon: BoltIcon() },
                                { variant: 'dark', icon: MoonIcon() },
                                { variant: 'link', icon: LinkIcon() }
                            ] as { variant: Variant, icon: JSX.Element; }[]).map(x =>
                                <React.Fragment key={`btn-icon-${x.variant}`}>
                                    <Button variant={x.variant} icon={x.icon} >{firstDigitUppercase(x.variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                    <Col xs='12' lg='6'>
                        <Card
                            title='With Icons'
                        >
                            {([
                                { variant: 'primary', icon: StarIcon() },
                                { variant: 'secondary', icon: LightbulbIcon() },
                                { variant: 'success', icon: MagicIcon() },
                                { variant: 'info', icon: InfoCircle() },
                                { variant: 'warning', icon: ExclamationCircleIcon() },
                                { variant: 'danger', icon: SkullIcon() },
                                { variant: 'light', icon: BoltIcon() },
                                { variant: 'dark', icon: MoonIcon() }
                            ] as { variant: Variant, icon: JSX.Element; }[]).map(x =>
                                <React.Fragment key={`btn-outline-icon-${x.variant}`}>
                                    <Button variant={x.variant} outline icon={x.icon} >{firstDigitUppercase(x.variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Size Large'
                        >
                            {(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark', 'link'] as Variant[]).map(variant =>
                                <React.Fragment key={`btn-lg-${variant}`}>
                                    <Button variant={variant} size='lg' >{firstDigitUppercase(variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Size Large'
                        >
                            {(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'] as Variant[]).map(variant =>
                                <React.Fragment key={`btn-outline-lg-${variant}`}>
                                    <Button variant={variant} outline size='lg' >{firstDigitUppercase(variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Size Small'
                        >
                            {(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark', 'link'] as Variant[]).map(variant =>
                                <React.Fragment key={`btn-sm-${variant}`}>
                                    <Button variant={variant} size='sm' >{firstDigitUppercase(variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Size Small'
                        >
                            {(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'] as Variant[]).map(variant =>
                                <React.Fragment key={`btn-outline-sm-${variant}`}>
                                    <Button variant={variant} outline size='sm' >{firstDigitUppercase(variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Disabled state'
                        >
                            {(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark', 'link'] as Variant[]).map(variant =>
                                <React.Fragment key={`btn-disable-${variant}`}>
                                    <Button variant={variant} disable >{firstDigitUppercase(variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Disabled state'
                        >
                            {(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'] as Variant[]).map(variant =>
                                <React.Fragment key={`btn-outline-disable-${variant}`}>
                                    <Button variant={variant} outline disable >{firstDigitUppercase(variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Active state'
                        >
                            {(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark', 'link'] as Variant[]).map(variant =>
                                <React.Fragment key={`btn-active-${variant}`}>
                                    <Button variant={variant} active >{firstDigitUppercase(variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Active state'
                        >
                            {(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'] as Variant[]).map(variant =>
                                <React.Fragment key={`btn-outline-active-${variant}`}>
                                    <Button variant={variant} outline active >{firstDigitUppercase(variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Block Level Buttons'
                        >
                            {(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark', 'link'] as Variant[]).map(variant =>
                                <React.Fragment key={`btn-block-${variant}`}>
                                    <Button variant={variant} block >{firstDigitUppercase(variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Block Level Buttons'
                        >
                            {(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'] as Variant[]).map(variant =>
                                <React.Fragment key={`btn-outline-active-${variant}`}>
                                    <Button variant={variant} outline block >{firstDigitUppercase(variant)}</Button>
                                    {' '}
                                </React.Fragment>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div >
        );
    }
}

const mapStateToProps = (state: any) => {
    return {};
};

export default connect(mapStateToProps)(ButtonExample);;
