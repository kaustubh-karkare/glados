import assert from 'assert';
import React from 'react';
import PropTypes from '../prop-types';
import { TypeaheadOptions } from '../Common';
import LogTopicList from './LogTopicList';

class LogTopicSearch extends React.Component {
    static getTypeaheadOptions(logMode) {
        const where = { logMode: logMode || undefined };
        return new TypeaheadOptions({
            serverSideOptions: [
                { name: 'log-topic', args: { where } },
            ],
        });
    }

    static getDerivedStateFromProps(props, state) {
        const where = {
            logMode: props.logMode || undefined,
        };
        let defaultDisplay = true;
        props.search.forEach((item) => {
            if (item.__type__ === 'log-topic') {
                if (!where.logTopics) {
                    where.logTopics = [];
                }
                where.logTopics.push(item);
                defaultDisplay = false;
            } else {
                assert(false, item);
            }
        });
        state.where = where;
        state.defaultDisplay = defaultDisplay;
        return state;
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        if (this.state.defaultDisplay) {
            const where = {
                logMode: this.props.logMode || undefined,
                parentLogTopic: null,
            };
            return <LogTopicList where={where} />;
        }
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
}

LogTopicSearch.propTypes = {
    logMode: PropTypes.Custom.LogMode,
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogTopicSearch;
