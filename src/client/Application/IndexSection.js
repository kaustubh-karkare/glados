import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { DateRangePicker, ScrollableSection, TypeaheadSelector } from '../Common';

function IndexSection(props) {
    const { Component } = props;
    const typeaheadOptions = Component.getTypeaheadOptions();
    const filteredSearch = typeaheadOptions.filterToKnownTypes(props.search);
    if (filteredSearch.length !== props.search.length) {
        window.setTimeout(props.onChange.bind(filteredSearch), 0);
    }
    const { dateRange } = props;
    return (
        <div className="index-section">
            <div className="mb-1">
                <InputGroup>
                    <DateRangePicker
                        dateRange={dateRange}
                        onChange={(newDateRange) => props.onChange({ dateRange: newDateRange })}
                    />
                    <TypeaheadSelector
                        id="search"
                        options={typeaheadOptions}
                        value={filteredSearch}
                        disabled={props.disabled}
                        onChange={(search) => props.onChange({ search })}
                        placeholder="Search ..."
                        multiple
                    />
                </InputGroup>
            </div>
            <ScrollableSection padding={20 + 4}>
                <Component
                    dateRange={dateRange}
                    search={filteredSearch}
                />
            </ScrollableSection>
        </div>
    );
}

IndexSection.propTypes = {
    Component: PropTypes.func.isRequired,
    dateRange: PropTypes.Custom.DateRange,
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default IndexSection;
