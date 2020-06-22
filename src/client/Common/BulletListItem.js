/* eslint-disable react/prop-types */

import InputGroup from 'react-bootstrap/InputGroup';
import { FaRegTrashAlt } from 'react-icons/fa';
import { GoPrimitiveDot } from 'react-icons/go';
import { MdFormatLineSpacing, MdEdit } from 'react-icons/md';
import { TiMinus, TiPlus } from 'react-icons/ti';
import React from 'react';
import PropTypes from 'prop-types';


class BulletListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hover: false };
    }

    renderPrefix() {
        if (this.state.hover) {
            return (
                <>
                    <div className="icon sortableDragHandle" style={{ cursor: 'grab' }}>
                        <MdFormatLineSpacing />
                    </div>
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

export default BulletListItem;
