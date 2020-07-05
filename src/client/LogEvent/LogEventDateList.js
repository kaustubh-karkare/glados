import PropTypes from 'prop-types';
import React from 'react';
import { DataLoader } from '../Common';
import { getTodayLabel, getDayOfTheWeek } from '../../common/DateUtils';
import LogEventList from './LogEventList';

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
        const { selector, ...moreProps } = this.props;
        return this.state.dates.map((date) => (
            <LogEventList
                key={date}
                name={`${date} : ${getDayOfTheWeek(date)}`}
                selector={{ date, ...selector }}
                showAdder={date === today}
                {...moreProps}
            />
        ));
    }
}

LogEventDateList.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object,
};

export default LogEventDateList;
