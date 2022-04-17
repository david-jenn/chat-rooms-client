import '../App.scss';
import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import moment from 'moment';

import { io } from 'socket.io-client';
import axios from 'axios';

const URL = 'http://localhost:5000'; //http://localhost:5000 https://talk-rooms-server-david-jenn.herokuapp.com/


function TalkRoom({changePage, auth, ccRoom}) {
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const ccUsername = auth.payload.displayName;

  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [typingMessage, setTypingMessage] = useState('');
  const [messageList, setMessageList] = useState([]);

  const [roomData, setRoomData] = useState(null);
  const [userList, setUserList] = useState([]);

  const currentTypers = [];
  const [signedIn, setSignedIn] = useState(false);
  

  useEffect(() => {

    fetchRoomMessages();
    if(!socket) {
     setSocket(io(URL, {
          withCredentials: true,
      }));
    }
    const username = "bob";
    const room = ccRoom;

    if (socket) {
      socket.emit('joinRoom', { username, room });
    }
    if(socket?.connected) {
      console.log('connected!');
    } else {
      console.log('disconnected!')
    }
    if (socket) {
     
      socket.on('message', (message) => {
        outputMessage(message);
        scrollToBottom();
        });
      socket.on('roomUsers', ({ room, users }) => {
        setUserList(users);
        setRoomData(room);
      });
      socket.on('typingOutput', (message) => {
       
        console.log(message);
        modifyTypingMessage(message);
        setTypingMessage(message);
      })
    }
  }, [socket]);

  function fetchRoomMessages() {
    console.log(process.env.REACT_APP_API_URL);

    axios(`${process.env.REACT_APP_API_URL}/api/comment/${ccRoom}/list` , {
      method:'get',
    })
    .then((res) => {
      if(_.isArray(res.data)) {
        setMessageList(res.data);
        scrollToBottom();
      }
    })
    .catch((err) => {
      console.log(err);
    })
  }

  function onSendMessage(evt) {
    evt.preventDefault();
    // setMessageListItems([...messageListItems, message]);

    //Emit message to server
    socket.emit('chatMessage', ccUsername, message, ccRoom);
    setMessage("");
    messageInputRef.current.blur();
  }

  function outputMessage(msgObj) {

    const messageListCopy = [...messageList];
    messageListCopy.push(msgObj);
    console.log(messageList);
    console.log(messageListCopy);
    
   // console.log(socket);
    setMessageList([...messageListCopy]);
  }


  function onSignOut(evt) {
    evt.preventDefault();
    console.log('fired!');
    setSignedIn(false);
    socket.disconnect();
    setUserList([]);
    setMessageList([]);
    changePage('SignIn')
    
  }

  function onInputChange(evt, setValue) {
    const newValue = evt.currentTarget.value;
    setValue(newValue);
  }

  function scrollToBottom() {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  function setInputFocused(evt) {
    setIsInputFocused(evt);
    socket.emit('typing', ccUsername, evt, ccRoom);
  }

  function modifyTypingMessage(message) {
      

  }


  return (
    
    <div className="container main-wrapper">

    
        <div>
          <div className="row">
            <div className="d-md-block  col-md-2">
              <div className="mb-2 d-flex justify-content-end">
                <button className="btn btn-danger" onClick={(evt) => onSignOut(evt)}>
                  Sign Out
                </button>
              </div>
              <div>Users...</div>
              {userList.length === 0 && <div className="fst-italic">No users found</div>}
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
                {_.map(messageList, (messageListItem) => (
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
                    value={message}
                    ref={messageInputRef}
                    onChange={(evt) => onInputChange(evt, setMessage)}
                    onBlur={(evt) => setInputFocused(false)}
                    onFocus={(evt) => setInputFocused(true)}
                  ></input>
                </div>
                <div className="mb-2 d-flex">
                  <button className="btn btn-primary me-3" onClick={(evt) => onSendMessage(evt)}>
                    Send
                  </button>
                  <div className="fst-italic">{typingMessage}</div>
                </div>
              </form>
            </div>
          </div>
        </div>
      
    </div>
   
  )
}

export default TalkRoom;