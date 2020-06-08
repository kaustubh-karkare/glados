import React from 'react';
import PropTypes from '../prop-types';
import { GenericSortableList } from '../Common';
import LogKeyEditor from './LogKeyEditor';

class LogKeyListEditor extends React.Component {
    filterBy(index, option) {
        const logKey = this.props.logKeys[index];
        return (
            this.props.logKeys
                .filter((_, itemIndex) => (index !== itemIndex))
                .every((otherLogKey) => option.id !== otherLogKey.id)
            && option.name.includes(logKey.name)
        );
    }

    render() {
        return (
            <GenericSortableList
                {...this.props}
                type={LogKeyEditor}
                itemKey="logKey"
                allowUpdate
                allowDelete
                filterBy={(index, option) => this.filterBy(index, option)}
                values={this.props.logKeys}
                onUpdate={this.props.onUpdate}
            />
        );
    }
}

LogKeyListEditor.propTypes = {
    logKeys: PropTypes.arrayOf(PropTypes.Custom.LogKey.isRequired).isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default LogKeyListEditor;
