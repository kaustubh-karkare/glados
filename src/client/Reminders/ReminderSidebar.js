import React from 'react';
import ReminderCheckList from './ReminderCheckList';
import { DataLoader } from '../Common';

class ReminderSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { reminderGroups: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            name: 'reminder-sidebar',
            callback: (reminderGroups) => this.setState({ reminderGroups }),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    render() {
        if (this.state.reminderGroups === null) {
            return 'Loading ...';
        }
        return this.state.reminderGroups.map((reminderGroup) => (
            <ReminderCheckList
                key={reminderGroup.id}
                name={reminderGroup.name}
                items={reminderGroup.items}
            />
        ));
    }
}

export default ReminderSidebar;
