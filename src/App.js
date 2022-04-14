import './App.scss';
import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import moment from 'moment';

import { io } from 'socket.io-client';

const URL = 'https://talk-rooms-server.herokuapp.com';

function App() {
  const messagesEndRef = useRef(null);

  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messageListItems, setMessageListItems] = useState([]);

  const [roomData, setRoomData] = useState(null);
  const [userList, setUserList] = useState([]);

  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {

    console.log(socket);
    if (!signedIn && socket) {
      socket.disconnect();
    }

    if (!socket && signedIn) {
      setSocket(io(URL));
    }

    if (socket && signedIn) {
      socket.emit('joinRoom', { username, room });
    }
    if(socket?.connected) {
      console.log('connected!');
    } else {
      console.log('disconnected!')
    }
    if (socket) {
      console.log('in here');
      socket.on('message', (message) => {
        outputMessage(message);
        scrollToBottom();
      });
      socket.on('roomUsers', ({ room, users }) => {
        setUserList(users);
        setRoomData(room);
      });
    }
  }, [socket, signedIn]);

  function onSendMessage(evt) {
    evt.preventDefault();
    // setMessageListItems([...messageListItems, message]);

    //Emit message to server
    socket.emit('chatMessage', message);
  }

  function outputMessage(msgObj) {
    messageListItems.push(msgObj);
    console.log(socket);
    setMessageListItems([...messageListItems]);
  }

  function onSignIn(evt) {
    evt.preventDefault();
    console.log('fired!');
    setSignedIn(true);
    setSocket(null);
  }

  function onSignOut(evt) {
    evt.preventDefault();
    console.log('fired!');
    setSignedIn(false);
    socket.disconnect();
    setUserList([]);
    setMessageListItems([]);
  }

  function onInputChange(evt, setValue) {
    const newValue = evt.currentTarget.value;
    setValue(newValue);
  }

  function scrollToBottom() {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="wrapper">
      <div className="header-wrapper p-1 mb-1 bg-primary text-light">
      <h1 className="">Talk Rooms</h1>
      </div>
      <div className="container main-wrapper">
        

        {!signedIn && (
          <div>
            <form className="row">
              <div className="mb-2 col-md-6">
                <label htmlFor="message" className="form-label">
                  Username
                </label>
                <input
                  id="message"
                  className="form-control"
                  onChange={(evt) => onInputChange(evt, setUsername)}
                ></input>
              </div>
              <div className="mb-2 col-md-6">
                <label htmlFor="message" className="form-label">
                  Room
                </label>
                <input id="message" className="form-control" onChange={(evt) => onInputChange(evt, setRoom)}></input>
              </div>
              <div className="mb-2">
                <button className="btn btn-primary" onClick={(evt) => onSignIn(evt)}>
                  Join Room
                </button>
              </div>
            </form>
          </div>
        )}
        {signedIn && (
          <div>
            <div className="row">
              <div className="d-md-block d-none col-md-2">
                <div className="mb-2">
                  <button className="btn btn-danger" onClick={(evt) => onSignOut(evt)}>
                    Sign Out
                  </button>
                </div>
                <div>Users...</div>
                {userList.length > 0 && (
                  <div>
                    {_.map(userList, (user) => (
                      <div className="card mb-2">{user.username}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-md-10">
                <div className="scroll-item mb-3 border border-dark p-3">
                  {_.map(messageListItems, (messageListItem) => (
                    <div>
                      <div className="item mb-2">
                        <div className="item-header d-flex justify-content-between">
                          <div>{messageListItem.username}</div>
                          <div>{moment(messageListItem.date).fromNow()}</div>
                        </div>
                        <div className="item-body">{messageListItem.msg}</div>
                      </div>
                    </div>
                  ))}

                  <div ref={messagesEndRef}></div>
                </div>
                <form className="">
                  <div className="mb-2">
                    <label htmlFor="message" className="form-label visually-hidden">
                      Your Message
                    </label>
                    <input
                      id="message"
                      className="form-control"
                      onChange={(evt) => onInputChange(evt, setMessage)}
                    ></input>
                  </div>
                  <div className="mb-2">
                    <button className="btn btn-primary" onClick={(evt) => onSendMessage(evt)}>
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="p-2 bg-primary text-light">Talk Rooms - David Jenn - 2022</footer>
    </div>
  );
}

export default App;
