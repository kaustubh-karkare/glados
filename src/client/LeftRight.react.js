/* eslint-disable react/prop-types */

import React from 'react';

function LeftRight(props) {
    return (
        <div {...props}>
            <div className="d-flex">
                <div className="mr-auto">{props.children[0]}</div>
                <div>{props.children[1]}</div>
            </div>
        </div>
    );
}

export default LeftRight;
