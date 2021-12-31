import React from 'react';

import PropTypes from '../prop-types';
import LeftRight from './LeftRight';
import SidebarSection from './SidebarSection';

class EnumSelectorSection extends React.Component {
    renderOptions() {
        return this.props.options.map((option, index) => {
            let { label } = option;
            if (this.props.value !== option.value) {
                label = (
                    <a href="#" onClick={() => this.props.onChange(option.value)}>
                        {option.label}
                    </a>
                );
            }
            return (
                <span key={option.value}>
                    {index ? ' | ' : ''}
                    {' '}
                    {label}
                </span>
            );
        });
    }

    render() {
        return (
            <SidebarSection>
                <LeftRight>
                    {this.props.label}
                    <div>{this.renderOptions()}</div>
                </LeftRight>
            </SidebarSection>
        );
    }
}

EnumSelectorSection.propTypes = {
    label: PropTypes.string.isRequired,
    options: PropTypes.Custom.EnumOptions.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default EnumSelectorSection;
