import React from 'react';
import { LogReminderList } from '../LogReminder';

class LogEntryReminderList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logReminderGroups: null };
    }

    componentDidMount() {
        this.reload();
    }

    reload() {
        window.api.send('log-reminder-group-list')
            .then((logReminderGroups) => this.setState({ logReminderGroups }));
    }

    render() {
        if (this.state.logReminderGroups === null) {
            return 'Loading ...';
        }
        return this.state.logReminderGroups.map((logReminderGroup) => (
            <LogReminderList
                key={logReminderGroup.id}
                logReminderGroup={logReminderGroup}
            />
        ));
    }
}

export default LogEntryReminderList;
