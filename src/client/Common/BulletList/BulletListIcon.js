import PropTypes from 'prop-types';
import React from 'react';

import { KeyCodes } from '../Utils';

function BulletListIcon(props) {
    return (
        <div
            className="icon ml-1"
            title={props.title}
            onClick={props.onClick}
            onKeyDown={(event) => {
                if (event.keyCode === KeyCodes.ENTER) {
                    props.onClick(event);
                }
            }}
        >
            {props.children}
        </div>
    );
}

BulletListIcon.propTypes = {
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any.isRequired,
};

export default BulletListIcon;
