import { useEffect } from 'react';
import { db } from '@/lib/dexie';

export function useSyncQueue() {
  useEffect(() => {
    let isSyncing = false;
    let syncInterval: any;

    async function processQueue() {
      if (isSyncing || !navigator.onLine) return;

      try {
        isSyncing = true;
        const queueItems = await db.syncQueue.orderBy('id').toArray();
        if (queueItems.length === 0) {
          isSyncing = false;
          return;
        }

        console.log(`Processing ${queueItems.length} items in sync queue...`);

        const res = await fetch('/api/sync/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: queueItems })
        });

        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            // Remove processed items
            const idsToDelete = queueItems.map(item => item.id!);
            await db.syncQueue.bulkDelete(idsToDelete);
            console.log('✅ Sync queue processed successfully');
          }
        } else {
          console.error('Failed to push sync queue to server', await res.text());
        }
      } catch (err) {
        console.error('Sync queue processing error:', err);
      } finally {
        isSyncing = false;
      }
    }

    // Process immediately if online
    if (navigator.onLine) {
      processQueue();
    }

    // Listen to online events
    window.addEventListener('online', processQueue);
    
    // Also set an interval to retry periodically if items are stuck
    syncInterval = setInterval(processQueue, 30000); // 30 seconds

    return () => {
      window.removeEventListener('online', processQueue);
      clearInterval(syncInterval);
    };
  }, []);
}
