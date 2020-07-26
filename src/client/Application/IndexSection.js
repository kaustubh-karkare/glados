import React from 'react';
import PropTypes from 'prop-types';

function IndexSection(props) {
    return (
        <div className="index-section">
            {props.children}
        </div>
    );
}

IndexSection.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

export default IndexSection;
