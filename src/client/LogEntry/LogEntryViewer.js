import InputGroup from 'react-bootstrap/InputGroup';
import { FaRegTrashAlt } from 'react-icons/fa';
import { GoPrimitiveDot } from 'react-icons/go';
import { GrDrag } from 'react-icons/gr';
import { TiMinus, TiPlus } from 'react-icons/ti';
import { MdEdit } from 'react-icons/md';
import React from 'react';
import PropTypes from '../prop-types';
import { TextEditor } from '../Common';

class LogEntryViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hover: false,
            isExpanded: false,
        };
    }

    toggleIsExpanded() {
        this.setState((state) => ({ isExpanded: !state.isExpanded }));
    }

    renderPrefix() {
        if (this.state.hover) {
            return (
                <>
                    <div className="compact-option sortableDragHandle">
                        <GrDrag />
                    </div>
                    <div
                        className="compact-option"
                        onClick={() => this.toggleIsExpanded()}
                    >
                        {this.state.isExpanded ? <TiMinus /> : <TiPlus />}
                    </div>
                </>
            );
        }
        return (
            <>
                <div className="compact-option" />
                <div className="compact-option">
                    {this.state.isExpanded ? <TiMinus /> : <GoPrimitiveDot />}
                </div>
            </>
        );
    }

    renderSuffix() {
        if (this.state.hover) {
            return (
                <>
                    <div className="compact-option mr-1" onClick={this.props.onEditButtonClick}>
                        <MdEdit />
                    </div>
                    <div className="compact-option" onClick={this.props.onDeleteButtonClick}>
                        <FaRegTrashAlt />
                    </div>
                </>
            );
        }
        return null;
    }

    renderExpanded() {
        if (!this.state.isExpanded) {
            return null;
        }
        if (!this.props.logEntry.details) {
            return null;
        }
        // 30 = 13*2 (options) + mx-1 (title)
        return (
            <div style={{ marginLeft: 30 }}>
                <TextEditor
                    readOnly
                    value={this.props.logEntry.details}
                />
            </div>
        );
    }

    render() {
        return (
            <div>
                <InputGroup
                    onDoubleClick={() => this.toggleIsExpanded()}
                    onMouseEnter={() => this.setState({ hover: true })}
                    onMouseLeave={() => this.setState({ hover: false })}
                    size="sm"
                >
                    {this.renderPrefix()}
                    <div className="mx-1">
                        <TextEditor
                            readOnly
                            value={this.props.logEntry.title}
                        />
                    </div>
                    {this.renderSuffix()}
                </InputGroup>
                {this.renderExpanded()}
            </div>
        );
    }
}

LogEntryViewer.propTypes = {
    logEntry: PropTypes.Custom.LogEntry.isRequired,
    onEditButtonClick: PropTypes.func,
    onDeleteButtonClick: PropTypes.func,
};

export default LogEntryViewer;
