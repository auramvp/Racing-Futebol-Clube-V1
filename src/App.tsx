import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Trophies from './pages/Trophies';
import Transparency from './pages/Transparency';
import Admin from './pages/Admin';

import Squad from './pages/Squad';
import Board from './pages/Board';
import Statute from './pages/Statute';
import Socio from './pages/Socio';
import Registration from './pages/Registration';
import NewsList from './pages/NewsList';
import NewsDetail from './pages/NewsDetail';
import BrandKit from './pages/BrandKit';
import CampaignPopup from './components/layout/CampaignPopup';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-red-600 selection:text-white">
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      {!isAdmin && <CampaignPopup />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matriculas" element={<Registration />} />
          <Route path="/o-clube" element={<About />} />
          <Route path="/elenco/:category" element={<Squad />} />
          <Route path="/noticias" element={<NewsList />} />
          <Route path="/noticias/:id" element={<NewsDetail />} />
          <Route path="/socio" element={<Socio />} />
          <Route path="/diretoria" element={<Board />} />
          <Route path="/estatuto" element={<Statute />} />
          <Route path="/trofeus" element={<Trophies />} />
          <Route path="/transparencia" element={<Transparency />} />
          <Route path="/kit-de-marca" element={<BrandKit />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}
