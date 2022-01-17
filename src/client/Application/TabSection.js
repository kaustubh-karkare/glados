import React from 'react';

import { Enum } from '../../common/data_types';
import { PluginDisplayLocation, SidebarSection } from '../Common';
import { GraphSection } from '../Graphs';
import { LogEventSearch } from '../LogEvent';
import { LogStructureSearch } from '../LogStructure';
import { LogTopicSearch } from '../LogTopic';
import PropTypes from '../prop-types';

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
    {
        label: 'Explore Graphs',
        value: 'graph',
        Component: GraphSection,
    },
]);

class TabSection extends React.Component {
    constructor(props) {
        super(props);
        const PluginOptions = [];
        const TabComponents = {};
        Tab.Options.forEach((option) => {
            TabComponents[option.value] = option.Component;
        });
        Object.entries(this.props.plugins).forEach(([_name, api]) => {
            if (api.getDisplayLocation() === PluginDisplayLocation.TAB_SECTION) {
                const tabData = api.getTabData();
                PluginOptions.push(tabData);
                TabComponents[tabData.value] = (...args) => api.getDisplayComponent(...args);
            }
        });
        this.state = {
            options: Tab.Options.concat(PluginOptions),
            components: TabComponents,
        };
    }

    getComponent(value) {
        return this.state.components[value];
    }

    render() {
        return this.state.options.map((option) => (
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
    plugins: PropTypes.Custom.Plugins.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default TabSection;
