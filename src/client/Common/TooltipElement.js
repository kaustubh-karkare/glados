import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

function TooltipElement(props) {
    const overlay = (
        <Tooltip style={{ width: 200 }}>
            {props.children[1]}
        </Tooltip>
    );
    return (
        <OverlayTrigger
            rootClose
            placement="right-start"
            overlay={overlay}
        >
            {props.children[0]}
        </OverlayTrigger>
    );
}

TooltipElement.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any.isRequired,
};

export default TooltipElement;
