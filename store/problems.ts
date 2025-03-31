import { create } from 'zustand';
import { Problem } from '@/types';
import { getPlaylistItems } from '@/utils/youtube';

interface ProblemsState {
  problems: Problem[];
  error: string | null;
  hasFetched: boolean;
  isHydrated: boolean;
  fetchProblems: () => Promise<void>;
  updateProblem: (problemId: string, updates: Partial<Problem>) => void;
  toggleBookmark: (problemId: string) => void;
  handleProblemToggle: (problemId: string, attemptIndex: number) => void;
  hydrate: () => void;
}

const initialState: ProblemsState = {
  problems: [],
  error: null,
  hasFetched: false,
  isHydrated: false,
  fetchProblems: async () => {},
  updateProblem: () => {},
  toggleBookmark: () => {},
  handleProblemToggle: () => {},
  hydrate: () => {},
};

// Load initial state from localStorage
const loadInitialState = (): Partial<ProblemsState> => {
  if (typeof window === 'undefined') return initialState;
  
  try {
    const savedState = localStorage.getItem('problemsState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        ...parsed,
        hasFetched: true,
        isHydrated: true
      };
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
  return initialState;
};

// Debounced save to localStorage
let saveTimeout: NodeJS.Timeout;
const debouncedSave = (state: Partial<ProblemsState>) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem('problemsState', JSON.stringify({
      ...state,
      hasFetched: true,
      isHydrated: true
    }));
  }, 1000);
};

const useProblemsStore = create<ProblemsState>()((set, get) => ({
  ...initialState,
  ...loadInitialState(),

  hydrate: () => {
    set({ isHydrated: true });
  },

  fetchProblems: async () => {
    // If we already have problems or have fetched before, don't fetch again
    if (get().hasFetched || get().problems.length > 0) {
      return;
    }

    try {
      const fetchedProblems = await getPlaylistItems();
      const sortedItems = fetchedProblems.sort((a, b) => {
        const difficultyOrder = { 'Easy': 0, 'Medium': 1, 'Hard': 2 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      });
      set({ 
        problems: sortedItems, 
        hasFetched: true,
        isHydrated: true
      });
      // Save to localStorage after fetching
      localStorage.setItem('problemsState', JSON.stringify({ 
        problems: sortedItems,
        hasFetched: true,
        isHydrated: true
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch problems',
        isHydrated: true
      });
    }
  },

  updateProblem: (problemId: string, updates: Partial<Problem>) => {
    set((state) => {
      const newState = {
        problems: state.problems.map((problem: Problem) =>
          problem.id === problemId ? { ...problem, ...updates } : problem
        ),
      };
      debouncedSave(newState);
      return newState;
    });
  },

  toggleBookmark: (problemId: string) => {
    set((state) => {
      const newState = {
        problems: state.problems.map((problem: Problem) =>
          problem.id === problemId
            ? { ...problem, starred: !problem.starred }
            : problem
        ),
      };
      debouncedSave(newState);
      return newState;
    });
  },

  handleProblemToggle: (problemId: string, attemptIndex: number) => {
    set((state) => {
      const newState = {
        problems: state.problems.map((problem: Problem) => {
          if (problem.id === problemId) {
            const attempts = [...(problem.attempts || [])];
            const attempt = attempts[attemptIndex];
            
            if (attempt) {
              attempts.splice(attemptIndex, 1);
            } else {
              attempts.push({
                date: new Date().toISOString(),
                successful: true
              });
            }

            return {
              ...problem,
              attempts,
              lastAttempted: attempts.length > 0 ? new Date().toISOString() : undefined
            };
          }
          return problem;
        }),
      };
      debouncedSave(newState);
      return newState;
    });
  },
}));

// Initialize store on client side
if (typeof window !== 'undefined') {
  const store = useProblemsStore.getState();
  if (!store.hasFetched && store.problems.length === 0) {
    store.fetchProblems();
  }
}

export { useProblemsStore }; 