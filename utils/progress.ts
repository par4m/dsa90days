'use client';

export function getProgress() {
  if (typeof window === 'undefined') {
    return {
      completedProblems: [],
      starredProblems: [],
      lastUpdated: new Date().toISOString()
    };
  }

  const storedProgress = localStorage.getItem('progress');
  if (!storedProgress) {
    return {
      completedProblems: [],
      starredProblems: [],
      lastUpdated: new Date().toISOString()
    };
  }
  return JSON.parse(storedProgress);
}

export function updateProgress(problemId: string, completed: boolean) {
  if (typeof window === 'undefined') return;

  const progress = getProgress();
  const completedProblems = new Set(progress.completedProblems);
  
  if (completed) {
    completedProblems.add(problemId);
  } else {
    completedProblems.delete(problemId);
  }
  
  const updatedProgress = {
    ...progress,
    completedProblems: Array.from(completedProblems),
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem('progress', JSON.stringify(updatedProgress));
  return updatedProgress;
}

export function toggleStarred(problemId: string) {
  if (typeof window === 'undefined') return;

  const progress = getProgress();
  const starredProblems = new Set(progress.starredProblems || []);
  
  if (starredProblems.has(problemId)) {
    starredProblems.delete(problemId);
  } else {
    starredProblems.add(problemId);
  }
  
  const updatedProgress = {
    ...progress,
    starredProblems: Array.from(starredProblems),
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem('progress', JSON.stringify(updatedProgress));
  return updatedProgress;
} 