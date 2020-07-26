import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import { ScrollableSection, TypeaheadSelector } from '../Common';
import LogStructureList from './LogStructureList';
import LogStructureGroupList from './LogStructureGroupList';

class LogStructureSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logStructure: null,
        };
    }

    onSelect(logTopic) {
        if (!logTopic) {
            this.setState({ logStructure: null });
            return;
        }
        window.api.send('log-structure-list', { selector: { topic_id: logTopic.id } })
            .then(([logStructure]) => this.setState({ logStructure }));
    }

    renderFilters() {
        return (
            <InputGroup>
                <TypeaheadSelector
                    dataType="log-topic"
                    value={this.state.logStructure && this.state.logStructure.logTopic}
                    disabled={this.props.disabled}
                    onChange={(logTopic) => this.onSelect(logTopic)}
                    selector={{ has_structure: true }}
                    placeholder="Structure Search ..."
                />
            </InputGroup>
        );
    }

    renderLogStructures() {
        if (this.state.logStructure) {
            const selector = { id: this.state.logStructure.id };
            return (
                <LogStructureList
                    allowCreation={false}
                    allowReordering={false}
                    selector={selector}
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
