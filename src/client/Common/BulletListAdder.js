/* eslint-disable react/prop-types */

import { GoPrimitiveDot } from 'react-icons/go';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';

function BulletListAdder(props) {
    return (
        <InputGroup size="sm">
            <div className="icon" />
            <div className="icon">
                <GoPrimitiveDot />
            </div>
            <div className="mx-1">
                {props.children}
            </div>
        </InputGroup>
    );
}

export default BulletListAdder;
