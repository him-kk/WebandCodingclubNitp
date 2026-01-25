import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Components
import WebGLBackground from './components/WebGLBackground';
import Navigation from './components/Navigation';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';

// Sections
import Hero from './sections/Hero';
import Events from './sections/Events';
import Projects from './sections/Projects';
import ProfessorMessage from './sections/ProfessorMessage';
import Team from './sections/Team';
import Leaderboard from './sections/Leaderboard';
import Resources from './sections/Resources';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

// Pages
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

gsap.registerPlugin(ScrollTrigger);

// Main Homepage Component
function HomePage() {
  useEffect(() => {
    // Initialize smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh();

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-void text-white overflow-x-hidden digital-grain">
      {/* WebGL Background */}
      <WebGLBackground />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative z-10">
        <Hero />
        <Events />
        <Projects />
        <ProfessorMessage />
        <Team />
        <Leaderboard />
        <Resources />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
}

// Main App with Routing
function App() {
  return (
    <BrowserRouter>
         <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Redirect /Admin to /admin for consistency */}
        <Route path="/Admin/*" element={<Navigate to="/admin" replace />} />
        
        {/* Protected Admin Route */}
        <Route 
          path="/admin/" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;