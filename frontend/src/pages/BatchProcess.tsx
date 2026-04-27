import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, ArrowLeft, Image as ImageIcon, X, Sparkles, FileText, Code, Star, Settings, LogOut, Check, Loader2, AlertCircle } from 'lucide-react';
import { extractFeedbackFromImage, enhanceTestimonial } from '../lib/gemini';
import { templateMap } from '../components/TestimonialTemplates';
import type { TestimonialData, TemplateName } from '../types/testimonial';
import { useTestimonialStore, generateHash } from '../store/testimonialStore';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const BatchProcess: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { 
    addToHistory, 
    addToDownloadHistory, 
    checkDuplicateHash, 
    history,
    batchData: rawBatchData,
    setBatchData,
    addInProgressHash,
    removeInProgressHash,
    clearInProgressHashes,
    bulkSaveToHistory
  } = useTestimonialStore();

  const batchData = Array.isArray(rawBatchData) ? rawBatchData : [];

  useEffect(() => {
    if (user && (!user.businessName || !user.businessType)) {
      // If the user already has testimonials in the store, they are an existing user — never redirect them
      const hasTestimonialsInStore = history && history.length > 0;
      const hasHistoryInStorage =
        localStorage.getItem(`testimonial_history_${user.id}`) ||
        localStorage.getItem('testimonial_history');

      const isExistingUser = hasTestimonialsInStore || !!hasHistoryInStorage;

      if (!isExistingUser) {
        navigate('/settings', { replace: true, state: { missingInfo: true } });
      }
    }
  }, [user, navigate, history]);

  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentFileProgress, setCurrentFileProgress] = useState(0);
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  
  const [globalTemplate, setGlobalTemplate] = useState<TemplateName>('minimal');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  
  // Ref to track batchData for auto-save on unmount
  const batchDataRef = useRef(batchData);
  useEffect(() => {
     batchDataRef.current = batchData;
  }, [batchData]);

  // AUTO-SAVE ON EXIT: Save everything to history when leaving the page
  useEffect(() => {
    return () => {
      const dataToSave = batchDataRef.current;
      if (dataToSave && dataToSave.length > 0) {
        // Use bulkSave to preserve existing status (isExported, etc.)
        const itemsToSave = dataToSave.map(item => getMergedData(item.data));
        bulkSaveToHistory(itemsToSave).catch(err => {
          console.error("Auto-save on unmount failed:", err);
        });
      }
    };
  }, [bulkSaveToHistory]);
  const [customization, setCustomization] = useState({
    fontFamily: 'Inter, sans-serif',
    customBackgroundColor: '',
    customTextColor: '',
  });

  const templateOptions = [
    { id: 'minimal', label: 'Minimal', colorHex: '#f8fafc' },
    { id: 'instagram', label: 'Instagram', colorHex: '#f472b6' },
    { id: 'whatsapp', label: 'WhatsApp', colorHex: '#34d399' },
    { id: 'dark-premium', label: 'Dark Premium', colorHex: '#0f172a' },
    { id: 'linkedin', label: 'LinkedIn', colorHex: '#3b82f6' },
    { id: 'glassmorphism', label: 'Glassmorphism', colorHex: '#bae6fd' },
    { id: 'geometric', label: 'Geometric', colorHex: '#d8b4fe' },
    { id: 'happy-bubble', label: 'Happy Bubble', colorHex: '#fde047' },
    { id: 'deep-burgundy', label: 'Deep Burgundy', colorHex: '#991b1b' },
    { id: 'classic-parchment', label: 'Classic Parchment', colorHex: '#fed7aa' },
    { id: 'corporate-grid', label: 'Corporate Grid', colorHex: '#94a3b8' },
    { id: 'azure-bubble', label: 'Azure Bubble', colorHex: '#7dd3fc' },
  ];

  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleQueueFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    setQueuedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFileFromQueue = (index: number) => {
    setQueuedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processImages = async (files: File[], isAppending = false) => {
    if (!isAppending) {
      setBatchData([]); // Clear existing items when starting a new batch
      setIsProcessing(true);
      setStep(1);
    }
    
    const toastId = isAppending ? toast.loading(`AI is analyzing ${files.length} new images...`) : null;
    
    setCurrentFileIndex(0);
    setCurrentFileProgress(0);
    
    const newResults: { id: string; image: string; data: TestimonialData }[] = [];
    
    for (let i = 0; i < files.length; i++) {
       const file = files[i];
       setCurrentFileIndex(i);
       setCurrentFileProgress(0);
       
       if (isAppending) {
         toast.loading(`Analyzing image ${i + 1}/${files.length}: ${file.name}...`, { id: toastId! });
       }
       
       setProgressMsg(`AI is analyzing image ${i + 1} of ${files.length}...`);
       
       const progressInterval = setInterval(() => {
         setCurrentFileProgress(prev => {
           if (prev < 90) return prev + Math.floor(Math.random() * 8) + 2;
           if (prev < 98) return prev + 1;
           return prev;
         });
       }, 500);
       
        let hash = '';
        try {
         const arrayBuffer = await new Promise<ArrayBuffer>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
            reader.readAsArrayBuffer(file);
         });

         hash = await generateHash(arrayBuffer);

         if (checkDuplicateHash(hash)) {
            clearInterval(progressInterval);
            toast.info(`Image ${file.name} is a duplicate and was skipped.`);
            setCurrentFileProgress(100);
            continue;
         }

         addInProgressHash(hash);

         if (batchData.some(item => item.data.imageHash === hash) || newResults.some(item => item.data.imageHash === hash)) {
            clearInterval(progressInterval);
            toast.info(`Image ${file.name} is already in the editor and was skipped.`);
            setCurrentFileProgress(100);
            continue;
         }

         const base64 = await new Promise<string>((resolve) => {
            const img = new Image();
            img.onload = () => {
               const canvas = document.createElement('canvas');
               const MAX_WIDTH = 1000;
               const MAX_HEIGHT = 1000;
               let width = img.width;
               let height = img.height;

               if (width > height) {
                  if (width > MAX_WIDTH) {
                     height *= MAX_WIDTH / width;
                     width = MAX_WIDTH;
                  }
               } else {
                  if (height > MAX_HEIGHT) {
                     width *= MAX_HEIGHT / height;
                     height = MAX_HEIGHT;
                  }
               }
               canvas.width = width;
               canvas.height = height;
               const ctx = canvas.getContext('2d');
               ctx?.drawImage(img, 0, 0, width, height);
               resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
             const r = new FileReader();
             r.onload = (e) => {
                img.src = e.target?.result as string;
             };
             r.readAsDataURL(file);
         });

         const result = await extractFeedbackFromImage(base64, file.type || "image/png");
         clearInterval(progressInterval);
         setCurrentFileProgress(100);

         const itemId = `testimonial_batch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
         
         const newItem = {
           id: itemId,
           image: base64,
           originalFeedback: result.feedback,
           fileName: file.name,
           data: {
             feedback: result.feedback || 'No text extracted',
             time: result.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
             date: result.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
             name: result.name || `Customer`,
             role: result.role || '',
             company: result.company || '',
             websiteUrl: '',
             linkedinUrl: '',
             socialLink: '',
             profileImage: null,
             tone: result.tone || 'Friendly',
             rating: result.rating || 5,
             tag: 'testimonial',
             id: itemId,
             imageHash: hash,
             template: globalTemplate,
             fontFamily: customization.fontFamily,
             customBackgroundColor: customization.customBackgroundColor,
             customTextColor: customization.customTextColor,
           } as TestimonialData
         };
         
         newResults.push(newItem);
         setBatchData(prev => [...prev, newItem]);
         removeInProgressHash(hash);
        } catch (err: any) {
          clearInterval(progressInterval);
          console.error("Extraction failed", err);
          toast.error(`Image failed: ${err.message || 'Unknown error'}`);
          if (hash) removeInProgressHash(hash);
        }

       await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    if (isAppending) {
      toast.success(`Successfully added ${newResults.length} new testimonials!`, { id: toastId! });
      // Scroll to bottom to see new items
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }

    setIsProcessing(false);

    if (newResults.length > 0) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        newResults.forEach(r => next.add(r.id));
        return next;
      });
      setStep(1);
    } else if (batchData.length === 0) {
      toast.error("No data could be extracted from these images.");
      setStep(0);
    }
  };

  const executeBatchExtraction = () => {
    if (queuedFiles.length < 2) {
       toast.error("Batch processing requires at least 2 images!");
       return;
    }
    processImages(queuedFiles);
  };

  const handleUploadMore = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (newFiles.length === 0) return;
    processImages(newFiles, true); // Pass true for isAppending
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateGlobalStyle = (partial: Partial<TestimonialData>) => {
     setBatchData(prev => prev.map(item => 
        selectedIds.has(item.id) ? { ...item, data: { ...item.data, ...partial } } : item
     ));
     if (partial.template) setGlobalTemplate(partial.template as TemplateName);
  };

  const handleDataEdit = (id: string, partial: Partial<TestimonialData>) => {
      setBatchData(prev => prev.map(item => item.id === id ? { ...item, data: { ...item.data, ...partial } } : item));
  };

  const handleToneSwitch = async (id: string, tone: string) => {
    const item = batchData.find(i => i.id === id);
    if (!item) return;

    if (tone === 'original') {
      handleDataEdit(id, { feedback: item.originalFeedback || item.data.feedback, tone: 'original' as any });
      return;
    }

    const toastId = toast.loading(`Transforming to ${tone} tone...`);
    try {
      const enhancedText = await enhanceTestimonial(item.originalFeedback || item.data.feedback, tone);
      handleDataEdit(id, { feedback: enhancedText, tone: tone as any });
      toast.success(`Updated to ${tone} tone!`, { id: toastId });
    } catch (err) {
      toast.error("Failed to enhance text", { id: toastId });
    }
  };

  const getMergedData = (localData: TestimonialData) => {
      return { ...localData, ...customization };
  };

  const validateItem = (data: TestimonialData, index?: number) => {
    const requiredFields = [
      { key: 'feedback', label: 'Feedback' },
      { key: 'name', label: 'Name' },
      { key: 'company', label: 'Company' },
      { key: 'role', label: 'Role' }
    ];
    const missing = requiredFields.filter(f => !data[f.key as keyof TestimonialData]);
    if (missing.length > 0) {
      const msg = index !== undefined 
        ? `Testimonial #${index + 1} is missing: ${missing.map(m => m.label).join(', ')}`
        : `Missing: ${missing.map(m => m.label).join(', ')}`;
      toast.error(msg);
      return false;
    }
    return true;
  };

  const handleExportAll = async () => {
    if (batchData.length === 0) {
      toast.error("No testimonials to export!");
      return;
    }

    // Check all items first for required fields
    for (let i = 0; i < batchData.length; i++) {
      if (!validateItem(batchData[i].data, i)) return;
    }

    const toastId = toast.loading("Generating high-quality testimonials ZIP...");
    try {
      const zip = new JSZip();
      
      for (let i = 0; i < batchData.length; i++) {
        const item = batchData[i];
        const ref = cardRefs.current[item.id];
        if (ref) {
          // Add a small delay for large batches to prevent UI freezing
          if (i > 0 && i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const canvas = await html2canvas(ref, { 
            scale: 2, 
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: null
          });
          
          const imgData = canvas.toDataURL('image/png').split(',')[1];
          const fileName = `${(item.data.name || 'testimonial').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${item.id.slice(-4)}.png`;
          zip.file(fileName, imgData, { base64: true });
        }
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `testimonials_batch_${new Date().getTime()}.zip`);
      
      // AUTOMATIC BULK SAVE: Mark all as EXPORTED because they just downloaded
      const finalItemsToSave = batchData.map(item => ({
        ...getMergedData(item.data),
        isExported: true
      }));
      
      await bulkSaveToHistory(finalItemsToSave);
      
      // Update download history with a single batch event
      addToDownloadHistory(`Batch Export (${batchData.length} items)`, "ZIP");
      
      setBatchData(prev => prev.map(item => ({
        ...item,
        data: { ...item.data, isExported: true }
      })));

      toast.success("Batch ZIP downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error("Batch Export Error:", err);
      toast.error(`Export failed: ${err.message || 'Unknown error'}`, { id: toastId });
    }
  };

  const handleExitWithAutoSave = async () => {
    if (batchData.length === 0) {
       navigate('/dashboard');
       return;
    }

    const itemsToSave = batchData.map(item => ({
       ...getMergedData(item.data),
       isExported: false,
       status: 'pending'
    }));

    await bulkSaveToHistory(itemsToSave);

    toast.success(`Progress saved! ${batchData.length} testimonials added to history.`, {
       description: "Viewing history..."
    });
    
    navigate('/history');
  };

  const handleSaveAll = async () => {
    // Check all items first
    for (let i = 0; i < batchData.length; i++) {
      if (!validateItem(batchData[i].data, i)) return;
    }

    const itemsToSave = batchData.map(item => ({
      ...getMergedData(item.data),
      isExported: false
    }));

    await bulkSaveToHistory(itemsToSave);
    toast.success(`Successfully saved all ${batchData.length} testimonials!`);
    navigate('/history');
  };

  const handleIndividualExport = async (id: string, format: 'png' | 'pdf' | 'html') => {
    const ref = cardRefs.current[id];
    if (!ref) return;
    const item = batchData.find(b => b.id === id);
    if (!item) return;

    if (!validateItem(item.data)) return;

    const data = getMergedData(item.data);
    // ... rest of export logic same

    if (format === 'html') {
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
    ${ref.innerHTML}
  </div>
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      saveAs(blob, `${data.name || 'testimonial'}.html`);
      toast.success("HTML Exported!");
      return;
    }

    const canvas = await html2canvas(ref, { scale: 2, useCORS: true });
    
    if (format === 'png') {
      const imgData = canvas.toDataURL('image/png');
      saveAs(imgData, `${data.name || 'testimonial'}.png`);
    } else if (format === 'pdf') {
      const { jsPDF } = await import('jspdf');
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${data.name || 'testimonial'}.pdf`);
    }
    toast.success(`${format.toUpperCase()} Exported!`);
    
    // AUTOMATIC SAVE: Mark as EXPORTED because they just downloaded
    addToHistory({ ...data, isExported: true });
    addToDownloadHistory(data.name, format, data.id);
    
    // Update local state to prevent auto-save from reverting status
    setBatchData(prev => prev.map(item => 
      item.id === id ? { ...item, data: { ...item.data, isExported: true } } : item
    ));
  };

  const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Serif', value: 'Merriweather, serif' },
    { name: 'Monospace', value: "'Fira Code', monospace" },
    { name: 'Rounded', value: "'Quicksand', sans-serif" },
    { name: 'Bookman', value: '"Bookman Old Style", serif' },
    { name: 'Cambria', value: 'Cambria, serif' },
    { name: 'High Tower', value: '"High Tower Text", serif' },
    { name: 'Britannic', value: '"Britannic Bold", sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Tahoma', value: 'Tahoma, sans-serif' },
    { name: 'Palatino', value: '"Palatino Linotype", serif' },
    { name: 'Century Gothic', value: '"Century Gothic", sans-serif' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <input 
         id="uploadMoreInput"
         type="file"
         multiple
         accept="image/*"
         onChange={(e) => handleUploadMore(e.target.files)}
         className="hidden"
      />
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Batch Process Screenshots</h1>
         
         {step === 1 && !isProcessing && batchData.length > 0 && (
            <div className="flex items-center gap-3">
                <button
                   onClick={() => {
                      const allSelected = selectedIds.size === batchData.length;
                      if (allSelected) setSelectedIds(new Set());
                      else setSelectedIds(new Set(batchData.map(b => b.id)));
                   }}
                   className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-5 py-3 rounded-xl transition-all border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md"
                >
                   <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedIds.size === batchData.length ? 'bg-white border-slate-900 text-slate-900' : 'bg-slate-50 border-slate-200 text-transparent'}`}>
                      <Check className="w-3.5 h-3.5 stroke-[4px]" />
                   </div>
                   {selectedIds.size === batchData.length ? 'Deselect All' : 'Select All'}
                </button>

                <button
                  onClick={() => document.getElementById('uploadMoreInput')?.click()}
                  className="flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 hover:text-blue-600 transition-all group/up"
                >
                  <span className="text-blue-600 text-lg leading-none group-hover/up:scale-125 transition-transform">+</span>
                  <span className="opacity-80 group-hover/up:opacity-100">Upload</span>
                </button>

                <button
                   onClick={() => { 
                      if (batchData.length > 0) {
                        batchData.forEach(item => addToHistory({ ...item.data, isExported: false }));
                        toast.success("Progress auto-saved to history!");
                      }
                      setStep(0); 
                      setBatchData([]); 
                      setQueuedFiles([]); 
                   }}
                   className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground bg-card border border-border px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                   <ArrowLeft className="w-4 h-4" /> Start Over
                </button>
            </div>
         )}
      </div>

      {step === 0 ? (
        <div className="max-w-4xl mx-auto mt-6 bg-card p-8 rounded-xl border border-border shadow-sm transition-all">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Transform <span className="text-blue-600">multiple</span> reviews
            </h2>
            <p className="text-muted-foreground">Pick multiple screenshots and proceed to extraction when ready.</p>
          </div>
          
          <div 
             className="relative border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-blue-500 transition-all cursor-pointer bg-muted/50 hover:bg-blue-50/30"
             onClick={() => document.getElementById('batchInput')?.click()}
          >
             <input
               id="batchInput"
               type="file"
               multiple
               accept="image/*"
               onChange={(e) => handleQueueFiles(e.target.files)}
               className="hidden"
             />
             <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center">
                   <ImageIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                   <p className="text-lg font-medium text-foreground">Drop multiple screenshots here</p>
                   {queuedFiles.length > 0 ? (
                      <p className="text-sm text-blue-600 font-bold mt-1">Ready for Extraction</p>
                   ) : (
                      <p className="text-sm text-muted-foreground mt-1">Select 2 to 50 images at once</p>
                   )}
                </div>
             </div>
          </div>

          {queuedFiles.length > 0 && (
             <div className="mt-8 space-y-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                   {queuedFiles.map((file, idx) => (
                      <div key={idx} className="group relative aspect-square rounded-md border border-border overflow-hidden bg-accent transition-all hover:ring-2 hover:ring-blue-400">
                         <img src={URL.createObjectURL(file)} alt="queued" className="w-full h-full object-cover" />
                         <button 
                            onClick={(e) => { e.stopPropagation(); removeFileFromQueue(idx); }}
                            className="absolute top-1 right-1 bg-slate-900/40 hover:bg-slate-900/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                            <X className="w-3 h-3" />
                         </button>
                      </div>
                   ))}
                </div>

                <div className="flex justify-center pt-4">
                   <button 
                      onClick={executeBatchExtraction}
                      disabled={isProcessing}
                      className={`w-full max-w-sm py-4 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/5 dark:shadow-white/5 ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-95'
                      }`}
                   >
                       {isProcessing ? (
                         <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Processing...
                         </>
                       ) : queuedFiles.length < 2 ? (
                         <>
                           <X className="w-5 h-5" />
                           Upload {2 - queuedFiles.length} more for Batch
                         </>
                       ) : (
                         <>
                           <Sparkles className="w-5 h-5" />
                           Extract {queuedFiles.length} Images with AI
                         </>
                       )}
                   </button>
                </div>
             </div>
          )}

          {queuedFiles.length === 0 && (
             <button 
                onClick={() => document.getElementById('batchInput')?.click()}
                className="w-full mt-4 py-4 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-500 hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
             >
                <Upload className="w-4 h-4" />
                Browse Files
             </button>
          )}
        </div>
      ) : isProcessing ? (
        <div className="max-w-5xl mx-auto mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT: File progress list */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Processing {queuedFiles.length} files</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Running AI extraction...</p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin inline-block" />
                  AI Engine
                </span>
              </div>

              {/* Overall progress */}
              <div className="mt-5 mb-5">
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                  <span>Overall progress</span>
                  <span className="text-blue-600">{Math.round(((currentFileIndex + (currentFileProgress / 100)) / queuedFiles.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(((currentFileIndex + (currentFileProgress / 100)) / queuedFiles.length) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Per-file list */}
              <div className="space-y-4">
                {queuedFiles.map((file, idx) => {
                   const isDone = batchData.some(r => (r as any).fileName === file.name);
                   const isProcessingFile = idx === currentFileIndex && !isDone;
                   const isFailed = idx < currentFileIndex && !isDone;
                   const pct = isProcessingFile ? currentFileProgress : isDone ? 100 : 0;

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                              <span className="text-slate-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                              {isDone ? (
                                <span className="text-emerald-500">Extracted</span>
                              ) : isFailed ? (
                                <span className="text-red-500">Failed</span>
                              ) : isProcessingFile ? (
                                <span className="text-blue-500">{pct}%</span>
                              ) : (
                                <span className="text-slate-400">Queued</span>
                              )}
                              
                              {isDone && <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-sm"><Check className="w-3.5 h-3.5 stroke-[4px]" /></div>}
                              {isFailed && <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100 shadow-sm"><AlertCircle className="w-3.5 h-3.5 stroke-[4px]" /></div>}
                              {isProcessingFile && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                              {!isDone && !isFailed && !isProcessingFile && <div className="w-6 h-6 rounded-full border-2 border-slate-200" />}
                            </div>
                          </div>
                          
                          <div className="mt-1.5 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <div 
                                className={`h-full transition-all duration-300 ${isDone ? 'bg-emerald-500' : isFailed ? 'bg-red-400' : 'bg-blue-500'}`}
                                style={{ width: `${pct}%` }}
                             />
                          </div>
                          {isProcessingFile && <p className="text-[10px] text-slate-400 mt-1 animate-pulse">AI Processing...</p>}
                          {isFailed && <p className="text-[10px] text-red-400 mt-1">AI was busy. Skipping this image...</p>}
                          {isDone && <p className="text-[10px] text-emerald-500/70 mt-1">✓ AI complete · Extraction ready</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: OCR info panel */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm p-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 animate-pulse" />
                <Sparkles className="w-10 h-10 text-blue-600 animate-bounce transition-transform duration-1000" />
              </div>
              
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Extracting Knowledge</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto font-medium">
                  Our advanced AI model is decoding the visual hierarchy and extracting pure customer sentiment.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                {['Neural Analysis', 'Intent Detection', 'Semantic Parsing', 'Context Awareness'].map(tag => (
                  <span key={tag} className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-200 dark:border-white/5">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Animated progress indicator */}
              <div className="flex items-center gap-3 py-4">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div 
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-blue-600"
                      style={{ 
                        animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest animate-pulse">Analyzing...</span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start max-w-[1400px] mx-auto">
           {/* SIDEBAR: Global Styling */}
           <div className="lg:sticky lg:top-6 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm space-y-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Global Styling</h3>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Template</label>
                  <div className="relative">
                    <button
                      onClick={() => setIsTemplateOpen(!isTemplateOpen)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-left font-black text-[13px] tracking-tight text-slate-900 dark:text-white cursor-pointer hover:border-blue-300 transition-all flex items-center justify-between"
                    >
                      <span>{templateOptions.find(t => t.id === globalTemplate)?.label}</span>
                      <div className={`transition-transform duration-200 ${isTemplateOpen ? 'rotate-180' : ''}`}>
                         <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </button>

                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-slate-100 shadow-sm pointer-events-none" 
                         style={{ backgroundColor: templateOptions.find(t => t.id === globalTemplate)?.colorHex }} 
                    />

                    {isTemplateOpen && (
                      <div className="absolute z-[100] mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-[300px] overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                          {templateOptions.map(tpl => (
                            <button
                              key={tpl.id}
                              onClick={() => {
                                updateGlobalStyle({ template: tpl.id as TemplateName });
                                setIsTemplateOpen(false);
                              }}
                              className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all text-left group ${
                                globalTemplate === tpl.id 
                                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' 
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="w-4 h-4 rounded-full border border-slate-100 shadow-sm" style={{ backgroundColor: tpl.colorHex }} />
                              <span className="text-[13px] font-bold">{tpl.label}</span>
                              {globalTemplate === tpl.id && <Check className="w-3.5 h-3.5 ml-auto stroke-[3px]" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fonts</label>
                  <div className="grid grid-cols-2 gap-2">
                    {fontFamilies.map(font => (
                       <button
                         key={font.value}
                         onClick={() => updateGlobalStyle({ fontFamily: font.value })}
                         className={`text-[11px] px-3 py-2.5 rounded-lg transition-all border ${
                            (Array.isArray(batchData) ? batchData : []).every(b => !selectedIds.has(b.id) || b.data.fontFamily === font.value) && (Array.isArray(batchData) ? batchData : []).some(b => selectedIds.has(b.id) && b.data.fontFamily === font.value) ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-lg shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:border-blue-400'
                         }`}
                         style={{ fontFamily: font.value }}
                       >
                         {font.name}
                       </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                    <button 
                       onClick={handleExportAll}
                       className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                       <Download className="w-5 h-5"/> Export All (ZIP)
                    </button>
                    <button 
                       onClick={() => handleSaveAll()}
                       className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                       <Sparkles className="w-5 h-5"/> Save All to History
                    </button>
                    <button 
                       onClick={() => handleExitWithAutoSave()}
                       className="w-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                       <LogOut className="w-5 h-5"/> Exit Editor
                    </button>
                 </div>
              </div>
           </div>

           {/* MAIN LIST: Vertical Editors */}
           <div className="space-y-8">
               {batchData.map((item, index) => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-100 dark:border-white/10 shadow-sm flex flex-col xl:flex-row gap-6 items-start hover:shadow-md transition-shadow">
                     <div className="xl:w-[380px] flex-shrink-0 space-y-6">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-black">#{index + 1}</div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Editor</h3>
                       </div>

                       <div className="space-y-4">
                          <input 
                             type="text" 
                             value={item.data.name} 
                             onChange={(e) => handleDataEdit(item.id, { name: e.target.value })}
                             className="w-full text-base px-4 py-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                             placeholder="Name *"
                          />
                          <input 
                             type="text" 
                             value={item.data.role} 
                             onChange={(e) => handleDataEdit(item.id, { role: e.target.value })}
                             className="w-full text-base px-4 py-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                             placeholder="Role *"
                          />
                          <input 
                             type="text" 
                             value={item.data.company} 
                             onChange={(e) => handleDataEdit(item.id, { company: e.target.value })}
                             className="w-full text-base px-4 py-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                             placeholder="Company *"
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Rating</label>
                                <div className="flex items-center gap-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5">
                                   {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                         key={star}
                                         onClick={() => handleDataEdit(item.id, { rating: star })}
                                         className="transition-transform active:scale-90 hover:scale-110"
                                      >
                                         <Star 
                                            className={`w-4 h-4 ${
                                               star <= (item.data.rating || 5)
                                                  ? 'fill-amber-400 text-amber-400' 
                                                  : 'text-slate-200 dark:text-slate-700'
                                            }`} 
                                         />
                                      </button>
                                   ))}
                                </div>
                             </div>
                             <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Website URL</label>
                                <input 
                                   type="text" 
                                   value={item.data.websiteUrl || ''} 
                                   onChange={(e) => handleDataEdit(item.id, { websiteUrl: e.target.value })}
                                   className="w-full text-xs px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                   placeholder="https://..."
                                />
                             </div>
                          </div>

                          <div>
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">LinkedIn URL</label>
                             <input 
                                type="text" 
                                value={item.data.linkedinUrl || ''} 
                                onChange={(e) => handleDataEdit(item.id, { linkedinUrl: e.target.value })}
                                className="w-full text-xs px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                placeholder="https://linkedin.com/in/..."
                             />
                          </div>

                          <textarea 
                             value={item.data.feedback} 
                             onChange={(e) => handleDataEdit(item.id, { feedback: e.target.value })}
                             rows={5}
                             className="w-full text-base px-4 py-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                             placeholder="Feedback content..."
                          />
                       </div>

                    </div>
                    <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-white/5 p-4 flex flex-col items-center justify-center min-h-[450px] relative group/preview">
                        {/* TICK BOX ON LIVE PREVIEW */}
                        <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
                           <button 
                              onClick={() => {
                                 if (window.confirm("Remove this item from the batch?")) {
                                    setBatchData(prev => prev.filter(i => i.id !== item.id));
                                 }
                              }}
                              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-500 hover:border-rose-500/50 flex items-center justify-center transition-all shadow-sm"
                              title="Remove from batch"
                           >
                              <X className="w-4 h-4" />
                           </button>
                           <button 
                              onClick={() => {
                                 const next = new Set(selectedIds);
                                 if (next.has(item.id)) next.delete(item.id);
                                 else next.add(item.id);
                                 setSelectedIds(next);
                              }}
                              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm hover:shadow-md ${
                                 selectedIds.has(item.id) 
                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-transparent'
                              }`}
                           >
                              <Check className="w-5 h-5 stroke-[4px]" />
                           </button>
                        </div>
                        <div className="w-full max-w-[420px]" ref={(el) => (cardRefs.current[item.id] = el)}>
                           {(() => {
                              const templateId = item.data.template || globalTemplate;
                              const TemplateComp = templateMap[templateId as keyof typeof templateMap] || templateMap.minimal;
                              return <TemplateComp data={item.data} showWatermark={true} />;
                           })()}
                        </div>


                        {/* AI TONE SWITCHER (RELOCATED ABOVE ACTIONS) */}
                        <div className="mt-8 flex items-center gap-2 p-1 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-white/10 shadow-sm z-20">
                           {['Original', 'Professional', 'Concise', 'Expanded'].map(tone => (
                              <button
                                 key={tone}
                                 onClick={() => handleToneSwitch(item.id, tone.toLowerCase())}
                                 className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
                                    (item.data.tone as string)?.toLowerCase() === tone.toLowerCase()
                                       ? 'bg-blue-600 text-white shadow-md'
                                       : 'text-slate-400 hover:text-slate-600'
                                 }`}
                              >
                                 {tone}
                              </button>
                           ))}
                           <div className="w-px h-4 bg-slate-100 dark:bg-white/5 mx-1" />
                           <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-[11px] font-black uppercase tracking-wider hover:bg-blue-100 transition-all">
                              <Sparkles className="w-3 h-3" />
                              Enhance
                           </button>
                        </div>

                        {/* ACTION BUTTONS (RELOCATED UNDER PREVIEW) */}
                        <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-[420px] px-2">
                           <button onClick={() => handleIndividualExport(item.id, 'png')} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[11px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-white/10 shadow-sm">
                              <Download className="w-3.5 h-3.5" /> PNG
                           </button>
                           <button onClick={() => handleIndividualExport(item.id, 'pdf')} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[11px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-white/10 shadow-sm">
                              <FileText className="w-3.5 h-3.5" /> PDF
                           </button>
                           <button onClick={() => handleIndividualExport(item.id, 'html')} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[11px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-white/10 shadow-sm">
                              <Code className="w-3.5 h-3.5" /> HTML
                           </button>
                           <button 
                              onClick={() => {
                                 addToHistory(item.data);
                                 toast.success("Saved to Wall of Love!");
                              }} 
                              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white text-[11px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                           >
                              <Sparkles className="w-3.5 h-3.5" /> Save
                           </button>
                        </div>


                     </div>
                 </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default BatchProcess;
