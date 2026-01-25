import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, Check, Mail, User, MessageSquare, Loader2 } from 'lucide-react';
import api from '../services/api';
gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subject: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Form fields slide-up animation
      const fields = formRef.current?.querySelectorAll('.form-field');
      fields?.forEach((field, i) => {
        gsap.fromTo(
          field,
          { opacity: 0, y: 100 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
            },
            delay: i * 0.1,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormState('loading');

  try {
    const response = await api.post('/contact', formData); // send formData to backend

    if (response.data.success) {
      setFormState('success');

      // Reset after showing success
      setTimeout(() => {
        setFormState('idle');
        setFormData({ name: '', email: '', message: '', subject: '' });
      }, 3000);
    }
  } catch (err: any) {
    console.error('Contact form submission error:', err);
    setFormState('idle');
    alert(err.response?.data?.message || 'Something went wrong!');
  }
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.02]">
        <h2 className="font-display text-[30vw] text-white uppercase tracking-wider whitespace-nowrap">
          CONTACT
        </h2>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-orange" />
              <span className="font-tech text-sm tracking-widest text-orange uppercase">
                Get In Touch
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display uppercase tracking-wider text-white mb-6">
              Ready to<br />
              <span className="text-orange">Hack?</span>
            </h2>

            <p className="text-lg text-light/60 mb-8">
              Join our community of passionate developers, innovators, and creators. 
              Whether you're a beginner or an expert, there's a place for you here.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              {[
                { label: 'Email', value: 'hello@WebandCodingclub.dev' },
                { label: 'Discord', value: 'discord.gg/WebandCodingclub' },
                { label: 'Location', value: 'Tech University, Innovation Hub' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-orange rounded-full" />
                  <span className="text-light/50">{item.label}:</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-10">
              {[
                { value: '24/7', label: 'Support' },
                { value: '< 24h', label: 'Response Time' },
                { value: '100%', label: 'Free' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-orange">{stat.value}</div>
                  <div className="text-sm text-light/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Form */}
          <div className="relative">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
                <div className="absolute top-0 right-0 w-40 h-10 bg-orange/20 rotate-45 translate-x-10 -translate-y-5" />
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Name */}
                <div className="form-field relative">
                  <label
                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                      focusedField === 'name' || formData.name
                        ? 'top-0 text-xs text-orange bg-void px-2'
                        : 'top-4 text-light/50'
                    }`}
                  >
                    <User className="w-4 h-4 inline mr-1" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange/50 transition-colors"
                    required
                  />
                </div>

                {/* Email */}
                <div className="form-field relative">
                  <label
                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                      focusedField === 'email' || formData.email
                        ? 'top-0 text-xs text-orange bg-void px-2'
                        : 'top-4 text-light/50'
                    }`}
                  >
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange/50 transition-colors"
                    required
                  />
                </div>

                {/* Message */}
                <div className="form-field relative">
                  <label
                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                      focusedField === 'message' || formData.message
                        ? 'top-0 text-xs text-orange bg-void px-2'
                        : 'top-4 text-light/50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    rows={4}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange/50 transition-colors resize-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formState !== 'idle'}
                  className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-500 ${
                    formState === 'success'
                      ? 'bg-green-500 text-white'
                      : 'bg-orange text-black hover:shadow-glow'
                  }`}
                >
                  {formState === 'idle' && (
                    <>
                      <span>Send Message</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                  {formState === 'loading' && (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  )}
                  {formState === 'success' && (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Message Sent!</span>
                    </>
                  )}
                </button>
              </div>

              {/* Success particles */}
              {formState === 'success' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-orange rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `particle ${0.5 + Math.random() * 0.5}s ease-out forwards`,
                      }}
                    />
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Particle animation styles */}
      <style>{`
        @keyframes particle {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;
