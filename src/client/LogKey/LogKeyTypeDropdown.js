import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import React from 'react';
import PropTypes from '../prop-types';

import { getLogKeyType, getLogKeyTypes } from '../../common/LogKey';

function LogKeyTypeDropdown(props) {
    return (
        <>
            <DropdownButton
                as={ButtonGroup}
                className=""
                disabled={props.logKey.id > 0}
                onSelect={() => null}
                size="sm"
                title={getLogKeyType(props.logKey.type).label}
                variant="secondary"
            >
                {getLogKeyTypes().map((item) => (
                    <Dropdown.Item
                        key={item.value}
                        onMouseDown={() => {
                            const logKey = { ...props.logKey };
                            logKey.type = item.value;
                            props.onUpdate(logKey);
                        }}
                    >
                        {item.label}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
        </>
    );
}

LogKeyTypeDropdown.propTypes = {
    logKey: PropTypes.Custom.LogKey.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default LogKeyTypeDropdown;
