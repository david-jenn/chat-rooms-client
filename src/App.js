import './App.scss';
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';

import Navbar from './components/Navbar';
import SignIn from './components/SignIn';
import TalkRoom from './components/TalkRoom';
import Footer from './components/Footer';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';

import { io } from 'socket.io-client';

function App() {
  const [auth, setAuth] = useState(null);
  const [page, setPage] = useState('SignIn');
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  let roomName;
  let usernameHolder;

  function onLogin(auth) {
    setAuth(auth);
    setPage('Dashboard');
  }

  function onLogout(auth) {
    setAuth(null);
    setPage('SignIn');
    if (localStorage) {
      localStorage.removeItem('authToken');
    }
  }

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
      <Navbar auth={auth} onLogout={onLogout} changePage={changePage} />
      <main className="container flex-grow-1 ">
        {page === 'SignIn' && <Login onLogin={onLogin} getUsername={getUsername} getRoom={getRoom} />}
        {page === 'Register' && <Register onLogin={onLogin}/>}
        {page === 'Dashboard' && <Dashboard auth={auth} getRoom={getRoom} changePage={changePage} />}
        {page === 'TalkRoom' && auth && room && <TalkRoom changePage={changePage} auth={auth} ccRoom={room} />}

      </main>
      <Footer />
    </div>
  );
}

export default App;
