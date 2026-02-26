import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './config/supabase';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import BookNow from './pages/Book_now';
import Price from './pages/Price_list';
import Shop from './pages/Shop';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Returns from './pages/Returns';
import AdminDashboard from './pages/AdminDashboard';
import AdminAuth from './components/AdminAuth';
import LogoHeader from './components/LogoHeader';
import MobileNav from './components/MobileNav';
import ScrollToTop from './components/ScrollToTop';
import PromoBanner from './components/PromoBanner';
import Footer from './components/Footer';
import './assets/styles/app.css';

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAdminLogin = (newSession) => {
    setSession(newSession);
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <>
      <ScrollToTop />
      {!isAdminPage && <PromoBanner />}
      {!isAdminPage && <LogoHeader />}
      {!isAdminPage && <MobileNav />}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/price" element={<Price />} />
          <Route path="/book" element={<BookNow />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/returns" element={<Returns />} />
          <Route
            path="/admin"
            element={
              authLoading ? (
                <div className="admin-dashboard"><div className="loading">Loading...</div></div>
              ) : session ?
                <AdminDashboard onLogout={handleAdminLogout} /> :
                <AdminAuth onLogin={handleAdminLogin} />
            }
          />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;