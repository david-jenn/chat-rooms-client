import axios from 'axios';
import _ from 'lodash';
import { useState, useEffect } from 'react';
import onInputChange from '../utils/onInputChange';

import InputField from './InputField';
import FindFriends from './FindFriends';
import FriendList from './FriendList';
import FriendRequests from './FriendRequests';

function Friends({ auth, user }) {
  const [error, setError] = useState('');
  const [friendList, setFriendList] = useState([]);

  return (
    <div>
      <h2>Friends</h2>

      
      <FindFriends auth={auth} user={user} friendList={friendList} />

      <h3>Friend List</h3>
      <FriendList auth={auth} user={user} setFriendList={setFriendList} />
      <h3>Friend Requests</h3>
      <FriendRequests auth={auth} user={user} />
    </div>
  );
}

export default Friends;
