import React from 'react';
import PropTypes from 'prop-types';
import { LeftRight, SidebarSection } from '../Common';
import SettingsModal from './SettingsModal';

class SettingsSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShown: false,
        };
    }

    render() {
        return (
            <SidebarSection>
                <LeftRight>
                    <a href="#" onClick={() => this.setState({ isShown: true })}>Settings</a>
                    <span />
                </LeftRight>
                <SettingsModal
                    settings={this.props.settings}
                    isShown={this.state.isShown}
                    onClose={() => this.setState({ isShown: false })}
                />
            </SidebarSection>
        );
    }
}

SettingsSection.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    settings: PropTypes.objectOf(PropTypes.any.isRequired).isRequired,
};

export default SettingsSection;
