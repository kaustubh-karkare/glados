import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { MdClose } from 'react-icons/md';

import InputLine from './InputLine';

class PopoverElement extends React.Component {
    renderOverlayTrigger() {
        const overlay = (
            <Popover id="date-range-selector">
                {this.props.children[1]}
            </Popover>
        );
        return (
            <OverlayTrigger
                trigger="click"
                rootClose
                placement="bottom-start"
                overlay={overlay}
            >
                <InputLine styled className="px-1">
                    {this.props.children[0]}
                </InputLine>
            </OverlayTrigger>
        );
    }

    renderButton() {
        return <Button onClick={() => this.props.onReset(null)}><MdClose /></Button>;
    }

    render() {
        return (
            <>
                {this.renderOverlayTrigger()}
                {this.renderButton()}
            </>
        );
    }
}

PopoverElement.propTypes = {
    onReset: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any.isRequired,
};

export default PopoverElement;
