function Navbar({ auth, onLogout }) {
  function onClickLogout(evt) {
    evt.preventDefault();
    onLogout();
  }
  return (
    <div>
      <nav class="navbar navbar-light bg-light mb-3">
        <div class="container-fluid">
          
          <a class="navbar-brand" href="/">
            TalkRooms
          </a>
          {auth && (
                
                <span class="navbar-text" onClick={(evt) => onClickLogout(evt)}>
                Logout
              </span>
                
              )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
