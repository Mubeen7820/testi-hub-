import React, { useEffect } from 'react';
import { Star, Camera, Sparkles } from 'lucide-react';
import { useTestimonialStore } from '../store/testimonialStore';
import { suggestEmojis, analyzeSentiment } from '../lib/sentiment';
import { chatWithAI } from '../lib/gemini';
import { toast } from 'sonner';

export const EditPanel: React.FC = () => {
  const { data, updateData, setStep } = useTestimonialStore();
  const emojis = suggestEmojis(data.tone);

  const [isTimeLive, setIsTimeLive] = React.useState(true);

  // Keep time ticking
  useEffect(() => {
    if (!isTimeLive) return;
    
    // Instantly set correctly
    const setLive = () => {
       const now = new Date();
       updateData({
          date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
       });
    };
    
    setLive();
    const timer = setInterval(setLive, 1000);
    return () => clearInterval(timer);
  }, [isTimeLive, updateData]);

  const handleFeedbackChange = (text: string) => {
    const { tone } = analyzeSentiment(text);
    updateData({ feedback: text, tone });
  };

  const handleProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateData({ profileImage: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const [originalFeedback, setOriginalFeedback] = React.useState(data.feedback);
  const [activeVariant, setActiveVariant] = React.useState<'original' | 'professional' | 'concise' | 'expanded'>('original');
  const [isEnhancing, setIsEnhancing] = React.useState(false);

  const handleRewrite = async (variant: 'professional' | 'concise' | 'expanded') => {
    if (isEnhancing) return;
    setIsEnhancing(true);
    setActiveVariant(variant);
    
    try {
      const prompt = `Rewrite this testimonial to be ${variant}. Testimonial: "${originalFeedback}". Return ONLY the rewritten text.`;
      const rewritten = await chatWithAI(prompt);
      updateData({ feedback: rewritten });
    } catch (error) {
      console.error('Rewrite failed:', error);
      toast.error('Failed to rewrite testimonial');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleEnhance = async () => {
    if (isEnhancing) return;
    setIsEnhancing(true);
    
    try {
      const prompt = `Enhance this testimonial by fixing grammar, adding subtle emojis, and making it sound more authentic while preserving the original meaning. Testimonial: "${data.feedback}". Return ONLY the enhanced text.`;
      const enhanced = await chatWithAI(prompt);
      updateData({ feedback: enhanced });
    } catch (error) {
      console.error('Enhance failed:', error);
      toast.error('Failed to enhance testimonial');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleNextStep = () => {
    const requiredFields = [
      { key: 'feedback', label: 'Feedback Text' },
      { key: 'name', label: 'Name' },
      { key: 'company', label: 'Company' },
      { key: 'role', label: 'Role / Designation' }
    ];

    const missing = requiredFields.filter(field => !data[field.key as keyof typeof data]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in required fields: ${missing.map(m => m.label).join(', ')}`);
      return;
    }

    setStep(2);
  };

  return (
    <div className="space-y-6 animate-fade-up pb-8">
      
      {/* AI Extraction Summary */}
      <div className="bg-secondary/50 border border-border p-4 rounded-md text-sm">
        <h3 className="text-muted-foreground font-medium mb-3 text-xs">AI Extraction Summary</h3>
        <div className="grid grid-cols-2 gap-y-2 text-muted-foreground">
          <div><span className="text-muted-foreground/70 text-xs">Name:</span> <span className="font-medium text-foreground">{data.name || 'N/A'}</span></div>
          <div><span className="text-muted-foreground/70 text-xs">Company:</span> <span className="font-medium text-foreground">{data.company || 'N/A'}</span></div>
          <div><span className="text-muted-foreground/70 text-xs">Role:</span> <span className="font-medium text-foreground">{data.role || 'N/A'}</span></div>
          <div><span className="text-muted-foreground/70 text-xs">Sentiment:</span> <span className="font-medium text-foreground capitalize">{data.tone}</span></div>
          <div><span className="text-muted-foreground/70 text-xs">Confidence:</span> <span className="font-medium text-foreground">100%</span></div>
          <div><span className="text-muted-foreground/70 text-xs">Date:</span> <span className="font-medium text-foreground">{data.date || 'N/A'}</span></div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Edit Details</h2>
        </div>

        {/* Feedback */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
             Feedback Text <span className="text-red-500 font-bold">*</span>
             {isEnhancing && <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse ml-1" />}
          </label>
          <textarea
            value={data.feedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            rows={6}
            disabled={isEnhancing}
            className="w-full max-w-full box-border break-words px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[100px] disabled:opacity-50"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-2 text-xs">
              <button 
                onClick={() => {
                  setActiveVariant('original');
                  updateData({ feedback: originalFeedback });
                }}
                className={`px-3 py-1 rounded-full transition-colors border ${activeVariant === 'original' ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground hover:bg-secondary border-transparent'}`}
              >
                Original
              </button>
              <button 
                onClick={() => handleRewrite('professional')}
                className={`px-3 py-1 rounded-full transition-colors border ${activeVariant === 'professional' ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground hover:bg-secondary border-transparent'}`}
              >
                Professional
              </button>
              <button 
                onClick={() => handleRewrite('concise')}
                className={`px-3 py-1 rounded-full transition-colors border ${activeVariant === 'concise' ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground hover:bg-secondary border-transparent'}`}
              >
                Concise
              </button>
              <button 
                onClick={() => handleRewrite('expanded')}
                className={`px-3 py-1 rounded-full transition-colors border ${activeVariant === 'expanded' ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground hover:bg-secondary border-transparent'}`}
              >
                Expanded
              </button>
            </div>
            <button 
              onClick={handleEnhance}
              disabled={isEnhancing}
              className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary hover:opacity-90 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-3 h-3 text-yellow-300 ${isEnhancing ? 'animate-spin' : ''}`} /> 
              {isEnhancing ? 'Processing...' : 'Enhance'}
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Name & Company */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Name <span className="text-red-500 font-bold">*</span></label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => updateData({ name: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Company <span className="text-red-500 font-bold">*</span></label>
            <input
              type="text"
              value={data.company}
              onChange={(e) => updateData({ company: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Role & Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Role / Designation <span className="text-red-500 font-bold">*</span></label>
            <input
              type="text"
              value={data.role}
              onChange={(e) => updateData({ role: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Date ({isTimeLive ? "Live" : "Manual"})</label>
            <input
              type="text"
              value={data.date}
              onChange={(e) => {
                setIsTimeLive(false);
                updateData({ date: e.target.value });
              }}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          {/* Time (Live seconds editing) */}
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-medium text-muted-foreground flex justify-between">
              <span>Time ({isTimeLive ? "Live" : "Manual"})</span>
              {!isTimeLive && (
                <button onClick={() => setIsTimeLive(true)} className="text-[10px] text-primary hover:opacity-80">
                  Resume Live Sync
                </button>
              )}
            </label>
            <input
              type="text"
              value={data.time}
              onChange={(e) => {
                setIsTimeLive(false);
                updateData({ time: e.target.value });
              }}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Rating & Website */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Rating</label>
            <div className="flex gap-1 h-[38px] items-center px-3 rounded-md bg-background border border-border">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => updateData({ rating: s })}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-4 h-4 ${s <= data.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Website URL</label>
            <input
              type="text"
              value={data.websiteUrl}
              onChange={(e) => updateData({ websiteUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* LinkedIn URL - full width */}
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-medium text-muted-foreground">LinkedIn URL</label>
            <input
              type="text"
              value={data.linkedinUrl}
              onChange={(e) => updateData({ linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/"
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
        </div>

      </div>
      
      {/* Next Button transition to Template Picker */}
      <div className="pt-6 border-t border-border">
         <button 
           onClick={handleNextStep}
           className="w-full bg-primary hover:opacity-90 text-primary-foreground font-medium py-3 rounded-md transition-all flex justify-center items-center gap-2 glow"
         >
           Choose Templates
         </button>
      </div>

    </div>
  );
};
