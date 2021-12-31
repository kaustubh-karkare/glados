import './InputLine.css';

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

function InputLine(props) {
    const {
        className, overflow, styled, children, ...moreProps
    } = props;
    moreProps.className = classNames({
        'input-line': true,
        overflow,
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
    overflow: PropTypes.bool,
    styled: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

export default InputLine;
