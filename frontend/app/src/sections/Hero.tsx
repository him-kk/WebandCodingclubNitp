import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Github, Code2, Zap } from 'lucide-react';

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [glitchText, setGlitchText] = useState('Web&Coding');

  const images = [
    { src: '/hero-1.jpg', position: 'left', delay: 0.4 },
    { src: '/hero-2.jpg', position: 'right', delay: 0.6 },
    { src: '/hero-3.jpg', position: 'bottom', delay: 0.8 },
  ];

  // Glitch effect for  text
  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const interval = setInterval(() => {
      let iterations = 0;
      const maxIterations = 3;
      
      const glitchInterval = setInterval(() => {
        setGlitchText(prev => 
          prev.split('').map((_, i) => {
            if (i < iterations) return 'Web&Coding'[i];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('')
        );
        
        iterations += 1/3;
        if (iterations >= maxIterations) {
          clearInterval(glitchInterval);
          setGlitchText('Web&Coding');
        }
      }, 50);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { 
          opacity: 0, 
          y: 100,
          rotateX: -90,
        },
        { 
          opacity: 1, 
          y: 0,
          rotateX: 0,
          duration: 1.2, 
          ease: 'power4.out',
          delay: 0.2,
        }
      );

      // Subtitle animation
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power3.out',
          delay: 0.6,
        }
      );

      // CTA button animation
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power3.out',
          delay: 0.8,
        }
      );

      // Images orbital convergence
      imagesRef.current.forEach((img, i) => {
        if (img) {
          gsap.fromTo(
            img,
            { 
              scale: 0, 
              rotation: 180,
              opacity: 0,
            },
            { 
              scale: 1, 
              rotation: 0,
              opacity: 1,
              duration: 1, 
              ease: 'power4.out',
              delay: images[i].delay,
            }
          );

          // Floating animation
          gsap.to(img, {
            y: '+=15',
            duration: 3 + i * 0.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 2;
      const y = (clientY / window.innerHeight - 0.5) * 2;

      imagesRef.current.forEach((img, i) => {
        if (img) {
          const factor = (i + 1) * 10;
          gsap.to(img, {
            x: x * factor,
            y: y * factor,
            rotateY: x * 10,
            rotateX: -y * 10,
            duration: 0.5,
            ease: 'power2.out',
          });
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20"
      style={{ perspective: '1000px' }}
    >
      {/* Background large text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <h1 className="font-display text-[20vw] text-white/[0.03] uppercase tracking-wider whitespace-nowrap">
          {glitchText}
        </h1>
      </div>

      {/* Orbital Images */}
      <div className="absolute inset-0 pointer-events-none">
        {images.map((img, i) => (
          <div
            key={i}
            ref={el => { imagesRef.current[i] = el; }}
            className={`absolute w-64 h-40 md:w-80 md:h-48 lg:w-96 lg:h-56 rounded-lg overflow-hidden shadow-2xl ${
              img.position === 'left' 
                ? 'left-[5%] md:left-[10%] top-[20%]' 
                : img.position === 'right' 
                ? 'right-[5%] md:right-[10%] top-[25%]' 
                : 'left-1/2 -translate-x-1/2 bottom-[15%]'
            }`}
            style={{ 
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
          >
            <img
              src={img.src}
              alt={`Web&Coding club activity ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/60 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Pre-title */}
        <div className="flex items-center justify-center gap-2 mb-6 opacity-80">
          <Code2 className="w-4 h-4 text-orange" />
          <span className="text-sm md:text-base font-tech tracking-widest text-orange uppercase">
            Welcome to the Matrix
          </span>
          <Code2 className="w-4 h-4 text-orange" />
        </div>

        {/* Main Title */}
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-display uppercase tracking-wider mb-6"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <span className="block text-white">The</span>
          <span className="block text-orange glow-orange">{glitchText}</span>
          <span className="block text-white">Club</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-base md:text-lg lg:text-xl text-light/80 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          We are a community of coders, creators, and innovators. 
          Where code collides with creativity in a digital explosion.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            ref={ctaRef}
            onClick={() => scrollToSection('projects')}
            className="group relative px-8 py-4 bg-orange text-black font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-glow-lg"
          >
            <span className="relative z-10 flex items-center gap-2">
              Enter the Matrix
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>

          <button
            onClick={() => scrollToSection('events')}
            className="group px-8 py-4 border border-orange/50 text-orange font-semibold rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-orange/10 hover:border-orange"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              View Events
            </span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 md:gap-16 mt-16">
          {[
            { value: '500+', label: 'Members' },
            { value: '50+', label: 'Projects' },
            { value: '20+', label: 'Events' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange">{stat.value}</div>
              <div className="text-xs md:text-sm text-light/60 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* GitHub Link */}
        <div className="mt-12">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-light/60 hover:text-orange transition-colors duration-300"
          >
            <Github className="w-5 h-5" />
            <span className="text-sm">Join us on GitHub</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
