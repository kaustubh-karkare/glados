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
                        onMouseDown={() => props.onChange(option.value)}
                    >
                        {option.label}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
        </>
    );
}

CustomDropdown.propTypes = {
    value: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        }),
    ).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default CustomDropdown;
