import React from 'react';
import PropTypes from 'prop-types';
import BulletListLine from './BulletListLine';
import Highlightable from '../Highlightable';
import { KeyCodes } from '../Utils';

class BulletListPager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isHighlighted: false,
        };
    }

    onKeyDown(event) {
        if (event.keyCode === KeyCodes.SPACE) {
            this.props.updateLimit(this.props.limit + this.props.batchSize);
        } else if (event.keyCode === KeyCodes.ENTER) {
            this.props.updateLimit(null);
        }
    }

    renderButtons() {
        return (
            <>
                {' |'}
                <span
                    className="mx-1"
                    onClick={() => this.props.updateLimit(this.props.limit + this.props.batchSize)}
                >
                    Load More
                </span>
                |
                <span
                    className="mx-1"
                    onClick={() => this.props.updateLimit(null)}
                >
                    Load All
                </span>
            </>
        );
    }

    render() {
        let message;
        if (this.props.itemsLength === null) {
            if (this.props.limit === this.props.batchSize) {
                // We don't know whether we need pagination yet.
                return null;
            } if (this.props.limit) {
                message = `Fetching last ${this.props.limit} items ...`;
            } else {
                message = 'Fetching all items ...';
            }
            return (
                <BulletListLine className="pager">
                    {message}
                </BulletListLine>
            );
        }
        if (this.props.itemsLength <= this.props.batchSize && !this.props.hasMoreItems) {
            // No need for pagination.
            return null;
        }
        let buttons;
        if (this.props.hasMoreItems) {
            message = `Showing last ${this.props.itemsLength} items`;
            buttons = this.renderButtons();
        } else {
            message = `Showing all ${this.props.itemsLength} items`;
        }
        return (
            <Highlightable
                isHighlighted={this.state.isHighlighted}
                onChange={(isHighlighted) => this.setState({ isHighlighted })}
            >
                <BulletListLine className="pager">
                    {message}
                    {buttons}
                </BulletListLine>
            </Highlightable>
        );
    }
}

BulletListPager.propTypes = {
    batchSize: PropTypes.number.isRequired,
    limit: PropTypes.number,
    updateLimit: PropTypes.func.isRequired,
    itemsLength: PropTypes.number,
    hasMoreItems: PropTypes.bool,
};

export default BulletListPager;
