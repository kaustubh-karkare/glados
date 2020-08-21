import './Bootstrap';
import './index.css';
import './prop-types'; // Load PropTypes.Custom

import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import SocketRPC from '../common/SocketRPC';
import { isVirtualItem } from '../data';
import { Coordinator } from './Common';
import { Application } from './Application';

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
            const suffix = '-upsert';
            if (name.endsWith(suffix) && isVirtualItem(input)) {
                const dataType = name.substring(0, name.length - suffix.length);
                Coordinator.broadcast(`${dataType}-created`, output);
            }
        },
        (name, input, error) => Coordinator.invoke('modal-error', error),
    );

    const config = JSON.parse(cookies.client);
    ReactDOM.render(
        <Application rightSidebarTopicIds={config.right_sidebar_topic_ids} />,
        document.getElementById('root'),
    );
};
