import { Link } from 'react-router-dom';
import '../../assets/styles/header.css';
import beautyImage from '../../assets/images/navbar_logo_transparent.png';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-wrapper">
          <img 
            src={beautyImage} 
            alt="Beauty by Viktoria" 
            className="header-logo"
          />
        </div>
        <nav className="main-nav">
          <ul className="nav-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/book">Book Now</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;