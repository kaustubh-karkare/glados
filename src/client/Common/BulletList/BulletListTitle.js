import { MdAddCircleOutline } from 'react-icons/md';
import { TiMinus, TiPlus } from 'react-icons/ti';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import Highlightable from '../Highlightable';
import BulletListIcon from './BulletListIcon';
import { KeyCodes } from '../Utils';


class BulletListTitle extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isHighlighted: false };
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
            <Highlightable
                isHighlighted={this.state.isHighlighted}
                onChange={(isHighlighted) => this.setState({ isHighlighted })}
                onKeyDown={(event) => this.onKeyDown(event)}
            >
                <InputGroup>
                    <div>{this.props.name}</div>
                    {this.state.isHighlighted ? this.renderListToggleButton() : null}
                    {this.state.isHighlighted ? this.renderAddButton() : null}
                </InputGroup>
            </Highlightable>
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
