import { useState, useEffect } from "react";
import axios from "axios";
import _ from "lodash";

import Friends from "./Friends";
import TalkRoom from "./TalkRoom";
import FriendList from "./FriendList";

function Dashboard({auth, changePage}) {

  const [error, setError] = useState('');
  const [user, setUser] = useState(null);



  useEffect(() => {
    console.log(auth);
    getUser(auth.payload._id);
  }, [auth, ])

  function getUser(id) {
    console.log(id)
    axios(`${process.env.REACT_APP_API_URL}/api/user/${id}`, {
      method: 'get',
    })
      .then((res) => {
        console.log(res);
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
    <div className="row">
      <div className="friend-container col-md-3">
        <div>
          <Friends auth={auth} user={user} />
        </div>
      </div>
      <div className="friend-container col-md-6">
        <div>
          <TalkRoom changePage={changePage} auth={auth} />
        </div>
      </div>
      <div className="friend-container col-md-3">
        <div>Other data</div>
      </div>
    </div>
  
  )
}

export default Dashboard;