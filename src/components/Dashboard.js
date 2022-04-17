import onInputChange from '../utils/onInputChange';
import React, { useState, useEffect, useRef } from 'react';

function Dashboard({getRoom, changePage}) {
  const [room, setRoom] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function onJoinRoom(evt, room) {
    evt.preventDefault();
    if(!room) {
      setErrorMessage('room cannot be left blank')
      return
    }

    getRoom(room);
    changePage('TalkRoom');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="mb-2 col-md-6">
        <label htmlFor="message" className="form-label">
          Room
        </label>
        <input id="message" className="form-control" onChange={(evt) => onInputChange(evt, setRoom)}></input>
      </div>
      <div className="mb-2">
          <button className="btn btn-primary" onClick={(evt) => onJoinRoom(evt, room)}>
            Join Room
          </button>
          <div className="text-danger">{errorMessage}</div>
        </div>
    </div>
  );
}

export default Dashboard;
