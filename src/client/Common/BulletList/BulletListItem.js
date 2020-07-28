/* eslint-disable react/prop-types */

import { FaRegTrashAlt } from 'react-icons/fa';
import { GoPrimitiveDot } from 'react-icons/go';
import { MdFormatLineSpacing, MdEdit } from 'react-icons/md';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import { TiMinus, TiPlus } from 'react-icons/ti';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import { KeyCodes } from '../Utils';
import Highlightable from '../Highlightable';


const SortableDragHandle = SortableHandle(() => (
    <div className="icon sortableDragHandle">
        <MdFormatLineSpacing />
    </div>
));


class BulletListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isHighlighted: false };
    }

    onKeyDown(event) {
        if (event.keyCode === KeyCodes.ENTER) {
            this.props.onEditButtonClick(event);
        } else if (event.keyCode === KeyCodes.SPACE) {
            this.props.onToggleButtonClick(event);
        } else if (event.keyCode === KeyCodes.DELETE) {
            this.props.onDeleteButtonClick(event);
        } else if (event.keyCode === KeyCodes.UP_ARROW) {
            this.props.onMoveUp(event);
        } else if (event.keyCode === KeyCodes.DOWN_ARROW) {
            this.props.onMoveDown(event);
        }
    }

    renderPrefix() {
        if (this.state.isHighlighted) {
            return (
                <>
                    {
                        this.props.allowReordering
                            ? <SortableDragHandle />
                            : <div className="icon" />
                    }
                    <div
                        className="icon icon-white mr-1"
                        onClick={this.props.onToggleButtonClick}
                    >
                        {this.props.isExpanded ? <TiMinus /> : <TiPlus />}
                    </div>
                </>
            );
        }
        return (
            <>
                <div className="icon" />
                <div className="icon icon-white mr-1">
                    {this.props.isExpanded ? <TiMinus /> : <GoPrimitiveDot />}
                </div>
            </>
        );
    }

    renderSuffix() {
        if (!this.state.isHighlighted) {
            return null;
        }
        return (
            <>
                <div
                    className="icon mx-1"
                    title="Edit"
                    onClick={this.props.onEditButtonClick}
                >
                    <MdEdit />
                </div>
                <div
                    className="icon"
                    title="Delete"
                    onClick={this.props.onDeleteButtonClick}
                >
                    <FaRegTrashAlt />
                </div>
            </>
        );
    }

    renderExpanded() {
        if (!this.props.isExpanded) {
            return null;
        }
        // 30 = 13*2 (options) + mx-1 (title)
        return (
            <div style={{ marginLeft: 30 }}>
                {this.props.children[1]}
            </div>
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
                    {this.renderPrefix()}
                    {this.props.children[0]}
                    {this.renderSuffix()}
                </InputGroup>
                {this.renderExpanded()}
            </Highlightable>
        );
    }
}

BulletListItem.propTypes = {
    allowReordering: PropTypes.bool,
    onMoveUp: PropTypes.func.isRequired,
    onMoveDown: PropTypes.func.isRequired,

    isExpanded: PropTypes.bool,
    onToggleButtonClick: PropTypes.func.isRequired,

    onEditButtonClick: PropTypes.func.isRequired,
    onDeleteButtonClick: PropTypes.func.isRequired,
};


export default SortableElement(BulletListItem);
