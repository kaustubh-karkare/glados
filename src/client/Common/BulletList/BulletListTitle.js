import PropTypes from 'prop-types';
import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import { TiMinus, TiPlus } from 'react-icons/ti';

import Highlightable from '../Highlightable';
import { KeyCodes } from '../Utils';
import BulletListIcon from './BulletListIcon';

class BulletListTitle extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isHighlighted: false };
    }

    onKeyDown(event) {
        if (event.keyCode === KeyCodes.ENTER) {
            this.props.onAddButtonClick(event);
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

    renderSortButton() {
        if (!this.props.onSortButtonClick) {
            return null;
        }
        // TODO: Use a proper icon to indicate sorting.
        // Was on a flight (no internet access) when I added this feature.
        return (
            <BulletListIcon
                title="Sort"
                onClick={this.props.onSortButtonClick}
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
                    {this.state.isHighlighted ? this.renderSortButton() : null}
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
    onSortButtonClick: PropTypes.func,
};

export default BulletListTitle;
