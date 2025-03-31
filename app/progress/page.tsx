'use client';

import { useEffect, useState } from 'react';
import { Problem, Topic, Company } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

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

export default function Progress() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [bookmarkedProblems, setBookmarkedProblems] = useState<Problem[]>([]);
  const [revisionProblems, setRevisionProblems] = useState<Problem[]>([]);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Load problems from localStorage
  useEffect(() => {
    const savedProblems = localStorage.getItem('problems');
    if (savedProblems) {
      const parsedProblems = JSON.parse(savedProblems);
      setProblems(parsedProblems);
      setBookmarkedProblems(parsedProblems.filter((p: Problem) => p.starred));
      setRevisionProblems(getRandomRevisionProblems(parsedProblems));
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTimer && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      setActiveTimer(null);
    }
    return () => clearInterval(timer);
  }, [activeTimer, timeLeft]);

  const getRandomRevisionProblems = (allProblems: Problem[]): Problem[] => {
    const solvedProblems = allProblems.filter(p => p.attempts.length > 0 && !p.starred);
    const shuffled = [...solvedProblems].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5); // Return 5 random problems
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (problemId: string, duration: number = 1800) => { // Default 30 minutes
    setActiveTimer(problemId);
    setTimeLeft(duration);
  };

  const stopTimer = () => {
    setActiveTimer(null);
    setTimeLeft(0);
  };

  const toggleBookmark = (problemId: string) => {
    const updatedProblems = problems.map(problem => {
      if (problem.id === problemId) {
        return { ...problem, starred: !problem.starred };
      }
      return problem;
    });

    setProblems(updatedProblems);
    setBookmarkedProblems(updatedProblems.filter(p => p.starred));
    setRevisionProblems(getRandomRevisionProblems(updatedProblems));
    localStorage.setItem('problems', JSON.stringify(updatedProblems));
  };

  const handleAttemptToggle = (problemId: string, attemptIndex: number) => {
    const updatedProblems = problems.map(problem => {
      if (problem.id === problemId) {
        const attempts = [...(problem.attempts || [])];
        const attempt = attempts[attemptIndex];
        
        if (attempt) {
          // If attempt exists, remove it
          attempts.splice(attemptIndex, 1);
        } else {
          // If no attempt exists, add a new successful attempt
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
    });

    setProblems(updatedProblems);
    setBookmarkedProblems(updatedProblems.filter(p => p.starred));
    setRevisionProblems(getRandomRevisionProblems(updatedProblems));
    localStorage.setItem('problems', JSON.stringify(updatedProblems));
  };

  if (!mounted) return null;

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

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Progress Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Problems</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{problems.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Solved Problems</h3>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {problems.filter(p => p.attempts.length > 0).length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bookmarked Problems</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {bookmarkedProblems.length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Mastered Problems</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {problems.filter(p => p.attempts.length >= 3).length}
            </p>
          </div>
        </div>

        {/* Bookmarked Problems */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Bookmarked Problems</h2>
          <div className="space-y-4">
            {bookmarkedProblems.map((problem) => (
              <Collapsible key={problem.id}>
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-lg">
                  <div className="group border-l-4 border-transparent px-6 py-4 transition-all duration-200 ease-in-out hover:border-l-yellow-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {[0, 1, 2].map((attemptIndex) => {
                            const attempt = problem.attempts?.[attemptIndex];
                            return (
                              <button
                                key={attemptIndex}
                                onClick={() => handleAttemptToggle(problem.id, attemptIndex)}
                                className={cn(
                                  "relative h-5 w-5 rounded-full border-2 transition-colors duration-200 cursor-pointer",
                                  attempt?.successful
                                    ? "border-green-500 bg-green-500"
                                    : "border-gray-300 dark:border-gray-600"
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
                        <CollapsibleTrigger className="flex items-center space-x-4">
                          <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                            {problem.title}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">
                              {problem.topic}
                            </Badge>
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
                          </div>
                        </CollapsibleTrigger>
                      </div>
                      <div className="flex items-center space-x-4">
                        {activeTimer === problem.id ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-mono text-blue-600 dark:text-blue-400">
                              {formatTime(timeLeft)}
                            </span>
                            <button
                              onClick={stopTimer}
                              className="rounded-full p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startTimer(problem.id)}
                            className="rounded-full p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => toggleBookmark(problem.id)}
                          className={cn(
                            "rounded-full p-2 transition-colors duration-200",
                            problem.starred
                              ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                              : "text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800"
                          )}
                        >
                          <svg
                            className="h-5 w-5"
                            fill={problem.starred ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
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
            ))}
          </div>
        </section>

        {/* Revision Section */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Revision Problems</h2>
          <div className="space-y-4">
            {revisionProblems.map((problem) => (
              <Collapsible key={problem.id}>
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-lg">
                  <div className="group border-l-4 border-transparent px-6 py-4 transition-all duration-200 ease-in-out hover:border-l-blue-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {[0, 1, 2].map((attemptIndex) => {
                            const attempt = problem.attempts?.[attemptIndex];
                            return (
                              <button
                                key={attemptIndex}
                                onClick={() => handleAttemptToggle(problem.id, attemptIndex)}
                                className={cn(
                                  "relative h-5 w-5 rounded-full border-2 transition-colors duration-200 cursor-pointer",
                                  attempt?.successful
                                    ? "border-green-500 bg-green-500"
                                    : "border-gray-300 dark:border-gray-600"
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
                        <CollapsibleTrigger className="flex items-center space-x-4">
                          <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                            {problem.title}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">
                              {problem.topic}
                            </Badge>
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
                          </div>
                        </CollapsibleTrigger>
                      </div>
                      <div className="flex items-center space-x-4">
                        {activeTimer === problem.id ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-mono text-blue-600 dark:text-blue-400">
                              {formatTime(timeLeft)}
                            </span>
                            <button
                              onClick={stopTimer}
                              className="rounded-full p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startTimer(problem.id)}
                            className="rounded-full p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => toggleBookmark(problem.id)}
                          className={cn(
                            "rounded-full p-2 transition-colors duration-200",
                            problem.starred
                              ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                              : "text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800"
                          )}
                        >
                          <svg
                            className="h-5 w-5"
                            fill={problem.starred ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
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
            ))}
          </div>
        </section>
      </main>
    </div>
  );
} 