import PropTypes from 'prop-types';
import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';

import {
    LeftRight, SortableList, TextInput,
} from '../../../client/Common';
import { getNextID } from '../../../common/data_types';

/*

FIlters I want?
Tomorrow.
Next 7 days.
Overdue.
Major events in the future.

Date: lt/gt
DateRange: startDate, EndDate
    DatePicker / DateRangePicker are not useful.
    Pure Text for Date? lt(today)
IsComplete?
Topics / Structures

*/

function renderRow(props) {
    const { item } = props;
    const children = props.children || [];
    return (
        <div key={props.label}>
            <InputGroup className="my-1">
                {children.shift()}
                <TextInput
                    placeholder="Label"
                    value={item.label}
                    disabled={props.disabled}
                    onChange={(label) => props.onChange({ ...item, label })}
                />
                {children.pop()}
            </InputGroup>
        </div>
    );
}

function MoreEventListsSettings(props) {
    const items = props.value || [];
    return (
        <div className="my-3">
            <LeftRight>
                <div>More Event Lists</div>
                <a
                    href="#"
                    onClick={() => props.onChange(items.concat({
                        __id__: getNextID(items),
                        label: '',
                        timezone: '',
                    }))}
                >
                    Add Entry
                </a>
            </LeftRight>
            <SortableList
                items={items}
                disabled={props.disabled}
                onChange={(newItems) => props.onChange(newItems)}
                type={renderRow}
                valueKey="item"
            />
        </div>
    );
}

MoreEventListsSettings.propTypes = {
    disabled: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
};

export default MoreEventListsSettings;
