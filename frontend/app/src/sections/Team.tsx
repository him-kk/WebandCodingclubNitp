import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, Linkedin, Twitter, Star, GitBranch } from 'lucide-react';
import api from '../services/api'; // Axios instance

gsap.registerPlugin(ScrollTrigger);

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  avatar?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  techStack?: string[];
  contributions?: number;
  projects?: number;
}

const Team = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch team members
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get('/team');
        setTeamMembers(res.data?.data ?? []);
      } catch (err) {
        console.error('Failed to fetch team members:', err);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  // GSAP animations
  useEffect(() => {
    if (!teamMembers.length) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, scale: 0.8, y: 50 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 70%',
              },
              delay: i * 0.1,
            }
          );
        }
      });

      if (svgRef.current) {
        const lines = svgRef.current.querySelectorAll('line');
        lines.forEach((line) => {
          gsap.fromTo(
            line,
            { strokeDashoffset: 1000 },
            {
              strokeDashoffset: 0,
              duration: 1.5,
              ease: 'power2.out',
              scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [teamMembers]);

  // Mouse hover movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      setMousePos({ x, y });

      cardsRef.current.forEach((card, i) => {
        if (card && hoveredMember === null) {
          const factor = (i % 2 === 0 ? 1 : -1) * 10;
          gsap.to(card, {
            x: x * factor,
            y: y * factor * 0.5,
            duration: 0.5,
            ease: 'power2.out',
          });
        }
      });
    };

    const section = sectionRef.current;
    section?.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => section?.removeEventListener('mousemove', handleMouseMove);
  }, [hoveredMember]);

  // Node positions for SVG lines
  const getNodePosition = (index: number) => {
    const positions = teamMembers.map((_, i) => ({
      x: 20 + (i % 3) * 30,
      y: 20 + Math.floor(i / 3) * 25,
    }));
    return positions[index];
  };

  // Generate connecting lines
  const generateLines = () => {
    const lines: React.ReactElement[] = [];
    for (let i = 0; i < teamMembers.length; i++) {
      for (let j = i + 1; j < teamMembers.length; j++) {
        const from = getNodePosition(i);
        const to = getNodePosition(j);
        lines.push(
          <line
            key={`${i}-${j}`}
            x1={`${from.x}%`}
            y1={`${from.y}%`}
            x2={`${to.x}%`}
            y2={`${to.y}%`}
            stroke="rgba(255, 152, 0, 0.2)"
            strokeWidth="1"
            strokeDasharray="1000"
            className={hoveredMember !== null ? 'opacity-50' : 'opacity-100'}
          />
        );
      }
    }
    return lines;
  };

  if (loading) return <p className="text-center py-20 text-light/50">Loading team members...</p>;
  if (!teamMembers.length) return <p className="text-center py-20 text-light/50">No team members found.</p>;

  return (
    <section ref={sectionRef} id="team" className="relative py-24 md:py-32 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none">
        {generateLines()}
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-6 h-6 text-orange" />
            <span className="font-tech text-sm tracking-widest text-orange uppercase">The Minds Behind</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display uppercase tracking-wider text-white mb-4">
            The Team
          </h2>
          <p className="text-light/60 max-w-2xl mx-auto">
            Meet the brilliant minds driving innovation at our club.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member._id}
              ref={(el) => { cardsRef.current[index] = el; }}
              className={`relative group transition-all duration-500 ${
                hoveredMember !== null && hoveredMember !== index ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
              } ${hoveredMember === index ? 'scale-105 z-20' : ''}`}
              style={{
                transform:
                  hoveredMember === index ? `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` : 'none',
              }}
              onMouseEnter={() => setHoveredMember(index)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              <div className="relative bg-void/80 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-orange/50 group-hover:shadow-glow">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.avatar || '/default-avatar.png'}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-orange/90 text-black text-xs font-semibold rounded-full">
                    {member.role.split(' & ')[0]}
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {member.github && (
                      <a href={member.github} className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-orange hover:text-black transition-all duration-300">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a href={member.linkedin} className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-blue hover:text-white transition-all duration-300">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white hover:text-black transition-all duration-300">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm text-light/60 mb-4">{member.role}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {member.techStack?.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-light/70 font-tech"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-light/50 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3 text-orange" />
                      <span>{member.contributions || 0} commits</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-blue" />
                      <span>{member.projects || 0} projects</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
