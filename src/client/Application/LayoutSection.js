import PropTypes from 'prop-types';
import React from 'react';
import { LeftRight, SidebarSection } from '../Common';
import Enum from '../../common/Enum';

const Layout = Enum([
    {
        label: 'Default',
        value: 'default',
    },
    {
        label: 'Topic',
        value: 'topic',
    },
]);

class LayoutSection extends React.Component {
    renderOptions() {
        return Layout.Options.map((option, index) => {
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
                    {'Layout: '}
                    <div>{this.renderOptions()}</div>
                </LeftRight>
            </SidebarSection>
        );
    }
}

const DEFAULT_VALUE = Layout.DEFAULT;

LayoutSection.getValue = (value) => value || DEFAULT_VALUE;

LayoutSection.Enum = Layout;

LayoutSection.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

LayoutSection.defaultProps = {
    value: DEFAULT_VALUE,
};

export default LayoutSection;
