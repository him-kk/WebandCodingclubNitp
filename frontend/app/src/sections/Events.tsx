
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Clock, MapPin, ArrowRight, Users, ExternalLink } from 'lucide-react';
import api from '../services/api';

gsap.registerPlugin(ScrollTrigger);

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  attendees: number;
  description: string;
  registrationLink?: string; // NEW FIELD
}

const Events = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [scrambledDates, setScrambledDates] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        if (response.data.success) {
          setEvents(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Date scramble effect on hover
  const scrambleDate = (eventId: number, originalDate: string) => {
    const chars = '0123456789/';
    let iterations = 0;
    const maxIterations = 10;

    const interval = setInterval(() => {
      setScrambledDates(prev => ({
        ...prev,
        [eventId]: originalDate
          .split('')
          .map((char, i) => {
            if (i < iterations) return originalDate[i];
            if (char === ' ' || char === ',') return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join(''),
      }));

      iterations++;
      if (iterations >= maxIterations) {
        clearInterval(interval);
        setScrambledDates(prev => ({
          ...prev,
          [eventId]: originalDate,
        }));
      }
    }, 30);
  };

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      // Horizontal scroll effect
      if (streamRef.current) {
        gsap.to(streamRef.current, {
          x: -300,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });

        // Continuous drift
        gsap.to(streamRef.current, {
          x: '-=50',
          duration: 20,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [events]);

  // Function to handle registration
  const handleRegister = (event: Event) => {
    if (event.registrationLink) {
      // Open registration link in new tab
      window.open(event.registrationLink, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback: Navigate to internal registration or show message
      alert('Registration link not available for this event.');
    }
  };

  if (loading) {
    return (
      <section className="py-24 md:py-32 flex justify-center items-center">
        <span className="text-white text-lg">Loading events...</span>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="events" className="relative py-24 md:py-32 overflow-hidden">
      {/* Section Title - Vertical */}
      <div
        ref={titleRef}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 hidden md:block"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        <span className="font-tech text-xs tracking-[0.5em] text-orange/60 uppercase">
          Upcoming Events
        </span>
      </div>

      {/* Mobile Title */}
      <div className="md:hidden px-4 mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Upcoming Events</h2>
        <div className="w-20 h-1 bg-orange rounded-full" />
      </div>

      {/* Events Stream */}
      <div className="relative overflow-hidden">
        <div ref={streamRef} className="flex gap-6 md:gap-10 px-4 md:pl-24" style={{ width: 'fit-content' }}>
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`relative flex-shrink-0 w-[300px] md:w-[400px] group cursor-pointer transition-all duration-500 ${
                hoveredEvent === event.id ? 'scale-105 z-20' : 'scale-100'
              }`}
              onMouseEnter={() => {
                setHoveredEvent(event.id);
                scrambleDate(event.id, event.date);
              }}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              {/* Card */}
              <div className="relative bg-void/80 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group-hover:border-orange/50 transition-colors duration-300">
                {/* Image */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Scanline effect */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scanline" />
                  </div>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent" />
                  
                  {/* Event number */}
                  <div className="absolute top-4 right-4 font-tech text-6xl text-white/10">
                    0{index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 md:p-6">
                  {/* Date */}
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-orange" />
                    <span className="font-tech text-sm text-orange">{scrambledDates[event.id] || event.date}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-orange transition-colors duration-300">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-light/60 mb-4 line-clamp-2">{event.description}</p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-light/50 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>

                  {/* Register Button - Updated with Registration Link */}
                  <button
                    onClick={() => handleRegister(event)}
                    className="w-full py-2 bg-orange/10 border border-orange/30 text-orange text-sm font-semibold rounded-lg flex items-center justify-center gap-2 group-hover:bg-orange group-hover:text-black transition-all duration-300"
                  >
                    {event.registrationLink ? (
                      <>
                        Register Now
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        Register Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Link */}
      <div className="flex justify-center mt-12">
        <button className="group flex items-center gap-2 text-orange hover:text-white transition-colors duration-300">
          <span className="font-semibold">View All Events</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </section>
  );
};

export default Events;