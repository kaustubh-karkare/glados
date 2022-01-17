import './GraphSection.css';

import deepEqual from 'deep-equal';
import React from 'react';

import { DataLoader } from '../Common';
import PropTypes from '../prop-types';
import GraphLineChart from './GraphLineChart';
import { getGraphData } from './GraphSectionData';
import GraphSectionOptions, { Granularity } from './GraphSectionOptions';
import { NormalTooltip } from './GraphTooltip';

class GraphSection extends React.Component {
    static getTypeaheadOptions() {
        return GraphSectionOptions.get();
    }

    static getDerivedStateFromProps(props, state) {
        const result = GraphSectionOptions.extractData(props.search);
        result.where.date = props.dateRange || undefined;
        const newGranularity = result.extra.granularity || Granularity.WEEK;
        if (!deepEqual(state.where, result.where)) {
            state.reload = true;
        }
        state.where = result.where;
        state.hasAnyFilters = props.search.length > 0;
        if (state.granularity !== newGranularity && state.logEvents) {
            state.graphData = getGraphData(
                state.where.logStructure,
                state.logEvents,
                props.dateRange,
                newGranularity,
            );
        }
        state.granularity = newGranularity;
        return state;
    }

    constructor(props) {
        super(props);
        this.state = { graphData: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => {
                const { hasAnyFilters, where } = this.state;
                if (!hasAnyFilters) {
                    return null;
                }
                return {
                    name: 'log-event-list',
                    args: {
                        where: {
                            ...where,
                            date: this.props.dateRange || undefined,
                        },
                    },
                };
            },
            onData: (logEvents) => {
                const { dateRange } = this.props;
                const { where, granularity } = this.state;
                const graphData = getGraphData(
                    where.logStructure,
                    logEvents,
                    dateRange,
                    granularity,
                );
                this.setState({ logEvents, graphData });
            },
        });
    }

    componentDidUpdate(prevProps) {
        if (this.state.reload) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ reload: false });
            this.dataLoader.reload();
        }
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    render() {
        const { hasAnyFilters, graphData } = this.state;
        if (!hasAnyFilters) {
            return 'Please add some filters!';
        } if (!graphData) {
            return 'Loading ...';
        } if (graphData.isEmpty) {
            return 'No data!';
        }
        return graphData.lines.map((line) => {
            const lines = [{
                name: line.name,
                dataKey: line.valueKey,
            }];
            return (
                <GraphLineChart
                    key={line.name}
                    samples={graphData.samples}
                    lines={lines}
                    tooltip={NormalTooltip}
                />
            );
        });
    }
}

GraphSection.propTypes = {
    dateRange: PropTypes.Custom.DateRange,
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default GraphSection;
