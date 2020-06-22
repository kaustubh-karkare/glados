import InputGroup from 'react-bootstrap/InputGroup';
import { FaRegTrashAlt } from 'react-icons/fa';
import { GoPrimitiveDot } from 'react-icons/go';
import { MdFormatLineSpacing, MdEdit } from 'react-icons/md';
import { TiMinus, TiPlus } from 'react-icons/ti';

import React from 'react';
import PropTypes from '../prop-types';
import { TextEditor } from '../Common';
import { TextEditorSources } from './LogEntryTitleEditor';

class LogEntryViewer extends React.Component {
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
        if (this.state.hover) {
            return (
                <>
                    <div className="icon mr-1" onClick={this.props.onEditButtonClick}>
                        <MdEdit />
                    </div>
                    <div className="icon" onClick={this.props.onDeleteButtonClick}>
                        <FaRegTrashAlt />
                    </div>
                </>
            );
        }
        return null;
    }

    renderExpanded() {
        if (!this.props.isExpanded) {
            return null;
        }
        if (!this.props.logEntry.details) {
            return null;
        }
        // 30 = 13*2 (options) + mx-1 (title)
        return (
            <div style={{ marginLeft: 30 }}>
                <TextEditor
                    unstyled
                    disabled
                    sources={TextEditorSources}
                    value={this.props.logEntry.details}
                />
            </div>
        );
    }

    render() {
        return (
            <div>
                <InputGroup
                    onMouseEnter={() => this.setState({ hover: true })}
                    onMouseLeave={() => this.setState({ hover: false })}
                    size="sm"
                >
                    {this.renderPrefix()}
                    <div className="mx-1">
                        <TextEditor
                            unstyled
                            disabled
                            sources={TextEditorSources}
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

    // prefix
    isExpanded: PropTypes.bool,
    onToggleExpansion: PropTypes.func.isRequired,

    // suffix
    onEditButtonClick: PropTypes.func.isRequired,
    onDeleteButtonClick: PropTypes.func.isRequired,
};

export default LogEntryViewer;
