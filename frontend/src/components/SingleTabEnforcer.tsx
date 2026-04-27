import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export const SingleTabEnforcer = () => {
  const [isDuplicateTab, setIsDuplicateTab] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel('app_tab_channel');
    const tabId = Math.random().toString(36).substring(2, 9);
    
    // Tell everyone we just opened
    channel.postMessage({ type: 'NEW_TAB', id: tabId });

    // Listen for responses from other tabs
    channel.onmessage = (event) => {
      if (event.data.type === 'NEW_TAB') {
        // A new tab just opened, but WE are already here. We tell them we are primary.
        channel.postMessage({ type: 'PRIMARY_TAB_EXISTS', id: tabId });
      } else if (event.data.type === 'PRIMARY_TAB_EXISTS') {
        // Someone else was here first, so WE are the duplicate tab.
        setIsDuplicateTab(true);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  if (!isDuplicateTab) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-card max-w-md w-full rounded-2xl shadow-2xl border border-border p-8 text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight mb-3">Application Already Open</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            To prevent data corruption and ensure changes are saved securely to the correct account, this application is strictly limited to <b>one active tab</b> per device.
          </p>
        </div>
        <div className="bg-secondary/50 border border-border p-4 rounded-xl">
          <p className="text-sm font-bold text-foreground">
            Please close this tab and return to your original window.
          </p>
        </div>
      </div>
    </div>
  );
};
