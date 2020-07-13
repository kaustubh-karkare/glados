import React from 'react';
import LogReminderCheckList from './LogReminderCheckList';
import { DataLoader } from '../Common';

class LogReminderSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logTopicAndReminders: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            name: 'reminder-sidebar',
            callback: (logTopicAndReminders) => this.setState({ logTopicAndReminders }),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    render() {
        if (this.state.logTopicAndReminders === null) {
            return 'Loading ...';
        }
        return this.state.logTopicAndReminders.map(({ logTopic, logReminders }) => (
            <LogReminderCheckList
                key={logTopic.id}
                logTopic={logTopic}
                logReminders={logReminders}
            />
        ));
    }
}

export default LogReminderSidebar;
