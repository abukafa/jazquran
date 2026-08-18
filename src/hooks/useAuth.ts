import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { db } from "@/lib/dexie";
import { useLiveQuery } from "dexie-react-hooks";

export function useAuth() {
  const { data: session, status } = useSession();
  const [isOfflineAuth, setIsOfflineAuth] = useState(false);

  // Coba ambil session dari local Dexie jika NextAuth tidak punya session (offline)
  const localSession = useLiveQuery(() => db.session.get("current_session"));

  const user = session?.user || localSession?.user;
  const isAuthenticated = status === "authenticated" || !!localSession?.user;
  const isLoading = status === "loading" && !localSession;

  useEffect(() => {
    if (status === "unauthenticated" && localSession?.user && !navigator.onLine) {
      setIsOfflineAuth(true);
    } else {
      setIsOfflineAuth(false);
    }
  }, [status, localSession]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isOfflineAuth,
    session: session || localSession,
  };
}
