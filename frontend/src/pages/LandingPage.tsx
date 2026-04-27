import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun, Sparkles, Brain, Palette, Wand2, Layers, Share2, Zap, ChevronDown, Plus, Minus } from 'lucide-react';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import logoIcon from '../assets/logo.png';
import mentorxLogo from '../assets/logo_transparent.png';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { useAuthStore } from '@/store/authStore';

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="group bg-white dark:bg-[#0b1219] border border-black/5 dark:border-white/5 rounded-xl overflow-hidden transition-all hover:border-blue-500/30 h-fit shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 text-left flex items-start justify-between gap-4"
      >
        <span className="text-[14px] sm:text-[15px] font-bold text-slate-800 dark:text-slate-200 leading-snug">
          {q}
        </span>
        <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-blue-600 text-white rotate-0' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 rotate-0'}`}>
          {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5 text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-50 dark:border-white/5 pt-3">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (location.state?.openAuth) {
      navigate('/login');
      // Clear state after reading
      window.history.replaceState({}, document.title);
    }
  }, [location, navigate, isAuthenticated]);

  const isDark = theme === "dark" ||
    (theme === "system" && document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Refs for the smoky background effect
  const glowRef1 = useRef<HTMLDivElement>(null);
  const glowRef2 = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!glowRef1.current || !glowRef2.current) return;
    
    // Use clientX and clientY because the glow container is 'fixed' to the viewport.
    // This ensures the smoke tracks the cursor perfectly even when scrolling down.
    const x = e.clientX;
    const y = e.clientY;

    // Translate the glow elements to follow the mouse, centered on cursor
    // The sizes are 300px and 150px, so we subtract half to center (150px and 75px)
    glowRef1.current.style.transform = `translate(${x - 150}px, ${y - 150}px)`;
    glowRef2.current.style.transform = `translate(${x - 75}px, ${y - 75}px)`;
  };

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeftPos = React.useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeftPos.current = scrollRef.current?.scrollLeft || 0;
  };
  const onMouseLeave = () => {
    isDragging.current = false;
  };
  const onMouseUp = () => {
    isDragging.current = false;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 }
    );

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }
    
    const scroll = (time: number) => {
      let dt = time - lastTime;
      if (dt > 100) dt = 16; // Clamp large skips if user switches tabs
      lastTime = time;
       
      if (scrollRef.current && isVisible) {
        if (!isDragging.current) {
          scrollRef.current.scrollLeft += (dt * 0.05); 
        }
        
        const halfWidth = scrollRef.current.scrollWidth / 2;
        if (scrollRef.current.scrollLeft >= halfWidth) {
          scrollRef.current.scrollLeft = 1; // small buffer
        } else if (scrollRef.current.scrollLeft <= 0) {
          scrollRef.current.scrollLeft = halfWidth - 1;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };
    animationId = requestAnimationFrame(scroll);
    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, []);

  const shimmerCss = `
    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
    @keyframes shimmer-spin {
      to {
        --angle: 360deg;
      }
    }
    .wave-wrapper > div:nth-child(10n + 1) { margin-top: 0px; }
    .wave-wrapper > div:nth-child(10n + 2) { margin-top: 40px; }
    .wave-wrapper > div:nth-child(10n + 3) { margin-top: 80px; }
    .wave-wrapper > div:nth-child(10n + 4) { margin-top: 40px; }
    .wave-wrapper > div:nth-child(10n + 5) { margin-top: 0px; }
    .wave-wrapper > div:nth-child(10n + 6) { margin-top: -40px; }
    .wave-wrapper > div:nth-child(10n + 7) { margin-top: -80px; }
    .wave-wrapper > div:nth-child(10n + 8) { margin-top: -40px; }
    .wave-wrapper > div:nth-child(10n + 9) { margin-top: 0px; }
    .wave-wrapper > div:nth-child(10n + 10) { margin-top: 40px; }
  `;

  const { scrollYProgress } = useScroll();

  return (
    <div 
      className="min-h-screen bg-[#F1F2F4] dark:bg-slate-950 text-foreground dark:text-slate-100 font-sans flex flex-col items-center justify-between overflow-x-hidden selection:bg-blue-200 relative"
      onMouseMove={handleMouseMove}
    >
      <style>{shimmerCss}</style>
      
      {/* Interactive Smoky Blue Glow Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
        <div
          ref={glowRef1}
          className="absolute top-0 left-0 w-[300px] h-[300px] bg-[#1DA1F2]/30 rounded-full blur-[60px] will-change-transform"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
        <div
          ref={glowRef2}
          className="absolute top-0 left-0 w-[150px] h-[150px] bg-[#3B82F6]/30 rounded-full blur-[40px] will-change-transform"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <AuroraBackground className="w-full flex flex-col justify-start items-center bg-transparent dark:bg-transparent pb-16 pt-0 relative z-[2]">
        {/* Header */}
        <header className="w-full flex justify-between items-center px-8 py-6 max-w-7xl z-50">
          <Link to="/" className="flex items-center gap-3 shrink-0 cursor-pointer">
             <div className="w-12 h-12 flex items-center justify-center">
                <img src={mentorxLogo} alt="MENTORX Logo" className="w-full h-full object-contain" />
             </div>
             <span className="font-bold text-xl tracking-tight text-black dark:text-white">Testimonial-HUB</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-10 text-[14px] font-bold text-slate-600 dark:text-slate-400">
             <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-black dark:hover:text-white transition-all hover:scale-105">Home</button>
             <button onClick={() => document.getElementById('examples-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black dark:hover:text-white transition-all hover:scale-105 flex items-center gap-1">Testimonials <ChevronDown className="w-3.5 h-3.5" /></button>
             <button onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black dark:hover:text-white transition-all hover:scale-105 flex items-center gap-1">Services <ChevronDown className="w-3.5 h-3.5" /></button>
             <button onClick={() => document.getElementById('queries-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black dark:hover:text-white transition-all hover:scale-105 flex items-center gap-1">FAQ <ChevronDown className="w-3.5 h-3.5" /></button>
             <button onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black dark:hover:text-white transition-all hover:scale-105 flex items-center gap-1">About <ChevronDown className="w-3.5 h-3.5" /></button>
          </nav>

          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isDark ? (
                <Sun className="w-5 h-5 cursor-pointer text-slate-300 hover:text-white transition-colors" />
              ) : (
                <Moon className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-black transition-colors" />
              )}
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="relative inline-flex items-center justify-center p-[2px] bg-slate-200 dark:bg-slate-800 rounded-full group cursor-pointer"
            >
              {/* The outer glowing blur */}
              <div 
                className="absolute inset-0 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'conic-gradient(from var(--angle), transparent 25%, #06b6d4, transparent 50%)',
                  animation: 'shimmer-spin 2.5s linear infinite',
                }}
              />
              {/* The actual moving border */}
              <div 
                className="absolute inset-0 rounded-full overflow-hidden"
              >
                <div 
                  className="absolute inset-0 aspect-square w-[200%] h-[200%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background: 'conic-gradient(from var(--angle), transparent 25%, #06b6d4, transparent 50%)',
                    animation: 'shimmer-spin 2.5s linear infinite',
                  }}
                />
              </div>
              
              <span className="relative z-10 inline-flex items-center justify-center w-full h-full px-6 py-2.5 text-sm font-bold text-black dark:text-white bg-[#F1F2F4] dark:bg-slate-950 rounded-full group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors duration-300">
                Sign In
              </span>
            </button>
          </div>
        </header>

        {/* Hero Text */}
        <div className="flex-1 w-full flex flex-col items-center justify-start pt-10 md:pt-20 lg:pt-24 z-10 px-4 text-center mt-4">
        <h1 className="text-[14vw] md:text-[11vw] lg:text-[10vw] leading-[0.8] font-[950] text-black dark:text-white tracking-[-0.05em] w-full text-center whitespace-nowrap px-4 mt-12 mb-6">
            Testimonial-HUB
        </h1>
        <p className="max-w-xl text-muted-foreground dark:text-slate-400 font-serif italic mb-10 mx-auto leading-relaxed text-[13px] sm:text-[15px] mt-8">
          Convert WhatsApp feedback into powerful testimonials. Upload a screenshot,
          and we'll handle the rest — extraction, design, export.
        </p>

        <div className="flex items-center justify-center gap-4 mb-24">
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            Enter Dashboard <span className="text-xl leading-none">→</span>
          </button>
          <button 
            onClick={() => document.getElementById('examples-section')?.scrollIntoView({ behavior: 'smooth' })} 
            className="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border border-border/80 dark:border-slate-700 text-foreground dark:text-slate-100 px-8 py-3.5 rounded-2xl font-semibold transition-all flex items-center justify-center shadow-sm"
          >
            View Examples
          </button>
        </div>
        </div>
      </AuroraBackground>

      <main id="examples-section" className="w-full flex flex-col items-center justify-start z-10 text-center">
        {/* 3D Cards */}
        <div className="w-full mb-0 z-20 relative -mt-8" style={{ perspective: "1000px" }}>
          {/* Fading Edges (Outside scroll container so they don't move) */}
          <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#F1F2F4] dark:from-slate-950 to-transparent z-30 pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#F1F2F4] dark:from-slate-950 to-transparent z-30 pointer-events-none"></div>
          
          {/* Native Scrolling Wrapper */}
          <div 
            className="w-full flex justify-start overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab active:cursor-grabbing"
            ref={scrollRef}
            onMouseLeave={onMouseLeave}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onTouchStart={() => { isDragging.current = true; }}
            onTouchEnd={() => { isDragging.current = false; }}
          >
            <div className="flex w-max pt-24 pb-24 select-none">
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="wave-wrapper flex gap-4 xl:gap-8 items-center justify-center shrink-0 px-2 sm:px-4">
                <CardContainer className="inter-var origin-right shrink-0">
                  <CardBody className="bg-[#0b141a] relative group/card w-[280px] sm:w-[320px] h-[340px] rounded-xl p-6 border border-white/5 shadow-2xl flex flex-col justify-between">
                    <CardItem translateY={20} className="flex items-center gap-3 text-white mb-6">
                      <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" /></svg>
                      </div>
                      <div>
                        <p className="font-bold text-sm">WhatsApp</p>
                        <p className="text-xs text-slate-400">Pavithra • 3:45 PM</p>
                      </div>
                    </CardItem>
                    <CardItem translateZ={50} translateY={10} className="bg-[#054c2a] text-[#e9edef] p-3 rounded-lg rounded-tr-sm text-[13px] leading-relaxed shadow-md mb-2 w-[85%] self-end ml-auto text-left">
                      Hey! Just wanted to say your tool is incredible 🔥
                    </CardItem>
                    <CardItem translateZ={60} translateY={15} className="bg-[#054c2a] text-[#e9edef] p-3 rounded-lg text-[13px] leading-relaxed shadow-md w-[85%] self-end ml-auto text-left flex flex-col">
                      <span>Saved us hours every week. Worth every penny!</span>
                      <div className="text-[9px] text-white/50 self-end mt-1 flex items-center gap-1">read <span className="text-blue-400 text-[10px]">✓✓</span></div>
                    </CardItem>
                    <CardItem translateZ={40} className="mt-8 flex items-center justify-center gap-2 text-indigo-400 text-xs font-semibold">
                      <Sparkles className="w-3 h-3" /> Detecting feedback...
                    </CardItem>
                  </CardBody>
                </CardContainer>

                <CardContainer className="inter-var origin-left shrink-0">
                  <CardBody className="bg-gradient-to-br from-[#1c225b] to-[#0e0d29] relative group/card w-[280px] sm:w-[320px] h-[340px] rounded-2xl p-8 shadow-2xl flex flex-col justify-between">
                    <CardItem translateZ={30} className="flex items-center gap-1 text-cyan-400 mb-6 text-xl tracking-widest w-full font-serif">
                      ★★★★★ <span className="ml-auto bg-transparent border border-blue-500/30 text-blue-300 text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wider">AUTO-GENERATED</span>
                    </CardItem>
                    <CardItem translateZ={50} className="text-[17px] font-medium text-white leading-relaxed text-left mt-2">
                      "Your tool is incredible. Saved us <span className="text-[#a78bfa]">hours</span> every week. Worth every penny!"
                    </CardItem>
                    <CardItem translateZ={40} className="flex items-center gap-3 mt-10 text-left w-full">
                      <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-[#1c225b] font-bold text-sm shadow-sm">
                        P
                      </div>
                      <div>
                        <p className="text-white font-bold text-[13px]">Pavithra Addanki</p>
                        <p className="text-slate-400 tracking-wide text-[11px] font-semibold">Product Manager</p>
                      </div>
                    </CardItem>
                  </CardBody>
                </CardContainer>

                <CardContainer className="inter-var origin-left shrink-0">
                  <CardBody className="bg-gradient-to-br from-[#1b263b] to-[#0d161f] relative group/card w-[280px] sm:w-[320px] h-[340px] rounded-2xl p-8 shadow-2xl flex flex-col justify-between">
                    <CardItem translateZ={30} className="flex items-center gap-1 text-amber-400 mb-6 text-xl tracking-widest w-full font-serif">
                      ★★★★★ <span className="ml-auto bg-transparent border border-emerald-500/30 text-emerald-300 text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wider">TWITTER READY</span>
                    </CardItem>
                    <CardItem translateZ={50} className="text-[17px] font-medium text-white leading-relaxed text-left mt-2">
                      "Testimonial-HUB is an absolute game changer. We generated <span className="text-[#60a5fa]">20 beautiful cards</span> in under a minute!"
                    </CardItem>
                    <CardItem translateZ={40} className="flex items-center gap-3 mt-10 text-left w-full">
                      <div className="w-9 h-9 rounded-full bg-emerald-200 flex items-center justify-center text-[#0d161f] font-bold text-sm shadow-sm">
                        M
                      </div>
                      <div>
                        <p className="text-white font-bold text-[13px]">Mubeen</p>
                        <p className="text-slate-400 tracking-wide text-[11px] font-semibold">Marketing Director</p>
                      </div>
                    </CardItem>
                  </CardBody>
                </CardContainer>

                <CardContainer className="inter-var origin-bottom shrink-0">
                  <CardBody className="bg-gradient-to-br from-[#3b0b18] to-[#12040b] relative group/card w-[280px] sm:w-[320px] h-[340px] rounded-2xl p-8 border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-[50px] rounded-full pointer-events-none" />
                    <CardItem translateZ={30} className="flex items-center gap-1 text-rose-300 mb-6 text-xl tracking-widest w-full font-serif z-10">
                      ★★★★★ <span className="ml-auto bg-white/5 border border-rose-500/30 text-rose-200 text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wider shadow-sm">LINKEDIN POST</span>
                    </CardItem>
                    <CardItem translateZ={50} className="text-[17px] font-medium text-white leading-relaxed text-left mt-2 z-10">
                      "Literally took seconds. Our conversion rate jumped by <span className="text-rose-400 font-bold">15%</span> right after placing these."
                    </CardItem>
                    <CardItem translateZ={40} className="flex items-center gap-3 mt-10 text-left w-full z-10">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/20">
                        S
                      </div>
                      <div>
                        <p className="text-white font-bold text-[13px]">Sahithi</p>
                        <p className="text-rose-300/70 tracking-wide text-[11px] font-semibold">Founding Designer</p>
                      </div>
                    </CardItem>
                  </CardBody>
                </CardContainer>

                <CardContainer className="inter-var origin-left shrink-0">
                  <CardBody className="bg-gradient-to-br from-[#3b1236] to-[#170514] relative group/card w-[280px] sm:w-[320px] h-[340px] rounded-2xl p-8 border border-fuchsia-500/10 shadow-2xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 blur-[50px] rounded-full pointer-events-none" />
                    <CardItem translateZ={30} className="flex items-center gap-1 text-fuchsia-300 mb-6 text-xl tracking-widest w-full font-serif z-10">
                      ★★★★★ <span className="ml-auto bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-200 text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wider shadow-sm">VIRAL READY</span>
                    </CardItem>
                    <CardItem translateZ={50} className="text-[17px] font-medium text-white leading-relaxed text-left mt-2 z-10">
                      "This is hands down the best investment for our team. We saw a <span className="text-fuchsia-400 font-bold bg-fuchsia-500/10 px-1 rounded">2x increase</span> in clicks within days."
                    </CardItem>
                    <CardItem translateZ={40} className="flex items-center gap-3 mt-10 text-left w-full z-10">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/20">
                        S
                      </div>
                      <div>
                        <p className="text-white font-bold text-[13px]">Sneha</p>
                        <p className="text-fuchsia-300/70 tracking-wide text-[11px] font-semibold">Content Strategist</p>
                      </div>
                    </CardItem>
                  </CardBody>
                </CardContainer>

                <CardContainer className="inter-var origin-right shrink-0">
                  <CardBody className="bg-[#000000] relative group/card w-[280px] sm:w-[320px] h-[340px] rounded-2xl p-6 border border-white/5 shadow-2xl flex flex-col justify-between">
                    <CardItem translateY={20} className="flex items-center gap-3 text-white mb-6">
                      <div className="w-8 h-8 rounded-full bg-[#0A84FF] flex items-center justify-center text-white font-black text-[12px]">iM</div>
                      <div>
                        <p className="font-bold text-sm">Keerthana</p>
                        <p className="text-xs text-slate-400">Today 10:12 AM</p>
                      </div>
                    </CardItem>
                    <CardItem translateZ={50} translateY={10} className="bg-[#0A84FF] text-white p-3.5 rounded-2xl rounded-br-sm text-[13px] leading-relaxed shadow-md mb-2 w-[85%] self-end ml-auto text-left">
                      It used to take me a whole day to collect and format reviews. Now? 5 minutes flat.
                    </CardItem>
                    <CardItem translateZ={60} translateY={15} className="bg-[#0A84FF] text-white p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-md w-[85%] self-end ml-auto text-left flex flex-col">
                      <span>Absolutely magnificent tool ✨</span>
                      <div className="text-[9px] text-white/70 self-end mt-1 flex items-center gap-1">Delivered</div>
                    </CardItem>
                    <CardItem translateZ={40} className="mt-8 flex items-center justify-center gap-2 text-indigo-400 text-xs font-semibold">
                      <Sparkles className="w-3 h-3" /> Converted beautifully
                    </CardItem>
                  </CardBody>
                </CardContainer>

                <CardContainer className="inter-var origin-left shrink-0">
                  <CardBody className="bg-gradient-to-br from-[#062414] to-[#020b06] relative group/card w-[280px] sm:w-[320px] h-[340px] rounded-2xl p-8 border border-emerald-500/10 shadow-2xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
                    <CardItem translateZ={30} className="flex items-center gap-1 text-emerald-400 mb-6 text-xl tracking-widest w-full font-serif z-10">
                      ★★★★★ <span className="ml-auto bg-transparent border border-emerald-500/30 text-emerald-300 text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wider shadow-sm">SITE EMBED</span>
                    </CardItem>
                    <CardItem translateZ={50} className="text-[17px] font-medium text-white leading-relaxed text-left mt-2 z-10">
                      "Insane value. If you're not using this, you are <span className="text-emerald-400 font-bold bg-emerald-950 px-1 rounded">leaving money</span> on the table."
                    </CardItem>
                    <CardItem translateZ={40} className="flex items-center gap-3 mt-10 text-left w-full z-10">
                      <div className="w-9 h-9 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-md border border-emerald-500/30">
                        Sr
                      </div>
                      <div>
                        <p className="text-white font-bold text-[13px]">Sruthi</p>
                        <p className="text-emerald-400/60 tracking-wide text-[11px] font-semibold">Startup Founder</p>
                      </div>
                    </CardItem>
                  </CardBody>
                </CardContainer>

                <CardContainer className="inter-var origin-bottom shrink-0">
                  <CardBody className="bg-gradient-to-br from-[#2a2414] to-[#0a0904] relative group/card w-[280px] sm:w-[320px] h-[340px] rounded-2xl p-8 border border-amber-500/10 shadow-2xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
                    <CardItem translateZ={30} className="flex items-center gap-1 text-amber-500 mb-6 text-xl tracking-widest w-full font-serif z-10">
                      ★★★★★ <span className="ml-auto bg-black/40 border border-amber-500/30 text-amber-300 text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wider shadow-sm">NEWSLETTER</span>
                    </CardItem>
                    <CardItem translateZ={50} className="text-[17px] font-medium text-amber-50/90 leading-relaxed text-left mt-2 z-10 font-serif italic">
                      "Everything looks so premium. Our newsletter click-through rate exploded the moment we added these."
                    </CardItem>
                    <CardItem translateZ={40} className="flex items-center gap-3 mt-10 text-left w-full z-10">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-extrabold text-sm shadow-md border border-white/20">
                        T
                      </div>
                      <div>
                        <p className="text-white font-bold text-[13px]">Thanuja</p>
                        <p className="text-amber-400/70 tracking-wide text-[11px] font-semibold">Creative Director</p>
                      </div>
                    </CardItem>
                  </CardBody>
                </CardContainer>

                <CardContainer className="inter-var origin-left shrink-0">
                  <CardBody className="bg-[#111827] relative group/card w-[280px] sm:w-[320px] h-[340px] rounded-2xl p-8 border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col justify-between overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />
                    <CardItem translateZ={30} className="flex items-center gap-1 text-cyan-400 mb-6 text-xl tracking-widest w-full font-serif z-10">
                      ★★★★★ <span className="ml-auto text-slate-400 text-[9px] font-bold tracking-widest uppercase">VERIFIED</span>
                    </CardItem>
                    <CardItem translateZ={50} className="text-[16px] font-medium text-slate-200 leading-relaxed text-left mt-2 z-10">
                      "Our signups surged by <span className="text-cyan-400 font-bold bg-cyan-400/10 px-1 rounded">22%</span> after we embedded the generated wall. Completely phenomenal."
                    </CardItem>
                    <CardItem translateZ={40} className="flex items-center gap-3 mt-10 text-left w-full z-10">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 font-bold text-sm shadow-md border border-slate-600">
                        S
                      </div>
                      <div>
                        <p className="text-slate-100 font-bold text-[13px]">Sandeep</p>
                        <p className="text-slate-500 tracking-wide text-[11px] font-bold">Growth Lead</p>
                      </div>
                    </CardItem>
                  </CardBody>
                </CardContainer>

                <CardContainer className="inter-var origin-right shrink-0">
                  <CardBody className="bg-gradient-to-br from-[#2b0811] to-[#0a0204] relative group/card w-[280px] sm:w-[320px] h-[340px] rounded-2xl p-8 border border-orange-500/10 shadow-2xl flex flex-col justify-between overflow-hidden">
                    <CardItem translateZ={30} className="flex items-center gap-1 text-orange-400 mb-6 text-xl tracking-widest w-full font-serif z-10">
                      ★★★★★ <span className="ml-auto bg-orange-600/20 text-orange-300 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-orange-500/30">#BUILDINPUBLIC</span>
                    </CardItem>
                    <CardItem translateZ={50} className="text-[17px] font-medium text-white leading-relaxed text-left mt-2 z-10">
                      "Just shipped my product and already got <span className="text-orange-400 font-bold border-b border-orange-400/30">50 reviews</span> looking simply stunning everywhere."
                    </CardItem>
                    <CardItem translateZ={40} className="flex items-center gap-3 mt-10 text-left w-full z-10">
                      <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-black font-black text-[12px] shadow-md border border-white/10">
                        CH
                      </div>
                      <div>
                        <p className="text-white font-bold text-[13px]">Charan</p>
                        <p className="text-orange-400/60 tracking-wide text-[11px] font-semibold">Indie Hacker</p>
                      </div>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>

    {/* Features Section */}
      <section id="features-section" className="w-full bg-transparent pt-4 pb-16 md:pb-24 flex flex-col items-center justify-center relative overflow-hidden text-center px-4">

        {/* Text Block Wrap w/ Background */}
        <div className="relative flex flex-col items-center justify-center w-full translate-y-12 sm:translate-y-16">

          {/* Giant Background Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 w-full flex justify-center">
            <h2 className="text-[17vw] leading-[0.8] font-black text-black/[0.03] dark:text-white/[0.02] tracking-tight uppercase whitespace-nowrap px-4 w-full text-center">
              Features
            </h2>
          </div>

          {/* Heading */}
          <h3 className="relative z-10 text-4xl md:text-5xl lg:text-6xl font-bold text-foreground dark:text-white max-w-4xl leading-[1.15] tracking-tight">
            Everything you need to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#c084fc] via-[#818cf8] to-cyan-400">
              turn<br className="hidden sm:block" />praise into proof
            </span>
          </h3>

          {/* Subtitle */}
          <p className="max-w-xl text-muted-foreground dark:text-slate-400 font-serif italic mt-8 mx-auto leading-relaxed text-[12px] sm:text-[14px] px-4">
            Six superpowers that take testimonials from buried in a chat thread to the front page of your website.
          </p>
        </div>

        {/* Features Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl mx-auto mt-24 mb-16 px-4 sm:px-8 translate-y-12 sm:translate-y-16">
          {[
            { icon: Brain, title: "AI text extraction", desc: "Upload a screenshot. Our model parses sender, message, and timestamp with 99% accuracy.", glow: "from-purple-500", text: "text-purple-500 dark:text-purple-400" },
            { icon: Palette, title: "20+ templates", desc: "From minimalist editorial to neon brutalism. Templates designed by working designers, not AI.", glow: "from-blue-500", text: "text-blue-500 dark:text-blue-400" },
            { icon: Wand2, title: "Brand-aware styling", desc: "Drop your logo and brand colors once. Every testimonial inherits your visual language.", glow: "from-rose-500", text: "text-rose-500 dark:text-rose-400" },
            { icon: Layers, title: "Bulk generate", desc: "Convert 50 testimonials at once. Auto-rotate through templates for a varied feed.", glow: "from-purple-500", text: "text-purple-500 dark:text-purple-400" },
            { icon: Share2, title: "Export anywhere", desc: "PNG, JPG, HTML, PDF, or one-click share to LinkedIn, Instagram, and your testimonial wall.", glow: "from-blue-500", text: "text-blue-500 dark:text-blue-400" },
            { icon: Zap, title: "Live in seconds", desc: "Hosted testimonial walls with your subdomain. Drop them on your site with a single line.", glow: "from-rose-500", text: "text-rose-500 dark:text-rose-400" },
          ].map((feature, idx) => (
            <div key={idx} className="bg-card dark:bg-[#0b1219] p-6 sm:p-8 rounded-2xl border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-none text-left flex flex-col gap-5 hover:-translate-y-1 hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 group overflow-hidden relative z-0">
              {/* Expanding solid circle from top-left */}
              <div className="absolute top-6 left-6 sm:top-8 sm:left-8 w-12 h-12 bg-[#0a192f] dark:bg-slate-100 rounded-full scale-0 group-hover:scale-[35] transition-transform duration-700 ease-out z-0 origin-center" />

              <div className="w-12 h-12 rounded-xl bg-accent dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center shadow-sm relative z-10 group-hover:scale-110 group-hover:bg-white/10 dark:group-hover:bg-black/5 transition-all duration-500">
                <feature.icon className={`w-5 h-5 ${feature.text} group-hover:text-white dark:group-hover:text-black transition-colors duration-500`} />
              </div>
              <div className="relative z-10">
                <h4 className="text-foreground dark:text-white font-bold text-[17px] tracking-tight mb-2.5 transition-colors duration-500 group-hover:text-white dark:group-hover:text-black">{feature.title}</h4>
                <p className="text-muted-foreground dark:text-slate-400 text-[13px] sm:text-sm leading-relaxed font-medium transition-colors duration-500 group-hover:text-slate-300 dark:group-hover:text-slate-700">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Queries Section (FAQ) */}
      <section id="queries-section" className="w-full bg-transparent pt-24 pb-32 flex flex-col items-center justify-center relative overflow-hidden px-4">
        <div className="relative flex flex-col items-center justify-center w-full mb-16">
          {/* Giant Background Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 w-full flex justify-center">
            <h2 className="text-[17vw] leading-[0.8] font-black text-black/[0.03] dark:text-white/[0.02] tracking-tight uppercase whitespace-nowrap px-4 w-full text-center">
              FAQ
            </h2>
          </div>
          <h3 className="relative z-10 text-3xl md:text-5xl font-bold text-foreground dark:text-white tracking-tight uppercase">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 relative z-10 px-4">
          {[
            {
              q: "How does TestimonialHub extract testimonials from WhatsApp screenshots?",
              a: "You simply upload a screenshot. Our AI uses OCR to read the text, then Gemini AI filters out noise like timestamps, 'read more' buttons, and tick marks — leaving only the pure customer quote, name, and star rating. No manual copy-pasting ever."
            },
            {
              q: "Is my customer data and WhatsApp conversation safe when I upload screenshots?",
              a: "Absolutely. Your screenshots are processed in real-time and never stored permanently on our servers. The AI reads the image, extracts only the testimonial text, and the original screenshot is deleted immediately after processing. Your customers' private conversations stay private — we only keep the final cleaned testimonial that you approve and save yourself."
            },
            {
              q: "How long does it take to go from screenshot to a publish-ready testimonial card?",
              a: "Under 60 seconds. Upload your WhatsApp screenshot, AI extracts and cleans it, you pick a design theme, and your card is ready to export as PNG, JPG, or embed directly on your website."
            },
            {
              q: "Do I need any design or technical skills to use this?",
              a: "Zero. TestimonialHub is built for business owners and marketers, not designers or developers. If you can take a screenshot and click a button, you can create professional testimonial cards and embed them on your website."
            }
          ].map((item, idx) => (
            <FAQItem key={idx} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* Footer / Info */}
      <footer id="about-section" className="w-full relative overflow-hidden bg-card/50 dark:bg-slate-950/50 pt-20 border-t border-black/5 dark:border-white/5 mt-10">
        <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col md:flex-row gap-12 justify-between mb-8">
          <div className="max-w-sm">
             <div className="mb-4">
                {/* Logo removed */}
             </div>
            <p className="text-muted-foreground dark:text-slate-400 font-medium text-[13px] leading-relaxed mb-4">
              Convert WhatsApp feedback into powerful testimonials.<br />
              Built for modern teams that ship social proof daily.
            </p>
          </div>
          <div className="flex gap-20">
            <div>
              <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">Product</h4>
              <ul className="space-y-4 text-sm font-semibold text-slate-600 dark:text-slate-500">
                <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Features</li>
                <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Templates</li>
                <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">Company</h4>
              <ul className="space-y-4 text-sm font-semibold text-slate-600 dark:text-slate-500">
                <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">About</li>
                <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Privacy</li>
                <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Terms</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="w-full relative z-0 mt-12 flex flex-col items-center justify-center pb-6 overflow-hidden">
          <motion.h1 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.8 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.04,
                  delayChildren: 0.1,
                }
              }
            }}
            className="text-[14vw] md:text-[11vw] lg:text-[10vw] leading-[0.8] font-[950] text-black dark:text-white tracking-[-0.05em] w-full text-center whitespace-nowrap px-4"
          >
            {"Testimonial-HUB".split("").map((char, index) => (
              <motion.span
                key={index}
                variants={{
                  hidden: { opacity: 0, x: -30, filter: "blur(8px)" },
                  visible: { opacity: 1, x: 0, filter: "blur(0px)" }
                }}
                transition={{ 
                  duration: 0.5, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>
          <p className="text-[10px] font-bold tracking-[0.3em] text-slate-400 dark:text-slate-600 mt-4 uppercase">
            MXC IGNITE LLP
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
