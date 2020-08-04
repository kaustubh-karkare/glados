import React from 'react';
import PropTypes from 'prop-types';
import { DataLoader, SidebarSection } from '../Common';

class SidebarItemsSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = { items: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => ({
                name: `${this.props.dataType}-list`,
                args: {
                    where: { on_sidebar: true },
                },
            }),
            callback: (items) => this.setState({
                items: items.sort((left, right) => left.name.localeCompare(right.name)),
            }),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    renderContent() {
        if (this.state.items === null) {
            return 'Loading ...';
        }
        const { ViewerComponent, valueKey } = this.props;
        return this.state.items.map((item) => (
            <ViewerComponent key={item.id} {...{ [valueKey]: item }} />
        ));
    }

    render() {
        return (
            <SidebarSection title={this.props.title}>
                {this.renderContent()}
            </SidebarSection>
        );
    }
}

SidebarItemsSection.propTypes = {
    title: PropTypes.string.isRequired,
    dataType: PropTypes.string.isRequired,
    ViewerComponent: PropTypes.func.isRequired,
    valueKey: PropTypes.string.isRequired,
};

export default SidebarItemsSection;
