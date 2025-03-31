DSA in 90 Days based on https://www.youtube.com/playlist?list=PLVItHqpXY_DArKRcfmGWykqV3u4hDaJLo

## 🌟 Features

### Core Features
- **Problem Tracking**: Track your progress across 90 days of DSA problems
- **Progress Monitoring**: Visual progress bars and statistics
- **YouTube Integration**: Direct links to problem solutions and explanations
- **Topic Organization**: Problems categorized by topics and difficulty levels
- **Company Tags**: Track which companies frequently ask each problem
- **Attempt Tracking**: Track multiple attempts for each problem
- **Bookmarking**: Save important problems for later review
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Customizable theme support

### Technical Features
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- YouTube Data API integration
- Local storage for data persistence
- Responsive and accessible design
- Modern UI components

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- YouTube Data API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/par4m/dsa90days.git
cd dsa90days
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
```

To get a YouTube API key:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API key)
5. Copy the API key to your `.env.local` file

### Running the Application

1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
dsa90days/
├── app/
│   ├── page.tsx              # Home page
│   ├── progress/
│   │   └── page.tsx         # Progress tracking page
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # Reusable UI components
│   └── problem-card.tsx     # Problem card component
├── lib/
│   └── utils.ts            # Utility functions
├── types/
│   └── index.ts            # TypeScript type definitions
├── utils/
│   └── youtube.ts          # YouTube API integration
├── public/                 # Static assets
└── styles/                 # Global styles
```

## 🔧 Configuration

### YouTube API Configuration
The application uses the YouTube Data API to fetch video information. You can configure the API settings in `utils/youtube.ts`:

```typescript
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const PLAYLIST_ID = 'your_playlist_id';
```

### Problem Data Structure
Problems are stored in the following format:
```typescript
interface Problem {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companies: string[];
  videoId: string;
  attempts: {
    date: string;
    successful: boolean;
  }[];
  starred: boolean;
  lastAttempted?: string;
  addedDate: string;
}
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

1. **Code Style**
   - Use TypeScript for all new code
   - Follow the existing code style
   - Use meaningful variable and function names
   - Add comments for complex logic

2. **Testing**
   - Add tests for new features
   - Ensure all tests pass before submitting PR
   - Test on both desktop and mobile

3. **Documentation**
   - Update README.md for new features
   - Add comments for complex functions
   - Document any new environment variables

4. **Performance**
   - Optimize images and assets
   - Minimize API calls
   - Use proper caching strategies

### Common Issues and Solutions

1. **YouTube API Quota Exceeded**
   - Check your API key usage in Google Cloud Console
   - Consider implementing caching for API responses

2. **Local Storage Issues**
   - Clear browser cache and local storage
   - Check for storage limits

3. **Build Errors**
   - Run `npm clean-install` to reset dependencies
   - Check for TypeScript errors

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- All contributors and users of this project

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/dsa90days/issues) page
2. Create a new issue if needed
3. Join our community discussions

## 🔄 Updates and Maintenance

- Regular updates for new features and bug fixes
- Monthly dependency updates
- Community-driven improvements
- Performance optimizations

## 🌐 Deployment

The application can be deployed to any platform that supports Next.js:
- Vercel (recommended)
- Netlify
- AWS
- Google Cloud Platform

For Vercel deployment:
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables
4. Deploy!

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop browsers
- Mobile browsers
- Tablets
- Progressive Web App (PWA) support coming soon

## 🔒 Security

- API keys are stored securely in environment variables
- Regular security audits
- Dependency vulnerability checks
- Secure data storage practices

## 🎯 Future Roadmap

- [ ] Add user authentication
- [ ] Implement study groups
- [ ] Add code playground
- [ ] Create mobile app
- [ ] Add more problem sources
- [ ] Implement spaced repetition
- [ ] Add performance analytics
- [ ] Create API endpoints
- [ ] Add offline support
- [ ] Implement PWA features

## 📊 Analytics

The application includes basic analytics for:
- Problem completion rates
- Topic mastery
- Time spent on problems
- User engagement metrics

## 🔍 Search and Filter

Advanced search and filter capabilities:
- By topic
- By difficulty
- By company
- By completion status
- By date added
- By last attempted

## 🎨 Customization

Users can customize:
- Theme (dark/light mode)
- Problem display
- Progress tracking
- Notification preferences
- Study reminders

## 📚 Learning Resources

Each problem includes:
- Problem description
- Solution approach
- Time complexity
- Space complexity
- Related problems
- External resources
- Video explanations
- Code examples
