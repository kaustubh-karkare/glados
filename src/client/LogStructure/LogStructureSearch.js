import assert from 'assert';
import PropTypes from 'prop-types';
import React from 'react';
import { TypeaheadOptions } from '../Common';
import LogStructureList from './LogStructureList';
import LogStructureGroupList from './LogStructureGroupList';

class LogStructureSearch extends React.Component {
    static getTypeaheadOptions() {
        return new TypeaheadOptions({
            serverSideOptions: [{ name: 'log-structure' }, { name: 'log-topic' }],
        });
    }

    static getDerivedStateFromProps(props, state) {
        const where = {};
        let defaultDisplay = true;
        props.search.forEach((item) => {
            if (item.__type__ === 'log-structure') {
                if (!where.id) where.id = [];
                where.id.push(item.id);
                defaultDisplay = false;
            } else if (item.__type__ === 'log-topic') {
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
            return <LogStructureGroupList />;
        }
        return (
            <LogStructureList
                name="Selected Structure(s)"
                allowCreation={false}
                allowReordering={false}
                where={this.state.where}
            />
        );
    }
}

LogStructureSearch.propTypes = {
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogStructureSearch;
