import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import BookNow from './pages/Book_now';
import Price from './pages/Price_list';
import LogoHeader from './components/LogoHeader';
import MobileNav from './components/MobileNav';
import ScrollToTop from './components/ScrollToTop';
import './assets/styles/app.css'; // Assuming you have a global styles file

function App() {
  return (
    <Router>
      <ScrollToTop />
      <LogoHeader />
      <MobileNav />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/price" element={<Price />} />
          <Route path="/book" element={<BookNow />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
