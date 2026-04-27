import { create } from 'zustand';
import type { TestimonialData, TemplateName, ExportFormat } from '../types/testimonial';
import { toast } from 'sonner';
import api from '../lib/axios';
import { useAuthStore } from './authStore';

interface DownloadHistoryEvent {
  id?: string;
  name: string;
  format: string;
  date: string;
  time: string;
  testimonialId?: string;
  isDeleted?: boolean;
}

interface DeletedTestimonial extends TestimonialData {
  deletedAt: string; // ISO string
}

interface TestimonialStore {
  step: number;
  setStep: (step: number) => void;

  uploadedImage: string | null;
  setUploadedImage: (img: string | null) => void;

  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;

  ocrProgress: number;
  setOcrProgress: (v: number) => void;

  data: TestimonialData;
  updateData: (partial: Partial<TestimonialData>) => void;

  selectedTemplate: TemplateName;
  setSelectedTemplate: (t: TemplateName) => void;

  showWatermark: boolean;
  setShowWatermark: (v: boolean) => void;

  exportFormat: ExportFormat;
  setExportFormat: (f: ExportFormat) => void;

  history: TestimonialData[];
  downloadHistory: DownloadHistoryEvent[];
  recentlyDeleted: DeletedTestimonial[];
  batchData: any[]; // Temporary storage for batch processing
  inProgressHashes: Set<string>; // Hashes currently being processed
  
  addToHistory: (d: TestimonialData) => Promise<void>;
  addToDownloadHistory: (name: string, format: string, testimonialId?: string) => void;
  removeFromHistory: (index: number) => Promise<void>;
  restoreFromDeleted: (id: string) => void;
  permanentlyDelete: (id: string) => void;
  removeFromDownloadHistory: (index: number) => Promise<void>;
  clearExpiredDeleted: () => void;
  clearStore: () => void;
  loadHistory: () => Promise<void>;
  setBatchData: (dataOrUpdater: any[] | ((prev: any[]) => any[])) => void;
  updateTestimonialStatus: (id: string, isExported: boolean) => Promise<void>;
  addInProgressHash: (hash: string) => void;
  removeInProgressHash: (hash: string) => void;
  clearInProgressHashes: () => void;
  checkDuplicateHash: (hash: string) => boolean;
}

export const generateHash = async (input: string | ArrayBuffer) => {
  let data: Uint8Array;
  if (typeof input === 'string') {
    // If it's a base64 string, we should ideally hash the binary part, 
    // but for consistency with existing calls, we'll hash the string.
    // However, the best way is to pass the ArrayBuffer directly.
    const encoder = new TextEncoder();
    data = encoder.encode(input);
  } else {
    data = new Uint8Array(input);
  }
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as any);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const createDefaultData = (): TestimonialData => ({
  feedback: '',
  rating: 5,
  date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  name: '',
  role: '',
  company: '',
  websiteUrl: '',
  linkedinUrl: '',
  socialLink: '',
  profileImage: null,
  tone: 'positive',
  tag: 'testimonial',
  customBackgroundColor: '',
  customTextColor: '',
  fontFamily: 'Inter, sans-serif',
  fontSize: 16,
  watermarkColor: '',
  id: `testimonial_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
});

export const useTestimonialStore = create<TestimonialStore>((set, get) => ({
  step: 0,
  setStep: (step) => set({ step }),

  uploadedImage: null,
  setUploadedImage: (uploadedImage) => set({ uploadedImage }),

  isProcessing: false,
  setIsProcessing: (isProcessing) => set({ isProcessing }),

  ocrProgress: 0,
  setOcrProgress: (ocrProgress) => set({ ocrProgress }),

  data: createDefaultData(),
  updateData: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),

  selectedTemplate: 'minimal',
  setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),

  showWatermark: false,
  setShowWatermark: (showWatermark) => set({ showWatermark }),

  exportFormat: 'png',
  setExportFormat: (exportFormat) => set({ exportFormat }),

  history: [],
  downloadHistory: [],
  recentlyDeleted: [],
  batchData: [],
  inProgressHashes: new Set(),

  setBatchData: (batchDataOrUpdater) => {
    if (typeof batchDataOrUpdater === 'function') {
      set((state) => ({ batchData: (batchDataOrUpdater as any)(state.batchData) }));
    } else {
      set({ batchData: batchDataOrUpdater });
    }
  },
  
  updateTestimonialStatus: async (id, isExported) => {
    const userId = useAuthStore.getState().user?.id;
    const history = get().history;
    const updatedHistory = history.map(t => t.id === id ? { ...t, isExported } : t);
    
    set({ history: updatedHistory });
    
    if (userId) {
      localStorage.setItem(`testimonial_history_${userId}`, JSON.stringify(updatedHistory));
      try {
        await api.patch(`/testimonials/${id}`, { isExported });
      } catch (e) {
        console.error('Failed to update status on backend:', e);
      }
    }
  },

  addInProgressHash: (hash) => set((state) => {
    const newHashes = new Set(state.inProgressHashes);
    newHashes.add(hash);
    return { inProgressHashes: newHashes };
  }),

  removeInProgressHash: (hash) => set((state) => {
    const newHashes = new Set(state.inProgressHashes);
    newHashes.delete(hash);
    return { inProgressHashes: newHashes };
  }),

  clearInProgressHashes: () => set({ inProgressHashes: new Set() }),

  addToDownloadHistory: (name, format, testimonialId) => {
    const userId = useAuthStore.getState().user?.id;
    const now = new Date();
    const newEvent: DownloadHistoryEvent = {
      name: name || 'Anonymous',
      format: format.toUpperCase(),
      date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      testimonialId
    };

    const history = get().downloadHistory;
    
    // Prevent duplicate entries
    if (history.length > 0) {
      const isDuplicate = history.some(last => 
        (testimonialId && last.testimonialId === testimonialId && last.format === newEvent.format) ||
        (last.name === newEvent.name && last.format === newEvent.format && last.time === newEvent.time)
      );
      if (isDuplicate) return;
    }

    const newDownloadHistory = [newEvent, ...history].slice(0, 100);
    set({ downloadHistory: newDownloadHistory });
    
    if (userId) {
      localStorage.setItem(`download_history_${userId}`, JSON.stringify(newDownloadHistory));
      
      // Update the testimonial exported status in store and backend
      if (testimonialId) {
        const testimonials = get().history;
        const updatedHistory = testimonials.map(t => 
          t.id === testimonialId ? { ...t, isExported: true } : t
        );
        set({ history: updatedHistory });
        localStorage.setItem(`testimonial_history_${userId}`, JSON.stringify(updatedHistory));
        
        // Sync with backend
        if (testimonialId) {
          api.patch(`/testimonials/${testimonialId}`, { isExported: true }).catch(e => {
            console.error('Failed to update export status on backend:', e);
          });
        }
      }

      // Sync download event with backend
      api.post('/testimonials/downloads', newEvent).catch(e => {
        console.error('Failed to save download event to backend:', e);
      });
    }
  },

  removeFromDownloadHistory: async (index) => {
    const userId = useAuthStore.getState().user?.id;
    const item = get().downloadHistory[index];
    if (!item) return;

    const newHistory = get().downloadHistory.filter((_, i) => i !== index);
    set({ downloadHistory: newHistory });
    if (userId) {
      localStorage.setItem(`download_history_${userId}`, JSON.stringify(newHistory));
      if (item.id) {
        try {
          await api.delete(`/testimonials/downloads/${item.id}`);
        } catch (e) {
          console.error('Failed to delete download event from backend:', e);
        }
      }
    }
  },

  checkDuplicateHash: (hash) => {
    if (!hash) return false;
    const history = get().history;
    const batchData = get().batchData;
    const inProgressHashes = get().inProgressHashes;
    
    const isDuplicate = history.some(t => t.imageHash === hash) || 
                       batchData.some(t => t.data?.imageHash === hash || t.imageHash === hash) ||
                       inProgressHashes.has(hash);
    return isDuplicate;
  },

   addToHistory: async (d) => {
    const userId = useAuthStore.getState().user?.id;
    const now = new Date();
    const entry = { 
      ...d, 
      id: d.id || `testimonial_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: d.date || now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.time || now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      template: d.template || get().selectedTemplate
    };
    
    // Check if we are updating an existing one or adding new
    const oldHistory = get().history;
    const existingIndex = oldHistory.findIndex(t => t.id === entry.id);
    
    let newHistory;
    if (existingIndex !== -1) {
      // Update existing
      newHistory = [...oldHistory];
      newHistory[existingIndex] = entry;
    } else {
      // Add new
      newHistory = [entry, ...oldHistory];
    }
    
    set({ history: newHistory, data: entry });

    if (userId) {
      try {
        await api.post('/testimonials', entry);
        localStorage.setItem(`testimonial_history_${userId}`, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to sync testimonial to backend:', error);
      }
    }
  },

  bulkSaveToHistory: async (items) => {
    const userId = useAuthStore.getState().user?.id;
    const now = new Date();
    const currentHistory = get().history;
    
    const processedItems = items.map(d => ({
      ...d,
      id: d.id || `testimonial_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: d.date || now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.time || now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      template: d.template || get().selectedTemplate
    }));

    // Update local state first (Optimistic & Atomic)
    const newHistory = [...currentHistory];
    processedItems.forEach(item => {
      const idx = newHistory.findIndex(t => t.id === item.id);
      if (idx !== -1) newHistory[idx] = item;
      else newHistory.unshift(item);
    });

    set({ history: newHistory });

    if (userId) {
      localStorage.setItem(`testimonial_history_${userId}`, JSON.stringify(newHistory));
      try {
        // Run backend saves in parallel but we wait for all to complete
        await Promise.all(processedItems.map(item => api.post('/testimonials', item)));
      } catch (error) {
        console.error('Bulk sync failed partially:', error);
        toast.error('Some items failed to sync to cloud, but saved locally.');
      }
    }
  },

  removeFromHistory: async (index) => {
    const item = get().history[index];
    if (!item) return;

    const userId = useAuthStore.getState().user?.id;
    
    // Move to recently deleted (local only for now as a trash bin)
    const deletedEntry: DeletedTestimonial = {
      ...item,
      deletedAt: new Date().toISOString()
    };
    const newRecentlyDeleted = [deletedEntry, ...get().recentlyDeleted];
    
    // Remove from history (Optimistic)
    const newHistory = get().history.filter((_, i) => i !== index);
    
    // Remove related downloads
    const newDownloadHistory = get().downloadHistory.filter(d => d.testimonialId !== item.id);
    
    set({ 
      history: newHistory, 
      recentlyDeleted: newRecentlyDeleted,
      downloadHistory: newDownloadHistory
    });

    if (userId && item.id) {
      try {
        await api.delete(`/testimonials/${item.id}`);
        localStorage.setItem(`testimonial_history_${userId}`, JSON.stringify(newHistory));
        localStorage.setItem(`recently_deleted_${userId}`, JSON.stringify(newRecentlyDeleted));
        localStorage.setItem(`download_history_${userId}`, JSON.stringify(newDownloadHistory));
      } catch (error) {
        console.error('Failed to delete testimonial from backend:', error);
      }
    }
  },

  restoreFromDeleted: (id) => {
    const userId = useAuthStore.getState().user?.id;
    const itemToRestore = get().recentlyDeleted.find(t => t.id === id);
    if (!itemToRestore) return;

    const newRecentlyDeleted = get().recentlyDeleted.filter(t => t.id !== id);
    const { deletedAt, ...originalData } = itemToRestore;
    
    // Add back to history
    get().addToHistory(originalData as TestimonialData);
    set({ recentlyDeleted: newRecentlyDeleted });

    if (userId) {
      localStorage.setItem(`recently_deleted_${userId}`, JSON.stringify(newRecentlyDeleted));
    }
  },

  permanentlyDelete: (id) => {
    const userId = useAuthStore.getState().user?.id;
    const newRecentlyDeleted = get().recentlyDeleted.filter(t => t.id !== id);
    set({ recentlyDeleted: newRecentlyDeleted });
    if (userId) {
      localStorage.setItem(`recently_deleted_${userId}`, JSON.stringify(newRecentlyDeleted));
    }
  },

  clearExpiredDeleted: () => {
    const userId = useAuthStore.getState().user?.id;
    const now = new Date().getTime();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    const validDeleted = get().recentlyDeleted.filter(item => {
      const deletedTime = new Date(item.deletedAt).getTime();
      return now - deletedTime <= SEVEN_DAYS;
    });

    if (validDeleted.length === get().recentlyDeleted.length) return;

    set({ recentlyDeleted: validDeleted });
    if (userId) {
      localStorage.setItem(`recently_deleted_${userId}`, JSON.stringify(validDeleted));
    }
  },

  loadHistory: async () => {
    const user = useAuthStore.getState().user;
    if (!user?.id) {
      set({ history: [], downloadHistory: [] });
      return;
    }

    try {
      // 1. Fetch from Backend
      let { data: backendHistory } = await api.get('/testimonials');
      
      // De-duplicate backend history
      backendHistory = backendHistory.filter((item: any, index: number, self: any[]) =>
        index === self.findIndex((t) => (
          t.id === item.id || 
          (`${t.feedback}-${t.name}`.toLowerCase().trim() === `${item.feedback}-${item.name}`.toLowerCase().trim())
        ))
      );
      
      // 2. Load Local History for Migration Check
      let localHistory: TestimonialData[] = [];
      const saved = localStorage.getItem(`testimonial_history_${user.id}`);
      if (saved) {
        try { 
          const parsed = JSON.parse(saved); 
          if (Array.isArray(parsed)) {
            localHistory = parsed.filter((item, index, self) =>
              index === self.findIndex((t) => (
                t.id === item.id || (t.feedback === item.feedback && t.name === item.name)
              ))
            );
          }
        } catch (e) {
          console.error("Local history parse failed:", e);
        }
      }

      // 3. Migration & Sync Logic
      if (backendHistory.length === 0 && localHistory.length > 0) {
        console.log('Migrating local testimonials to cloud...');
        for (const item of localHistory) {
          try {
            await api.post('/testimonials', item);
          } catch (e) {
            console.error('Migration failed for item:', item.id, e);
          }
        }
        const { data: syncedHistory } = await api.get('/testimonials');
        set({ history: syncedHistory });
      } else {
        const syncedHistory = [...backendHistory];
        let needsSync = false;
        
        // Final De-duplicate (by feedback + name)
        const uniqueSyncedHistory: TestimonialData[] = [];
        const seen = new Set();
        syncedHistory.forEach((item: TestimonialData) => {
          const key = `${item.feedback.toLowerCase().trim()}-${(item.name || '').toLowerCase().trim()}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueSyncedHistory.push(item);
          }
        });
        
        set({ history: uniqueSyncedHistory });
        if (needsSync) {
          localStorage.setItem(`testimonial_history_${user.id}`, JSON.stringify(uniqueSyncedHistory));
        }
      }

      // 4. Load Download History — always trust backend
      const { data: backendDownloads } = await api.get('/testimonials/downloads');

      // Only migrate if backend is empty AND local has data that has real IDs (first-time user who used app before backend)
      let localDownloads: any[] = [];
      const savedDownloads = localStorage.getItem(`download_history_${user.id}`);
      if (savedDownloads) {
        try { localDownloads = JSON.parse(savedDownloads); } catch {}
      }
      
      // Only migrate if: backend is empty AND local items don't have backend IDs (truly local-only data)
      const localOnlyDownloads = localDownloads.filter((d: any) => !d.id);
      if (backendDownloads.length === 0 && localOnlyDownloads.length > 0) {
        console.log('Migrating local downloads to cloud...');
        for (const item of localOnlyDownloads) {
          try {
            const { name, format, date, time, testimonialId } = item;
            // Skip SAVED/PENDING entries — they should never be in download history
            if (format === 'SAVED' || format === 'PENDING') continue;
            await api.post('/testimonials/downloads', { name, format, date, time, testimonialId });
          } catch (e) {
            console.error('Migration failed for download event:', e);
          }
        }
        const { data: syncedDownloads } = await api.get('/testimonials/downloads');
        set({ downloadHistory: syncedDownloads });
        localStorage.setItem(`download_history_${user.id}`, JSON.stringify(syncedDownloads));
      } else {
        // Always use backend as source of truth
        set({ downloadHistory: backendDownloads });
        localStorage.setItem(`download_history_${user.id}`, JSON.stringify(backendDownloads));
        
        // Also self-heal isExported status if download exists but testimonial says pending
        const currentHistory = get().history;
        let historyNeedsUpdate = false;
        const updatedHistory = currentHistory.map(t => {
          // 1. Match by exact Testimonial ID (Best)
          let hasDownload = backendDownloads.some((d: any) => d.testimonialId === t.id);

          // 2. Batch Export Fix: If a batch ZIP was downloaded AFTER this was created, it's considered completed.
          if (!hasDownload) {
             const hasBatch = backendDownloads.some((d: any) => 
                (d.name?.includes("Batch") || d.format === "ZIP") && 
                new Date(d.createdAt || d.date || 0) >= new Date(t.createdAt || t.date || 0)
             );
             if (hasBatch) hasDownload = true;
          }

          // 3. Fallback: Match by Name ONLY if name is unique and not Anonymous
          if (!hasDownload && t.name && t.name !== 'Anonymous') {
            const sameNameCount = currentHistory.filter(item => item.name === t.name).length;
            if (sameNameCount === 1) {
              hasDownload = backendDownloads.some((d: any) => d.name === t.name);
            }
          }

          if (!t.isExported && hasDownload) {
            historyNeedsUpdate = true;
            api.patch(`/testimonials/${t.id}`, { isExported: true }).catch(() => {});
            return { ...t, isExported: true };
          }
          return t;
        });

        if (historyNeedsUpdate) {
          set({ history: updatedHistory });
          localStorage.setItem(`testimonial_history_${user.id}`, JSON.stringify(updatedHistory));
        }
      }

      // 5. Load recently deleted
      let rDeleted: any[] = [];
      const savedDeleted = localStorage.getItem(`recently_deleted_${user.id}`);
      if (savedDeleted) {
        try { rDeleted = JSON.parse(savedDeleted); } catch {}
      }
      set({ recentlyDeleted: rDeleted });

    } catch (error) {
      console.error('Failed to load history from backend:', error);
      // Fallback to local
      const saved = localStorage.getItem(`testimonial_history_${user.id}`);
      if (saved) {
        try { set({ history: JSON.parse(saved) }); } catch {}
      }
    }

    get().clearExpiredDeleted();
  },

  clearStore: () => {
    set({
      history: [],
      downloadHistory: [],
      recentlyDeleted: [],
      data: createDefaultData(),
      uploadedImage: null,
      step: 0,
      isProcessing: false,
      ocrProgress: 0,
      batchData: []
    });
  }
}));
