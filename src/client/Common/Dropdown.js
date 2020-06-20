import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import React from 'react';
import PropTypes from 'prop-types';

function CustomDropdown(props) {
    const selectedOption = props.options.find((option) => option.value === props.value);
    return (
        <>
            <DropdownButton
                disabled={props.disabled}
                onSelect={() => null}
                size="sm"
                title={selectedOption.label}
                variant="secondary"
            >
                {props.options.map((option) => (
                    <Dropdown.Item
                        key={option.value}
                        onMouseDown={() => props.onUpdate(option.value)}
                    >
                        {option.label}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
        </>
    );
}

CustomDropdown.propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        }),
    ).isRequired,
    onUpdate: PropTypes.func.isRequired,
};

CustomDropdown.defaultProps = {
    disabled: false,
};

export default CustomDropdown;
