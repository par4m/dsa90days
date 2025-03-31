'use client';

import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const resources = [
  {
    id: '1',
    title: 'COMPLETE DSA in 90 Days for Placements 2025 | Course Outline-2',
    videoId: '4QICEX1cP9Q',
    description: 'A comprehensive guide to mastering Data Structures and Algorithms in 90 days for 2025 placements.',
    tags: ['#dsa', '#course-outline'],
    addedAt: '2024-03-20',
  },
  {
    id: '2',
    title: 'DSA in 90 Days for Placements 2025 | Course Outline | Crack Coding Interviews!',
    videoId: 'fmxRItl_CfY',
    description: 'Learn how to crack coding interviews with our structured 90-day DSA course outline.',
    tags: ['#dsa', '#course-outline', '#interview-prep'],
    addedAt: '2024-03-19',
  },
  {
    id: '3',
    title: 'Top 10 LeetCode Tips & Resources to Ace Coding Interviews!',
    videoId: 'xxb4HSKwTBo',
    description: 'Essential tips and resources to help you excel in LeetCode and coding interviews.',
    tags: ['#leetcode', '#interview-tips', '#resources'],
    addedAt: '2024-03-18',
  },
  {
    id: '4',
    title: '3 Months DSA for Placements! Beginner, Medium & Advanced Level!',
    videoId: 'hw2nv3jIgZs',
    description: 'A structured 3-month plan covering DSA from beginner to advanced level for placements.',
    tags: ['#dsa', '#leetcode', '#java', '#course-plan'],
    addedAt: '2024-03-17',
  },
];

export default function Resources() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">DSA90</h1>
              <div className="hidden md:block ml-10 space-x-8">
                <a href="/" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Problems
                </a>
                <a href="/progress" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Progress
                </a>
                <a href="/resources" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Resources
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Course Resources</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Essential videos and guides to help you master DSA and crack coding interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-lg transition-all duration-200 ease-in-out hover:shadow-md"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Video Thumbnail */}
                <a
                  href={`https://www.youtube.com/watch?v=${resource.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800 group"
                >
                  <img
                    src={`https://img.youtube.com/vi/${resource.videoId}/maxresdefault.jpg`}
                    alt={resource.title}
                    className="h-full w-full object-cover transition-transform duration-200 ease-in-out group-hover:scale-105"
                    onError={(e) => {
                      // Fallback to medium quality thumbnail if maxresdefault is not available
                      const target = e.target as HTMLImageElement;
                      target.src = `https://img.youtube.com/vi/${resource.videoId}/mqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100">
                    <div className="rounded-full bg-red-600 p-4">
                      <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* Content */}
                <div className="p-6 flex flex-col">
                  <div className="flex items-center justify-end">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(resource.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {resource.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {resource.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${resource.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Watch on YouTube
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 