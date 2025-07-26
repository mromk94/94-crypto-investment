import React, { useRef, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomeSection from './components/HomeSection';
import AboutSection from './components/AboutSection';
import TradeSection from './components/TradeSection';
import PlansSection from './components/PlansSection';
import FeaturesSection from './components/FeaturesSection';
import SecuritySection from './components/SecuritySection';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Forgot from './pages/Forgot';
import Dashboard from './pages/Dashboard';
import AdminIndex from './pages/admin/index';
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));

function App() {
  // Section refs for smooth scroll
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const tradeRef = useRef(null);
  const plansRef = useRef(null);
  const faqRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Determine base URL based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  const basename = isDevelopment ? '/' : '/TonSuiMining';

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={
          <Suspense fallback={<div className="p-8 text-center text-accent">Loading admin login...</div>}>
            <AdminLogin />
          </Suspense>
        } />
        <Route path="/admin/*" element={<AdminIndex />} />
        <Route path="*" element={
          <div className="min-h-screen bg-primary text-white">
            <Header
              onHome={() => window.location.reload()}
              onAbout={() => scrollToSection(aboutRef)}
              onTrade={() => scrollToSection(tradeRef)}
              onPlans={() => scrollToSection(plansRef)}
              onContact={() => scrollToSection(contactRef)}
              onFaq={() => scrollToSection(faqRef)}
              loggedIn={false}
            />
            <div ref={homeRef}><HomeSection /></div>
            <div ref={aboutRef}><AboutSection /></div>
            <div ref={tradeRef}><TradeSection /></div>
            <div ref={plansRef}><PlansSection /></div>
            <FeaturesSection />
            <SecuritySection />
            <TestimonialsSection />
            <div ref={faqRef}><FAQSection /></div>
            <div ref={contactRef}><ContactSection /></div>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
