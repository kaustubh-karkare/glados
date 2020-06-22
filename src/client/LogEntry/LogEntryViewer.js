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
            expanded: false,
        };
    }

    renderExpansionButton() {
        if (this.state.expanded) {
            return (
                <div
                    className="compact-option"
                    onClick={() => this.setState({ expanded: false })}
                >
                    <TiMinus />
                </div>
            );
        }
        return (
            <div
                className="compact-option"
                onClick={() => this.setState({ expanded: true })}
            >
                <TiPlus />
            </div>
        );
    }

    renderPrefix() {
        if (this.state.hover) {
            return (
                <>
                    <div className="compact-option sortableDragHandle">
                        <GrDrag />
                    </div>
                    {this.renderExpansionButton()}
                </>
            );
        }
        return (
            <>
                <div className="compact-option" />
                <div className="compact-option">
                    {this.state.expanded ? <TiMinus /> : <GoPrimitiveDot />}
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

    render() {
        return (
            <InputGroup
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
        );
    }
}

LogEntryViewer.propTypes = {
    logEntry: PropTypes.Custom.LogEntry.isRequired,
    onEditButtonClick: PropTypes.func,
    onDeleteButtonClick: PropTypes.func,
};

export default LogEntryViewer;
