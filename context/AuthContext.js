'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initFirebase } from '@/lib/firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auth, db } = initFirebase();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data());
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (fullName, email, password) => {
    const { auth, db } = initFirebase();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await updateProfile(cred.user, { displayName: fullName });
    } catch (err) {
      console.warn('Could not update display name:', err.message);
    }
    try {
      await setDoc(doc(db, 'users', cred.user.uid), {
        fullName,
        email,
        role: 'patient',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not save user profile to Firestore:', err.message);
    }
    return cred.user;
  };

  const login = (email, password) => {
    const { auth } = initFirebase();
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    const { auth } = initFirebase();
    return firebaseSignOut(auth);
  };

  const resetPassword = (email) => {
    const { auth } = initFirebase();
    return sendPasswordResetEmail(auth, email);
  };

  const value = { user, userProfile, loading, signup, login, logout, resetPassword };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
