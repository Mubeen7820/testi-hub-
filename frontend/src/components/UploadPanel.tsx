import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, FileText, Sparkles } from 'lucide-react';
import { useTestimonialStore, generateHash } from '../store/testimonialStore';
import { extractFeedbackFromImage, extractFeedbackFromText } from '../lib/gemini';
import { toast } from 'sonner';

export const UploadPanel: React.FC = () => {
  const { 
    updateData, 
    setStep, 
    isProcessing, 
    ocrProgress, 
    checkDuplicateHash, 
    addInProgressHash, 
    removeInProgressHash,
    uploadedImage, 
    setUploadedImage, 
    setIsProcessing, 
    setOcrProgress
  } = useTestimonialStore();
  const [isDragging, setIsDragging] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);

  const executeExtraction = useCallback(async () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    setOcrProgress(0); // Start progress

    // Create a realistic loading simulation that takes ~12 seconds to hit 95%
    // 95% / 120 ticks (10 ticks per second for 12 seconds) = roughly 0.8% per tick
    const progressInterval = setInterval(() => {
      const currentProgress = useTestimonialStore.getState().ocrProgress;
      if (currentProgress >= 95) {
        setOcrProgress(95);
      } else {
        setOcrProgress(currentProgress + 0.8);
      }
    }, 100);

    try {
      const result = await extractFeedbackFromImage(uploadedImage, selectedFile?.type || "image/png");
      
      clearInterval(progressInterval);
      setOcrProgress(100); // Complete instantly
      
      if (!result.isSupported || !result.feedback || result.feedback.trim().length < 5) {
        toast.error("No clear feedback detected! Please upload a review screenshot.");
        return;
      }

      updateData({
        feedback: result.feedback,
        time: result.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        name: result.name || '',
        role: result.role || '',
        company: result.company || '',
        date: result.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        tone: result.tone || 'Friendly',
        rating: result.rating || 5,
        imageHash: imageHash || undefined,
      });
      
      setTimeout(() => setStep(1), 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Gemini Extraction failed:', error);
      toast.error("AI Extraction failed. Please try again or paste text manually.");
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage, setIsProcessing, setOcrProgress, updateData, setStep]);

  const handleQueueImage = useCallback((file: File) => {
    setSelectedFile(file);
    
    // Create hash from ArrayBuffer for maximum reliability
    const hashReader = new FileReader();
    hashReader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const hash = await generateHash(buffer);
      
      if (checkDuplicateHash(hash)) {
        toast.error("This screenshot has already been processed!", {
          description: "You can find it in your History or Wall of Love.",
          duration: 5000
        });
        return;
      }
      
      addInProgressHash(hash);
      setImageHash(hash);
      
      // Now read as DataURL for previewing
      const previewReader = new FileReader();
      previewReader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string);
      };
      previewReader.readAsDataURL(file);
    };
    hashReader.readAsArrayBuffer(file);
  }, [setUploadedImage, checkDuplicateHash]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleQueueImage(file);
  }, [handleQueueImage]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleQueueImage(file);
  }, [handleQueueImage]);

  const removeFile = () => {
     setSelectedFile(null);
     setUploadedImage(null);
  };

  const handlePasteSubmit = async () => {
    if (!pastedText.trim()) return;
    setIsProcessing(true);
    setOcrProgress(20);

    try {
      setOcrProgress(60);
      const result = await extractFeedbackFromText(pastedText);
      setOcrProgress(90);

      updateData({
        feedback: result.feedback,
        time: result.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        name: result.name || '',
        role: result.role || '',
        company: result.company || '',
        date: result.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        tone: result.tone || 'Friendly',
        rating: result.rating || 5,
      });

      setOcrProgress(100);
      setTimeout(() => setStep(1), 500);
    } catch (error) {
       console.error('Gemini Text Extraction failed:', error);
       toast.error("AI could not extract feedback from text. Please try refining your text.");
    } finally {
       setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Turn feedback into <span className="text-[#8B5CF6]">art</span>
        </h2>
        <p className="text-muted-foreground">Upload a WhatsApp screenshot or paste your feedback below</p>
      </div>

      {!pasteMode && !selectedFile ? (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer bg-accent ${
              isDragging ? 'border-primary bg-primary/5 glow-border' : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Drop screenshot here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
              </div>
              <div className="flex gap-2 mt-1">
                <span className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">PNG</span>
                <span className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">JPG</span>
                <span className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">WEBP</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPasteMode(true)}
            className="w-full py-3 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Paste text instead
          </button>

          <button 
             onClick={() => {
                toast.error("Please upload an image first!");
             }}
             className="w-full py-4 mt-4 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/5 dark:shadow-white/5"
           >
             <Sparkles className="w-4 h-4" />
             Extract with AI
           </button>
        </>
      ) : !pasteMode && selectedFile ? (
         <div className="space-y-4">
            <div className="relative border border-border bg-secondary/50 rounded-lg p-4 flex flex-col justify-between">
               <div className="relative bg-background rounded-md border border-border p-2 max-h-64 overflow-hidden mb-4 shadow-sm">
                  <img src={uploadedImage!} alt="Uploaded" className="w-full object-contain max-h-60" />
                  <button 
                     onClick={removeFile}
                     className="absolute top-4 right-4 bg-slate-900/40 hover:bg-slate-900/60 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
               </div>
               
               <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background border border-border p-3 rounded-md mb-4">
                  <FileText className="w-4 h-4" />
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="ml-auto">{(selectedFile.size / 1024).toFixed(1)} KB</span>
               </div>
               
               <button 
                 onClick={executeExtraction}
                 className="w-full py-4 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/5 dark:shadow-white/5"
               >
                 <Sparkles className="w-4 h-4" />
                 Extract with AI
               </button>
            </div>
         </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your feedback text here..."
            className="w-full h-32 rounded-md bg-secondary border border-border p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handlePasteSubmit}
              className="flex-1 py-3 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/5 dark:shadow-white/5"
            >
              <Sparkles className="w-4 h-4" />
              Extract with AI
            </button>
            <button
              onClick={() => setPasteMode(false)}
              className="px-4 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="rounded-lg p-4 border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-4 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase animate-pulse">Extracting feedback…</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-slate-900 dark:bg-white transition-all duration-1000 ease-out relative"
              style={{ width: `${ocrProgress}%` }}
            >
              {/* Internal subtle glow for realism */}
              <div className="absolute inset-0 bg-white/20 dark:bg-black/20 w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
