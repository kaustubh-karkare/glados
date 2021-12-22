import React from 'react';
import PropTypes from 'prop-types';
import { SidebarSection } from '../Common';
import ReminderItem from './ReminderItem';

class ReminderList extends React.Component {
    renderContent() {
        if (this.props.logStructures.length === 0) {
            return <div className="ml-3">All done for now!</div>;
        }
        return this.props.logStructures.map((logStructure) => (
            <ReminderItem
                key={logStructure.id}
                logStructure={logStructure}
            />
        ));
    }

    render() {
        return (
            <SidebarSection title={this.props.name}>
                {this.renderContent()}
            </SidebarSection>
        );
    }
}

ReminderList.propTypes = {
    name: PropTypes.string.isRequired,
    logStructures: PropTypes.arrayOf(PropTypes.Custom.LogStructure.isRequired).isRequired,
};

export default ReminderList;
