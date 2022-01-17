import PropTypes from 'prop-types';
import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';

import {
    DateRangePicker, LeftRight, SortableList, TextInput, TypeaheadOptions, TypeaheadSelector,
} from '../../../client/Common';
import { getNextID } from '../../../common/data_types';

function addNewItem(items) {
    const item = {
        __id__: getNextID(items),
        logStructure: null,
        keyLabel: '',
        newLabel: '',
        dateRange: null,
        target: '0',
    };
    return items.concat(item);
}

function renderRow(props) {
    const { item } = props;
    const children = props.children || [];
    return (
        <div key={props.label}>
            <InputGroup className="my-1">
                {children.shift()}
                <TypeaheadSelector
                    id={`long-term-goals-settings-row-${item.__id__}`}
                    disabled={props.disabled}
                    placeholder="Structure"
                    options={TypeaheadOptions.getFromTypes(['log-structure'])}
                    value={item.logStructure}
                    onChange={(logStructure) => props.onChange({ ...item, logStructure })}
                />
                <TextInput
                    placeholder="Key Label"
                    value={item.keyLabel}
                    disabled={props.disabled}
                    onChange={(keyLabel) => props.onChange({ ...item, keyLabel })}
                />
                <TextInput
                    placeholder="New Label"
                    value={item.newLabel}
                    disabled={props.disabled}
                    onChange={(newLabel) => props.onChange({ ...item, newLabel })}
                />
                {children.pop()}
            </InputGroup>
            <InputGroup className="my-1">
                <DateRangePicker
                    dateRange={item.dateRange}
                    onChange={(dateRange) => props.onChange({ ...item, dateRange })}
                />
                <TextInput
                    placeholder="Target"
                    value={item.target}
                    disabled={props.disabled}
                    onChange={(target) => props.onChange({ ...item, target })}
                />
            </InputGroup>
        </div>
    );
}

function LongTermGoalsSettings(props) {
    const items = props.value || [];
    return (
        <div className="my-3">
            <LeftRight>
                <div>Long Term Goals</div>
                <a href="#" onClick={() => props.onChange(addNewItem(items))}>
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

LongTermGoalsSettings.propTypes = {
    disabled: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
};

export default LongTermGoalsSettings;
