import React from 'react';

import { DataLoader } from '../Common';
import PropTypes from '../prop-types';
import ReminderList from './ReminderList';

class ReminderSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logStructureGroups: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => ({ name: 'reminder-sidebar' }),
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
                key={reminderGroup.__id__}
                name={reminderGroup.name}
                logStructures={reminderGroup.logStructures}
                disabled={this.props.disabled}
            />
        ));
    }
}

ReminderSidebar.propTypes = {
    disabled: PropTypes.bool.isRequired,
};

export default ReminderSidebar;
