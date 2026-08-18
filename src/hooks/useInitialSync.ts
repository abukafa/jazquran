import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { db } from '@/lib/dexie';

export function useInitialSync() {
  const { data: session, status } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function performSync() {
      if (status !== 'authenticated') return;
      
      // Prevent running multiple times concurrently
      if (isSyncing) return;

      try {
        setIsSyncing(true);
        setError(null);
        
        // Cek koneksi internet
        if (!navigator.onLine) {
           console.log("Offline, skipping initial sync pull");
           setIsSyncing(false);
           return;
        }

        const res = await fetch('/api/sync/pull');
        if (!res.ok) throw new Error('Failed to pull data');

        const data = await res.json();

        // Gunakan Dexie transaction untuk memastikan atomic update
        await db.transaction('rw', [
          db.users, db.tenants, db.halaqahs, db.students, db.mutabaahs, db.quotes, db.session
        ], async () => {
          
          if (data.users?.length) {
            await db.users.bulkPut(data.users);
          }
          if (data.tenants?.length) {
            await db.tenants.bulkPut(data.tenants);
          }
          if (data.halaqahs?.length) {
            await db.halaqahs.bulkPut(data.halaqahs);
          }
          if (data.students?.length) {
            await db.students.bulkPut(data.students);
          }
          if (data.mutabaahs?.length) {
            await db.mutabaahs.bulkPut(data.mutabaahs);
          }
          if (data.quotes?.length) {
            await db.quotes.bulkPut(data.quotes);
          }
          
          if (data.session) {
             await db.session.put(data.session);
          }
        });

        console.log('✅ Initial sync completed successfully');
      } catch (err: any) {
        console.error('Initial sync failed:', err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setIsSyncing(false);
      }
    }

    performSync();

    return () => {
      mounted = false;
    };
  }, [status]); // Run when auth status changes to authenticated

  return { isSyncing, error };
}
