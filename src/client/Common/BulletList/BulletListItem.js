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


const SortableDragHandle = SortableHandle(() => (
    <div className="icon sortableDragHandle">
        <MdFormatLineSpacing />
    </div>
));


class BulletListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasFocus: false };
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
        if (this.state.hasFocus) {
            return (
                <>
                    <SortableDragHandle />
                    <div
                        className="icon icon-white"
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
                <div className="icon icon-white">
                    {this.props.isExpanded ? <TiMinus /> : <GoPrimitiveDot />}
                </div>
            </>
        );
    }

    renderSuffix() {
        if (!this.state.hasFocus) {
            return null;
        }
        return (
            <>
                <div
                    className="icon mr-1"
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
            <div>
                <InputGroup
                    className={this.state.hasFocus ? 'focus' : null}
                    tabIndex={0}
                    onMouseEnter={() => this.setState({ hasFocus: true })}
                    onMouseOver={() => this.setState({ hasFocus: true })}
                    onMouseLeave={() => this.setState({ hasFocus: false })}
                    onFocus={() => this.setState({ hasFocus: true })}
                    onBlur={() => this.setState({ hasFocus: false })}
                    onKeyDown={(event) => this.onKeyDown(event)}
                >
                    {this.renderPrefix()}
                    <div className="mx-1">
                        {this.props.children[0]}
                    </div>
                    {this.renderSuffix()}
                </InputGroup>
                {this.renderExpanded()}
            </div>
        );
    }
}

BulletListItem.propTypes = {
    onMoveUp: PropTypes.func.isRequired,
    onMoveDown: PropTypes.func.isRequired,

    isExpanded: PropTypes.bool,
    onToggleButtonClick: PropTypes.func.isRequired,

    onEditButtonClick: PropTypes.func.isRequired,
    onDeleteButtonClick: PropTypes.func.isRequired,
};


export default SortableElement(BulletListItem);
