import { Link } from 'react-router-dom';
import '../../assets/styles/main.css';
import beautyImage from '../../assets/images/navbar_logo.png';

function Header() {
  return (
    <header className="header">
      <div className="logo"><img src={beautyImage} alt="Beauty by Viktoria" /></div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    </header>
  );
}

export default Header;