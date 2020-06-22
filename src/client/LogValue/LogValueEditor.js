import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { Dropdown, Typeahead } from '../Common';

import { LogKey, LogValue } from '../../data';

function LogValueEditor(props) {
    const logValue = props.value;

    const { logKey } = logValue;
    const updateLogKey = (updatedLogKey) => {
        const updatedLogValue = { ...logValue };
        updatedLogValue.logKey = updatedLogKey;
        props.onChange(updatedLogValue);
    };

    return (
        <InputGroup className="my-1">
            <Dropdown
                disabled={logKey.id > 0}
                value={logKey.type}
                options={LogKey.getTypes()}
                onUpdate={(type) => updateLogKey({ ...logKey, type })}
            />
            <Typeahead
                dataType="log-key"
                value={logKey}
                onUpdate={(updatedLogKey) => updateLogKey(updatedLogKey)}
                allowDelete={props.isNewCategory}
                onDelete={() => updateLogKey(LogKey.createEmpty())}
            />
            <Typeahead
                labelKey="data"
                dataType="log-value"
                value={logValue}
                onUpdate={props.onChange}
                allowDelete={logValue.id > 0}
                onDelete={(updatedLogValue) => props.onChange(
                    LogValue.createEmpty(updatedLogValue.logKey),
                )}
            />
        </InputGroup>
    );
}

LogValueEditor.propTypes = {
    isNewCategory: PropTypes.bool.isRequired,
    value: PropTypes.Custom.LogValue.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogValueEditor;
