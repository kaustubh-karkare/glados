import Modal from 'react-bootstrap/Modal';
import React from 'react';
import PropTypes from '../prop-types';

function suppressUnlessShiftKey(event) {
    if (!event.shiftKey) {
        event.preventDefault();
    }
}

class LogTopicModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logTopic: props.logTopic,
        };
    }

    render() {
        const { logTopic } = this.state;
        return (
            <Modal
                show
                onHide={this.props.onClose}
                onEscapeKeyDown={suppressUnlessShiftKey}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{logTopic.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <li>TextEditor for details (with autosave)</li>
                    <li>LogEventList for this topic specifically.</li>
                    <li>Links to the current topic must be disabled.</li>
                </Modal.Body>
            </Modal>
        );
    }
}

LogTopicModal.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
    onClose: PropTypes.func.isRequired, // provided by ModalStack
};

export default LogTopicModal;
