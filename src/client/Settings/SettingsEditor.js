import assert from 'assert';
import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';

import {
    HelpIcon, Selector, TextInput, TooltipElement,
} from '../Common';
import PropTypes from '../prop-types';

const SETTINGS_ITEMS = [
    {
        key: 'display_overdue_and_upcoming_events',
        label: 'Display Overdue And Upcoming Events',
        type: 'boolean',
    },
    {
        key: 'display_settings_section',
        label: 'Display Settings Section',
        type: 'boolean',
    },
    {
        key: 'display_two_details_sections',
        label: 'Display Two Details Sections',
        type: 'boolean',
    },
    {
        key: 'today_offset_hours',
        label: 'Today Offset Hours',
        type: 'integer',
        description: (
            'Adjust the time at which the day starts / ends. Eg - If you frequently stay awake until 2am or so, '
            + 'you can set this value to "3", so the app does not move on to the next day until 3am.'
        ),
    },
    {
        key: 'bullet_list_page_size',
        label: 'Bullet List Page Size',
        type: 'integer',
    },
];

class SettingsEditor extends React.Component {
    getSetting(key, defaultValue = null) {
        return this.props.settings[key] || defaultValue;
    }

    setSetting(key, value) {
        const settings = { ...this.props.settings };
        settings[key] = value;
        this.props.onChange(settings);
    }

    renderSettingsItems() {
        return SETTINGS_ITEMS.map((item) => {
            let inputElement = null;
            if (item.type === 'boolean') {
                inputElement = (
                    <Selector.Binary
                        disabled={this.props.disabled}
                        value={this.getSetting(item.key, false)}
                        onChange={(value) => this.setSetting(item.key, value)}
                    />
                );
            } if (item.type === 'integer') {
                inputElement = (
                    <TextInput
                        disabled={this.props.disabled}
                        value={this.getSetting(item.key, '')}
                        onChange={(value) => this.setSetting(item.key, value)}
                    />
                );
            }
            assert(inputElement, `unknown settings item type: ${item.type}`);
            let tooltip;
            if (item.description) {
                tooltip = (
                    <TooltipElement>
                        <HelpIcon isShown />
                        <span>{item.description}</span>
                    </TooltipElement>
                );
            }
            return (
                <InputGroup className="my-1" key={item.key}>
                    <div className="pr-2" style={{ width: '250px', textAlign: 'right' }}>
                        {item.label}
                        {tooltip}
                    </div>
                    {inputElement}
                </InputGroup>
            );
        });
    }

    render() {
        const results = [
            <div key="my-3">
                {this.renderSettingsItems()}
            </div>,
        ];
        Object.entries(this.props.plugins).forEach(([name, api]) => {
            const key = api.getSettingsKey();
            if (key === null) {
                return;
            }
            const props = {
                disabled: this.props.disabled,
                value: this.getSetting(key),
                onChange: (newValue) => this.setSetting(key, newValue),
            };
            results.push(<div key={name}>{api.getSettingsComponent(props)}</div>);
        });
        return results;
    }
}

SettingsEditor.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    settings: PropTypes.objectOf(PropTypes.any.isRequired).isRequired,
    plugins: PropTypes.Custom.Plugins.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
};

export default SettingsEditor;
