import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';

import { Selector } from '../Common';
import PropTypes from '../prop-types';

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

    render() {
        const results = [
            <div key="standard">
                {this.renderDisplayOverdueAndUpcomingEvents()}
                {this.renderDisplaySettingsSection()}
                {this.renderTwoDetailsSections()}
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
