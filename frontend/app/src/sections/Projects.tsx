import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, ExternalLink, Star, GitFork, Code2, Users } from 'lucide-react';
import api from '../services/api'; // Axios instance

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  stars: number;
  forks: number;
  contributors: number;
}

const Projects = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch projects safely
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects'); // adjust backend route
        // Safely read data and fallback to empty array
        setProjects(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setProjects([]); // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // GSAP animations
  useEffect(() => {
    if (!projects || projects.length === 0) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        // Fly-in animation
        gsap.fromTo(
          card,
          { z: -500, opacity: 0, rotateX: 15 },
          {
            z: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1.2,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              end: 'top 50%',
              toggleActions: 'play none none reverse',
            },
            delay: i * 0.2,
          }
        );

        // Scroll Z-pass effect
        gsap.to(card, {
          z: 200,
          opacity: 0.3,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top 30%',
            end: 'top -20%',
            scrub: 1,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [projects]);

  // Mouse tilt effect
  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setMousePos({ x, y });

    gsap.to(card, {
      rotateY: x * 30,
      rotateX: -y * 30,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = (index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'power2.out' });
    setHoveredCard(null);
  };

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative py-24 md:py-32"
      style={{ perspective: '2000px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 className="w-6 h-6 text-orange" />
            <span className="font-tech text-sm tracking-widest text-orange uppercase">
              Our Work
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display uppercase tracking-wider text-white mb-4">
            Projects
          </h2>
          <p className="text-light/60 max-w-2xl mx-auto">
            Explore our latest innovations and open-source contributions. Each project represents our commitment to pushing boundaries.
          </p>
        </div>

        {/* Project Cards */}
        <div className="relative space-y-8 md:space-y-0">
          {loading ? (
            <p className="text-center text-light/50 py-10">Loading projects...</p>
          ) : !projects || projects.length === 0 ? (
            <p className="text-center text-light/50 py-10">No projects found.</p>
          ) : (
            projects.map((project, index) => (
              <div
                key={project.id}
                ref={(el) => { cardsRef.current[index] = el; }}
                className={`relative w-full md:w-11/12 lg:w-4/5 mx-auto ${index > 0 ? 'md:-mt-32' : ''}`}
                style={{ transformStyle: 'preserve-3d', zIndex: projects.length - index }}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => handleMouseLeave(index)}
              >
                <div className={`relative bg-void/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 ${hoveredCard === index ? 'border-orange/50 shadow-glow' : ''}`}>
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative md:w-2/5 h-64 md:h-auto overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700"
                        style={{
                          transform: hoveredCard === index
                            ? `scale(1.1) translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`
                            : 'scale(1)',
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-void/80 md:block hidden" />
                      <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent md:hidden" />
                    </div>

                    {/* Content */}
                    <div className="md:w-3/5 p-6 md:p-8 lg:p-10">
                      <div className="font-tech text-7xl text-white/5 absolute top-4 right-4">0{index + 1}</div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 group-hover:text-orange transition-colors">{project.title}</h3>
                      <p className="text-light/60 mb-6 line-clamp-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-light/80 font-tech"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 mb-6 text-sm text-light/50">
                        <div className="flex items-center gap-1"><Star className="w-4 h-4 text-orange" /> <span>{project.stars}</span></div>
                        <div className="flex items-center gap-1"><GitFork className="w-4 h-4 text-blue" /> <span>{project.forks}</span></div>
                        <div className="flex items-center gap-1"><Users className="w-4 h-4 text-light/40" /> <span>{project.contributors} contributors</span></div>
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center gap-4">
                        <a href={project.githubUrl} className="flex items-center gap-2 px-5 py-2 bg-white/5 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/10 hover:border-orange/50 transition-all duration-300">
                          <Github className="w-4 h-4" /> View Code
                        </a>
                        <a href={project.liveUrl} className="flex items-center gap-2 px-5 py-2 bg-orange text-black text-sm font-medium rounded-lg hover:shadow-glow transition-all duration-300">
                          <ExternalLink className="w-4 h-4" /> Live Demo
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
