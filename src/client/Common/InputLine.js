import classNames from 'classnames';
import React from 'react';
import PropTypes from '../prop-types';

import './InputLine.css';

function InputLine(props) {
    const {
        className, styled, children, ...moreProps
    } = props;
    moreProps.className = classNames({
        'input-line': true,
        styled,
    }, className);
    return (
        <div {...moreProps}>
            {children}
        </div>
    );
}

InputLine.propTypes = {
    className: PropTypes.string,
    styled: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

InputLine.defaultProps = {
    styled: true,
};

export default InputLine;
