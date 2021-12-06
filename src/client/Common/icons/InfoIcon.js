import { MdInfo } from 'react-icons/md';
import React from 'react';
import PropTypes from 'prop-types';

function InfoIcon(props) {
    const { isShown, ...moreProps } = props;
    if (!isShown) {
        return null;
    }
    return (
        <MdInfo
            className="ml-1"
            color="var(--link-color)"
            style={{ cursor: 'pointer' }}
            {...moreProps}
        />
    );
}

InfoIcon.propTypes = {
    isShown: PropTypes.bool.isRequired,
};

export default InfoIcon;
