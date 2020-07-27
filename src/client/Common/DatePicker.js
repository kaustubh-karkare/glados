import DatePickerOriginal from 'react-datepicker';
import React from 'react';
import PropTypes from 'prop-types';
import { getDateLabel, getDateValue } from '../../common/DateUtils';

import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.css';

function DatePicker(props) {
    return (
        <DatePickerOriginal
            dateFormat="yyyy-MM-dd"
            selected={new Date(getDateValue(props.value))}
            disabled={props.disabled}
            onChange={
                (newDate) => props.onChange(newDate ? getDateLabel(newDate.valueOf()) : null)
            }
        />
    );
}

DatePicker.propTypes = {
    value: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default DatePicker;
