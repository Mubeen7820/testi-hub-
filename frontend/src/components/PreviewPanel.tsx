import React, { useRef, useCallback, useState } from 'react';
import { Download, ToggleLeft, ToggleRight, Sparkles, Instagram, Facebook, Linkedin, Share2, LogOut } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useTestimonialStore } from '../store/testimonialStore';
import { useAuthStore } from '../store/authStore';
import { templateMap } from './TestimonialTemplates';

import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const PreviewPanel: React.FC = () => {
  const { data, selectedTemplate, showWatermark, setShowWatermark, exportFormat, setExportFormat, step, addToDownloadHistory } = useTestimonialStore();
  const { user } = useAuthStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isExported, setIsExported] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Reset states when data changes so we can save/export again
  React.useEffect(() => {
    setIsExported(false);
    setIsSaved(false);
  }, [data.feedback, data.name, data.role, data.company]);

  const Template = templateMap[selectedTemplate];

  const isOnExportStep = step >= 2 || !!data.id;

  const handleExport = useCallback(async () => {
    if (!previewRef.current) return;

    if (exportFormat === 'html') {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Testimonial - ${data.name || 'Anonymous'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
    .testimonial-container { width: 100%; max-width: 600px; }
  </style>
</head>
<body>
  <div class="testimonial-container">
    ${previewRef.current.innerHTML}
  </div>
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const link = document.createElement('a');
      link.download = `testimonial.html`;
      link.href = URL.createObjectURL(blob);
      link.click();
      setIsExported(true);
      addToDownloadHistory(data.name, 'html', data.id);
      toast.success("Exported HTML! You can now save it to your Wall of Love.");
      return;
    }

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: (exportFormat === 'jpg' || exportFormat === 'pdf') ? '#ffffff' : null,
        scale: 2,
        useCORS: true,
        allowTaint: true, // fallback if CORS is not available for an image, though it might restrict toDataURL locally.
      });

      if (exportFormat === 'pdf') {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save('testimonial.pdf');
      } else {
        const link = document.createElement('a');
        link.download = `testimonial.${exportFormat}`;
        link.href = canvas.toDataURL(exportFormat === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
        link.click();
      }

      setIsExported(true);
      addToDownloadHistory(data.name, exportFormat, data.id);
      toast.success(`Exported ${exportFormat.toUpperCase()}! You can now save it to your Wall of Love.`);
    } catch (error: any) {
      console.error("Export failed:", error);
      if (error && error.name === 'SecurityError') {
         toast.error("Export blocked by browser security (CORS). Images loaded from an external URL must support CORS. Try using an uploaded image.");
      } else {
         toast.error("Failed to generate export: " + (error.message || "Unknown error"));
      }
    }
  }, [exportFormat, data, addToDownloadHistory]);

  const handleSocialShare = async (platform: 'instagram' | 'facebook' | 'linkedin') => {
    if (!previewRef.current) return;
    setIsSharing(true);
    
    try {
      // Force watermark for social sharing regardless of UI toggle
      const wasWatermarkOff = !showWatermark;
      if (wasWatermarkOff) setShowWatermark(true);
      
      // Wait a tiny bit for React to render the watermark
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      // Restore user's watermark preference
      if (wasWatermarkOff) setShowWatermark(false);

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Failed to generate image");

      const file = new File([blob], 'testimonial.png', { type: 'image/png' });

      // Log the download
      addToDownloadHistory(data.name, `PNG (Social: ${platform})`);

      // Check if we are on mobile to decide between Native Share vs "Copy & Open"
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // 1. Try Native Share (BEST FOR MOBILE - avoids copy/paste manual steps)
      if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Testimonial from ${data.name}`,
          text: `Check out this amazing feedback from ${data.name}! #Testimonial #Feedback`,
        });
        toast.success(`Shared to ${platform}!`);
      } else {
        // 2. Desktop "Direct" Flow: Copy to Clipboard + Open Platform Website
        // This is much better for Desktop because the Windows/Mac share sheet 
        // often doesn't have Instagram/Facebook directly.
        const urls = {
          instagram: user?.instagramUrl || 'https://www.instagram.com/',
          facebook: user?.facebookUrl || 'https://www.facebook.com/',
          linkedin: user?.linkedinUrl || 'https://www.linkedin.com/feed/?shareActive=true'
        };

        // Attempt to copy image to clipboard
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            
            // Show toast FIRST
            toast.success(`Image Copied! Just Paste (Ctrl+V) to post on ${platform.charAt(0).toUpperCase() + platform.slice(1)}.`, {
              duration: 5000,
              icon: '📋'
            });

            // Wait a bit so they see it
            await new Promise(r => setTimeout(r, 800));
            
            // THEN open the window
            window.open(urls[platform], '_blank');
            return;
          }
        } catch (clipboardError) {
          console.warn('Clipboard write failed, falling back to download', clipboardError);
        }

        // Fallback: Download + Open Platform
        const link = document.createElement('a');
        link.download = `testimonial_to_${platform}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        window.open(urls[platform], '_blank');
        toast.info(`Opening ${platform}... Please upload the downloaded image to post!`);
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Sharing failed. Please download the image and post manually.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Live Preview</h2>
          <p className="text-sm text-muted-foreground">Updates in real-time</p>
        </div>
      </div>

      {/* Preview */}
      <div className="glass rounded-xl p-4">
        <div ref={previewRef}>
          <Template data={data} showWatermark={showWatermark} />
        </div>
      </div>

      {/* Controls */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Watermark</span>
          <button onClick={() => setShowWatermark(!showWatermark)} className="text-foreground">
            {showWatermark ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Format</span>
          <div className="flex gap-1">
            {(['png', 'jpg', 'pdf', 'html'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setExportFormat(f)}
                className={`text-[10px] px-2 py-1 rounded-md uppercase font-black transition-all ${
                  exportFormat === f
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleExport}
            disabled={!isOnExportStep}
            title={!isOnExportStep ? "Choose a template first to unlock export" : `Export as ${exportFormat.toUpperCase()}`}
            className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isOnExportStep
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-black/5 dark:shadow-white/5 cursor-pointer'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
            }`}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={() => {
              const { addToHistory } = useTestimonialStore.getState();
              const finalData = { ...data, isExported: isExported };
              addToHistory(finalData);
              
              setIsSaved(true);
              toast.success(isExported ? "Saved successfully!" : "Saved as Pending (Not Exported yet)");
            }}
            disabled={!isOnExportStep}
            title="Save your changes to history"
            className={`flex-1 py-3 rounded-lg border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isOnExportStep
                ? 'border-slate-900 dark:border-white/20 bg-transparent text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 cursor-pointer'
                : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Save
          </button>

          <button
            onClick={() => {
              const { addToHistory } = useTestimonialStore.getState();

              // Scenario 2: User exported but didn't save -> Auto-save before exit
              if (isExported && !isSaved) {
                const finalData = { ...data, isExported: true };
                addToHistory(finalData);
                toast.success("Automatically saved your exported testimonial!");
                navigate('/dashboard');
                return;
              }

              // Scenario 1: User exits directly without saving or exporting -> Warning
              if (!isSaved && !isExported) {
                const confirmed = window.confirm("Exit without saving changes? Your work will be lost.\n\nClick OK to Discard.");
                if (!confirmed) return;
              }

              // Scenario 3: If saved but not exported, it's already in history as pending.
              // Just exit.
              navigate('/dashboard');
            }}
            className="flex-1 py-3 rounded-lg border border-border bg-background text-foreground hover:bg-accent font-medium text-sm flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Exit
          </button>
        </div>

        {/* Social Share Section */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <Share2 className="w-3 h-3" /> Share Socially (Auto-Watermarked)
          </p>
          <div className="flex gap-3">
            <button 
              disabled={isSharing || !isOnExportStep}
              onClick={() => handleSocialShare('instagram')}
              className="flex-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white p-2.5 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Instagram className="w-5 h-5" />
            </button>
            <button 
              disabled={isSharing || !isOnExportStep}
              onClick={() => handleSocialShare('facebook')}
              className="flex-1 bg-[#1877F2] text-white p-2.5 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Facebook className="w-5 h-5" />
            </button>
            <button 
              disabled={isSharing || !isOnExportStep}
              onClick={() => handleSocialShare('linkedin')}
              className="flex-1 bg-[#0A66C2] text-white p-2.5 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Linkedin className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[9px] text-center text-muted-foreground mt-2">
            Watermark is always included for social shares.
          </p>
        </div>
        {/* Help Text */}
        <div className="mt-4 space-y-2">
          {!isOnExportStep && (
            <p className="text-[11px] text-center text-muted-foreground animate-pulse">
              ✏️ Choose a template to unlock Export & Save
            </p>
          )}
          {isOnExportStep && !isExported && (
            <p className="text-[11px] text-center text-muted-foreground">
              💡 Export your testimonial first to enable "Save Live"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
