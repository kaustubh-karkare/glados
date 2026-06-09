import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import { GoPrimitiveDot } from 'react-icons/go';

function BulletListLine(props) {
    // eslint-disable-next-line react/prop-types
    const { children, className, ...moreProps } = props;
    return (
        <InputGroup className={`bullet-list-line ${className || ''}`.trim()} {...moreProps}>
            <div className="icon" />
            <div className="icon mr-1">
                <GoPrimitiveDot />
            </div>
            {children}
        </InputGroup>
    );
}

export default BulletListLine;
