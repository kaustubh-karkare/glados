import React from 'react';
import LogReminderCheckList from './LogReminderCheckList';
import { DataLoader } from '../Common';

class LogReminderSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logReminderGroups: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            name: 'log-reminder-group-list',
            args: {
                selector: { on_sidebar: true },
                ordering: true,
            },
            callback: (logReminderGroups) => this.setState({ logReminderGroups }),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    render() {
        if (this.state.logReminderGroups === null) {
            return 'Loading ...';
        }
        return this.state.logReminderGroups.map((logReminderGroup) => (
            <LogReminderCheckList
                key={logReminderGroup.id}
                logReminderGroup={logReminderGroup}
            />
        ));
    }
}

export default LogReminderSidebar;
