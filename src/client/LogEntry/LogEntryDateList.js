import React from 'react';
import { DataLoader } from '../Common';
import LogEntryList from './LogEntryList';
import { getTodayLabel, getDayOfTheWeek } from '../../common/DateUtils';

class LogEntryDateList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dates: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            name: 'dates',
            callback: (dates) => this.setState({ dates }),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
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
