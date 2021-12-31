import PropTypes from 'prop-types';
import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';

import {
    HelpIcon, LeftRight, SortableList, TooltipElement, TypeaheadOptions, TypeaheadSelector,
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
                    id={`settings-topic-row-${item.__id__}`}
                    disabled={props.disabled}
                    options={TypeaheadOptions.getFromTypes(['log-topic'])}
                    value={item.logTopic}
                    onChange={(logTopic) => props.onChange({ ...item, logTopic })}
                />
                {children.pop()}
            </InputGroup>
        </div>
    );
}

function TopicSectionSettings(props) {
    const helpText = (
        'Add sections on the right sidebar for each topic selected here, '
        + 'which display the bullet-points in the details of those topics.'
    );
    const items = props.value;
    return (
        <div className="my-3">
            <LeftRight>
                <div>
                    Topic Sections
                    <TooltipElement>
                        <HelpIcon isShown />
                        <span>{helpText}</span>
                    </TooltipElement>
                </div>
                <a
                    href="#"
                    onClick={() => props.onChange(items.concat({
                        __id__: getNextID(items),
                        logTopic: null,
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

TopicSectionSettings.propTypes = {
    disabled: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
};

export default TopicSectionSettings;
