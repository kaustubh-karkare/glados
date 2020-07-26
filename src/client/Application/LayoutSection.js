import React from 'react';
import { Coordinator, LeftRight, SidebarSection } from '../Common';

class LayoutSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const [layoutOptions, layoutType] = Coordinator.invoke('layout-list');
        this.setState({ layoutOptions, layoutType });
    }

    onClick(event, layoutType) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ layoutType });
        Coordinator.invoke('layout', layoutType);
    }

    renderOptions() {
        return this.state.layoutOptions.map((option, index) => {
            let { label } = option;
            if (this.state.layoutType !== option.value) {
                label = (
                    <a href="#" onClick={(event) => this.onClick(event, option.value)}>
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

export default LayoutSidebar;
