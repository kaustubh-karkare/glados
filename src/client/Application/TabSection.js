import PropTypes from 'prop-types';
import React from 'react';
import { SidebarSection } from '../Common';
import { LogEventSearch } from '../LogEvent';
import { LogStructureSearch } from '../LogStructure';
import { LogTopicSearch } from '../LogTopic';
import Enum from '../../common/Enum';

const Tab = Enum([
    {
        label: 'Manage Events',
        value: 'log-event',
        Component: LogEventSearch,
    },
    {
        label: 'Manage Topics',
        value: 'log-topic',
        Component: LogTopicSearch,
    },
    {
        label: 'Manage Structures',
        value: 'log-structure',
        Component: LogStructureSearch,
    },
]);

class TabSection extends React.Component {
    render() {
        return Tab.Options.map((option) => (
            <SidebarSection
                key={option.value}
                onClick={() => this.props.onChange(option.value)}
                selected={this.props.value === option.value}
            >
                {option.label}
            </SidebarSection>
        ));
    }
}

TabSection.Enum = Tab;

TabSection.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default TabSection;
