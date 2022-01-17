import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';

import { DateRangePicker, ScrollableSection, TypeaheadSelector } from '../Common';
import PropTypes from '../prop-types';

class IndexSection extends React.Component {
    renderWithTypeahead() {
        const { Component, dateRange, onChange } = this.props;
        const typeaheadOptions = Component.getTypeaheadOptions();
        const filteredSearch = typeaheadOptions.filterToKnownTypes(this.props.search);
        if (filteredSearch.length !== this.props.search.length) {
            window.setTimeout(onChange.bind(filteredSearch), 0);
        }
        return (
            <div className="index-section">
                <div className="mb-1">
                    <InputGroup>
                        <DateRangePicker
                            dateRange={dateRange}
                            onChange={(newDateRange) => onChange({ dateRange: newDateRange })}
                        />
                        <TypeaheadSelector
                            id="search"
                            options={typeaheadOptions}
                            value={filteredSearch}
                            disabled={this.props.disabled}
                            onChange={(search) => onChange({ search })}
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

    renderSimple() {
        const { Component } = this.props;
        return (
            <div className="index-section">
                <ScrollableSection>
                    <Component />
                </ScrollableSection>
            </div>
        );
    }

    render() {
        const { Component } = this.props;
        if (Component.getTypeaheadOptions) {
            return this.renderWithTypeahead();
        }
        return this.renderSimple();
    }
}

IndexSection.propTypes = {
    Component: PropTypes.func.isRequired,
    dateRange: PropTypes.Custom.DateRange,
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default IndexSection;
