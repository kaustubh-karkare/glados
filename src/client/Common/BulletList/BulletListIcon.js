import PropTypes from 'prop-types';
import React from 'react';
import { KeyCodes } from '../Utils';


class BulletListIcon extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasFocus: false };
    }

    render() {
        return (
            <div
                className={`icon ml-1 ${this.state.hasFocus ? 'focus' : ''}`}
                tabIndex={0}
                title={this.props.title}
                onMouseEnter={() => this.setState({ hasFocus: true })}
                onMouseOver={() => this.setState({ hasFocus: true })}
                onMouseLeave={() => this.setState({ hasFocus: false })}
                onFocus={() => this.setState({ hasFocus: true })}
                onBlur={() => this.setState({ hasFocus: false })}
                onClick={this.props.onClick}
                onKeyDown={(event) => {
                    if (event.keyCode === KeyCodes.ENTER) {
                        this.props.onClick(event);
                    }
                }}
            >
                {this.props.children}
            </div>
        );
    }
}

BulletListIcon.propTypes = {
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any.isRequired,
};

export default BulletListIcon;
