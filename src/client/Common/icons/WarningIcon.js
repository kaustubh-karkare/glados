import { AiOutlineWarning } from 'react-icons/ai';
import React from 'react';
import PropTypes from 'prop-types';

function WarningIcon(props) {
    if (!props.isShown) {
        return null;
    }
    return (
        <AiOutlineWarning
            className="ml-1"
            color="var(--warning-color)"
            style={{ position: 'relative', top: -1 }}
        />
    );
}

WarningIcon.propTypes = {
    isShown: PropTypes.bool.isRequired,
};

export default WarningIcon;
