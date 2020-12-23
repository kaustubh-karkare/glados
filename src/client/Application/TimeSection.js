import PropTypes from 'prop-types';
import React from 'react';
import { LeftRight, SidebarSection } from '../Common';

const { formatToTimeZone } = require('date-fns-timezone');

class TimeSection extends React.Component {
    constructor(props) {
        super(props);
        const offset = new Date().valueOf() % 1000;
        this.timeout = window.setTimeout(() => {
            this.interval = window.setInterval(() => this.forceUpdate(), 1000);
        }, 1000 - offset);
    }

    componentWillUnmount() {
        window.clearTimeout(this.timeout);
        window.clearInterval(this.interval);
    }

    render() {
        return (
            <SidebarSection>
                <LeftRight>
                    {this.props.label}
                    {formatToTimeZone(
                        new Date(),
                        'HH:mm:ss',
                        { timeZone: this.props.timezone },
                    )}
                </LeftRight>
            </SidebarSection>
        );
    }
}

TimeSection.propTypes = {
    label: PropTypes.string.isRequired,
    timezone: PropTypes.string.isRequired,
};

export default TimeSection;
