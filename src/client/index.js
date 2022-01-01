import './Bootstrap';
import './index.css';
import './prop-types'; // Load PropTypes.Custom

import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';

import { isVirtualItem } from '../common/data_types';
import SocketRPC from '../common/SocketRPC';
import { Application } from './Application';
import { Coordinator } from './Common';

function getCookies() {
    const cookies = {};
    document.cookie.split('; ').forEach((item) => {
        const [key, value] = item.split('=');
        cookies[key] = decodeURIComponent(value);
    });
    return cookies;
}

window.main = function main() {
    const cookies = getCookies();
    window.api = SocketRPC.client(
        io(`${cookies.host}:${cookies.port}`),
        (name, input, output) => {
            // The "log-event-created" event is used to auto-add the "Log Level: Minor+"
            // item to LogEventSearch typeahead, to make sure that the new item is visible.
            if (name === 'log-event-upsert' && isVirtualItem(input)) {
                Coordinator.broadcast('log-event-created', output);
            } else if (name === 'reminder-complete') {
                Coordinator.broadcast('log-event-created', output.logEvent);
            }
        },
        // TODO: Eliminate this catch-all.
        (_name, _input, error) => Coordinator.invoke('modal-error', error),
    );

    const plugins = {};
    const pluginsContext = require.context('../plugins', true, /client\.js$/);
    pluginsContext.keys()
        .forEach((filePath) => {
            const exports = pluginsContext(filePath);
            const name = filePath.split('/').slice(1, -1).join('/');
            plugins[name] = exports.default;
        });

    ReactDOM.render(<Application plugins={plugins} />, document.getElementById('root'));
};
