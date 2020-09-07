import assert from 'assert';
import PropTypes from 'prop-types';
import React from 'react';
import { TypeaheadOptions } from '../Common';
import LogModeList from './LogModeList';

class LogModeSearch extends React.Component {
    static getTypeaheadOptions(logMode) {
        return new TypeaheadOptions({
            serverSideOptions: [{ name: 'log-mode' }],
        });
    }

    static getDerivedStateFromProps(props, state) {
        const where = {};
        let defaultDisplay = true;
        props.search.forEach((item) => {
            if (item.__type__ === 'log-mode') {
                if (!where.id) where.id = [];
                where.id.push(item.id);
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
            return <LogModeList />;
        }
        return (
            <LogModeList
                name="Selected Mode(s)"
                allowCreation={false}
                allowReordering={false}
                where={this.state.where}
            />
        );
    }
}

LogModeSearch.propTypes = {
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogModeSearch;
