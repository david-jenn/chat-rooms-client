import { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/socket';



import Friends from './Friends';
import TalkRoom from './TalkRoom';



function Dashboard({ auth, changePage, changeSubPage, user }) {

  const socket = useContext(SocketContext);
  const [directChatData, setDirectChatData] = useState(null);


  function getDirectChatData(data) {
    setDirectChatData(data);
  }
  
  return (
    
    <div className="row dashboard">
      <div className="friend-container col-md-3">
        <div className="friend-wrapper">
          <Friends auth={auth} user={user} getDirectChatData={getDirectChatData} />
        </div>
      </div>
      <div className="friend-container col-md-9">
        <div><TalkRoom changePage={changePage} auth={auth} directChatData={directChatData} getDirectChatData={getDirectChatData} /></div>
      </div>
      {/* <div className="friend-container col-md-3">
        <div>Other data</div>
      </div> */}
    </div>
    
  );
}

export default Dashboard;
