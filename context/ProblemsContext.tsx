'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Problem } from '@/types';
import { getPlaylistItems } from '@/utils/youtube';

interface ProblemsContextType {
  problems: Problem[];
  setProblems: (problems: Problem[]) => void;
  isLoading: boolean;
}

const ProblemsContext = createContext<ProblemsContextType | undefined>(undefined);

export function ProblemsProvider({ children }: { children: ReactNode }) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const isInitialMount = useRef(true);

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Load problems only once on initial mount
  useEffect(() => {
    if (!mounted || !isInitialMount.current) return;

    const loadProblems = async () => {
      try {
        // Check if we have problems in localStorage
        const savedProblems = localStorage.getItem('problems');
        if (savedProblems) {
          setProblems(JSON.parse(savedProblems));
          setIsLoading(false);
          return;
        }

        // Only fetch if we don't have problems in localStorage
        const fetchedProblems = await getPlaylistItems();
        if (mounted) { // Only update state if component is still mounted
          setProblems(fetchedProblems);
          localStorage.setItem('problems', JSON.stringify(fetchedProblems));
        }
      } catch (error) {
        console.error('Error loading problems:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadProblems();
    isInitialMount.current = false;
  }, [mounted]);

  // Function to update problems and localStorage
  const updateProblems = (newProblems: Problem[]) => {
    if (mounted) {
      setProblems(newProblems);
      localStorage.setItem('problems', JSON.stringify(newProblems));
    }
  };

  return (
    <ProblemsContext.Provider value={{ problems, setProblems: updateProblems, isLoading }}>
      {children}
    </ProblemsContext.Provider>
  );
}

export function useProblems() {
  const context = useContext(ProblemsContext);
  if (context === undefined) {
    throw new Error('useProblems must be used within a ProblemsProvider');
  }
  return context;
} 