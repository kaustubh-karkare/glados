import React from 'react';
import PropTypes from '../prop-types';
import LogStructureList from './LogStructureList';
import LogStructureGroupList from './LogStructureGroupList';
import LogStructureOptions from './LogStructureOptions';

class LogStructureSearch extends React.Component {
    static getTypeaheadOptions(logMode) {
        return LogStructureOptions.get(logMode);
    }

    static getDerivedStateFromProps(props, _state) {
        return LogStructureOptions.extractData(
            props.logMode,
            props.search,
            LogStructureOptions.getTypeToActionMap(),
        );
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    renderSearchView() {
        return (
            <LogStructureList
                name="Selected Structure(s)"
                allowCreation={false}
                allowReordering={false}
                where={this.state.where}
                viewerComponentProps={{ showDetails: true }}
            />
        );
    }

    renderDefaultView() {
        const where = { logMode: this.props.logMode || undefined };
        return (
            <LogStructureGroupList
                where={where}
                viewerComponentProps={{ showDetails: true }}
            />
        );
    }

    render() {
        if (this.state.extra.searchView) {
            return this.renderSearchView();
        }
        return this.renderDefaultView();
    }
}

LogStructureSearch.propTypes = {
    logMode: PropTypes.Custom.LogMode,
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogStructureSearch;
