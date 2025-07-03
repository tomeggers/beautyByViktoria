import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Treatments from './pages/Treatments';
import BookNow from './pages/Book_now';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/treatments" element={<Treatments />} />
        <Route path="/book" element={<BookNow />} />
      </Routes>
    </Router>
  );
}

export default App;