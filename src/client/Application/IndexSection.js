import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from 'prop-types';
import { ScrollableSection, TypeaheadSelector } from '../Common';

function IndexSection(props) {
    const { Component } = props;
    const typeaheadOptions = Component.getTypeaheadOptions();
    const filteredSearch = typeaheadOptions.filter(props.search);
    if (filteredSearch.length !== props.search.length) {
        window.setTimeout(props.onChange.bind(filteredSearch), 0);
    }
    return (
        <div className="index-section">
            <div className="mb-1">
                <InputGroup>
                    <TypeaheadSelector
                        id="search"
                        options={typeaheadOptions}
                        value={filteredSearch}
                        disabled={props.disabled}
                        onChange={props.onChange}
                        placeholder="Search ..."
                        multiple
                    />
                </InputGroup>
            </div>
            <ScrollableSection padding={20 + 4}>
                <Component search={filteredSearch} />
            </ScrollableSection>
        </div>
    );
}

IndexSection.propTypes = {
    Component: PropTypes.func.isRequired,
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default IndexSection;
