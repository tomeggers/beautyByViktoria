import { useNavigate } from 'react-router-dom';
import { VscHome, VscArchive, VscCreditCard, VscCalendar } from 'react-icons/vsc';
import '../assets/styles/MobileNav.css';

export default function MobileNav() {
  const navigate = useNavigate();

  return (
    <nav className="mobile-nav">
      <button onClick={() => navigate('/')}><VscHome /><span>Home</span></button>
      <button onClick={() => navigate('/gallery')}><VscArchive /><span>Gallery</span></button>
      <button onClick={() => navigate('/price')}><VscCreditCard /><span>Prices</span></button>
      <button onClick={() => navigate('/book')}><VscCalendar /><span>Book</span></button>
    </nav>
  );
}
