import { MdAddCircleOutline } from 'react-icons/md';
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
        }
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
                    {this.state.isHighlighted ? this.renderAddButton() : null}
                </InputGroup>
            </Highlightable>
        );
    }
}

BulletListTitle.propTypes = {
    name: PropTypes.string.isRequired,
    onAddButtonClick: PropTypes.func,
};

export default BulletListTitle;
