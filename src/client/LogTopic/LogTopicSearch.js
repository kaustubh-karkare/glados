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
                'log-topic-select',
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
                    id="log-topic-search-topic"
                    serverSideTypes={['log-topic']}
                    value={this.state.logTopic}
                    disabled={this.props.disabled}
                    onChange={(logTopic) => this.setState({ logTopic })}
                    placeholder="Topic Search ..."
                />
            </InputGroup>
        );
    }

    renderLogTopics() {
        const where = {};
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

    renderWrapper() {
        if (this.props.unstyled) {
            return this.renderLogTopics();
        }
        return (
            <ScrollableSection padding={20 + 4}>
                {this.renderLogTopics()}
            </ScrollableSection>
        );
    }

    render() {
        return (
            <>
                <div className="mb-1">
                    {this.renderFilters()}
                </div>
                {this.renderWrapper()}
            </>
        );
    }
}

LogTopicSearch.propTypes = {
    unstyled: PropTypes.bool,
    disabled: PropTypes.bool.isRequired,
};

export default LogTopicSearch;
