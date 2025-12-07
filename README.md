# AI Answer Engine 🤖

A modern, production-ready Perplexity-style AI answer engine built with Next.js 15, featuring real-time streaming responses, inline citations, and a beautiful glassmorphic UI.

## ✨ Features

- **🔍 Intelligent Search**: Powered by Google Custom Search JSON API for high-quality web results
- **🤖 AI Responses**: Streaming answers from Google Gemini with inline citations
- **📚 Source Citations**: Top 5 sources displayed with favicons, titles, and snippets
- **💬 Follow-up Questions**: AI-generated contextual follow-up suggestions
- **📜 Search History**: Last 10 queries saved in localStorage
- **🌓 Dark/Light Mode**: Seamless theme switching with system preference detection
- **✨ Glassmorphism UI**: Modern backdrop-blur effects and smooth animations
- **📱 Responsive Design**: Mobile-first design that works on all devices
- **⚡ Real-time Streaming**: Token-by-token answer generation for instant feedback

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Google Custom Search API key ([Setup guide](https://developers.google.com/custom-search/v1/overview))
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Setting Up Google Custom Search

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Custom Search API
3. Create an API key (or use an existing one)
4. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
5. Create a new search engine and select "Search the entire web"
6. Copy the Search Engine ID (cx parameter)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-answer-engine
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
GOOGLE_CSE_API_KEY=your_google_cse_api_key_here
GOOGLE_CSE_CX=your_search_engine_id_here
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

5. Run the development server:
```bash
npm run dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS v4, Shadcn/UI components
- **Search**: Google Custom Search JSON API
- **AI**: Google Gemini 2.0 Flash
- **Markdown**: react-markdown for formatted responses

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── answer/route.ts    # Main streaming API endpoint
│   │   └── rephrase/route.ts  # Query optimization endpoint
│   ├── layout.tsx              # Root layout with metadata
│   └── page.tsx                # Main search interface
├── components/
│   ├── StreamingAnswer.tsx     # Real-time answer display
│   ├── SourcesPanel.tsx        # Citation sources panel
│   ├── ThemeToggle.tsx         # Dark/light mode toggle
│   └── HistorySidebar.tsx      # Search history sidebar
├── config/
│   ├── ai.ts                   # AI configuration & types
│   └── search.ts               # Search provider configuration
└── lib/
    ├── search.ts               # Google Custom Search integration
    └── llm.ts                  # Gemini streaming logic
```

## 🎯 Key Features Explained

### Streaming Responses
The answer endpoint uses Server-Sent Events (SSE) to stream AI responses token-by-token, providing instant feedback to users.

### Inline Citations
The AI is prompted to include citations like [1], [2] which map to the numbered sources in the sidebar.

### Smart Follow-ups
After each answer, the system generates 3 contextual follow-up questions to continue the conversation.

### Search History
Recent queries are stored in localStorage and accessible via the clock icon, making it easy to revisit previous searches.

### Glassmorphism Design
Modern UI with backdrop-blur effects, subtle gradients, and smooth transitions for a premium feel.

## 🔧 Customization

### Changing the AI Model

Edit `src/config/ai.ts`:
```typescript
export const AI_CONFIG = {
  GEMINI_MODEL: 'gemini-2.0-flash-exp', // Change to another Gemini model
  MAX_SEARCH_RESULTS: 10,
  MAX_SOURCES_DISPLAY: 5,
};
```

### Changing Search Provider

The active search provider configuration is documented in `src/config/search.ts`. The current implementation uses Google Custom Search JSON API. If you need to switch providers, update the helper function in `src/lib/search.ts`.

### Styling

The app uses Tailwind CSS v4. Edit `src/app/globals.css` to customize colors and themes.

## 📝 API Endpoints

### POST /api/answer
Streams AI answers with citations and follow-ups.

**Request:**
```json
{
  "query": "What is quantum computing?"
}
```

**Response:** Server-Sent Events stream with:
- `sources`: Search results array (may be empty if search fails)
- `token`: Individual text chunks
- `followups`: Suggested questions
- `done`: Stream completion signal

If Google Custom Search returns no results or fails, the sources array will be empty and the AI will respond with "Live web results are temporarily unavailable."

### POST /api/rephrase
Optimizes queries for better search results.

**Request:**
```json
{
  "query": "why sky blue"
}
```

**Response:**
```json
{
  "rephrased": "Why is the sky blue? Explain the scientific reasons."
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `GOOGLE_CSE_API_KEY`
   - `GOOGLE_CSE_CX`
   - `GOOGLE_GEMINI_API_KEY`
4. Deploy!

### Other Platforms

The app works on any platform that supports Next.js 15:
- Netlify
- Railway
- Fly.io
- Self-hosted with Docker

## ⚠️ Rate Limits

Google Custom Search JSON API has the following limits:
- **Free tier**: 100 queries per day
- **Paid tier**: Up to 10,000 queries per day (requires billing enabled)

Monitor your usage in the Google Cloud Console to avoid hitting limits.

## 📄 License

MIT

## 🙏 Credits

- Search powered by [Google Custom Search JSON API](https://developers.google.com/custom-search/v1/overview)
- AI powered by [Google Gemini](https://ai.google.dev/)
- UI components from [Shadcn/UI](https://ui.shadcn.com/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.