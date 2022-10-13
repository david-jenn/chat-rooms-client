import { useState, useEffect } from "react";
import axios from "axios";
import _ from "lodash";

function FriendRequests({auth, user}) {

  const [error, setError] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    getFriendRequests();
  }, [auth])

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
        console.log(res);
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
      {friendRequests &&
          friendRequests.length > 0 &&
          _.map(friendRequests, (request) => (
            <div className="card p-1 common-room">
            <div>{request.sender.displayName}</div>
            <div class ="text-primary" onClick={(evt) => acceptRequest(request.sender)}>Accept</div>
              
            </div>
          ))}
          {!friendRequests || friendRequests.length === 0 && <div className="fst-italic">No Friend Requests</div>}
    </div>
  )
}

export default FriendRequests;

