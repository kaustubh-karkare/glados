import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'react-bootstrap/Modal';

import { suppressUnlessShiftKey } from './Utils';

function InfoModal(props) {
    return (
        <Modal
            show
            onHide={props.onClose}
            onEscapeKeyDown={suppressUnlessShiftKey}
        >
            <Modal.Header closeButton>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {props.message}
            </Modal.Body>
        </Modal>
    );
}

InfoModal.propTypes = {
    title: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    message: PropTypes.any.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default InfoModal;
