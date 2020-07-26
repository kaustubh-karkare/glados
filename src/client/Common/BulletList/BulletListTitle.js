import { MdAddCircleOutline } from 'react-icons/md';
import { TiMinus, TiPlus } from 'react-icons/ti';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import BulletListIcon from './BulletListIcon';
import { KeyCodes } from '../Utils';


class BulletListTitle extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasFocus: false };
    }

    onKeyDown(event) {
        if (event.keyCode === KeyCodes.ENTER) {
            this.props.onAddButtonClick(event);
        } else if (event.keyCode === KeyCodes.SPACE) {
            this.props.onToggleButtonClick(event);
        }
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
        if (!this.props.onAddButtonClick) {
            return null;
        }
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
                tabIndex={0}
                className={this.state.hasFocus ? 'focus' : null}
                onMouseEnter={() => this.setState({ hasFocus: true })}
                onMouseOver={() => this.setState({ hasFocus: true })}
                onMouseLeave={() => this.setState({ hasFocus: false })}
                onFocus={() => this.setState({ hasFocus: true })}
                onBlur={() => this.setState({ hasFocus: false })}
                onKeyDown={(event) => this.onKeyDown(event)}
            >
                <div>{this.props.name}</div>
                {this.state.hasFocus ? this.renderListToggleButton() : null}
                {this.state.hasFocus ? this.renderAddButton() : null}
            </InputGroup>
        );
    }
}

BulletListTitle.propTypes = {
    name: PropTypes.string.isRequired,
    areAllExpanded: PropTypes.bool.isRequired,
    onToggleButtonClick: PropTypes.func.isRequired,
    onAddButtonClick: PropTypes.func,
};

export default BulletListTitle;
