import React from 'react';
import PropTypes from 'prop-types';
import InputGroup from 'react-bootstrap/InputGroup';
import {
    HelpIcon, LeftRight, SortableList, TextInput,
    TooltipElement, TypeaheadOptions, TypeaheadSelector,
} from '../../../client/Common';
import { getNextID } from '../../../common/data_types';

function renderRow(props) {
    const { item } = props;
    const children = props.children || [];
    return (
        <div key={props.label}>
            <InputGroup className="my-1">
                {children.shift()}
                <TypeaheadSelector
                    id={`topic-reminders-settings-row-${item.__id__}`}
                    disabled={props.disabled}
                    placeholder="Structure"
                    options={TypeaheadOptions.getFromTypes(['log-structure'])}
                    value={item.logStructure}
                    onChange={(logStructure) => props.onChange({ ...item, logStructure })}
                />
                <TextInput
                    placeholder="Threshold Days"
                    value={item.thresholdDays}
                    disabled={props.disabled}
                    onChange={(thresholdDays) => props.onChange({ ...item, thresholdDays })}
                />
                {children.pop()}
            </InputGroup>
        </div>
    );
}

function TopicRemindersSettings(props) {
    const helpText = (
        'Add sections on the right sidebar for each structure selected here (eg - Conversation). '
        + 'For each structure, look at the details to get a list of topics (eg - people), and then '
        + 'check to see if there are any events with that structure and topic in the last X days. '
        + 'If not, show a reminder about that topic (eg - speak to someone every X days).'
    );
    const items = props.value;
    return (
        <div className="my-3">
            <LeftRight>
                <div>
                    Reminder Sections
                    <TooltipElement>
                        <HelpIcon isShown />
                        <span>{helpText}</span>
                    </TooltipElement>
                </div>
                <a
                    href="#"
                    onClick={() => props.onChange(items.concat({
                        __id__: getNextID(items),
                        logStructure: null,
                        thresholdDays: '',
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

TopicRemindersSettings.propTypes = {
    disabled: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
};

export default TopicRemindersSettings;
