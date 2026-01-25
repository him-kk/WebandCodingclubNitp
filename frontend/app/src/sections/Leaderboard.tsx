import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Trophy, Medal, TrendingUp, Code2, Zap } from 'lucide-react';
import api from '../services/api';

gsap.registerPlugin(ScrollTrigger);

interface LeaderboardEntry {
  id: number;
  rank: number;
  name: string;
  avatar: string;
  points: number;
  level: string;
  badges?: string[];
  change?: number;
  streak?: number;
}

const badgeIcons: { [key: string]: string } = {
  'top-contributor': '👑',
  'hackathon-winner': '🏆',
  'mentor': '🎓',
  'ai-expert': '🤖',
  'workshop-host': '📢',
  'security-expert': '🛡️',
  'bug-hunter': '🐛',
  'mobile-dev': '📱',
  'ui-designer': '🎨',
  'devops': '⚙️',
  'cloud-architect': '☁️',
  'design-lead': '✨',
  'frontend-dev': '💻',
  'data-scientist': '📊',
  'algorithm-master': '🧮',
};

const Leaderboard = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [animatingRows, setAnimatingRows] = useState<number[]>([]);
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard');
        // safe fallback to empty array
        setLeaderboardData(res.data?.data ?? []);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // GSAP animations
  useEffect(() => {
    if (!leaderboardData.length) return;

    const ctx = gsap.context(() => {
      rowsRef.current.forEach((row, i) => {
        if (row) {
          gsap.fromTo(
            row,
            { opacity: 0, x: 100 },
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
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
    }, sectionRef);

    return () => ctx.revert();
  }, [leaderboardData]);

  // Live updates simulation
  useEffect(() => {
    if (!liveUpdates || !leaderboardData.length) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * leaderboardData.length);
      setAnimatingRows(prev => [...prev, randomIndex]);
      setTimeout(() => {
        setAnimatingRows(prev => prev.filter(i => i !== randomIndex));
      }, 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, [liveUpdates, leaderboardData]);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50';
      default: return 'bg-white/5 border-white/10';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="font-tech text-orange">#{rank}</span>;
    }
  };

  return (
    <section ref={sectionRef} id="leaderboard" className="relative py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-orange" />
            <span className="font-tech text-sm tracking-widest text-orange uppercase">
              Gamified Competition
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display uppercase tracking-wider text-white mb-4">
            Live Leaderboard
          </h2>
          <p className="text-light/60 max-w-2xl mx-auto mb-6">
            Climb the ranks by contributing to projects, attending workshops, and participating in events.
          </p>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setLiveUpdates(!liveUpdates)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                liveUpdates
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-white/5 text-light/50 border border-white/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${liveUpdates ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              {liveUpdates ? 'Live Updates' : 'Paused'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="space-y-3">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-tech text-light/50 uppercase tracking-wider border-b border-white/10">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Hacker</div>
            <div className="col-span-2">Level</div>
            <div className="col-span-2">Points</div>
            <div className="col-span-2">Badges</div>
            <div className="col-span-1">Streak</div>
          </div>

          {/* Rows */}
          {loading ? (
            <p className="text-center text-light/50 py-10">Loading leaderboard...</p>
          ) : leaderboardData.length === 0 ? (
            <p className="text-center text-light/50 py-10">No entries found.</p>
          ) : (
            leaderboardData.map((entry, index) => (
              <div
                key={entry.id}
                ref={(el) => { rowsRef.current[index] = el; }}
                className={`relative grid grid-cols-12 gap-4 px-4 md:px-6 py-4 rounded-xl border transition-all duration-500 ${
                  getRankStyle(entry.rank)
                } ${animatingRows.includes(index) ? 'animate-pulse-glow' : ''} ${
                  hoveredMember === entry.id ? 'scale-[1.02] z-10' : ''
                }`}
                onMouseEnter={() => setHoveredMember(entry.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                {/* Rank */}
                <div className="col-span-2 md:col-span-1 flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8">{getRankIcon(entry.rank)}</div>
                  {entry.change && entry.change !== 0 && (
                    <div className={`flex items-center text-xs ${entry.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <TrendingUp className={`w-3 h-3 ${entry.change < 0 ? 'rotate-180' : ''}`} />
                      {Math.abs(entry.change)}
                    </div>
                  )}
                </div>

                {/* Hacker */}
                <div className="col-span-7 md:col-span-4 flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{entry.name}</div>
                    <div className="text-xs text-light/50 hidden md:block">Level {entry.rank}</div>
                  </div>
                </div>

                {/* Level */}
                <div className="hidden md:flex col-span-2 items-center">
                  <span className="px-3 py-1 bg-orange/10 text-orange text-xs font-tech rounded-full">
                    {entry.level}
                  </span>
                </div>

                {/* Points */}
                <div className="col-span-3 md:col-span-2 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-orange" />
                  <span className="font-tech text-orange">{entry.points.toLocaleString()}</span>
                </div>

                {/* Badges */}
                <div className="hidden md:flex col-span-2 items-center gap-1">
                  {entry.badges?.slice(0, 3).map((badge, i) => (
                    <span
                      key={i}
                      className="text-lg hover:scale-125 transition-transform cursor-pointer"
                      title={badge.replace('-', ' ')}
                    >
                      {badgeIcons[badge] || '🏆'}
                    </span>
                  ))}
                  {entry.badges && entry.badges.length > 3 && (
                    <span className="text-xs text-light/50 ml-1">+{entry.badges.length - 3}</span>
                  )}
                </div>

                {/* Streak */}
                <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-1">
                  <Zap className={`w-4 h-4 ${entry.streak && entry.streak >= 10 ? 'text-orange' : 'text-light/30'}`} />
                  <span className="font-tech">{entry.streak ?? 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
