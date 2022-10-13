import axios from 'axios';
import _ from 'lodash';
import { useState, useEffect } from 'react';
import onInputChange from '../utils/onInputChange';

import InputField from './InputField';

function Friends({ auth, user }) {
  const [friendSearch, setFriendSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [viewAddFriend, setViewAddFriend] = useState(false);
  const [friendConnection, setFriendConnection] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    getFriendRequests();
    getFriends();
  }, [auth]);
  function onInputChange(evt, setValue) {
    const newValue = evt.currentTarget.value;
    setValue(newValue);
    fetchUsers(newValue);
  }

  function getFriends() {
    axios(`${process.env.REACT_APP_API_URL}/api/friend/friend-list/${auth.payload._id}`, {
      method: 'get',
    })
      .then((res) => {
        console.log(res);
        setFriendConnection(res.data);
      })
      .catch((err) => {
        const resError = err?.response?.data?.error;
        if (resError) {
          if (typeof resError === 'string') {
            setError(resError);
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

  function getFriendRequests() {
    console.log(user);
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

  function sendFriendRequest(friend) {
    console.log(auth);
    const sender = {
      id: user._id,
      displayName: user.displayName,
    };
    axios(`${process.env.REACT_APP_API_URL}/api/friend/send-request`, {
      method: 'put',
      data: {
        sender: sender,
        friend: { id: friend._id, displayName: friend.displayName },
        accepted: false,
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
          } else if (resError.details) {
            setError(_.map(resError.details, (x, index) => <div key={index}>{x.message}</div>));

            for (const detail of resError.details) {
            }
          } else {
            setError(JSON.stringify(resError));
          }
        } else {
          setError(err.message);
        }
      });
  }

  function fetchUsers(query) {
    axios(`${process.env.REACT_APP_API_URL}/api/user/list`, {
      method: 'get',
      params: { keyword: query },
    })
      .then((res) => {
        console.log(res.data);
        setSearchResults(res.data);
      })
      .catch((err) => {
        const resError = err?.response?.data?.error;
        if (resError) {
          if (typeof resError === 'string') {
            setError(resError);
          } else if (resError.details) {
            setError(_.map(resError.details, (x, index) => <div key={index}>{x.message}</div>));

            for (const detail of resError.details) {
            }
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
      <h2>Friends</h2>

      <div>
        <InputField
          label="Search Display Name"
          id="search-display-name"
          type="username"
          autoComplete="username"
          placeholder=""
          value={friendSearch}
          onChange={(evt) => onInputChange(evt, setFriendSearch)}
          error={null}
          shouldValidate={null}
        />
        {searchResults && searchResults.length > 0 && (
          <div>
            {_.map(searchResults, (result) => (
              <div key={result._id} className="common-room" onClick={(evt) => sendFriendRequest(result)}>
                <div className="card p-1">
                  <div className="d-flex justify-content-between">
                    <div>{result.displayName}</div>
                    <div>add</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <h3>Friend List</h3>
      {friendConnection &&
        friendConnection.length > 0 &&
        _.map(friendConnection, (connection) => (
          <div>
            <div>{connection.friend.displayName}</div>
          </div>
        ))}


      <div>
        <h3>Friend Requests</h3>
        {friendRequests &&
          friendRequests.length > 0 &&
          _.map(friendRequests, (request) => (
            <div className="card common-room" onClick={(evt) => acceptRequest(request.sender)}>
              {request.sender.displayName}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Friends;
