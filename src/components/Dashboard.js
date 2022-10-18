import { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/socket';

import Friends from './Friends';
import TalkRoom from './TalkRoom';
import LoadingIcon from './LoadingIcon';

function Dashboard({ auth, changePage, changeSubPage, user, showSuccess }) {
  const socket = useContext(SocketContext);
  const [directChatData, setDirectChatData] = useState(null);
  const [loadingTalkRoom, setLoadingTalkRoom] = useState(false);

  function getDirectChatData(data) {
    setDirectChatData(data);
  }

  return (
    <div className="row dashboard">
      <div className="friend-container col-md-3">
        <div className="friend-wrapper">
          <Friends
            auth={auth}
            user={user}
            getDirectChatData={getDirectChatData}
            showSuccess={showSuccess}
            setLoadingTalkRoom={setLoadingTalkRoom}
          />
        </div>
      </div>
      <div className="friend-container col-md-9">
       {loadingTalkRoom && <div className="d-flex justify-content-center mt-5">
          <LoadingIcon />
        </div>}
        {!loadingTalkRoom &&<div>
          <TalkRoom
            changePage={changePage}
            auth={auth}
            user={user}
            directChatData={directChatData}
            getDirectChatData={getDirectChatData}
          />
        </div> }
      </div>
      {/* <div className="friend-container col-md-3">
        <div>Other data</div>
      </div> */}
    </div>
  );
}

export default Dashboard;
