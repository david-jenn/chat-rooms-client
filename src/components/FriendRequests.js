import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { SocketContext } from '../context/socket';

function FriendRequests({ auth, user }) {
  const [error, setError] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentFriendRequests, setSentFriendRequests] = useState([]);

  const socket = useContext(SocketContext);

  const handleRequestCancelled = useCallback(() => {
    getFriendRequests();
    getSentFriendRequests();
  }, [])

  useEffect(() => {
    getFriendRequests();
    getSentFriendRequests();
    socket.on('REQUEST_ACCEPTED', (message) => {
      console.log('from requests: ' + message);
      getFriendRequests();
      getSentFriendRequests();
    });

    socket.on('REQUEST_RECEIVED', (message) => {
      console.log(message);
      getFriendRequests();
    });

    socket.on('REQUEST_SENT', (message) => {
      console.log('from request_sent  ' + message);
      getSentFriendRequests();
    });

    socket.on('REQUEST_CANCELED_SENDER', handleRequestCancelled)
  

    socket.on('REQUEST_CANCELED_RECEIVER', (message) => {
      console.log(message);
      getSentFriendRequests();
      getFriendRequests();
    })

    return () => {
      socket.off('REQUEST_ACCEPTED');
      socket.off('REQUEST_RECEIVED');
      socket.off('REQUEST_SENT');
      socket.off('REQUEST_CANCELED_SENDER');
      socket.off('REQUEST_CANCELED_RECEIVER');
    };
  }, [auth, socket]);

  function getFriendRequests() {
    axios(`${process.env.REACT_APP_API_URL}/api/friend/requests/${auth.payload._id}`, {
      method: 'get',
    })
      .then((res) => {
        console.log(res);
        setFriendRequests(res.data);
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

  function getSentFriendRequests() {
    axios(`${process.env.REACT_APP_API_URL}/api/friend/sent-requests/${auth.payload._id}`, {
      method: 'get',
    })
      .then((res) => {
        console.log(res);
        setSentFriendRequests(res.data);
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

  function acceptRequest(friend) {
    const userData = {
      id: user._id,
      displayName: user.displayName,
    };
    axios(`${process.env.REACT_APP_API_URL}/api/friend/accept-request`, {
      method: 'put',
      data: {
        connectionOne: userData,
        connectionTwo: friend,
      },
    })
      .then((res) => {
        const friendId = friend.id;
        const userDisplayName = user.displayName;
        const userId = user._id;
        console.log(res);
        socket.emit('ACCEPT_REQUEST', { friendId, userDisplayName, userId });
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

  function cancelSentRequest(friend) {
    const userData = {
      id: user._id,
      displayName: user.displayName,
    };
    axios(`${process.env.REACT_APP_API_URL}/api/friend/cancel-request`, {
      method: 'put',
      data: {
        connectionOne: friend,
        connectionTwo: userData,
      },
    })
      .then((res) => {
        const friendId = friend.id;
        const userDisplayName = user.displayName;
        const userId = user._id;
        console.log(res);
        socket.emit('CANCEL_REQUEST', { friendId, userDisplayName, userId });
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

 

  return (
    <div>
      <h3>Friend Requests</h3>
      {friendRequests &&
        friendRequests.length > 0 &&
        _.map(friendRequests, (request) => (
          <div className="card p-1 common-room">
            <div>{request.sender.displayName}</div>
            <div class="text-primary" onClick={(evt) => acceptRequest(request.sender)}>
              Accept
            </div>
          </div>
        ))}
      {!friendRequests || (friendRequests.length === 0 && <div className="fst-italic">No Friend Requests</div>)}
      {sentFriendRequests && sentFriendRequests.length > 0 && <h3>Sent Requests</h3>}
      {sentFriendRequests &&
        sentFriendRequests.length > 0 && 
        _.map(sentFriendRequests, (sentRequest) => (
          <div>
            <div className="card p-1 common-room">
              <div>{sentRequest.friend.displayName}</div>
              <div class="text-danger" onClick={(evt) => cancelSentRequest(sentRequest.friend)}>Cancel</div>
            </div>
          </div>
        ))}
        
    </div>
  );
}

export default FriendRequests;
