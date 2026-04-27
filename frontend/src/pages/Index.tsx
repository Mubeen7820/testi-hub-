import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useTestimonialStore } from '../store/testimonialStore';
import { UploadPanel } from '../components/UploadPanel';
import { EditPanel } from '../components/EditPanel';
import { TemplatePicker } from '../components/TemplatePicker';
import { PreviewPanel } from '../components/PreviewPanel';

const Index: React.FC = () => {
  const { step, setStep, history, loadHistory, removeFromHistory } = useTestimonialStore();

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="min-h-screen bg-background">


      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
        {step === 0 ? (
          /* Step 0: Upload */
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Turn feedback into <span className="gradient-text">art</span>
              </h2>
              <p className="text-muted-foreground">Upload a WhatsApp screenshot or paste your feedback</p>
            </div>
            <UploadPanel />
          </div>
        ) : (
          /* Step 1: Edit + Preview */
          <div>
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> New upload
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Edit */}
              <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
                <EditPanel />
                <TemplatePicker />
              </div>
              {/* Right: Preview */}
              <div className="lg:sticky lg:top-6 self-start">
                <PreviewPanel />
              </div>
            </div>
          </div>
        )}

        {/* History Section - Real Time Data */}
        {history.length > 0 && (
          <div className="pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Recent Feed</h3>
                <p className="text-sm text-muted-foreground">Your real-time testimonial history</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item, i) => (
                <div key={i} className="group relative glass rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all p-4">
                  <button 
                    onClick={() => removeFromHistory(i)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    ×
                  </button>
                  <div className="scale-75 origin-top-left" style={{ width: '133.33%' }}>
                     <div className="pointer-events-none">
                        <p className="text-sm italic line-clamp-3 mb-2">"{item.feedback}"</p>
                        <div className="flex items-center gap-2">
                          <img 
                            src={item.profileImage || "/logo.png"} 
                            alt={item.name} 
                            className="w-6 h-6 rounded-full object-cover border border-border/50" 
                          />
                          <span className="text-xs font-medium">{item.name || 'Anonymous'}</span>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
