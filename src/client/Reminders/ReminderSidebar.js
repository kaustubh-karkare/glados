import React from 'react';
import PropTypes from '../prop-types';
import ReminderList from './ReminderList';
import { DataLoader } from '../Common';

class ReminderSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logStructureGroups: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => ({
                name: 'reminder-sidebar',
                args: {
                    where: {
                        logMode: this.props.logMode || undefined,
                    },
                },
            }),
            onData: (logStructureGroups) => this.setState({ logStructureGroups }),
        });
    }

    componentDidUpdate() {
        this.dataLoader.reload();
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    render() {
        if (this.state.logStructureGroups === null) {
            return 'Loading ...';
        }
        return this.state.logStructureGroups.map((reminderGroup) => (
            <ReminderList
                key={reminderGroup.id}
                name={reminderGroup.name}
                logStructures={reminderGroup.logStructures}
                disabled={this.props.disabled}
            />
        ));
    }
}

ReminderSidebar.propTypes = {
    logMode: PropTypes.Custom.LogMode,
    disabled: PropTypes.bool.isRequired,
};

export default ReminderSidebar;
