import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { SocketContext } from '../context/socket';

function FriendList({ auth, user, setFriendList, getDirectChatData }) {
  const [error, setError] = useState('');
  const [friendConnections, setFriendConnections] = useState([]);
  

  const socket = useContext(SocketContext);

  useEffect(() => {
    getFriends();
    socket.on('REQUEST_ACCEPTED_SENDER', (message) => {
      getFriends()
    });
    socket.on('REQUEST_ACCEPTED_RECEIVER', (message) => {
      getFriends()
    });
    return () => {
      socket.off('REQUEST_ACCEPTED_SENDER');
      socket.off('REQUEST_ACCEPTED_RECEIVER');
    }
  }, [auth]);

  function getFriends() {
    axios(`${process.env.REACT_APP_API_URL}/api/friend/friend-list/${auth.payload._id}`, {
      method: 'get',
    })
      .then((res) => {
        setFriendConnections(res.data);
        setFriendList(res.data);
      })
      .catch((err) => {
        const resError = err?.response?.data?.error;
        if (resError) {
          if (typeof resError === 'string') {
            setError(resError);
            console.log(resError);
          } else if (resError.details) {
            setError(_.map(resError.details, (x, index) => <div key={index}>{x.message}</div>));
          } else {
            setError(JSON.stringify(resError));
          }
        } else {
          setError(err.message);
        }
      });
  }

  function joinDirectChat(friend) {
    console.log(friend);
    if(!friend || !user) {
      return;
    }
    const idArray = [user._id, friend.id].sort();
    const directChatId = `${idArray[0]};${idArray[1]}`
    
    axios(`${process.env.REACT_APP_API_URL}/api/room/join/direct-chat`, {
      method: 'put',
      data: { id: directChatId }
    })
      .then((res) => {
        console.log(res)
        const directChatData = {
          directChatId,
          friend: {
            id: friend.id,
            displayName: friend.displayName
          }
        }
        getDirectChatData(directChatData);
      })
      .catch((err) => {
        const resError = err?.response?.data?.error;
        if (resError) {
          if (typeof resError === 'string') {
            setError(resError);
            console.log(resError);
          } else if (resError.details) {
            setError(_.map(resError.details, (x, index) => <div key={index}>{x.message}</div>));
          } else {
            setError(JSON.stringify(resError));
          }
        } else {
          setError(err.message);
        }
      })
    
    
    
      

  }

  return (
    <div className="mb-3">
      
      {friendConnections &&
        friendConnections.length > 0 &&
        _.map(friendConnections, (connection) => (
          <div className="card p-2 mb-1">
            <div className="d-flex justify-content-between">
            <div>{connection.friend.displayName}</div>
            <button className="btn btn-small btn-primary" onClick={(evt) => joinDirectChat(connection.friend)}>Chat</button>
            </div>
          </div>
        ))}

      {!friendConnections || (friendConnections.length === 0 && <div className="fst-italic">No Friends Found</div>)}
    </div>
  );
}

export default FriendList;
