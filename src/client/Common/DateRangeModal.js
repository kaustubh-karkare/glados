import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import React from 'react';
import DateRangePicker from './DateRangePicker';
import { suppressUnlessShiftKey } from './Utils';

class DateRangeModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dateRange: props.dateRange };
    }

    render() {
        return (
            <Modal
                show
                onHide={() => this.props.onClose()}
                onEscapeKeyDown={suppressUnlessShiftKey}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Date Range</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DateRangePicker.Selector
                        dateRange={this.state.dateRange}
                        onChange={(dateRange) => this.setState({ dateRange })}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.props.onClose(this.state.dateRange)}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

DateRangeModal.propTypes = {
    dateRange: PropTypes.Custom.DateRange.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default DateRangeModal;
