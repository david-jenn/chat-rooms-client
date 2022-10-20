import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { SocketContext } from '../context/socket';

function FriendList({
  auth,
  user,
  directChatData,
  setFriendList,
  setDirectChatData,
  setDirectChatIds,
  setLoadingTalkRoom,
  setLoadingFriends,
}) {
  const [error, setError] = useState('');
  const [friendConnections, setFriendConnections] = useState([]);

  const socket = useContext(SocketContext);

  useEffect(() => {
    getFriends();
    socket.on('REQUEST_ACCEPTED_SENDER', (message) => {
      getFriends();
    });
    socket.on('REQUEST_ACCEPTED_RECEIVER', (message) => {
      getFriends();
    });
    socket.on('DIRECT_MESSAGE_RECEIVED', (data) => {
      console.log(data.friendId);
      console.log(directChatData?.friend.id);
      
      if(data.friendId === directChatData?.friend.id) { return; }
      const connections = [...friendConnections];
      for (const connection of connections) {
        if (connection.friend.id === data.friendId) {
          !connection.recentMessageCount ? connection.recentMessageCount = 1 : connection.recentMessageCount++;
        }
      }
      console.log(connections);
      setFriendConnections([...connections]);
    });
    return () => {
      socket.off('REQUEST_ACCEPTED_SENDER');
      socket.off('REQUEST_ACCEPTED_RECEIVER');
      socket.off('DIRECT_MESSAGE_RECEIVED')
    };
  }, [auth]);

  function getFriends() {
    setLoadingFriends(true);
    axios(`${process.env.REACT_APP_API_URL}/api/friend/friend-list/${auth.payload._id}`, {
      method: 'get',
    })
      .then((res) => {
        console.log(res.data);
        setLoadingFriends(false);
        setFriendConnections(res.data);
        setFriendList(res.data);
        const chatIds = res.data.map((friend) => {
          const connectionArray = [friend._id, user._id];
          const connectionSorted = connectionArray.sort();
          return `${connectionSorted[0]};${connectionSorted[1]}`;
        });
        setDirectChatIds(chatIds);
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
    setLoadingTalkRoom(true);
    setDirectChatData(null);
    const connections = [...friendConnections];
    const connection = connections.find((connection) => connection.friend.id === friend.id);
    connection.recentMessageCount = '';
    setFriendConnections([...connections]);

    console.log(friend);
    if (!friend || !user) {
      return;
    }
    const idArray = [user._id, friend.id].sort();
    const directChatId = `${idArray[0]};${idArray[1]}`;

    axios(`${process.env.REACT_APP_API_URL}/api/room/join/direct-chat`, {
      method: 'put',
      data: { id: directChatId },
    })
      .then((res) => {
        console.log(res);
        const directChatData = {
          directChatId,
          friend: {
            id: friend.id,
            displayName: friend.displayName,
          },
        };
        setLoadingTalkRoom(false);
        setDirectChatData(directChatData);
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
    <div className="mb-1 border-bottom border-2">
      {friendConnections &&
        friendConnections.length > 0 &&
        _.map(friendConnections, (connection) => (
          <div className="card p-2 mb-1">
            <div className="d-flex justify-content-between align-items-center">
              <div>{connection.friend.displayName}</div>
              <button className="btn btn-sm btn-primary" onClick={(evt) => joinDirectChat(connection.friend)}>
                Chat
              </button>
            </div>
            {connection.recentMessageCount && (
              <div className="d-flex">
                <div className="me-2 text-primary">&#8226;</div> <div>{connection.recentMessageCount}</div>{' '}
              </div>
            )}
          </div>
        ))}

      {!friendConnections || (friendConnections.length === 0 && <div className="fst-italic">No Friends Found</div>)}
      <div className="mb-3"></div>
    </div>
  );
}

export default FriendList;
