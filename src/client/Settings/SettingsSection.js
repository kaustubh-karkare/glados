import React from 'react';

import { LeftRight, SettingsContext, SidebarSection } from '../Common';
import PropTypes from '../prop-types';
import SettingsModal from './SettingsModal';

class SettingsSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShown: false,
        };
    }

    componentDidMount() {
        window.onkeydown = (event) => {
            if (event.shiftKey && event.metaKey && event.key === 's') {
                this.setState({ isShown: true });
            }
        };
    }

    componentWillUnmount() {
        delete window.onkeydown;
    }

    render() {
        const settings = this.context;
        const settingsSection = settings.display_settings_section ? (
            <SidebarSection>
                <LeftRight>
                    <a href="#" onClick={() => this.setState({ isShown: true })}>Settings</a>
                    <span />
                </LeftRight>
            </SidebarSection>
        ) : null;
        return (
            <>
                <SettingsModal
                    settings={this.props.settings}
                    plugins={this.props.plugins}
                    isShown={this.state.isShown}
                    onClose={() => this.setState({ isShown: false })}
                />
                {settingsSection}
            </>
        );
    }
}

SettingsSection.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    settings: PropTypes.objectOf(PropTypes.any.isRequired).isRequired,
    plugins: PropTypes.Custom.Plugins.isRequired,
};

SettingsSection.contextType = SettingsContext;

export default SettingsSection;
