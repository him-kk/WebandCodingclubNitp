import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Code2, Shield } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '#hero' },
    { label: 'Events', href: '#events' },
    { label: 'Projects', href: '#projects' },
    { label: 'Team', href: '#team' },
    { label: 'Leaderboard', href: '#leaderboard' },
    { label: 'Resources', href: '#resources' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-void/80 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#hero');
              }}
              className="flex items-center gap-2 group"
            >
              <Code2 className="w-6 h-6 md:w-8 md:h-8 text-orange group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-lg md:text-xl font-bold text-white">
                Web&Coding<span className="text-orange">Club</span>
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  className="px-4 py-2 text-sm text-light/70 hover:text-orange transition-colors duration-300 rounded-lg hover:bg-white/5"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Admin Login Button */}
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-orange border border-orange/30 rounded-lg hover:bg-orange/10 transition-all duration-300"
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
              
              <button
                onClick={() => scrollToSection('#contact')}
                className="px-5 py-2 bg-orange text-black text-sm font-semibold rounded-lg hover:shadow-glow transition-all duration-300"
              >
                Join Now
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-light hover:text-orange transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-void/95 backdrop-blur-xl"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Content */}
        <div className="relative h-full flex flex-col items-center justify-center gap-6 p-8">
          {navItems.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.href);
              }}
              className="text-2xl font-semibold text-white hover:text-orange transition-colors duration-300"
              style={{
                animationDelay: `${i * 50}ms`,
              }}
            >
              {item.label}
            </a>
          ))}

          {/* Admin Login Button - Mobile */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/login');
            }}
            className="flex items-center gap-2 px-6 py-3 text-orange border-2 border-orange rounded-lg hover:bg-orange hover:text-black transition-all duration-300"
          >
            <Shield className="w-5 h-5" />
            Admin Login
          </button>

          <button
            onClick={() => scrollToSection('#contact')}
            className="px-8 py-3 bg-orange text-black font-semibold rounded-lg hover:shadow-glow transition-all duration-300"
          >
            Join Now
          </button>
        </div>
      </div>
    </>
  );
};

export default Navigation;