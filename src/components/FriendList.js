import { useState, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';

function FriendList({ auth, user, setFriendList }) {
  const [error, setError] = useState('');
  const [friendConnections, setFriendConnections] = useState([]);

  useEffect(() => {
    getFriends();
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

  return (
    <div>
      {friendConnections &&
        friendConnections.length > 0 &&
        _.map(friendConnections, (connection) => (
          <div className="card p-1">
            <div>{connection.friend.displayName}</div>
          </div>
        ))}

      {!friendConnections || (friendConnections.length === 0 && <div className="fst-italic">No Friends Found</div>)}
    </div>
  );
}

export default FriendList;
