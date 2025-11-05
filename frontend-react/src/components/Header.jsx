import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="navwrap">
        <button className="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
        <nav className="nav" aria-label="Primary">
          <NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/results" className={({isActive}) => isActive ? "active" : ""}>Results</NavLink>
          <NavLink to="/about" className={({isActive}) => isActive ? "active" : ""}>About</NavLink>
        </nav>
      </div>
    </header>
  );
}
