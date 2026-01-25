import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, FileText, Video, Code2, ExternalLink, Clock, User, ChevronRight } from 'lucide-react';
import api from '../services/api'; // Axios instance with backend URL

gsap.registerPlugin(ScrollTrigger);

interface Tutorial {
  id: number;
  title: string;
  author: string;
  duration: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}

interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
}

interface Roadmap {
  id: number;
  title: string;
  steps: RoadmapStep[];
}

const Resources = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const roadmapsRef = useRef<HTMLDivElement>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState(0);
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [roadmapRes, tutorialRes, blogRes] = await Promise.all([
          api.get('/resources/roadmaps'),
          api.get('/resources/tutorials'),
          api.get('/resources/blog'),
        ]);

        setRoadmaps(roadmapRes.data.data || []);
        setTutorials(tutorialRes.data.data || []);
        setBlogPosts(blogRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const paths = roadmapsRef.current?.querySelectorAll('.roadmap-path');
      paths?.forEach((path) => {
        const length = (path as SVGPathElement).getTotalLength();
        (path as SVGPathElement).style.strokeDasharray = `${length}`;
        (path as SVGPathElement).style.strokeDashoffset = `${length}`;

        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [roadmaps]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-white/10 text-light/70';
    }
  };

  if (loading) {
    return <p className="text-center py-20 text-light/50">Loading resources...</p>;
  }

  return (
    <section ref={sectionRef} id="resources" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-orange" />
            <span className="font-tech text-sm tracking-widest text-orange uppercase">Knowledge Hub</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display uppercase tracking-wider text-white mb-4">
            Learning Resources
          </h2>
          <p className="text-light/60 max-w-2xl mx-auto">
            Curated roadmaps, tutorials, and articles to accelerate your learning journey.
          </p>
        </div>

        {/* Roadmaps */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Code2 className="w-6 h-6 text-orange" /> Learning Roadmaps
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {roadmaps.map((roadmap, index) => (
              <div
                key={roadmap.id}
                className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  activeRoadmap === index ? 'bg-orange/10 border-orange/50' : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                onClick={() => setActiveRoadmap(index)}
              >
                <h4 className="text-xl font-bold text-white mb-6">{roadmap.title}</h4>
                <div className="relative space-y-4" ref={roadmapsRef}>
                  <svg className="absolute left-4 top-8 bottom-8 w-1 h-[calc(100%-4rem)]" preserveAspectRatio="none">
                    <line className="roadmap-path" x1="0.5" y1="0" x2="0.5" y2="100%" stroke="rgba(255, 152, 0, 0.3)" strokeWidth="2" />
                  </svg>

                  {roadmap.steps.map((step, i) => (
                    <div key={step.id} className="relative flex items-start gap-4">
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        step.completed ? 'bg-orange text-black' : 'bg-white/10 text-light/50 border border-white/20'
                      }`}>
                        {step.completed ? '✓' : i + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <h5 className={`font-semibold ${step.completed ? 'text-white' : 'text-light/70'}`}>{step.title}</h5>
                        <p className="text-sm text-light/50 mt-1">{step.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-light/30" />
                          <span className="text-xs text-light/40">{step.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tutorials */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Video className="w-6 h-6 text-orange" /> Latest Tutorials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="group p-5 bg-white/5 border border-white/10 rounded-xl hover:border-orange/30 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 text-xs font-tech rounded-full border ${getDifficultyColor(tutorial.difficulty)}`}>
                    {tutorial.difficulty}
                  </span>
                  <span className="text-xs text-light/40">{tutorial.category}</span>
                </div>
                <h4 className="text-lg font-semibold text-white group-hover:text-orange transition-colors mb-2">{tutorial.title}</h4>
                <div className="flex items-center justify-between text-sm text-light/50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{tutorial.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{tutorial.duration}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-orange text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Watch Now</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blog Posts */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <FileText className="w-6 h-6 text-orange" /> From Our Blog
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-orange/30"
                onMouseEnter={() => setHoveredPost(post.id)}
                onMouseLeave={() => setHoveredPost(null)}
              >
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-orange/10 text-orange text-xs font-tech rounded-full mb-4">{post.category}</span>
                  <h4 className="text-lg font-semibold text-white mb-3 group-hover:text-orange transition-colors line-clamp-2">{post.title}</h4>
                  <p className="text-sm text-light/50 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-light/40">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>
                    <span>{post.date}</span>
                  </div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-t from-orange/20 to-transparent transition-opacity duration-300 pointer-events-none ${hoveredPost === post.id ? 'opacity-100' : 'opacity-0'}`} />
              </article>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <button className="group flex items-center gap-2 px-6 py-3 border border-orange/30 text-orange font-semibold rounded-lg hover:bg-orange hover:text-black transition-all duration-300">
              <span>View All Resources</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resources;
