import './SidebarSection.css';

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import { GoPrimitiveDot } from 'react-icons/go';
import { TiMinus, TiPlus } from 'react-icons/ti';

import Icon from './Icon';
import LeftRight from './LeftRight';

class SidebarSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isCollapsed: false };
    }

    renderHeader() {
        if (!this.props.title) {
            return null;
        }
        const { isCollapsed } = this.state;
        return (
            <LeftRight
                className={classNames({
                    header: true,
                    cursor: true,
                    separator: !isCollapsed,
                })}
                onClick={() => this.setState({ isCollapsed: !isCollapsed })}
            >
                {this.props.title}
                <Icon>{isCollapsed ? <TiPlus /> : <TiMinus />}</Icon>
            </LeftRight>
        );
    }

    renderChildren() {
        if (this.state.isCollapsed) {
            return null;
        }
        return (
            <div className={classNames({ cursor: !this.props.title })}>
                {this.props.children}
            </div>
        );
    }

    render() {
        const {
            selected, title: _title, children: _children, ...moreProps
        } = this.props;
        return (
            <div
                {...moreProps}
                className={classNames({
                    'sidebar-section': true,
                    selected,
                })}
            >
                {this.renderHeader()}
                {this.renderChildren()}
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

SidebarSection.Item = ({ children }) => (
    <InputGroup>
        <Icon alwaysHighlighted className="mr-1">
            <GoPrimitiveDot />
        </Icon>
        {children}
    </InputGroup>
);

SidebarSection.Item.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

export default SidebarSection;
