import React from 'react';
import { LogReminderCheckList } from '../LogReminder';

class LogEntryReminderList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logReminderGroups: null };
    }

    componentDidMount() {
        this.reload();
    }

    reload() {
        window.api.send('log-reminder-group-list', { selector: { on_sidebar: true }, ordering: true })
            .then((logReminderGroups) => this.setState({ logReminderGroups }));
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

export default LogEntryReminderList;
