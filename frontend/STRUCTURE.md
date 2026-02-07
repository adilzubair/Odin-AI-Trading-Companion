# Multi-Agent Trader - Project Structure Documentation

## 📁 Complete File Structure

```
multi_agent_trader/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                # Root layout with Inter font
│   │   ├── page.tsx                  # Main dashboard page
│   │   ├── globals.css               # Global styles & utilities
│   │   └── favicon.ico
│   │
│   ├── components/                    # React Components
│   │   ├── analysis/                 # Analysis Side Components
│   │   │   ├── TickerSelector.tsx   # Ticker selection (max 5)
│   │   │   └── LiveAnalysis.tsx     # Real-time agent analysis
│   │   │
│   │   ├── trader/                   # Trader Side Components
│   │   │   ├── PortfolioOverview.tsx  # Balance & P&L stats
│   │   │   ├── ActivePositions.tsx    # Current holdings
│   │   │   ├── ActiveSignals.tsx      # Combined signals
│   │   │   ├── ActivityFeed.tsx       # Live activity log
│   │   │   └── LLMCosts.tsx          # API cost tracking
│   │   │
│   │   └── ui/                       # Reusable UI Components
│   │       ├── card.tsx              # Glassmorphism cards
│   │       ├── button.tsx            # Gradient buttons
│   │       └── badge.tsx             # Status badges
│   │
│   ├── store/                        # Zustand State Management
│   │   ├── useAnalysisStore.ts      # Analysis state & actions
│   │   └── useTraderStore.ts        # Trading state & actions
│   │
│   ├── types/                        # TypeScript Definitions
│   │   └── index.ts                 # All type definitions
│   │
│   └── lib/                          # Utilities & Helpers
│       ├── utils.ts                 # Common utilities
│       └── mockData.ts              # Mock data generators
│
├── public/                           # Static Assets
├── node_modules/                     # Dependencies
├── .next/                           # Next.js build output
├── package.json                     # Project dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts              # Tailwind CSS config
├── next.config.ts                  # Next.js config
└── README.md                        # Project documentation
```

## 🎯 Component Architecture

### Analysis Side Flow
```
TickerSelector
    ↓
User selects tickers (max 5)
    ↓
LiveAnalysis
    ↓
Displays 4 agent analyses:
- Fundamentals Agent
- Sentiment Agent
- News Agent
- Technical Agent
```

### Trader Side Flow
```
PortfolioOverview (Balance, P&L)
    ↓
ActivePositions (Current holdings)
    ↓
ActiveSignals (MAHORAGA + TauricResearch)
    ↓
ActivityFeed (Real-time events)
    ↓
LLMCosts (API usage tracking)
```

## 📊 State Management

### Analysis Store (`useAnalysisStore`)
```typescript
{
  selectedTickers: Ticker[]           // Max 5 tickers
  liveAnalyses: Map<string, Analysis[]>  // Live agent analyses
  reports: AnalysisReport[]           // Historical reports
  isAnalyzing: boolean                // Analysis status
}
```

### Trader Store (`useTraderStore`)
```typescript
{
  portfolio: PortfolioStats           // Balance, P&L
  positions: Position[]               // Active positions
  signals: Signal[]                   // Combined signals
  activityFeed: ActivityItem[]        // Event log
  llmCosts: LLMCosts                 // API costs
}
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradients (`from-blue-600 to-blue-500`)
- **Success**: Green (`text-green-400`)
- **Danger**: Red (`text-red-400`)
- **Warning**: Yellow (`text-yellow-400`)
- **Info**: Blue (`text-blue-400`)

### Components
- **Cards**: Glassmorphism with `bg-gradient-to-br from-slate-900/90`
- **Buttons**: Gradient with hover scale effects
- **Badges**: Color-coded status indicators
- **Scrollbars**: Custom styled for dark theme

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, gradient text for emphasis
- **Body**: Slate colors for hierarchy

## 🔌 Integration Points (TODO)

### Backend APIs Needed
1. **Analysis API**
   - POST `/api/analyze` - Start analysis for tickers
   - GET `/api/analysis/:ticker` - Get live analysis
   - WebSocket `/ws/analysis` - Real-time updates

2. **Trading API**
   - GET `/api/portfolio` - Portfolio stats
   - GET `/api/positions` - Active positions
   - GET `/api/signals` - Combined signals
   - WebSocket `/ws/trading` - Live updates

3. **MAHORAGA Integration**
   - Social sentiment signals
   - Twitter/Reddit/StockTwits data
   - Crypto trading support

4. **TauricResearch Integration**
   - Multi-agent analysis system
   - Fundamentals, sentiment, news, technical
   - Bull/bear debate mechanism

## 📝 Key Features

### ✅ Implemented
- Clean, professional UI with glassmorphism
- Two-panel layout (Analysis + Trader)
- Ticker selection with max 5 limit
- State management with Zustand
- TypeScript for type safety
- Responsive design
- Custom scrollbars
- Gradient animations

### 🔜 Coming Soon (Backend Integration)
- Real-time WebSocket connections
- Actual trading execution
- Historical data charts
- User authentication
- API cost optimization
- Backtesting features
- Alert notifications

## 🚀 Development Workflow

1. **Start Dev Server**: `npm run dev`
2. **View at**: http://localhost:3000
3. **Edit Components**: Hot reload enabled
4. **Add Features**: Follow existing patterns
5. **Type Safety**: TypeScript will catch errors

## 📦 Dependencies

### Core
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety

### State & Data
- `zustand` - State management
- `recharts` - Charts (ready to use)

### UI & Styling
- `tailwindcss` - Utility CSS
- `lucide-react` - Icons
- `framer-motion` - Animations
- `class-variance-authority` - Component variants
- `clsx` + `tailwind-merge` - Class utilities

## 🎓 Best Practices

1. **Component Organization**: Keep components small and focused
2. **Type Safety**: Always define TypeScript types
3. **State Management**: Use Zustand stores for global state
4. **Styling**: Use Tailwind utilities, avoid inline styles
5. **Performance**: Use React.memo for expensive components
6. **Accessibility**: Include ARIA labels and keyboard nav

---

**Status**: ✅ Frontend Complete - Ready for Backend Integration
