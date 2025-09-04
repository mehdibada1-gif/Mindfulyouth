'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, Auth, IdTokenResult } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


// Define a type for the full user profile, including firestore data
export interface FullUserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    country?: string;
}

export interface UserContextType {
  user: FullUserProfile | null;
  loading: boolean;
  auth: Auth;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/login', '/signup', '/'];
const AUTH_ROUTES = ['/login', '/signup'];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let profileData: FullUserProfile;
        if (userDoc.exists()) {
             profileData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                ...userDoc.data()
            };
        } else {
            // This can happen on first sign-up before firestore doc is created
            profileData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
            };
        }
        setUser(profileData);

      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/seed') || pathname.startsWith('/setup');
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (!user && !isPublicRoute) {
        router.push('/login');
    }
    if (user && isAuthRoute) {
        router.push('/chat');
    }
  }, [user, loading, pathname, router]);


  return (
    <UserContext.Provider value={{ user, loading, auth }}>
      {loading ? <div className="flex items-center justify-center h-screen">Loading...</div> : children}
    </UserContext.Provider>
  );
};
