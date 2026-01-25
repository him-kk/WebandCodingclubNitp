import { useState } from 'react';
import { Code2, Github, Twitter, Linkedin, Instagram, Youtube, Mail, Heart } from 'lucide-react';
import api from '../services/api'; // Axios instance

const Footer = () => {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const socialLinks = [
    { name: 'GitHub', icon: Github, url: '#', color: 'hover:text-white' },
    { name: 'Twitter', icon: Twitter, url: '#', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, url: '#', color: 'hover:text-blue-500' },
    { name: 'Instagram', icon: Instagram, url: '#', color: 'hover:text-pink-500' },
    { name: 'YouTube', icon: Youtube, url: '#', color: 'hover:text-red-500' },
    { name: 'Discord', icon: Mail, url: '#', color: 'hover:text-indigo-400' },
  ];

  const quickLinks = [
    { label: 'About Us', href: '#' },
    { label: 'Events', href: '#events' },
    { label: 'Projects', href: '#projects' },
    { label: 'Team', href: '#team' },
    { label: 'Resources', href: '#resources' },
    { label: 'Contact', href: '#contact' },
  ];

  const resources = [
    { label: 'Learning Roadmaps', href: '#' },
    { label: 'Code Repository', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Community', href: '#' },
    { label: 'Blog', href: '#' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const response = await api.post('/newsletter/subscribe', { email });
      if (response.data.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <footer className="relative py-16 md:py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#hero" className="flex items-center gap-2 mb-6 group">
              <Code2 className="w-8 h-8 text-orange group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-2xl font-bold text-white">
                Web&Coding<span className="text-orange">Club</span>
              </span>
            </a>
            <p className="text-light/50 text-sm leading-relaxed mb-6">
              Where code collides with creativity. Join our community of passionate developers 
              building the future of technology.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  onMouseEnter={() => setHoveredSocial(social.name)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  className={`p-3 bg-white/5 border border-white/10 rounded-lg text-light/50 transition-all duration-300 ${
                    hoveredSocial === social.name
                      ? 'bg-orange/10 border-orange/30 text-orange -translate-y-2 shadow-glow'
                      : 'hover:text-white'
                  }`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                    className="text-light/50 hover:text-orange transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Resources</h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-light/50 hover:text-orange transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Stay Updated</h3>
            <p className="text-light/50 text-sm mb-4">
              Subscribe to our newsletter for the latest updates, events, and resources.
            </p>
            <form className="flex gap-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-light/40 focus:outline-none focus:border-orange/50 text-sm"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-orange text-black font-semibold rounded-lg hover:shadow-glow transition-all duration-300 text-sm"
              >
                {status === 'loading' ? 'Sending...' : 'Subscribe'}
              </button>
            </form>
            {status === 'success' && <p className="text-green-500 mt-2 text-sm">Subscribed successfully!</p>}
            {status === 'error' && <p className="text-red-500 mt-2 text-sm">Subscription failed. Try again.</p>}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-light/40 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by The Web&Coding Club Team
          </p>

          <div className="flex items-center gap-6 text-sm text-light/40">
            <a href="#" className="hover:text-orange transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-orange transition-colors">Code of Conduct</a>
          </div>

          <p className="text-light/40 text-sm">© 2026 The Web&Coding Club. All rights reserved.</p>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange/50 to-transparent" />
    </footer>
  );
};

export default Footer;
