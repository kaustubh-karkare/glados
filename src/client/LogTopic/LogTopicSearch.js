import React from 'react';
import PropTypes from '../prop-types';
import { TypeaheadOptions } from '../Common';
import LogTopicList from './LogTopicList';
import LogTopicOptions from './LogTopicOptions';

class LogTopicSearch extends React.Component {
    static getTypeaheadOptions() {
        const where = {};
        return new TypeaheadOptions({
            serverSideOptions: [
                { name: 'log-topic', args: { where } },
            ],
        });
    }

    static getDerivedStateFromProps(props, _state) {
        return LogTopicOptions.extractData(
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
                    where={{
                        __id__: this.state.where.logTopics
                            .map((logTopic) => logTopic.__id__),
                    }}
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

    // eslint-disable-next-line class-methods-use-this
    renderDefaultView() {
        return <LogTopicList where={{ parentLogTopic: null }} />;
    }

    render() {
        if (this.state.extra.searchView) {
            return this.renderSearchView();
        }
        return this.renderDefaultView();
    }
}

LogTopicSearch.propTypes = {
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogTopicSearch;
