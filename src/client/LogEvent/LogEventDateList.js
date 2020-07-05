import React from 'react';
import { DataLoader } from '../Common';
import LogEventList from './LogEventList';
import { getTodayLabel, getDayOfTheWeek } from '../../common/DateUtils';

class LogEventDateList extends React.Component {
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
            <LogEventList
                key={date}
                name={`${date} : ${getDayOfTheWeek(date)}`}
                selector={{ date }}
                showAdder={date === today}
            />
        ));
    }
}

export default LogEventDateList;
