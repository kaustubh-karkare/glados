import { MdEdit } from 'react-icons/md';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import { combineClassNames } from '../Common';

class CheckListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasFocus: false };
    }

    renderSuffix() {
        if (!this.state.hasFocus) {
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
            </>
        );
    }

    render() {
        return (
            <InputGroup
                className={combineClassNames({
                    focus: this.state.hasFocus,
                })}
                tabIndex={0}
                onMouseEnter={() => this.setState({ hasFocus: true })}
                onMouseOver={() => this.setState({ hasFocus: true })}
                onMouseLeave={() => this.setState({ hasFocus: false })}
                style={{ height: '20px', overflow: 'hidden' }}
            >
                <Form.Check
                    type="checkbox"
                    inline
                    checked={false}
                    readOnly
                    onClick={this.props.onCheckboxClick}
                    style={{ marginRight: 'none' }}
                />
                {this.props.children}
                {this.renderSuffix()}
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
