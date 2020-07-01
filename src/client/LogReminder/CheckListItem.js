import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';

class CheckListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasFocus: false };
    }

    render() {
        return (
            <InputGroup
                className={this.state.hasFocus ? 'focus' : null}
                tabIndex={0}
                onMouseEnter={() => this.setState({ hasFocus: true })}
                onMouseOver={() => this.setState({ hasFocus: true })}
                onMouseLeave={() => this.setState({ hasFocus: false })}
                onClick={this.props.onEditButtonClick}
                style={{ height: '20px', width: '140px', overflow: 'hidden' }}
            >
                <Form.Check
                    type="checkbox"
                    inline
                    checked={false}
                    onChange={this.props.onCheckboxClick}
                    style={{ marginRight: 'none' }}
                />
                {this.props.children}
            </InputGroup>
        );
    }
}

CheckListItem.propTypes = {
    onCheckboxClick: PropTypes.func.isRequired,
    onEditButtonClick: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

export default CheckListItem;
