import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import { ScrollableSection, TypeaheadSelector } from '../Common';
import LogTopicList from './LogTopicList';

class LogTopicSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logTopic: null,
        };
    }

    renderFilters() {
        return (
            <InputGroup>
                <TypeaheadSelector
                    dataType="log-topic"
                    value={this.state.logTopic}
                    disabled={this.props.disabled}
                    onChange={(logTopic) => this.setState({ logTopic })}
                    selector={{ has_structure: false }}
                    placeholder="Topic Search ..."
                />
            </InputGroup>
        );
    }

    renderLogTopics() {
        const selector = { has_structure: false };
        const moreProps = {};
        if (this.state.logTopic) {
            selector.id = this.state.logTopic.id;
            moreProps.allowCreation = false;
            moreProps.allowReordering = false;
        } else {
            selector.parent_topic_id = null;
        }
        return <LogTopicList selector={selector} {...moreProps} />;
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
