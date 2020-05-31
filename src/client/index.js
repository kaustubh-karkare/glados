import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import SocketRPC from '../common/socket_rpc';

import CategoryEditor from './CategoryEditor.react';

function initCookies() {
  document.cookies = document.cookie.split("; ").reduce((result, item) => {
    const [key, value] = item.split("=");
    result[key] = value;
    return result;
  }, {});
}

window.main = function() {
  initCookies();
  window.api = new SocketRPC(io('localhost:' + document.cookies.port));

  ReactDOM.render(
    <div>
      <CategoryEditor />
    </div>,
    document.getElementById('root')
  );
};
