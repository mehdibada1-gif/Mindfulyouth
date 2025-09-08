
'use client';

import { useContext } from 'react';
import { UserContext } from '@/components/auth/user-provider';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    updateEmail,
    updatePassword,
    updateProfile,
    type UserCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FullUserProfile } from '@/components/auth/user-provider';


export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  const { user, auth, loading } = context;

  const signUp = async (email: string, password: string): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create user profile in firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: '',
      photoURL: '',
      country: '',
    });
    return userCredential;
  };

  const signIn = (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const updateUserProfile = async (data: Partial<FullUserProfile> & { password?: string }) => {
     if (!auth.currentUser) throw new Error("User not found");
     const currentUser = auth.currentUser;

     // Update Auth Profile (displayName, photoURL)
     if (data.displayName !== undefined || data.photoURL !== undefined) {
        await updateProfile(currentUser, {
            displayName: data.displayName,
            photoURL: data.photoURL
        });
     }
    
     // Update Auth Email
     if (data.email && data.email !== currentUser.email) {
         await updateEmail(currentUser, data.email);
     }

     // Update Auth Password
     if (data.password) {
         await updatePassword(currentUser, data.password);
     }

     // Update Firestore Profile
     const userDocRef = doc(db, 'users', currentUser.uid);
     const firestoreUpdates: Partial<FullUserProfile> = {};
     if (data.displayName !== undefined) firestoreUpdates.displayName = data.displayName;
     if (data.photoURL !== undefined) firestoreUpdates.photoURL = data.photoURL;
     if (data.country !== undefined) firestoreUpdates.country = data.country;
     if (data.email !== undefined) firestoreUpdates.email = data.email;

     if (Object.keys(firestoreUpdates).length > 0) {
        await setDoc(userDocRef, firestoreUpdates, { merge: true });
     }
     
     // Manually refresh the user to get the latest profile data
     await currentUser.reload();
  };

  const uploadProfilePicture = async (file: File): Promise<string> => {
    if (!auth.currentUser) throw new Error("User not found");
    const storage = getStorage();
    const storageRef = ref(storage, `profile-pictures/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await updateUserProfile({ photoURL: downloadURL });

    return downloadURL;
  }

  return { 
      user,
      loading,
      signUp, 
      signIn, 
      signOut, 
      updateUserProfile,
      uploadProfilePicture
    };
};
