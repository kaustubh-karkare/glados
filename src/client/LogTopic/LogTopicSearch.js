import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import { Coordinator, ScrollableSection, TypeaheadSelector } from '../Common';
import LogTopicList from './LogTopicList';

class LogTopicSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logTopic: null,
        };
    }

    componentDidMount() {
        this.deregisterCallbacks = [
            Coordinator.register(
                'topic-select',
                (logTopic) => this.setState({ logTopic }),
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
                    dataType="log-topic"
                    value={this.state.logTopic}
                    disabled={this.props.disabled}
                    onChange={(logTopic) => this.setState({ logTopic })}
                    where={{ has_structure: false }}
                    placeholder="Topic Search ..."
                />
            </InputGroup>
        );
    }

    renderLogTopics() {
        const where = { has_structure: false };
        const moreProps = {};
        if (this.state.logTopic) {
            where.id = this.state.logTopic.id;
            moreProps.allowCreation = false;
            moreProps.allowReordering = false;
        } else {
            where.parent_topic_id = null;
        }
        return <LogTopicList where={where} {...moreProps} />;
    }

    render() {
        return (
            <>
                <div className="mb-1">
                    {this.renderFilters()}
                </div>
                <ScrollableSection padding={20 + 4}>
                    {this.renderLogTopics()}
                </ScrollableSection>
            </>
        );
    }
}

LogTopicSearch.propTypes = {
    disabled: PropTypes.bool.isRequired,
};

export default LogTopicSearch;
