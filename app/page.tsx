'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Problem, Topic, Company } from '@/types';
import { getPlaylistItems } from '@/utils/youtube';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useProblemsStore } from '@/store/problems';

const topics: Topic[] = [
  'Arrays',
  'Linked List',
  'Stack',
  'Queue',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Backtracking',
  'Binary Search',
  'Sorting',
  'Hashing',
  'Strings',
  'Math',
  'Bit Manipulation',
  'System Design',
  'Greedy',
  'Heap',
  'Trie',
  'Sliding Window',
  'Two Pointers',
  'Matrix',
  'Other'
];

const NavLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
  <a
    href={href}
    className={cn(
      "text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors",
      className
    )}
  >
    {children}
  </a>
);

export default function Home() {
  const { problems, error, handleProblemToggle, toggleBookmark, hasFetched, isHydrated, fetchProblems, hydrate } = useProblemsStore();
  const [showTags, setShowTags] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'difficulty' | 'title' | 'topic'>('difficulty');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expandedProblems, setExpandedProblems] = useState<Set<string>>(new Set());
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const difficulties: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];

  // Handle initial mount and hydration
  useEffect(() => {
    setMounted(true);
    hydrate();
    return () => setMounted(false);
  }, [hydrate]);

  // Fetch problems if needed
  useEffect(() => {
    if (!mounted || !isHydrated) return;
    
    if (!hasFetched && problems.length === 0) {
      fetchProblems();
    }
  }, [mounted, isHydrated, hasFetched, problems.length, fetchProblems]);

  // Load user preferences from localStorage
  useEffect(() => {
    if (!mounted || !isHydrated) return;

    try {
      const savedShowTags = localStorage.getItem('showTags');
      const savedSelectedTopic = localStorage.getItem('selectedTopic');
      const savedSelectedDifficulty = localStorage.getItem('selectedDifficulty');
      const savedSelectedCompany = localStorage.getItem('selectedCompany');
      const savedSortBy = localStorage.getItem('sortBy');
      const savedSortOrder = localStorage.getItem('sortOrder');

      if (savedShowTags) setShowTags(JSON.parse(savedShowTags));
      if (savedSelectedTopic) setSelectedTopic(JSON.parse(savedSelectedTopic));
      if (savedSelectedDifficulty) setSelectedDifficulty(JSON.parse(savedSelectedDifficulty));
      if (savedSelectedCompany) setSelectedCompany(JSON.parse(savedSelectedCompany));
      if (savedSortBy) setSortBy(JSON.parse(savedSortBy));
      if (savedSortOrder) setSortOrder(JSON.parse(savedSortOrder));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [mounted, isHydrated]);

  // Debounced save user preferences to localStorage
  useEffect(() => {
    if (!mounted) return;
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('showTags', JSON.stringify(showTags));
        localStorage.setItem('selectedTopic', JSON.stringify(selectedTopic));
        localStorage.setItem('selectedDifficulty', JSON.stringify(selectedDifficulty));
        localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
        localStorage.setItem('sortBy', JSON.stringify(sortBy));
        localStorage.setItem('sortOrder', JSON.stringify(sortOrder));
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [mounted, showTags, selectedTopic, selectedDifficulty, selectedCompany, sortBy, sortOrder]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setActiveTimer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, timeLeft]);

  // Memoize filtered and sorted problems
  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchesTopic = !selectedTopic || problem.topic === selectedTopic;
      const matchesDifficulty = !selectedDifficulty || problem.difficulty === selectedDifficulty;
      const matchesCompany = !selectedCompany || problem.companies.includes(selectedCompany);
      const matchesSearch = !searchQuery || 
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.topic.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTopic && matchesDifficulty && matchesCompany && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'difficulty') {
        const difficultyOrder = { 'Easy': 0, 'Medium': 1, 'Hard': 2 };
        return sortOrder === 'asc' 
          ? difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
          : difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
      } else if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else {
        return sortOrder === 'asc'
          ? a.topic.localeCompare(b.topic)
          : b.topic.localeCompare(a.topic);
      }
    });
  }, [problems, selectedTopic, selectedDifficulty, selectedCompany, searchQuery, sortBy, sortOrder]);

  // Memoize handlers
  const handleAttemptProblem = useCallback((problemId: string) => {
    handleProblemToggle(problemId, 0);
  }, [handleProblemToggle]);

  const toggleProblemExpand = useCallback((problemId: string) => {
    setExpandedProblems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(problemId)) {
        newSet.delete(problemId);
      } else {
        newSet.add(problemId);
      }
      return newSet;
    });
  }, []);

  const startTimer = useCallback((problemId: string, duration: number = 1800) => {
    setActiveTimer(problemId);
    setTimeLeft(duration);
  }, []);

  const stopTimer = useCallback(() => {
    setActiveTimer(null);
    setTimeLeft(0);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't return null during hydration, just show a loading state
  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-200">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">DSA90</h1>
                <div className="hidden md:block ml-10 space-x-8">
                  <NavLink href="/" className="relative group">
                    Problems
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                  </NavLink>
                  <NavLink href="/progress" className="relative group">
                    Progress
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                  </NavLink>
                  <NavLink href="/resources" className="relative group">
                    Resources
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                  </NavLink>
                </div>
              </div>
            </div>
          </nav>
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">DSA90</h1>
              <div className="hidden md:block ml-10 space-x-8">
                <NavLink href="/" className="relative group">
                  Problems
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </NavLink>
                <NavLink href="/progress" className="relative group">
                  Progress
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </NavLink>
                <NavLink href="/resources" className="relative group">
                  Resources
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                {theme === 'dark' ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <a
                href="https://github.com/par4m/dsa90days"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </nav>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-80 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-lg px-6 py-8">
          <div className="space-y-8">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2 pl-10 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Topics Section */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-semibold text-gray-900 dark:text-gray-100">
                Topics
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({selectedTopic ? '1 selected' : 'All'})
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out text-left",
                        selectedTopic === topic
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20"
                          : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Difficulty Section */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-semibold text-gray-900 dark:text-gray-100">
                Difficulty
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({selectedDifficulty || 'All'})
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="flex gap-2">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
                      className={cn(
                        "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out",
                        selectedDifficulty === difficulty
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      )}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Companies Section */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-semibold text-gray-900 dark:text-gray-100">
                Companies
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({selectedCompany || 'All'})
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  {['Google', 'Microsoft', 'Amazon', 'Facebook', 'Apple', 'Netflix', 'Twitter', 'LinkedIn', 'Uber', 'Airbnb', 'Other'].map((company) => (
                    <button
                      key={company}
                      onClick={() => setSelectedCompany(selectedCompany === company ? null : company as Company)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out text-left",
                        selectedCompany === company
                          ? company === 'Google' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20"
                          : company === 'Microsoft' ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 ring-1 ring-green-500/20"
                          : company === 'Amazon' ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 ring-1 ring-yellow-500/20"
                          : company === 'Facebook' ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20"
                          : company === 'Apple' ? "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 ring-1 ring-gray-500/20"
                          : company === 'Netflix' ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 ring-1 ring-red-500/20"
                          : company === 'Twitter' ? "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20"
                          : company === 'LinkedIn' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20"
                          : company === 'Uber' ? "bg-black dark:bg-gray-900 text-white dark:text-gray-100 ring-1 ring-black/20"
                          : company === 'Airbnb' ? "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 ring-1 ring-pink-500/20"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 ring-1 ring-gray-500/20"
                          : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      {company}
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Stats Section */}
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white/50 dark:bg-gray-950/50 backdrop-blur-lg">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Overall Progress</h3>
                <dl className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Completed</dt>
                    <dd className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                      {problems.filter(p => p.attempts?.length > 0).length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Remaining</dt>
                    <dd className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                      {problems.length - problems.filter(p => p.attempts?.length > 0).length}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Progress by Topic</h3>
                <div className="mt-4 space-y-3">
                  {topics.map((topic) => {
                    const topicProblems = problems.filter(p => p.topic === topic);
                    const completedCount = topicProblems.filter(p => p.attempts?.length === 3).length;
                    const progress = (completedCount / topicProblems.length) * 100;

                    return (
                      <div key={topic}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{topic}</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {completedCount}/{topicProblems.length}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-in-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Progress by Company</h3>
                <div className="mt-4 space-y-3">
                  {['Google', 'Microsoft', 'Amazon', 'Facebook', 'Apple', 'Netflix', 'Twitter', 'LinkedIn', 'Uber', 'Airbnb'].map((company) => {
                    const companyProblems = problems.filter(p => p.companies.includes(company as Company));
                    const completedCount = companyProblems.filter(p => p.attempts?.length === 3).length;
                    const progress = (completedCount / companyProblems.length) * 100;

                    return (
                      <div key={company}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{company}</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {completedCount}/{companyProblems.length}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-in-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Progress by Difficulty</h3>
                <div className="mt-4 space-y-3">
                  {['Easy', 'Medium', 'Hard'].map((difficulty) => {
                    const difficultyProblems = problems.filter(p => p.difficulty === difficulty);
                    const completedCount = difficultyProblems.filter(p => p.attempts?.length === 3).length;
                    const progress = (completedCount / difficultyProblems.length) * 100;

                    return (
                      <div key={difficulty}>
                        <div className="flex items-center justify-between text-sm">
                          <span className={cn(
                            "font-medium",
                            difficulty === 'Easy' ? "text-green-600 dark:text-green-400"
                            : difficulty === 'Medium' ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                          )}>
                            {difficulty}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {completedCount}/{difficultyProblems.length}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300 ease-in-out",
                              difficulty === 'Easy' ? "bg-green-500"
                              : difficulty === 'Medium' ? "bg-yellow-500"
                              : "bg-red-500"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8">
          {/* Controls */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {viewMode === 'grid' ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'difficulty' | 'title' | 'topic')}
                className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="difficulty">Sort by Difficulty</option>
                <option value="title">Sort by Title</option>
                <option value="topic">Sort by Topic</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortOrder === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Show Tags</span>
              <button
                onClick={() => setShowTags(!showTags)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-all duration-200 ease-in-out",
                  showTags ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <span
                  className={cn(
                    "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out",
                    showTags ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {problems.filter(p => p.attempts?.length > 0).length}
                  <span className="text-gray-400 dark:text-gray-500">/{problems.length}</span>
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">problems solved</div>
              </div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-in-out"
                style={{
                  width: `${(problems.filter(p => p.attempts?.length > 0).length / problems.length) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Problem List/Grid */}
          <div className={cn(
            "space-y-4",
            viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          )}>
            {filteredProblems.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No problems found</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
                </div>
              </div>
            ) : (
              filteredProblems.map((problem) => (
                <Collapsible key={problem.id}>
                  <div className={cn(
                    "overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-lg transition-all duration-200 ease-in-out hover:shadow-md",
                    viewMode === 'grid' ? "h-full" : ""
                  )}>
                    <div className="group border-l-4 border-transparent px-6 py-4 transition-all duration-200 ease-in-out hover:border-l-blue-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {[0, 1, 2].map((attemptIndex) => {
                              const attempt = problem.attempts?.[attemptIndex];
                              return (
                                <button
                                  key={attemptIndex}
                                  onClick={() => handleProblemToggle(problem.id, attemptIndex)}
                                  className={cn(
                                    "relative h-5 w-5 rounded-full border-2 transition-colors duration-200",
                                    attempt?.successful
                                      ? "border-green-500 bg-green-500"
                                      : "border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500"
                                  )}
                                  title={attempt ? `Solved on ${new Date(attempt.date).toLocaleDateString()}` : "Not solved yet"}
                                >
                                  {attempt?.successful && (
                                    <svg
                                      className="absolute inset-0 h-full w-full text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => toggleBookmark(problem.id)}
                            className={cn(
                              "transition-colors duration-200 ease-in-out",
                              problem.starred ? "text-yellow-400" : "text-gray-300 dark:text-gray-600 hover:text-yellow-400"
                            )}
                          >
                            <svg className="h-6 w-6" fill={problem.starred ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                          <CollapsibleTrigger className="flex items-center space-x-4">
                            <span className={cn(
                              "text-base font-medium transition-colors duration-200 ease-in-out",
                              problem.completed ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-900 dark:text-gray-100"
                            )}>
                              {problem.title}
                            </span>
                            <div className="flex items-center space-x-2">
                              {showTags && (
                                <>
                                  <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">
                                    {problem.topic}
                                  </Badge>
                                  {problem.companies.map((company) => (
                                    <Badge
                                      key={company}
                                      variant="secondary"
                                      className={cn(
                                        "font-medium",
                                        company === 'Google' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                        : company === 'Microsoft' ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                                        : company === 'Amazon' ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                                        : company === 'Facebook' ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                                        : company === 'Apple' ? "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400"
                                        : company === 'Netflix' ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                        : company === 'Twitter' ? "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400"
                                        : company === 'LinkedIn' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                        : company === 'Uber' ? "bg-black dark:bg-gray-900 text-white dark:text-gray-100"
                                        : company === 'Airbnb' ? "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                                      )}
                                    >
                                      {company}
                                    </Badge>
                                  ))}
                                </>
                              )}
                            </div>
                          </CollapsibleTrigger>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge
                            variant={problem.difficulty.toLowerCase() as any}
                            className={cn(
                              "px-3 py-0.5 font-medium",
                              problem.difficulty === 'Easy' ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                                : problem.difficulty === 'Medium' ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                                : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                            )}
                          >
                            {problem.difficulty}
                          </Badge>
                          <CollapsibleTrigger className="rounded-full p-1.5 text-gray-400 dark:text-gray-500 transition-all duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800">
                            <svg className="h-5 w-5 transition-transform duration-200 ease-in-out group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                    </div>
                    <CollapsibleContent>
                      <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-lg px-6 py-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center space-x-6">
                            <a
                              href={problem.questionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleAttemptProblem(problem.id)}
                              className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors duration-200 ease-in-out hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span>View Problem</span>
                            </a>
                            <a
                              href={`https://www.youtube.com/watch?v=${problem.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleAttemptProblem(problem.id)}
                              className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors duration-200 ease-in-out hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Watch Solution</span>
                            </a>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Added {new Date(problem.addedAt).toLocaleDateString()}
                            </span>
                            {problem.lastAttempted && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Last attempted {new Date(problem.lastAttempted).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}