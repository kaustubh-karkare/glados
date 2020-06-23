/* eslint-disable react/prop-types */

import { FaRegTrashAlt } from 'react-icons/fa';
import { GoPrimitiveDot } from 'react-icons/go';
import { MdFormatLineSpacing, MdEdit } from 'react-icons/md';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import { TiMinus, TiPlus } from 'react-icons/ti';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';


const SortableDragHandle = SortableHandle(() => (
    <div className="icon sortableDragHandle">
        <MdFormatLineSpacing />
    </div>
));


class BulletListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hover: false };
    }

    renderPrefix() {
        if (this.state.hover) {
            return (
                <>
                    <SortableDragHandle />
                    <div
                        className="icon icon-white"
                        onClick={this.props.onToggleExpansion}
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
        if (!this.state.hover) {
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
                    onMouseEnter={() => this.setState({ hover: true })}
                    onMouseOver={() => this.setState({ hover: true })}
                    onMouseLeave={() => this.setState({ hover: false })}
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
    // prefix
    isExpanded: PropTypes.bool,
    onToggleExpansion: PropTypes.func.isRequired,

    // suffix
    onEditButtonClick: PropTypes.func.isRequired,
    onDeleteButtonClick: PropTypes.func.isRequired,
};


export default SortableElement(BulletListItem);
