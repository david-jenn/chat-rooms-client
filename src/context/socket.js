import React from 'react';
import io from 'socket.io-client'
const URL = 'http://localhost:5000';

export const socket = io(URL, {
  withCredentials: true,
})
export const SocketContext = React.createContext();