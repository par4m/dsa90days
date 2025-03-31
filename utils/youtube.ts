'use client';

import { Topic, Problem } from '@/types';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const PLAYLIST_ID = 'PLVItHqpXY_DArKRcfmGWykqV3u4hDaJLo';

function getTopicFromTitle(title: string): Topic {
  // Extract category from text before |
  const categoryMatch = title.split('|')[0].trim().toLowerCase();
  
  // Map common variations to standardized topics
  // Binary Search specific check first to avoid confusion with Binary Trees
  if (categoryMatch.includes('binary search')) return 'Binary Search';
  
  // Rest of the categories
  if (categoryMatch.includes('array') || categoryMatch.includes('subarray')) return 'Arrays';
  if (categoryMatch.includes('linked list') || categoryMatch.includes('linkedlist')) return 'Linked List';
  if (categoryMatch.includes('stack') || categoryMatch.includes('monotonic')) return 'Stack';
  if (categoryMatch.includes('queue') || categoryMatch.includes('deque')) return 'Queue';
  if (categoryMatch.includes('tree') || categoryMatch.includes('bst') || categoryMatch.includes('binary tree')) return 'Trees';
  if (categoryMatch.includes('graph') || categoryMatch.includes('dfs') || categoryMatch.includes('bfs')) return 'Graphs';
  if (categoryMatch.includes('dp') || categoryMatch.includes('dynamic')) return 'Dynamic Programming';
  if (categoryMatch.includes('backtrack') || categoryMatch.includes('recursion')) return 'Backtracking';
  // String specific check - don't mix with substring operations
  if (categoryMatch.startsWith('string') || categoryMatch === 'strings') return 'Strings';
  if (categoryMatch.includes('sort') || categoryMatch.includes('merge sort')) return 'Sorting';
  if (categoryMatch.includes('hash') || categoryMatch.includes('map')) return 'Hashing';
  if (categoryMatch.includes('math') || categoryMatch.includes('number')) return 'Math';
  if (categoryMatch.includes('bit') || categoryMatch === 'binary') return 'Bit Manipulation';
  if (categoryMatch.includes('system') || categoryMatch.includes('design')) return 'System Design';
  if (categoryMatch.includes('greedy')) return 'Greedy';
  if (categoryMatch.includes('heap') || categoryMatch.includes('priority queue')) return 'Heap';
  if (categoryMatch.includes('trie')) return 'Trie';
  if (categoryMatch.includes('sliding window')) return 'Sliding Window';
  if (categoryMatch.includes('two pointer') || categoryMatch.includes('2 pointer')) return 'Two Pointers';
  if (categoryMatch.includes('matrix')) return 'Matrix';
  
  // Log uncategorized titles to help identify missing categories
  console.log('Uncategorized title:', title);
  return 'Other';
}

export function formatTitle(title: string): string {
  // First split by | to get the part after the topic
  const parts = title.split('|');
  let questionTitle = parts.length > 1 ? parts[1].trim() : parts[0].trim();
  
  // Remove difficulty tag if present (#easy, #medium, #hard)
  questionTitle = questionTitle.replace(/#(easy|medium|hard)/i, '').trim();
  
  // Remove any leading/trailing numbers, dots, or special characters
  questionTitle = questionTitle.replace(/^[\d\s.-]+/, '').trim();
  
  // Remove any text in parentheses
  questionTitle = questionTitle.replace(/\([^)]*\)/g, '').trim();
  
  // Remove any text in brackets
  questionTitle = questionTitle.replace(/\[[^\]]*\]/g, '').trim();
  
  // Remove any remaining special characters and extra spaces
  questionTitle = questionTitle.replace(/[^\w\s-]/g, '').trim();
  
  return questionTitle;
}

export async function getPlaylistItems(): Promise<Problem[]> {
  if (typeof window === 'undefined') {
    return getMockData();
  }

  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key is missing. Please add NEXT_PUBLIC_YOUTUBE_API_KEY to .env.local');
    return getMockData();
  }

  try {
    let allItems: any[] = [];
    let nextPageToken: string | undefined;

    do {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`
      );
      
      if (!response.ok) {
        console.error(`YouTube API error: ${response.status} ${response.statusText}`);
        return getMockData();
      }

      const data = await response.json();
      
      if (!data.items || !Array.isArray(data.items)) {
        console.error('Invalid API response:', data);
        return getMockData();
      }

      allItems = [...allItems, ...data.items];
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    // Filter out course outline videos
    const filteredItems = allItems.filter((item: any) => {
      const title = item.snippet.title.toLowerCase();
      return !title.includes('course outline') && 
             !title.includes('course plan') && 
             !title.includes('tips & resources') &&
             !title.includes('90 days for placements');
    });

    return filteredItems.map((item: any) => {
      const title = item.snippet.title;
      const videoId = item.snippet.resourceId.videoId;
      const publishedAt = item.snippet.publishedAt;
      const description = item.snippet.description;

      // Only use LeetCode link from description
      const leetCodeLink = extractLeetCodeLink(description);
      console.log('Title:', title);
      console.log('Found LeetCode link:', leetCodeLink);

      return {
        id: videoId,
        title,
        videoId,
        topic: getTopicFromTitle(title),
        difficulty: getDifficultyFromTitle(title),
        companies: getCompaniesFromTitle(title),
        questionLink: leetCodeLink || '', // Return empty string if no link found
        completed: false,
        starred: false,
        addedAt: publishedAt,
        attempts: []
      };
    });
  } catch (error) {
    console.error('Error fetching playlist items:', error);
    return getMockData();
  }
}

function extractLeetCodeLink(description: string): string | null {
  // First try to find a direct LeetCode link
  const directLinkRegex = /https:\/\/leetcode\.com\/problems\/[a-z0-9-]+(?:\/[a-z0-9-]*)?\/?/i;
  const directMatch = description.match(directLinkRegex);
  if (directMatch) {
    const url = directMatch[0];
    const cleanUrl = url.replace(/\/$/, ''); // Remove trailing slash if present
    console.log('Found direct LeetCode link:', cleanUrl);
    return cleanUrl;
  }

  // If no direct link found, try to find a link in a line containing "leetcode"
  const lines = description.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('leetcode')) {
      const linkMatch = line.match(/https:\/\/[^\s]+/i);
      if (linkMatch) {
        const url = linkMatch[0];
        const cleanUrl = url.replace(/\/$/, ''); // Remove trailing slash if present
        console.log('Found LeetCode link in line:', cleanUrl);
        return cleanUrl;
      }
    }
  }

  console.log('No LeetCode link found in description');
  return null;
}

// Mock data for development
const mockProblems: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    videoId: 'dQw4w9WgXcQ',
    completed: false,
    topic: 'Arrays',
    questionLink: 'https://leetcode.com/problems/two-sum/',
    companies: ['Google', 'Amazon', 'Microsoft'],
    starred: false,
    addedAt: new Date().toISOString(),
    attempts: []
  },
  {
    id: '2',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    videoId: 'dQw4w9WgXcQ',
    completed: false,
    topic: 'Stack',
    questionLink: 'https://leetcode.com/problems/valid-parentheses/',
    companies: ['Amazon', 'Microsoft'],
    starred: false,
    addedAt: new Date().toISOString(),
    attempts: []
  },
  {
    id: '3',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    videoId: 'dQw4w9WgXcQ',
    completed: false,
    topic: 'Linked List',
    questionLink: 'https://leetcode.com/problems/reverse-linked-list/',
    companies: ['Google', 'Facebook'],
    starred: false,
    addedAt: new Date().toISOString(),
    attempts: []
  },
  {
    id: '4',
    title: 'Binary Search',
    difficulty: 'Easy',
    videoId: 'dQw4w9WgXcQ',
    completed: false,
    topic: 'Binary Search',
    questionLink: 'https://leetcode.com/problems/binary-search/',
    companies: ['Amazon', 'Microsoft'],
    starred: false,
    addedAt: new Date().toISOString(),
    attempts: []
  },
  {
    id: '5',
    title: 'Climbing Stairs',
    difficulty: 'Medium',
    videoId: 'dQw4w9WgXcQ',
    completed: false,
    topic: 'Dynamic Programming',
    questionLink: 'https://leetcode.com/problems/climbing-stairs/',
    companies: ['Google', 'Amazon'],
    starred: false,
    addedAt: new Date().toISOString(),
    attempts: []
  },
];

function getMockData(): Problem[] {
  return mockProblems;
}

function getDifficultyFromTitle(title: string): 'Easy' | 'Medium' | 'Hard' {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('#easy')) return 'Easy';
  if (lowerTitle.includes('#medium')) return 'Medium';
  if (lowerTitle.includes('#hard')) return 'Hard';
  return 'Medium'; // default
}

function getCompaniesFromTitle(title: string): Problem['companies'] {
  const companies: Problem['companies'] = [];
  const companyKeywords: Record<Problem['companies'][number], string[]> = {
    'Google': ['google'],
    'Microsoft': ['microsoft', 'msft'],
    'Amazon': ['amazon', 'aws'],
    'Facebook': ['facebook', 'meta'],
    'Apple': ['apple'],
    'Netflix': ['netflix'],
    'Twitter': ['twitter'],
    'LinkedIn': ['linkedin'],
    'Uber': ['uber'],
    'Airbnb': ['airbnb'],
    'Other': []
  };

  for (const [company, keywords] of Object.entries(companyKeywords)) {
    if (keywords.some(keyword => title.toLowerCase().includes(keyword))) {
      companies.push(company as Problem['companies'][number]);
    }
  }

  return companies.length > 0 ? companies : ['Other'];
}

function getQuestionLinkFromTitle(title: string): string {
  // Remove any text before the first | if it exists
  const titleAfterPipe = title.split('|')[1]?.trim() || title.trim();
  
  // Remove course outline and level-related text
  const titleWithoutLevels = titleAfterPipe
    .replace(/(beginner|medium|advanced|level|course|outline|dsa|days|placements)/gi, '')
    .trim();
  
  // Remove difficulty tags if present
  const titleWithoutDifficulty = titleWithoutLevels.replace(/#(easy|medium|hard)/i, '').trim();
  
  // Remove any leading numbers, dots, or special characters
  const cleanTitle = titleWithoutDifficulty.replace(/^[\d\s.-]+/, '').trim();
  
  // Remove any text in parentheses or brackets
  const titleWithoutBrackets = cleanTitle.replace(/[\(\[].*?[\)\]]/g, '').trim();
  
  // Convert to URL-friendly slug
  const slug = titleWithoutBrackets
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `https://leetcode.com/problems/${slug}/`;
} 