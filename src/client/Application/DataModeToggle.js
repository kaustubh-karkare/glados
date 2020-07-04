import React from 'react';
import Enum from '../../common/Enum';

const [Options] = Enum([
    { label: 'Test', value: 'test' },
    { label: 'Prod', value: 'prod' },
]);

class TestModeToggle extends React.Component {
    static onChange(dataMode) {
        window.api.send('data-mode-set', dataMode)
            .then(() => TestModeToggle.waitUntilMode(dataMode))
            .catch((error) => window.modalStack_displayError(error));
    }

    static async waitUntilMode(expectedMode) {
        window.modalStack_displayError('This page will be reloaded soon!');
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                // eslint-disable-next-line no-await-in-loop
                const dataMode = await window.api.send('data-mode-get');
                if (dataMode !== expectedMode) {
                    // eslint-disable-next-line no-await-in-loop
                    await new Promise((resolve) => window.setTimeout(resolve, 500));
                } else {
                    window.location.reload();
                    break;
                }
            } catch (error) {
                window.modalStack_displayError(error);
            }
        }
    }

    // eslint-disable-next-line class-methods-use-this
    renderOptions(options, value) {
        const elements = [];
        options.forEach((option, index) => {
            if (index) elements.push(<span key={`sep-${option.value}`}>{' | '}</span>);
            if (option.value === value) {
                elements.push(<a key={option.value}>{option.label}</a>);
            } else {
                elements.push(
                    <span
                        key={option.value}
                        onClick={() => TestModeToggle.onChange(option.value)}
                        style={{ cursor: 'pointer' }}
                    >
                        {option.label}
                    </span>,
                );
            }
        });
        return elements;
    }

    render() {
        return (
            <div className="log-viewer">
                <span>{'Data Mode: '}</span>
                {this.renderOptions(Options, document.cookies.data)}
            </div>
        );
    }
}

export default TestModeToggle;
