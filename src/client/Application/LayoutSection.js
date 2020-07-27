import PropTypes from 'prop-types';
import React from 'react';
import { Coordinator, LeftRight, SidebarSection } from '../Common';

class LayoutSection extends React.Component {
    static onChange(event, layoutType) {
        event.preventDefault();
        event.stopPropagation();
        Coordinator.invoke('layout', layoutType);
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const [layoutOptions] = Coordinator.invoke('layout-list');
        this.setState({ layoutOptions });
    }

    renderOptions() {
        return this.state.layoutOptions.map((option, index) => {
            let { label } = option;
            if (this.props.layoutType !== option.value) {
                label = (
                    <a href="#" onClick={(event) => LayoutSection.onChange(event, option.value)}>
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
        if (!this.state.layoutOptions) return null;
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

LayoutSection.propTypes = {
    layoutType: PropTypes.string.isRequired,
};

export default LayoutSection;
