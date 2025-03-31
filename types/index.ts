export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Topic = 
  | 'Arrays'
  | 'Linked List'
  | 'Stack'
  | 'Queue'
  | 'Trees'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Backtracking'
  | 'Binary Search'
  | 'Sorting'
  | 'Hashing'
  | 'Strings'
  | 'Math'
  | 'Bit Manipulation'
  | 'System Design'
  | 'Greedy'
  | 'Heap'
  | 'Trie'
  | 'Sliding Window'
  | 'Two Pointers'
  | 'Matrix'
  | 'Other';

export type Company = 
  | 'Google'
  | 'Microsoft'
  | 'Amazon'
  | 'Facebook'
  | 'Apple'
  | 'Netflix'
  | 'Twitter'
  | 'LinkedIn'
  | 'Uber'
  | 'Airbnb'
  | 'Other';

export interface Problem {
  id: string;
  title: string;
  topic: Topic;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companies: Company[];
  questionLink: string;
  videoId: string;
  completed: boolean;
  starred: boolean;
  addedAt: string;
  lastAttempted?: string;
  attempts: {
    date: string;
    successful: boolean;
  }[];
}

export interface Progress {
  completedProblems: string[];
  starredProblems: string[];
  lastUpdated: string;
}

export interface Filters {
  topic: Topic | 'All';
  difficulty: Difficulty | 'All';
  company: Company | 'All';
  status: 'All' | 'Todo' | 'Done';
  starred: boolean;
} 