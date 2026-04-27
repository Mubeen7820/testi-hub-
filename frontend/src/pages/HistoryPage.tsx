import React from 'react';
import { useTestimonialStore } from '../store/testimonialStore';
import { Trash2, Edit, History as HistoryIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { templateMap } from '../components/TestimonialTemplates';

const HistoryPage = () => {
  const { history = [], removeFromHistory, updateData, setStep, loadHistory, updateTestimonialStatus } = useTestimonialStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    loadHistory().catch(err => {
      console.error("History load failed:", err);
    });
  }, [loadHistory]);

  const handleEdit = (item: any) => {
    if (!item) return;
    updateData(item);
    setStep(1);
    navigate('/create');
    toast.info("Editing testimonial...");
  };

  const handleDelete = (id: string, index: number) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      removeFromHistory(index);
      toast.success("Testimonial deleted");
    }
  };

  // Final safety check for history being an array
  const safeHistory = Array.isArray(history) ? history : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-0">
      <div className="shrink-0">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">History</h1>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Manage and edit your previous testimonials</p>
      </div>

      {safeHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeHistory.map((item, i) => {
            if (!item) return null;
            const isPending = !item.isExported;
            
            return (
              <div 
                key={item.id || `history-${i}`} 
                className={`relative bg-white dark:bg-slate-900 rounded-[2rem] border overflow-hidden transition-all flex flex-col ${
                  isPending 
                    ? 'border-rose-200 dark:border-rose-500/20 shadow-md shadow-rose-500/10' 
                    : 'border-black/5 dark:border-white/5 shadow-md shadow-black/5'
                }`}
              >
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <button 
                    onClick={async () => {
                      const newStatus = !item.isExported;
                      const toastId = toast.loading(`Marking as ${newStatus ? 'Completed' : 'Pending'}...`);
                      try {
                        await updateTestimonialStatus(item.id || '', newStatus);
                        toast.success(`Marked as ${newStatus ? 'Completed' : 'Pending'}`, { id: toastId });
                      } catch (e) {
                        toast.error("Failed to update status", { id: toastId });
                      }
                    }}
                    className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 ${
                      item.isExported 
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                        : 'bg-amber-500 text-white shadow-amber-500/20'
                    }`}
                  >
                    {item.isExported ? 'Completed' : 'Pending'}
                  </button>
                </div>

                <div className="flex-1 w-full relative group">
                   {/* Render actual template used during creation */}
                   {(() => {
                     const Template = templateMap[(item.template as keyof typeof templateMap)] || templateMap.minimal;
                     return <Template data={item} showWatermark={false} />;
                   })()}
                   
                   {/* Hover overlay for absolute positioned content protection */}
                   <div className="absolute inset-0 z-10 pointer-events-none" />
                </div>

                {/* Footer: Actions */}
                <div className="bg-white dark:bg-slate-900 shrink-0 p-3 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-1 relative z-20">
                   <button 
                      onClick={() => handleEdit(item)}
                      className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id || '', i)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/5">
           <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No History Yet</h3>
           <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-sm">Start by creating your first testimonial!</p>
           <button onClick={() => navigate('/create')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-bold text-sm">Create Now</button>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
