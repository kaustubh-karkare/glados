import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import React from 'react';
import { suppressUnlessShiftKey } from './Utils';

function ConfirmModal(props) {
    return (
        <Modal
            show
            onHide={() => props.onClose()}
            onEscapeKeyDown={suppressUnlessShiftKey}
        >
            <Modal.Header closeButton>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {props.body}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => props.onClose(false)}>
                    {props.noLabel}
                </Button>
                {' '}
                <Button onClick={() => props.onClose(true)}>
                    {props.yesLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

ConfirmModal.propTypes = {
    title: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    body: PropTypes.any.isRequired,
    yesLabel: PropTypes.string,
    noLabel: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

ConfirmModal.defaultProps = {
    yesLabel: 'Yes',
    noLabel: 'No',
};

export default ConfirmModal;
