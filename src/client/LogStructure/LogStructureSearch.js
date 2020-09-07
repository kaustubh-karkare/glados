import assert from 'assert';
import React from 'react';
import PropTypes from '../prop-types';
import { TypeaheadOptions } from '../Common';
import LogStructureList from './LogStructureList';
import LogStructureGroupList from './LogStructureGroupList';

class LogStructureSearch extends React.Component {
    static getTypeaheadOptions(logMode) {
        const where = { logMode: logMode || undefined };
        return new TypeaheadOptions({
            serverSideOptions: [
                { name: 'log-structure', args: { where } },
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
            const where = { logMode: this.props.logMode || undefined };
            return <LogStructureGroupList where={where} />;
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
    logMode: PropTypes.Custom.LogMode,
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogStructureSearch;
