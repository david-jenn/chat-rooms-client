import './App.scss';
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';

import Navbar from './components/Navbar';
import SignIn from './components/SignIn';
import TalkRoom from './components/TalkRoom';
import Footer from './components/Footer';


import { io } from 'socket.io-client';


function App() {

  const [page, setPage] = useState('SignIn');
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  let roomName;
  let usernameHolder;

  function changePage(pageName) {
    setPage(pageName);
  }

  function getRoom(room) {
    setRoom(room);
    roomName = room;
  }

  function getUsername(username) {
    setUsername(username);
    usernameHolder = username;
  }

  //const navigate = useNavigate();
 
  return (
    <div className="d-flex flex-column min-vh-100">

      <Navbar />
      <main className="container flex-grow-1 ">
   {page === 'SignIn' &&   <SignIn changePage={changePage} getUsername={getUsername} getRoom={getRoom} /> }
    {page === "TalkRoom" && username && room &&  <TalkRoom changePage={changePage} ccUsername={username} ccRoom={room} changePage={changePage}/> }
      </main>
      <Footer />

    </div>
  );
}

export default App;
