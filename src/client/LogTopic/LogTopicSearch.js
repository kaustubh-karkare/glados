import React from 'react';
import PropTypes from '../prop-types';
import { TypeaheadOptions } from '../Common';
import LogTopicList from './LogTopicList';
import LogTopicOptions from './LogTopicOptions';

class LogTopicSearch extends React.Component {
    static getTypeaheadOptions(logMode) {
        const where = { logMode: logMode || undefined };
        return new TypeaheadOptions({
            serverSideOptions: [
                { name: 'log-topic', args: { where } },
            ],
        });
    }

    static getDerivedStateFromProps(props, _state) {
        return LogTopicOptions.extractData(
            props.logMode,
            props.search,
            LogTopicOptions.getTypeToActionMap(),
        );
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    renderSearchView() {
        return (
            <>
                <LogTopicList
                    name="Selected Topic"
                    where={{ id: this.state.where.logTopics.map((logTopic) => logTopic.id) }}
                    allowCreation={false}
                    allowReordering={false}
                />
                <LogTopicList
                    name="Referencing Topics"
                    where={this.state.where}
                    allowCreation={false}
                    allowReordering={false}
                />
            </>
        );
    }

    renderDefaultView() {
        const where = {
            logMode: this.props.logMode || undefined,
            parentLogTopic: null,
        };
        return <LogTopicList where={where} />;
    }

    render() {
        if (this.state.extra.searchView) {
            return this.renderSearchView();
        }
        return this.renderDefaultView();
    }
}

LogTopicSearch.propTypes = {
    logMode: PropTypes.Custom.LogMode,
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogTopicSearch;
