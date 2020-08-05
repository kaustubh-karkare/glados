import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import { Coordinator, ScrollableSection, TypeaheadSelector } from '../Common';
import LogStructureList from './LogStructureList';
import LogStructureGroupList from './LogStructureGroupList';

class LogStructureSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logStructure: null,
        };
    }

    componentDidMount() {
        this.deregisterCallbacks = [
            Coordinator.register(
                'log-structure-select',
                (logStructure) => this.setState({ logStructure }),
            ),
        ];
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    renderFilters() {
        return (
            <InputGroup>
                <TypeaheadSelector
                    dataType="log-structure"
                    value={this.state.logStructure}
                    disabled={this.props.disabled}
                    onChange={(logStructure) => this.setState({ logStructure })}
                    placeholder="Structure Search ..."
                />
            </InputGroup>
        );
    }

    renderLogStructures() {
        if (this.state.logStructure) {
            const where = { id: this.state.logStructure.id };
            return (
                <LogStructureList
                    allowCreation={false}
                    allowReordering={false}
                    where={where}
                />
            );
        }
        return <LogStructureGroupList />;
    }

    render() {
        return (
            <>
                <div className="mb-1">
                    {this.renderFilters()}
                </div>
                <ScrollableSection padding={20 + 4}>
                    {this.renderLogStructures()}
                </ScrollableSection>
            </>
        );
    }
}

LogStructureSearch.propTypes = {
    disabled: PropTypes.bool.isRequired,
};

export default LogStructureSearch;
