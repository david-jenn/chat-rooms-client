import { useState, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';

import InputField from './InputField';

function FindFriends({ auth, user, friendList }) {
  const [error, setError] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);



  function onInputChange(evt, setValue) {
    const newValue = evt.currentTarget.value;
    setValue(newValue);
    fetchUsers(newValue);
  }

  function filterFriends(list) {
    console.log(list);
    console.log(friendList);
    
  }

  function fetchUsers(query) {
    axios(`${process.env.REACT_APP_API_URL}/api/user/list`, {
      method: 'get',
      params: { keyword: query },
    })
      .then((res) => {
        filterFriends(res.data)
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

  function sendFriendRequest(friend) {
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
            console.log(resError);
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
      <label htmlFor="room-search-input" className="form-label">
        Search for friends
      </label>
      <input
        id="search-display-name"
        type="username"
        className="form-control"
        onChange={(evt) => onInputChange(evt, setFriendSearch)}
        onFocus={(evt) => fetchUsers(friendSearch)}
        // onBlur={(evt) => setSearchResults([])}
      ></input>
      {searchResults && searchResults.length > 0 && (
        <div>
          {_.map(searchResults, (result) => (
            <div key={result._id} className="">
              <div className= "card p-1">
                <div className="d-flex justify-content-between">
                  <div>{result.displayName}</div>
                  <div className="text-primary common-room" >
                    <button type="button" className="btn btn-primary btn-sm" onClick={(evt) => sendFriendRequest(result)}>add</button>
                    
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FindFriends;
