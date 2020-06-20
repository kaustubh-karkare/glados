import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import React from 'react';
import PropTypes from '../prop-types';

import { getLogTagType, getLogTagTypes } from '../../common/LogTag';

function LogTagTypeDropdown(props) {
    return (
        <>
            <DropdownButton
                as={ButtonGroup}
                className=""
                disabled={props.logTag.id > 0}
                onSelect={() => null}
                size="sm"
                title={getLogTagType(props.logTag.type).label}
                variant="secondary"
            >
                {getLogTagTypes().map((item) => (
                    <Dropdown.Item
                        key={item.value}
                        onMouseDown={() => {
                            const logTag = { ...props.logTag };
                            logTag.type = item.value;
                            props.onUpdate(logTag);
                        }}
                    >
                        {item.label}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
        </>
    );
}

LogTagTypeDropdown.propTypes = {
    logTag: PropTypes.Custom.LogTag.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default LogTagTypeDropdown;
