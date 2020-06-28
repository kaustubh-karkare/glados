import React from 'react';
import { LogEntryList } from '../LogEntry';
import { getTodayLabel, getDayOfTheWeek } from '../../common/DateUtils';

class LogEntryDateList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dates: null };
    }

    componentDidMount() {
        this.reload();
    }

    reload() {
        window.api.send('dates')
            .then((dates) => this.setState({ dates }));
    }

    render() {
        if (this.state.dates === null) {
            return 'Loading ...';
        }
        const today = getTodayLabel();
        return this.state.dates.map((date) => (
            <LogEntryList
                key={date}
                name={`${date} : ${getDayOfTheWeek(date)}`}
                selector={{ date }}
                showAdder={date === today}
            />
        ));
    }
}

export default LogEntryDateList;
