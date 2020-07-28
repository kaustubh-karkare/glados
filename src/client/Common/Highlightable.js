import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import Coordinator from './Coordinator';

import './Highlightable.css';

class Highlightable extends React.Component {
    componentDidMount() {
        this.deregisterCallbacks = [
            Coordinator.subscribe('unhighlight', () => this.setHighlight(false)),
        ];
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    setHighlight(isHighlighted) {
        if (isHighlighted) {
            Coordinator.broadcast('unhighlight');
        }
        this.props.onChange(isHighlighted);
    }

    render() {
        const {
            isHighlighted, onChange: _, children, ...moreProps
        } = this.props;
        return (
            <div
                {...moreProps}
                className={classNames({ highlight: isHighlighted })}
                tabIndex={0}
                onMouseEnter={() => this.setHighlight(true)}
                onMouseOver={() => this.setHighlight(true)}
                onMouseLeave={() => this.setHighlight(false)}
                onFocus={() => this.setHighlight(true)}
                onBlur={() => this.setHighlight(false)}
            >
                {children}
            </div>
        );
    }
}

Highlightable.propTypes = {
    isHighlighted: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

export default Highlightable;
