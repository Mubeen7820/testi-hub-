import React from 'react';
import { useTestimonialStore } from '../store/testimonialStore';
import { UploadPanel } from '../components/UploadPanel';
import { EditPanel } from '../components/EditPanel';
import { TemplatePicker } from '../components/TemplatePicker';
import { PreviewPanel } from '../components/PreviewPanel';
import { ArrowLeft } from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const CreateTestimonial = () => {
  const { step, setStep } = useTestimonialStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (!user.businessName || !user.businessType)) {
      const isOriginalAccount = user.email === 'thavishisahithiiiii@gmail.com';
      const hasHistory = localStorage.getItem(`testimonial_history_${user.id}`) || (isOriginalAccount && localStorage.getItem('testimonial_history'));
      
      if (!hasHistory) {
        navigate('/settings', { replace: true, state: { missingInfo: true } });
      }
    }
  }, [user, navigate]);

  // Warn on tab close/refresh if they have unsaved work
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (step > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step]);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
         <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Create Testimonial</h2>
         {step === 1 && (
            <button
               onClick={() => setStep(0)}
               className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground bg-card border border-border px-4 py-2 rounded-lg transition-colors"
             >
               <ArrowLeft className="w-4 h-4" /> Reset & New Upload
             </button>
         )}
      </div>

      {step === 0 ? (
        /* Step 0: Upload */
        <div className="max-w-2xl mx-auto mt-12 bg-card p-8 rounded-2xl border border-border shadow-sm">
          <UploadPanel />
        </div>
      ) : step === 1 ? (
        /* Step 1: Edit */
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Edit */}
            <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">
              <EditPanel />
            </div>
            {/* Right: Preview */}
            <div className="lg:sticky lg:top-6 p-4 rounded-xl border border-border bg-muted/50">
              <PreviewPanel />
            </div>
          </div>
        </div>
      ) : (
        /* Step 2: Choose Template & Customize */
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Templates */}
            <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">
              <div className="flex items-center gap-4 mb-4">
                 <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5"/> Back to Edit
                 </button>
                 <h3 className="text-xl font-bold text-foreground">Choose Template</h3>
              </div>
              <TemplatePicker />
            </div>
            {/* Right: Preview */}
            <div className="lg:sticky lg:top-6 p-4 rounded-xl border border-border bg-muted/50">
              <PreviewPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// export default CreateTestimonial; // Commenting out to force named import in App.tsx
