import React, { createContext, useContext, useState, useEffect } from 'react';

interface QueuedSubmission {
  id: string;
  type: 'quiz_result' | 'procedure_completion' | 'chat_message';
  data: any;
  timestamp: number;
}

interface OfflineContextType {
  isOnline: boolean;
  queuedSubmissions: QueuedSubmission[];
  addToQueue: (submission: Omit<QueuedSubmission, 'id' | 'timestamp'>) => void;
  clearQueue: () => void;
  processQueue: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedSubmissions, setQueuedSubmissions] = useState<QueuedSubmission[]>([]);

  useEffect(() => {
    // Load queued submissions from localStorage
    const saved = localStorage.getItem('queuedSubmissions');
    if (saved) {
      setQueuedSubmissions(JSON.parse(saved));
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Save queued submissions to localStorage
    localStorage.setItem('queuedSubmissions', JSON.stringify(queuedSubmissions));
  }, [queuedSubmissions]);

  useEffect(() => {
    // Process queue when coming back online
    if (isOnline && queuedSubmissions.length > 0) {
      processQueue();
    }
  }, [isOnline]);

  const addToQueue = (submission: Omit<QueuedSubmission, 'id' | 'timestamp'>) => {
    const newSubmission: QueuedSubmission = {
      ...submission,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setQueuedSubmissions(prev => [...prev, newSubmission]);
  };

  const clearQueue = () => {
    setQueuedSubmissions([]);
  };

  const processQueue = async () => {
    if (!isOnline || queuedSubmissions.length === 0) return;

    const processedIds: string[] = [];

    for (const submission of queuedSubmissions) {
      try {
        // Process each submission based on type
        switch (submission.type) {
          case 'quiz_result':
            // await submitQuizResult(submission.data);
            break;
          case 'procedure_completion':
            // await submitProcedureCompletion(submission.data);
            break;
          case 'chat_message':
            // await submitChatMessage(submission.data);
            break;
        }
        processedIds.push(submission.id);
      } catch (error) {
        console.error('Failed to process queued submission:', error);
        // Keep failed submissions in queue for retry
        break;
      }
    }

    // Remove successfully processed submissions
    setQueuedSubmissions(prev =>
      prev.filter(submission => !processedIds.includes(submission.id))
    );
  };

  const value = {
    isOnline,
    queuedSubmissions,
    addToQueue,
    clearQueue,
    processQueue,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}