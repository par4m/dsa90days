import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const PLAYLIST_ID = 'PLVItHqpXY_DArKRcfmGWykqV3u4hDaJLo';

if (!YOUTUBE_API_KEY) {
  throw new Error('NEXT_PUBLIC_YOUTUBE_API_KEY is not set in .env.local');
}

const targetTitles = [
  'COMPLETE DSA in 90 Days for Placements 2025 | Course Outline-2',
  'DSA in 90 Days for Placements 2025 | Course Outline | Crack Coding Interviews!',
  'Top 10 LeetCode Tips & Resources to Ace Coding Interviews!',
  '3 Months DSA for Placements! Beginner, Medium & Advanced Level!'
];

async function fetchPlaylistItems() {
  let allItems: any[] = [];
  let nextPageToken: string | undefined;

  do {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`
    );
    
    if (!response.ok) {
      console.error(`YouTube API error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      console.error('Invalid API response:', data);
      return;
    }

    allItems = [...allItems, ...data.items];
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  // Find matching videos
  const matchingVideos = allItems.filter(item => 
    targetTitles.some(title => item.snippet.title.includes(title))
  );

  // Print results
  console.log('Found matching videos:');
  matchingVideos.forEach(item => {
    console.log(`Title: ${item.snippet.title}`);
    console.log(`Video ID: ${item.snippet.resourceId.videoId}`);
    console.log('---');
  });
}

fetchPlaylistItems().catch(console.error); 