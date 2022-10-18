import '../App.scss';
import React, { useState, useEffect, useRef, useContext } from 'react';
import _ from 'lodash';
import moment from 'moment';
import axios from 'axios';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import { SocketContext } from '../context/socket';

const URL = 'http://localhost:5000'; //http://localhost:5000 https://talk-rooms-server-david-jenn.herokuapp.com/

function TalkRoom({ changePage, auth, user, directChatData, getDirectChatData }) {
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const ccUsername = auth.payload.displayName;
  let messages = [];

  const [message, setMessage] = useState('');
  const [typingMessage, setTypingMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [messagesPending, setMessagesPending] = useState(false);

  const [roomData, setRoomData] = useState(null);
  const [userList, setUserList] = useState([]);

  const currentTypers = [];
  const [signedIn, setSignedIn] = useState(false);
  const [render, setRender] = useState(0);
  const [roomJoined, setRoomJoined] = useState(false);
  let messagesLoaded = false;

  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!messagesPending) {
      scrollToBottom();
    }

    //Might be expensive?
  });
  

  useEffect(() => {
    console.log(directChatData);
    console.log(socket);
    if (!directChatData) {
      return;
    }
    if (!directChatData.directChatId) {
      return;
    }

    if (!messagesLoaded) {
      fetchRoomMessages();
    }

    const username = auth.payload.displayName;
    const room = directChatData.directChatId;

    if (socket) {
      socket.emit('joinRoom', { username, room });
      setRoomJoined(true);

      socket.on('message', (message) => {
        console.log(message);
        outputMessage(message);
      });
      socket.on('roomUsers', ({ room, users }) => {
        setUserList(users);
        setRoomData(room);
      });

      socket.on('typingOutput', (message) => {
        setTypingMessage(message);
      });

      return () => {};
    }
  }, [socket?.connected, directChatData]);

  function fetchRoomMessages() {
    setMessagesPending(true);
    axios(`${process.env.REACT_APP_API_URL}/api/comment/${directChatData.directChatId}/list`, {
      method: 'get',
    })
      .then((res) => {
        if (_.isArray(res.data)) {
          messages = res.data;
          messagesLoaded = true;
          console.log(messages);
          setMessagesPending(false);
          setMessageList(messages);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function saveNewMessage(message) {
    axios(`${process.env.REACT_APP_API_URL}/api/comment/new`, {
      method: 'put',
      data: message,
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  //

  function onSendMessage(evt) {
    evt.preventDefault();
    if (!message) {
      return;
    }

    socket.emit('CHAT_MESSAGE', user.displayName, user._id, message, directChatData.directChatId);
    setMessage('');
    messageInputRef.current.blur();
    const comment = {
      userId: user._id,
      displayName: user.displayName,
      room: directChatData.directChatId,
      msg: message,
    };
    saveNewMessage(comment);
  }

  function outputMessage(msgObj) {
    //console.log(messages);
    messages.push(msgObj);
    setMessageList([...messages]);
  }

  function onInputChange(evt, setValue) {
    const newValue = evt.currentTarget.value;
    setValue(newValue);
  }

  function scrollToBottom() {
    if (directChatData && directChatData.directChatId) {
      messagesEndRef.current.scrollIntoView();
    }
  }

  function setInputFocused(evt) {
    socket.emit('typing', ccUsername, evt, directChatData.directChatId);
  }
  function onLeaveRoom() {
    console.log('leaving');
    getDirectChatData(null);
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
          {directChatData && directChatData?.directChatId && (
            <div className="">
              <div className="mb-1 d-flex align-items-center">
                <button className="btn btn-warning btn-sm me-1" onClick={(evt) => onLeaveRoom()}>
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <div className="animate__animated animate__bounce">{directChatData.friend?.displayName}</div>
                
              </div>
              {!messagesPending && (
                <div className="scroll-item  card mb-1   p-3">
                  {_.map(messageList, (messageListItem) => (
                    <div>
                      <div className="item mb-2">
                        <div className="item-header d-flex justify-content-between">
                          <div>{messageListItem.username}</div>
                        </div>
                        <div
                          className={
                            messageListItem.userId === user._id
                              ? 'd-flex flex-column align-items-end'
                              : 'd-flex flex-column align-items-start'
                          }
                        >
                          <div
                            className={messageListItem.userId === user._id ? 'outbound-msg' : 'inbound-msg text-break'}
                          >
                            {messageListItem.msg}
                          </div>
                          <div className="timestamp">{moment(messageListItem.timestamp).fromNow()}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="messages-end"></div>
                  <div ref={messagesEndRef}></div>
                </div>
              )}

              <form className="">
                <div className="mb-2">
                  <label htmlFor="message" className="form-label visually-hidden">
                    Your Message
                  </label>
                  <div className="input-group">
                    <input
                      id="message"
                      className="form-control"
                      value={message}
                      ref={messageInputRef}
                      onChange={(evt) => onInputChange(evt, setMessage)}
                      onBlur={(evt) => setInputFocused(false)}
                      onFocus={(evt) => setInputFocused(true)}
                    ></input>
                    <button type="submit" className="btn btn-primary" onClick={(evt) => onSendMessage(evt)}>
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                  </div>
                </div>
                <div className="mb-2 d-flex">
                  <div className="fst-italic">{typingMessage}</div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TalkRoom;
