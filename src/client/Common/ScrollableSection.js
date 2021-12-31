/* eslint-disable max-classes-per-file */

import './ScrollableSection.css';

import PropTypes from 'prop-types';
import React from 'react';

class WindowHeightDetector {
    static subscribe(callback) {
        if (!WindowHeightDetector.instance) {
            WindowHeightDetector.instance = new WindowHeightDetector();
        }
        const { instance } = WindowHeightDetector;
        instance.callbacks.push(callback);
        return instance.height;
    }

    constructor() {
        this.callbacks = [];
        this.height = window.innerHeight;
        window.addEventListener('resize', this.onResize.bind(this));
    }

    onResize() {
        this.height = window.innerHeight;
        this.callbacks.forEach((callback) => callback(this.height));
    }
}

class ScrollableSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            height: WindowHeightDetector.subscribe((height) => this.setState({ height })),
        };
    }

    render() {
        const height = this.state.height
            - this.props.padding
            - 32; // Why 32? 16px padding at top/bottom.
        return (
            <div className="scrollable-section" style={{ height }}>
                {this.props.children}
            </div>
        );
    }
}

ScrollableSection.propTypes = {
    padding: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

ScrollableSection.defaultProps = {
    padding: 0,
};

export default ScrollableSection;
