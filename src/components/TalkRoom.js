import '../App.scss';
import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import moment from 'moment';

import { io } from 'socket.io-client';
import axios from 'axios';

const URL = 'http://localhost:5000'; //http://localhost:5000 https://talk-rooms-server-david-jenn.herokuapp.com/

function TalkRoom({ changePage, auth, ccRoom }) {
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const ccUsername = auth.payload.displayName;
  let messages = [];

  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [typingMessage, setTypingMessage] = useState('');
  const [messageList, setMessageList] = useState([]);

  const [roomData, setRoomData] = useState(null);
  const [userList, setUserList] = useState([]);

  const currentTypers = [];
  const [signedIn, setSignedIn] = useState(false);
  const [render, setRender] = useState(0);
  const [roomJoined, setRoomJoined] = useState(false);
  let messagesLoaded = false;

  useEffect(() => {
    scrollToBottom();
    //Might be expensive?
  });

  useEffect(() => {
    console.log(socket);
    if (!ccRoom) {
      return;
    }
    
    if (!messagesLoaded) {
      fetchRoomMessages();
    }

    if (!socket) {
      setSocket(
        io(URL, {
          withCredentials: true,
        })
      );
    }

    const username = auth.payload.displayName;
    const room = ccRoom;
    

    if (socket?.connected) {
      console.log('connected!');
    } else {
      console.log('disconnected!');
    }
    if (socket) {
      if (!roomJoined) {
        socket.emit('joinRoom', { username, room });
        setRoomJoined(true);
      }

      socket.on('message', (message) => {
        console.log(message);
        outputMessage(message);
      });
      socket.on('roomUsers', ({ room, users }) => {
        setUserList(users);
        setRoomData(room);
      });
      socket.on('test', (message) => {
        console.log(message);
      })
      socket.on('typingOutput', (message) => {
        setTypingMessage(message);
      });
      socket.on('disconnect', () => {
        console.log('hello');
        changePage('Dashboard');
      });
      console.log(socket);
    }
  }, [socket?.connected, ccRoom]);

  function fetchRoomMessages() {
    axios(`${process.env.REACT_APP_API_URL}/api/comment/${ccRoom}/list`, {
      method: 'get',
    })
      .then((res) => {
        if (_.isArray(res.data)) {
          messages = res.data;
          messagesLoaded = true;
          const welcomeMessage = {
            date: new Date(),
            msg: `Welcome to TalkRooms, room: ${ccRoom}`,
            username: 'TalkRooms',
          };
          messages.push(welcomeMessage);
          console.log(messages);
          setMessageList(messages);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
  //

  function onSendMessage(evt) {
    evt.preventDefault();
    // setMessageListItems([...messageListItems, message]);

    //Emit message to server
    socket.emit('chatMessage', ccUsername, message, ccRoom);
    setMessage('');
    messageInputRef.current.blur();
  }

  function outputMessage(msgObj) {
    //console.log(messages);
    messages.push(msgObj);
    setMessageList(messages);
  }

  function onSignOut(evt) {
    if (evt) {
      evt.preventDefault();
    }

    //console.log('fired!');
    setSignedIn(false);
    if (socket) {
      socket.disconnect();
    }

    setUserList([]);
    setMessageList([]);
    changePage('Dashboard');
  }

  function onInputChange(evt, setValue) {
    const newValue = evt.currentTarget.value;
    setValue(newValue);
  }

  function scrollToBottom() {
    if(ccRoom) {
      messagesEndRef.current.scrollIntoView();
    }
    
  }

  function setInputFocused(evt) {
    socket.emit('typing', ccUsername, evt, ccRoom);
  }

  return (
    <div className="container main-wrapper">
      <div>
        <div className="row">
          {/* <div className="d-md-block  col-md-2">
            <div>Users...</div>
            {userList.length === 0 && <div className="fst-italic">No users found</div>}
            {userList.length > 0 && (
              <div>
                {_.map(userList, (user) => (
                  <div className="card mb-2">{user.username}</div>
                ))}
              </div>
            )}
          </div> */}
          {ccRoom && (
          <div className="col-md-12">
            <div className="mb-2 d-flex justify-content-between">
              <h1 className="fs-3">Room {ccRoom}</h1>
              <button className="btn btn-danger" onClick={(evt) => onSignOut(evt)}>
                Leave
              </button>
            </div>
            
              <div className="scroll-item mb-3 border border-dark p-3">
                {_.map(messageList, (messageListItem) => (
                  <div>
                    <div className="item mb-2">
                      <div className="item-header d-flex justify-content-between">
                        <div>{messageListItem.username}</div>
                        {messageListItem.timestamp && <div>{moment(messageListItem.timestamp).fromNow()}</div>}
                        {messageListItem.date && <div>{moment(messageListItem.date).fromNow()}</div>}
                      </div>
                      <div className="item-body">{messageListItem.msg}</div>
                    </div>
                  </div>
                ))}

                <div className="messages-end"></div>
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
                  value={message}
                  ref={messageInputRef}
                  onChange={(evt) => onInputChange(evt, setMessage)}
                  onBlur={(evt) => setInputFocused(false)}
                  onFocus={(evt) => setInputFocused(true)}
                ></input>
              </div>
              <div className="mb-2 d-flex">
                <button type="submit" className="btn btn-primary me-3" onClick={(evt) => onSendMessage(evt)}>
                  Send
                </button>
                <div className="fst-italic">{typingMessage}</div>
              </div>
            </form>
          </div>)}
        </div>
      </div>
    </div>
  );
}

export default TalkRoom;
