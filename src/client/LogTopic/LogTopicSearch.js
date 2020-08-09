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
        const { logTopic } = this.state;
        if (logTopic) {
            return (
                <>
                    <LogTopicList
                        name="Selected Topic"
                        where={{ id: logTopic.id }}
                        allowCreation={false}
                        allowReordering={false}
                    />
                    <LogTopicList
                        name="Referencing Topics"
                        where={{ topic_id: logTopic.id }}
                        allowCreation={false}
                        allowReordering={false}
                    />
                </>
            );
        }
        return <LogTopicList where={{ parent_topic_id: null }} />;
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
