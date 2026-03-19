/* eslint-disable react/prop-types */
const Navbar = ({ onSignInClick, user, searchValue, setSearchValue, onSearchSubmit }) => {
  return (
    <header className="navbar">
      <div className="nav-left">
        <div style={{ width: 24, height: 24, background: "#fff", borderRadius: 2 }} />
        <div className="logo-text">
          Tube<span>Clone</span>
        </div>
      </div>

      <div className="nav-center">
        <div className="search-container">
          <input
            className="search-input"
            placeholder="Paste MP4 video URL here"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button className="search-button" onClick={onSearchSubmit}>
            🔍
          </button>
        </div>
      </div>

      <div className="nav-right">
        {user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#3ea6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontWeight: 700,
              }}
            >
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span>{user.name}</span>
          </div>
        ) : (
          <button className="signin-btn" onClick={onSignInClick}>
            ⦿ Sign in
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
