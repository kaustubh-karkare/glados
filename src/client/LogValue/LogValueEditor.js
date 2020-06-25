import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { Dropdown, Typeahead } from '../Common';

import { LogKey, LogValue, isRealItem } from '../../data';

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
                disabled={isRealItem(logKey)}
                value={logKey.type}
                options={LogKey.getTypes()}
                onUpdate={(type) => updateLogKey({ ...logKey, type })}
            />
            <Typeahead
                dataType="log-key"
                value={logKey}
                onUpdate={(updatedLogKey) => updateLogKey(updatedLogKey)}
                allowDelete={props.isNewStructure}
                onDelete={(updatedLogKey) => updateLogKey(
                    LogKey.createVirtual({ name: updatedLogKey.logKey.name }),
                )}
            />
            <Typeahead
                labelKey="data"
                dataType="log-value"
                value={logValue}
                onUpdate={props.onChange}
                allowDelete={isRealItem(logValue)}
                onDelete={(updatedLogValue) => props.onChange(
                    LogValue.createVirtual({
                        logKey: updatedLogValue.logKey,
                        data: updatedLogValue.data,
                    }),
                )}
            />
        </InputGroup>
    );
}

LogValueEditor.propTypes = {
    isNewStructure: PropTypes.bool.isRequired,
    value: PropTypes.Custom.LogValue.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogValueEditor;
