import React from 'react';
import PropTypes from 'prop-types';
import { TiMinus, TiPlus } from 'react-icons/ti';
import classNames from 'classnames';
import LeftRight from './LeftRight';

import './SidebarSection.css';

class SidebarSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isCollapsed: false };
    }

    renderButton() {
        if (this.state.isCollapsed) {
            return <TiPlus onClick={() => this.setState({ isCollapsed: false })} />;
        }
        return <TiMinus onClick={() => this.setState({ isCollapsed: true })} />;
    }

    renderHeader() {
        return (
            <LeftRight className={classNames({
                'sidebar-section-header': true,
                'sidebar-section-separator': !this.state.isCollapsed,
            })}
            >
                {this.props.title}
                {this.renderButton()}
            </LeftRight>
        );
    }

    render() {
        const {
            selected, title, children, ...moreProps
        } = this.props;
        return (
            <div
                {...moreProps}
                className={classNames({
                    'sidebar-section': true,
                    'sidebar-section-selected': selected,
                })}
            >
                {title ? this.renderHeader() : null}
                {this.state.isCollapsed ? null : children}
            </div>
        );
    }
}

SidebarSection.propTypes = {
    selected: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    title: PropTypes.any,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

export default SidebarSection;
