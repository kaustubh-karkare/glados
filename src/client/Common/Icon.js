import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';

import './Icon.css';

function Icon(props) {
    const {
        alwaysHighlighted, neverHighlighted, className, children, ...moreProps
    } = props;
    moreProps.className = classNames({
        icon: true,
        'icon-highlighted': alwaysHighlighted,
        'icon-never-highlight': neverHighlighted,
    }, className);
    return (
        <div {...moreProps}>
            {children}
        </div>
    );
}

Icon.propTypes = {
    className: PropTypes.string,
    alwaysHighlighted: PropTypes.bool,
    neverHighlighted: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

export default Icon;
