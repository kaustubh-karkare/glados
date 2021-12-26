import React from 'react';
import PropTypes from '../prop-types';
import LogStructureList from './LogStructureList';
import LogStructureGroupList from './LogStructureGroupList';
import LogStructureOptions from './LogStructureOptions';

class LogStructureSearch extends React.Component {
    static getTypeaheadOptions() {
        return LogStructureOptions.get();
    }

    static getDerivedStateFromProps(props, _state) {
        return LogStructureOptions.extractData(
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

    // eslint-disable-next-line class-methods-use-this
    renderDefaultView() {
        return (
            <LogStructureGroupList
                where={{}}
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
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogStructureSearch;
