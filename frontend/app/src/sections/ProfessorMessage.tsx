import { Quote, Sparkles } from 'lucide-react';

const ProfessorMessage = () => {
  return (
    <section id="professor" className="relative min-h-screen py-20 bg-void overflow-hidden">
      {/* Background Effects - Matching your website style */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header with Glitch Effect */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange/10 border border-orange/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-orange" />
            <span className="text-sm font-tech text-orange uppercase tracking-wider">Faculty In-Charge</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 font-tech">
            Message from our{' '}
            <span className="text-orange glitch-text" data-text="Mentor">
              Mentor
            </span>
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Professor Image Side */}
          <div className="relative" data-aos="fade-right">
            {/* Decorative Frame */}
            <div className="absolute -inset-4 bg-gradient-to-br from-orange/20 via-transparent to-transparent rounded-2xl blur-2xl" />
            
            <div className="relative group">
              {/* Main Image Container */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
                {/* Replace with your professor's image */}
                <img
                  src="C:\Users\lenovo\Downloads\webandcodingclubnitp\web-coding-club\frontend\app\public\professor.jpg"
                  alt="Professor Name"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent opacity-60" />
                
                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-orange rounded-tl-lg" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-orange rounded-br-lg" />
              </div>

              {/* Info Card Overlay */}
              <div className="absolute bottom-6 left-6 right-6 bg-void/95 backdrop-blur-xl border border-white/10 rounded-xl p-5">
                <h3 className="text-2xl font-bold text-white mb-1 font-tech">Dr. Mukesh Kumar</h3>
                <p className="text-orange text-sm font-semibold mb-1">Faculty In-Charge</p>
                <p className="text-light/60 text-sm">Department of Computer Science & Engineering</p>
              </div>
            </div>
          </div>

          {/* Message Content Side */}
          <div className="space-y-8" data-aos="fade-left">
            {/* Quote Icon */}
            <Quote className="w-16 h-16 text-orange/20" />

            {/* Main Tagline */}
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
                <span className="text-orange">"</span>
                Empowering Students to Build Tomorrow's Technology Today
                <span className="text-orange">"</span>
              </h3>
            </div>

            {/* Professor's Message */}
            <div className="space-y-5 text-light/70 text-lg leading-relaxed">
              <p>
                Welcome to the Web & Coding Club! As the Faculty In-Charge, I am thrilled to see 
                students passionate about technology and innovation come together to learn, create, 
                and inspire.
              </p>
              <p>
                Our club is more than just coding—it's about building a community where ideas flourish, 
                skills are honed, and lifelong connections are made. Whether you're a beginner taking 
                your first steps in programming or an experienced developer pushing boundaries, there's 
                a place for you here.
              </p>
              <p>
                I encourage all members to actively participate, collaborate on projects, and make the 
                most of the opportunities this club provides. Together, let's shape the future of technology.
              </p>
            </div>

            {/* Signature */}
            <div className="pt-6 border-t border-white/10">
              <p className="text-white font-bold text-xl font-tech">Dr. Mukesh Kumar</p>
              <p className="text-orange text-sm font-semibold">Faculty In-Charge</p>
              <p className="text-light/60 text-sm">Web & Coding Club, NIT Patna</p>
            </div>

            {/* Core Values Cards */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="group relative p-5 bg-white/5 border border-white/10 rounded-xl hover:border-orange/50 transition-all duration-300 hover:shadow-glow">
                <div className="absolute inset-0 bg-gradient-to-br from-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <div className="relative">
                  <p className="text-orange font-bold text-lg mb-2 font-tech">LEARN</p>
                  <p className="text-light/60 text-sm">Master cutting-edge technologies</p>
                </div>
              </div>
              
              <div className="group relative p-5 bg-white/5 border border-white/10 rounded-xl hover:border-orange/50 transition-all duration-300 hover:shadow-glow">
                <div className="absolute inset-0 bg-gradient-to-br from-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <div className="relative">
                  <p className="text-orange font-bold text-lg mb-2 font-tech">BUILD</p>
                  <p className="text-light/60 text-sm">Create impactful projects</p>
                </div>
              </div>
              
              <div className="group relative p-5 bg-white/5 border border-white/10 rounded-xl hover:border-orange/50 transition-all duration-300 hover:shadow-glow">
                <div className="absolute inset-0 bg-gradient-to-br from-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <div className="relative">
                  <p className="text-orange font-bold text-lg mb-2 font-tech">INNOVATE</p>
                  <p className="text-light/60 text-sm">Push technological boundaries</p>
                </div>
              </div>
              
              <div className="group relative p-5 bg-white/5 border border-white/10 rounded-xl hover:border-orange/50 transition-all duration-300 hover:shadow-glow">
                <div className="absolute inset-0 bg-gradient-to-br from-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <div className="relative">
                  <p className="text-orange font-bold text-lg mb-2 font-tech">COLLABORATE</p>
                  <p className="text-light/60 text-sm">Connect with like-minded peers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfessorMessage;