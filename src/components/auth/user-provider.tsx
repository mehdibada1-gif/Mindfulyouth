'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, Auth, IdTokenResult } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

export interface UserContextType {
  user: (User & { idToken: IdTokenResult | null }) | null;
  loading: boolean;
  auth: Auth;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/login', '/signup'];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<(User & { idToken: IdTokenResult | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdTokenResult();
        setUser({ ...firebaseUser, idToken });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!loading && !user && !PUBLIC_ROUTES.includes(pathname)) {
        router.push('/login');
    }
    if (!loading && user && PUBLIC_ROUTES.includes(pathname)) {
        router.push('/');
    }
  }, [user, loading, pathname, router]);


  return (
    <UserContext.Provider value={{ user, loading, auth }}>
      {loading ? <div>Loading...</div> : children}
    </UserContext.Provider>
  );
};
