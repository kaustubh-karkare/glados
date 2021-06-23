import { BiDetail } from 'react-icons/bi';
import React from 'react';
import PropTypes from 'prop-types';

function DetailsIcon(props) {
    const { isShown, ...moreProps } = props;
    if (!isShown) {
        return null;
    }
    return (
        <BiDetail
            className="ml-1"
            color="var(--link-color)"
            style={{ cursor: 'pointer' }}
            {...moreProps}
        />
    );
}

DetailsIcon.propTypes = {
    isShown: PropTypes.bool.isRequired,
};

export default DetailsIcon;
