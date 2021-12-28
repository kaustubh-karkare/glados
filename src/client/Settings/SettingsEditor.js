import React from 'react';
import PropTypes from 'prop-types';

import InputGroup from 'react-bootstrap/InputGroup';
import { listTimeZones } from 'timezone-support';
import {
    LeftRight, Selector, SortableList, TextInput, TypeaheadOptions, TypeaheadSelector,
} from '../Common';

const TIMEZONE_OPTIONS = [{ label: '(timezone)', value: '' }].concat(Selector.getStringListOptions(listTimeZones().sort()));

function renderTimezoneRow(props) {
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

function renderTopicRow(props) {
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

function renderReminderRow(props) {
    const { item } = props;
    const children = props.children || [];
    return (
        <div key={props.label}>
            <InputGroup className="my-1">
                {children.shift()}
                <TypeaheadSelector
                    id={`settings-reminder-row-${item.__id__}`}
                    disabled={props.disabled}
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

function getNextID(items) {
    let nextId = -1;
    // eslint-disable-next-line no-loop-func
    while (items.some((item) => item.__id__ === nextId)) {
        nextId -= 1;
    }
    return nextId;
}

class SettingsEditor extends React.Component {
    getSetting(key, defaultValue = null) {
        return this.props.settings[key] || defaultValue;
    }

    setSetting(key, value) {
        const settings = { ...this.props.settings };
        settings[key] = value;
        this.props.onChange(settings);
    }

    renderDisplayOverdueAndUpcomingEvents() {
        const key = 'display_overdue_and_upcoming_events';
        return (
            <div className="my-3">
                <div>Display Overdue And Upcoming Events</div>
                <InputGroup className="my-1">
                    <Selector.Binary
                        disabled={this.props.disabled}
                        value={this.getSetting(key, false)}
                        onChange={(value) => this.setSetting(key, value)}
                    />
                </InputGroup>
            </div>
        );
    }

    renderDisplaySettingsSection() {
        const key = 'display_settings_section';
        return (
            <div className="my-3">
                <div>Display Settings Section</div>
                <InputGroup className="my-1">
                    <Selector.Binary
                        disabled={this.props.disabled}
                        value={this.getSetting(key, false)}
                        onChange={(value) => this.setSetting(key, value)}
                    />
                </InputGroup>
            </div>
        );
    }

    renderTwoDetailsSections() {
        const key = 'display_two_details_sections';
        return (
            <div className="my-3">
                <div>Display Two Details Sections</div>
                <InputGroup className="my-1">
                    <Selector.Binary
                        disabled={this.props.disabled}
                        value={this.getSetting(key, false)}
                        onChange={(value) => this.setSetting(key, value)}
                    />
                </InputGroup>
            </div>
        );
    }

    renderTimezones() {
        const key = 'timezones';
        const items = this.getSetting(key, []);
        return (
            <div className="my-3">
                <LeftRight>
                    <div>Display Timezones</div>
                    <a
                        href="#"
                        onClick={() => this.setSetting(key, items.concat({
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
                    disabled={this.props.disabled}
                    onChange={(newItems) => this.setSetting(key, newItems)}
                    type={(props) => renderTimezoneRow(props)}
                    valueKey="item"
                />
            </div>
        );
    }

    renderTopicSections() {
        const key = 'topic_sections';
        const items = this.getSetting(key, []);
        return (
            <div className="my-3">
                <LeftRight>
                    <div>Topic Sections</div>
                    <a
                        href="#"
                        onClick={() => this.setSetting(key, items.concat({
                            __id__: getNextID(items),
                            logTopic: null,
                        }))}
                    >
                        Add Entry
                    </a>
                </LeftRight>
                <SortableList
                    items={items}
                    disabled={this.props.disabled}
                    onChange={(newItems) => this.setSetting(key, newItems)}
                    type={(props) => renderTopicRow(props)}
                    valueKey="item"
                />
            </div>
        );
    }

    renderReminderSections() {
        const key = 'reminder_sections';
        const items = this.getSetting(key, []);
        return (
            <div className="my-3">
                <LeftRight>
                    <div>Reminder Sections</div>
                    <a
                        href="#"
                        onClick={() => this.setSetting(key, items.concat({
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
                    disabled={this.props.disabled}
                    onChange={(newItems) => this.setSetting(key, newItems)}
                    type={(props) => renderReminderRow(props)}
                    valueKey="item"
                />
            </div>
        );
    }

    render() {
        return (
            <>
                {this.renderDisplayOverdueAndUpcomingEvents()}
                {this.renderDisplaySettingsSection()}
                {this.renderTwoDetailsSections()}
                {this.renderTimezones()}
                {this.renderTopicSections()}
                {this.renderReminderSections()}
            </>
        );
    }
}

SettingsEditor.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    settings: PropTypes.objectOf(PropTypes.any.isRequired).isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
};

export default SettingsEditor;
