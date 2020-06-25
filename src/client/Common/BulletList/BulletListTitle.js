import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import { TiMinus, TiPlus } from 'react-icons/ti';
import { MdAddCircleOutline } from 'react-icons/md';
import BulletListIcon from './BulletListIcon';


class BulletListTitle extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasFocus: false };
    }

    renderListToggleButton() {
        if (this.props.areAllExpanded) {
            return (
                <BulletListIcon
                    title="Collapse All"
                    onClick={this.props.onToggleButtonClick}
                >
                    <TiMinus />
                </BulletListIcon>
            );
        }
        return (
            <BulletListIcon
                title="Expand All"
                onClick={this.props.onToggleButtonClick}
            >
                <TiPlus />
            </BulletListIcon>
        );
    }

    renderAddButton() {
        return (
            <BulletListIcon
                title="Create New"
                onClick={this.props.onAddButtonClick}
            >
                <MdAddCircleOutline />
            </BulletListIcon>
        );
    }

    render() {
        return (
            <InputGroup
                className={this.state.hasFocus ? 'focus' : null}
                onMouseEnter={() => this.setState({ hasFocus: true })}
                onMouseOver={() => this.setState({ hasFocus: true })}
                onMouseLeave={() => this.setState({ hasFocus: false })}
                onFocus={() => this.setState({ hasFocus: true })}
                onBlur={() => this.setState({ hasFocus: false })}
            >
                <div>{this.props.name}</div>
                {this.renderListToggleButton()}
                {this.renderAddButton()}
            </InputGroup>
        );
    }
}

BulletListTitle.propTypes = {
    name: PropTypes.string.isRequired,
    areAllExpanded: PropTypes.bool.isRequired,
    onToggleButtonClick: PropTypes.func.isRequired,
    onAddButtonClick: PropTypes.func.isRequired,
};

export default BulletListTitle;
