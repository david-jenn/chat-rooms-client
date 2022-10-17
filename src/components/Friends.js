import axios from 'axios';
import _ from 'lodash';
import { useState, useEffect } from 'react';
import onInputChange from '../utils/onInputChange';
import friends from '../../src/css/friends.css';

import InputField from './InputField';
import FindFriends from './FindFriends';
import FriendList from './FriendList';
import FriendRequests from './FriendRequests';

function Friends({ auth, user, getDirectChatData, showSuccess }) {
  const [error, setError] = useState('');
  const [friendList, setFriendList] = useState([]);

  return (
    <div className="friend-child">
      <h2>Friends</h2>
      <div className="d-flex flex-column friends-vertical">
   
        <div>
          <FindFriends auth={auth} user={user} friendList={friendList} />
        </div>
        <div className="flex-grow-1">
          <FriendList auth={auth} user={user} setFriendList={setFriendList} getDirectChatData={getDirectChatData} />
        </div>
        <div>
          <FriendRequests auth={auth} user={user} showSuccess={showSuccess}/>
        </div>
     
      </div>
    </div>
  );
}

export default Friends;
