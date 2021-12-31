import PropTypes from 'prop-types';
import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import { listTimeZones } from 'timezone-support';

import {
    LeftRight, Selector, SortableList, TextInput,
} from '../../../client/Common';
import { getNextID } from '../../../common/data_types';

const TIMEZONE_OPTIONS = [{ label: '(timezone)', value: '' }].concat(Selector.getStringListOptions(listTimeZones().sort()));

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
                <Selector
                    disabled={props.disabled}
                    options={TIMEZONE_OPTIONS}
                    value={item.timezone}
                    onChange={(timezone) => props.onChange({ ...item, timezone })}
                />
                {children.pop()}
            </InputGroup>
        </div>
    );
}

function TimeSectionSettings(props) {
    const items = props.value;
    return (
        <div className="my-3">
            <LeftRight>
                <div>Display Timezones</div>
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

TimeSectionSettings.propTypes = {
    disabled: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
};

export default TimeSectionSettings;
