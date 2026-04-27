import React from 'react';
import { useTestimonialStore } from '../store/testimonialStore';
import { Trash2, Edit, Search, Filter, LayoutGrid, ScrollText, CircleDot, Grid3X3, Clock, Calendar, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { TestimonialData } from '../types/testimonial';
import { templateMap } from '../components/TestimonialTemplates';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const TestimonialCard: React.FC<{ item: TestimonialData | undefined; layout: string }> = ({ item, layout }) => {
  if (!item) return null;
  
  const Template = templateMap[(item.template as keyof typeof templateMap)] || templateMap.minimal;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02 }}
      className={`
        bg-transparent transition-all duration-500 relative group overflow-hidden
        ${layout === 'scrollable' ? 'w-full rounded-[2.5rem] shadow-md border border-black/5 dark:border-white/5' : ''}
        ${layout === 'circular' ? 'w-[350px] aspect-square rounded-full shadow-lg border border-black/5 dark:border-white/5' : ''}
        ${layout === '3x3' ? 'aspect-[4/3] rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5' : ''}
        ${layout === 'grid' ? 'rounded-[2.5rem] shadow-md border border-black/5 dark:border-white/5' : ''}
      `}
    >
      <div className={`w-full h-full relative ${layout === 'circular' ? 'scale-90 flex items-center justify-center' : ''}`}>
        <Template data={item} showWatermark={false} />
        {/* Overlay to prevent interaction with inner template links/buttons and provide clean hover */}
        <div className="absolute inset-0 z-10 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export const WallOfLove: React.FC = () => {
  const { history, setStep, loadHistory } = useTestimonialStore();
  const navigate = useNavigate();

  const [search, setSearch] = React.useState("");
  const [filterName, setFilterName] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("");
  const [filterCompany, setFilterCompany] = React.useState("");
  const [layout, setLayout] = React.useState<"grid" | "scrollable" | "circular" | "3x3">("grid");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const filteredHistory = React.useMemo(() => {
    return history.filter(item => {
      const query = search.toLowerCase();
      const matchesSearch = !search || 
        (item.feedback || "").toLowerCase().includes(query) ||
        (item.name || "").toLowerCase().includes(query);
      const matchesName = !filterName || (item.name || "").toLowerCase().includes(filterName.toLowerCase());
      const matchesRole = !filterRole || (item.role || "").toLowerCase().includes(filterRole.toLowerCase());
      const matchesCompany = !filterCompany || (item.company || "").toLowerCase().includes(filterCompany.toLowerCase());
      
      return matchesSearch && matchesName && matchesRole && matchesCompany;
    });
  }, [history, search, filterName, filterRole, filterCompany]);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (layout !== 'scrollable') return;
      if (e.key === 'ArrowLeft') setActiveIndex(prev => Math.max(0, prev - 1));
      if (e.key === 'ArrowRight') setActiveIndex(prev => Math.min(filteredHistory.length - 1, prev + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layout, filteredHistory.length]);

  // Clamp activeIndex when filtered history changes
  React.useEffect(() => {
    if (activeIndex >= filteredHistory.length && filteredHistory.length > 0) {
      setActiveIndex(filteredHistory.length - 1);
    } else if (filteredHistory.length === 0) {
      setActiveIndex(0);
    }
  }, [filteredHistory.length, activeIndex]);

  const handleEdit = (item: any) => {
    setStep(0);
    navigate('/create');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Row: Title | Search | Layouts */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-6 xl:gap-10">
        <div className="shrink-0">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap uppercase">Wall of Love</h1>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Feedback Gallery</p>
        </div>

        {/* Big Central Search Bar */}
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search testimonials, content, or authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-md py-2 px-14 text-sm font-semibold focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-md border border-black/5 dark:border-white/5 shadow-sm shrink-0">
          {[
            { id: 'grid', icon: LayoutGrid, label: 'Grid' },
            { id: 'scrollable', icon: ScrollText, label: 'Side Scroll' },
            { id: 'circular', icon: CircleDot, label: 'Circular' },
            { id: '3x3', icon: Grid3X3, label: '3x3' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setLayout(mode.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
                layout === mode.id
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg shadow-black/5 ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <mode.icon className="w-4 h-4" />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Filter Bar Removed as per user request */}

      <AnimatePresence mode="wait">
        {filteredHistory.length > 0 ? (
          <div className="relative group/carousel">


            <motion.div
              key={layout}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className={`
                ${layout === 'grid' ? 'columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8' : ''}
                ${layout === 'scrollable' ? 'flex overflow-x-auto py-10 gap-8 scrollbar-hide snap-x px-8 items-center min-h-[400px]' : ''}
                ${layout === 'circular' ? 'flex flex-wrap justify-center gap-8 items-center max-w-6xl mx-auto' : ''}
                ${layout === '3x3' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}
              `}
            >
              {layout === 'scrollable' ? (
                filteredHistory.map((item, i) => (
                  <div key={item.id || i} className="shrink-0 w-full max-w-[600px] snap-center">
                    <TestimonialCard item={item} layout={layout} />
                  </div>
                ))
              ) : (
                filteredHistory.map((item, i) => (
                  <div key={item.id || i} className={layout === 'grid' ? 'break-inside-avoid' : ''}>
                    <TestimonialCard item={item} layout={layout} />
                  </div>
                ))
              )}
            </motion.div>

            {layout === 'scrollable' && (
               <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-2 z-10">
                  <button 
                     onClick={(e) => {
                        const container = (e.currentTarget.parentElement?.parentElement as HTMLElement).querySelector('.overflow-x-auto');
                        container?.scrollBy({ left: -400, behavior: 'smooth' });
                     }}
                     className="pointer-events-auto w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-all"
                  >
                     <ChevronLeft className="w-5 h-5 text-slate-900 dark:text-white" />
                  </button>
                  <button 
                     onClick={(e) => {
                        const container = (e.currentTarget.parentElement?.parentElement as HTMLElement).querySelector('.overflow-x-auto');
                        container?.scrollBy({ left: 400, behavior: 'smooth' });
                     }}
                     className="pointer-events-auto w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-all"
                  >
                     <ChevronRight className="w-5 h-5 text-slate-900 dark:text-white" />
                  </button>
               </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-slate-900/40 border-2 border-dashed border-black/5 dark:border-white/10 rounded-xl p-20 text-center"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-md flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto font-medium">We couldn't find any testimonials matching your filters. Try adjusting your search criteria.</p>
            <button 
              onClick={() => {
                setSearch(""); setFilterName(""); setFilterRole(""); setFilterCompany("");
              }}
              className="text-sm font-black text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WallOfLove;
