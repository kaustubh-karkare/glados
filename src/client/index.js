import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import SocketRPC from '../common/socket_rpc';

import CategoryEditor from './CategoryEditor.react';

import {Typeahead} from 'react-bootstrap-typeahead';

const states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
];

function initCookies() {
  document.cookies = document.cookie.split("; ").reduce((result, item) => {
    const [key, value] = item.split("=");
    result[key] = value;
    return result;
  }, {});
}

window.main = function() {
  initCookies();
  const api = new SocketRPC(io('localhost:' + document.cookies.port));

  ReactDOM.render(
    <div>
      <CategoryEditor />
      <Typeahead id="typeahead" options={states} />
    </div>,
    document.getElementById('root')
  );
};
