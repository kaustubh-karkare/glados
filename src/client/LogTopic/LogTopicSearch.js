import assert from 'assert';
import PropTypes from 'prop-types';
import React from 'react';
import { TypeaheadOptions } from '../Common';
import LogTopicList from './LogTopicList';

class LogTopicSearch extends React.Component {
    static getTypeaheadOptions() {
        return new TypeaheadOptions({
            serverSideOptions: [{ name: 'log-topic' }],
        });
    }

    static getDerivedStateFromProps(props, state) {
        const where = {};
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
            return <LogTopicList where={{ parentLogTopic: null }} />;
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
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogTopicSearch;
