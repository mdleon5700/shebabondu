'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { CandidateDocument, CandidateProfile } from '@/lib/types';
import { storage } from '@/lib/store';

interface CandidateData {
  profile: CandidateProfile | null;
  documents: CandidateDocument[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const Context = createContext<CandidateData>({ profile: null, documents: [], loading: true, refresh: async () => {} });

export function CandidateDataProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const generation = useRef(0);

  const refresh = useCallback(async () => {
    const current = ++generation.current;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('cs_session_token') : null;
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch('/api/profile', { cache: 'no-store', headers });
      if (!response.ok) throw new Error('Failed to load profile');
      const data = await response.json();
      if (current !== generation.current) return;
      if (!data.profile) {
        setProfile(null);
        setDocuments([]);
        return;
      }
      const docsResponse = await fetch('/api/documents', { cache: 'no-store', headers });
      if (!docsResponse.ok) throw new Error('Failed to load documents');
      const docs = await docsResponse.json();
      if (current !== generation.current) return;
      storage.setAuth({ isLoggedIn: true, role: 'candidate', userId: data.profile.id, name: data.profile.name, phone: data.profile.phone });
      storage.updateUser(data.profile);
      storage.replaceDocuments(docs.documents || []);
      setProfile(data.profile);
      setDocuments(docs.documents || []);
    } catch {
      if (current === generation.current) {
        // Fallback to cached profile instead of wiping to empty!
        const auth = storage.getAuth();
        if (auth.isLoggedIn && auth.role === 'candidate') {
          setProfile(storage.getUser());
          setDocuments(storage.getDocuments());
        }
      }
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const fromCache = () => {
      const auth = storage.getAuth();
      setProfile(auth.isLoggedIn && auth.role === 'candidate' ? storage.getUser() : null);
      setDocuments(auth.isLoggedIn ? storage.getDocuments() : []);
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('cs_user_changed', fromCache);
    window.addEventListener('cs_docs_changed', fromCache);
    window.addEventListener('cs_auth_changed', fromCache);
    return () => {
      generation.current++;
      window.removeEventListener('focus', refresh);
      window.removeEventListener('cs_user_changed', fromCache);
      window.removeEventListener('cs_docs_changed', fromCache);
      window.removeEventListener('cs_auth_changed', fromCache);
    };
  }, [pathname, refresh]);

  return <Context.Provider value={{ profile, documents, loading, refresh }}>{children}</Context.Provider>;
}

export function useCandidateData() {
  return useContext(Context);
}
