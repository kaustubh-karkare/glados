import assert from 'assert';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import { Coordinator, ScrollableSection, TypeaheadSelector } from '../Common';
import LogStructureList from './LogStructureList';
import LogStructureGroupList from './LogStructureGroupList';

class LogStructureSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logTopicOrStructure: null,
        };
    }

    componentDidMount() {
        this.deregisterCallbacks = [
            Coordinator.register(
                'log-structure-select',
                (logStructure) => this.setState({
                    logTopicOrStructure: logStructure,
                }, this.afterUpdate),
            ),
            Coordinator.register(
                'log-topic-select',
                (logTopic) => this.setState({
                    logTopicOrStructure: logTopic,
                }, this.afterUpdate),
            ),
        ];
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    renderFilters() {
        return (
            <InputGroup>
                <TypeaheadSelector
                    id="log-structure-search-topic-or-structure"
                    serverSideTypes={['log-topic', 'log-structure']}
                    value={this.state.logTopicOrStructure}
                    disabled={this.props.disabled}
                    onChange={(logTopicOrStructure) => this.setState({ logTopicOrStructure })}
                    placeholder="Structure Search ..."
                />
            </InputGroup>
        );
    }

    renderLogStructures() {
        const { logTopicOrStructure } = this.state;
        if (logTopicOrStructure) {
            if (logTopicOrStructure.__type__ === 'log-topic') {
                const where = { topic_id: logTopicOrStructure.id };
                return (
                    <LogStructureList
                        allowCreation={false}
                        allowReordering={false}
                        where={where}
                    />
                );
            } if (logTopicOrStructure.__type__ === 'log-structure') {
                return <LogStructureList.Single logStructure={logTopicOrStructure} />;
            }
            assert(false, logTopicOrStructure);
        }
        return <LogStructureGroupList />;
    }

    render() {
        return (
            <>
                <div className="mb-1">
                    {this.renderFilters()}
                </div>
                <ScrollableSection padding={20 + 4}>
                    {this.renderLogStructures()}
                </ScrollableSection>
            </>
        );
    }
}

LogStructureSearch.propTypes = {
    disabled: PropTypes.bool.isRequired,
};

export default LogStructureSearch;
