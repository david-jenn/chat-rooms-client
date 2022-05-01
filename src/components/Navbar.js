function Navbar({ auth, onLogout, changePage }) {
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
              {auth.payload.email}
            </span>
          )}

          {!auth && (
            <span class="navbar-text" onClick={(evt) => changePage('Register')}>
              Register
            </span>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
