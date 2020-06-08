import React from 'react';
import LogEntryEditor from './LogEntryEditor';

class LogEntryList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { entries: null };
    }

    componentDidMount() {
        this.reload();
    }

    reload() {
        window.api.send('log-entry-list')
            .then((entries) => this.setState({ entries }));
    }

    render() {
        if (this.state.entries) {
            return <div>Loading Entries ...</div>;
        }
        return <LogEntryEditor />;
    }
}

export default LogEntryList;
