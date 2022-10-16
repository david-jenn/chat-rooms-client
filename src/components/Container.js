import { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import { SocketContext, socket } from "../context/socket";

import Dashboard from "./Dashboard"
import TalkRoom from "./TalkRoom"
import FindRooms from "./FindRooms"

function Container ({auth, room, changePage, getRoom, onInputChange, changeSubPage, subPage}) {


  const [error, setError] = useState('');
  const [user, setUser] = useState(null);


    //socket
 useEffect(() => {
 
  if(user) {
    socket.emit('USER_JOIN', user);
  }
  
 },[socket, user])

 

  useEffect(() => {
   
    getUser(auth.payload._id);
  }, [auth]);

  function getUser(id) {

    axios(`${process.env.REACT_APP_API_URL}/api/user/${id}`, {
      method: 'get',
    })
      .then((res) => {
        setUser(res.data);
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
    <SocketContext.Provider value={socket}>
      
        {subPage === 'FindRooms' && <FindRooms auth={auth} getRoom={getRoom} changePage={changePage} onInputChange={onInputChange} changeSubPage={changeSubPage} />}
        {subPage === 'TalkRoom' && auth && room && <TalkRoom changePage={changePage} auth={auth} ccRoom={room} />}
        {subPage === 'Dashboard' && auth && <Dashboard changePage={changePage} auth={auth} user={user} changeSubPage={changeSubPage} />}

        </SocketContext.Provider>
  )
}

export default Container