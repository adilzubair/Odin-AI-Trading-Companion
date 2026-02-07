# 🎨 Odin AI Trading Companion - Frontend

A modern, responsive Next.js frontend for the Odin AI Trading Companion platform. Built with React 19, TypeScript, and Tailwind CSS for a premium trading experience.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Development](#development)
- [API Integration](#api-integration)
- [Deployment](#deployment)

---

## Overview

The frontend provides an intuitive, real-time interface for AI-powered trading analysis and portfolio management. It features a modern glassmorphism design with smooth animations and comprehensive data visualization.

### Key Highlights

- **Real-Time Updates**: Live market data polling every 5 seconds
- **Multi-Agent Analysis**: View AI-generated trading insights from specialized agents
- **Portfolio Tracking**: Monitor positions, P&L, and performance metrics
- **Autonomous Trading**: Configure and control automated trading
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

---

## Features

### Dashboard Tabs

#### 📊 Analysis Tab
- **Watchlist Management**: Add/remove tickers to monitor
- **Historical Analysis**: View past AI-generated reports
- **Agent Decisions**: See recommendations with confidence scores
- **Market Reports**: Comprehensive market analysis
- **Risk Assessment**: Multi-perspective risk evaluation

#### 🤖 Auto Trade Tab
- **Live Positions**: Real-time position tracking with P&L
- **Trading Signals**: Active signals from AI agents
- **Trade Execution**: Buy/sell interface with confirmation
- **Autonomous Controls**: Enable/disable auto-trading
- **Configuration**: Adjust risk parameters and budget

#### 💼 Portfolio Tab
- **Equity Curve**: Historical performance visualization
- **Performance Charts**: Interactive Recharts visualizations
- **Asset Allocation**: Breakdown by position and sector
- **Metrics Dashboard**: Sharpe ratio, max drawdown, win rate
- **Trade History**: Detailed execution logs

### UI/UX Features

- **Modern Design**: Glassmorphism with gradient accents
- **Dark Theme**: Professional trading interface optimized for long sessions
- **Smooth Animations**: Framer Motion transitions and micro-interactions
- **Interactive Charts**: Recharts for data visualization
- **Toast Notifications**: Real-time feedback with Sonner
- **Loading States**: Skeleton loaders and progress indicators

---

## Tech Stack

### Core Framework
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety

### Styling & UI
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS
- **[Framer Motion](https://www.framer.com/motion/)** - Animations
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[class-variance-authority](https://cva.style/)** - Component variants
- **[clsx](https://github.com/lukeed/clsx)** - Conditional classes

### State & Data
- **[Zustand](https://github.com/pmndrs/zustand)** - State management
- **[Axios](https://axios-http.com/)** - HTTP client
- **[Recharts](https://recharts.org/)** - Chart library
- **[date-fns](https://date-fns.org/)** - Date utilities

### Development Tools
- **[MSW](https://mswjs.io/)** - API mocking for development
- **[ESLint](https://eslint.org/)** - Code linting
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Backend API**: Running on `http://localhost:8000` (optional if using mock mode)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_API_KEY=dev_secret_key
   NEXT_PUBLIC_ENABLE_MOCKING=false
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Main dashboard page
│   │   └── globals.css              # Global styles
│   │
│   ├── components/                   # React components
│   │   ├── tabs/                    # Main tab components
│   │   │   ├── AnalysisTab.tsx     # Analysis dashboard
│   │   │   ├── AutoTradeTab.tsx    # Trading interface
│   │   │   └── PortfolioTab.tsx    # Portfolio view
│   │   │
│   │   ├── analysis/                # Analysis features
│   │   │   ├── TickerSelector.tsx  # Watchlist management
│   │   │   └── AnalysisReport.tsx  # AI analysis display
│   │   │
│   │   ├── trader/                  # Trading features
│   │   │   ├── PortfolioOverview.tsx
│   │   │   ├── ActivePositions.tsx
│   │   │   ├── ActiveSignals.tsx
│   │   │   └── LLMCosts.tsx
│   │   │
│   │   ├── trade/                   # Trade execution
│   │   │   └── StockDetail.tsx
│   │   │
│   │   └── ui/                      # Reusable UI components
│   │       ├── card.tsx
│   │       ├── button.tsx
│   │       ├── badge.tsx
│   │       └── ...
│   │
│   ├── store/                        # Zustand state stores
│   │   ├── useAnalysisStore.ts      # Analysis state
│   │   └── useTraderStore.ts        # Trading state
│   │
│   ├── services/                     # API services
│   │   └── api/
│   │       └── endpoints/
│   │           ├── market.ts        # Market data API
│   │           ├── portfolio.ts     # Portfolio API
│   │           ├── analysis.ts      # Analysis API
│   │           └── ...
│   │
│   ├── mocks/                        # MSW mock data
│   │   ├── browser.ts               # MSW browser setup
│   │   ├── handlers.ts              # API mock handlers
│   │   └── data/                    # Mock data
│   │       ├── mockWatchlist.ts
│   │       ├── mockTrades.ts
│   │       └── mockAutonomous.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── index.ts                 # Core types
│   │   └── api.ts                   # API types
│   │
│   └── lib/                          # Utilities
│       ├── utils.ts                 # Helper functions
│       ├── mockData.ts              # Mock data generators
│       └── chartData.ts             # Chart utilities
│
├── public/                           # Static assets
│   └── mockServiceWorker.js         # MSW service worker
│
├── .env.example                      # Environment template
├── .env.local                        # Local environment (gitignored)
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
└── README.md                         # This file
```

---

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_KEY=dev_secret_key

# Feature Flags
NEXT_PUBLIC_ENABLE_REAL_TRADING=false    # Enable real money trading
NEXT_PUBLIC_ENABLE_OBSERVER=true         # User behavior tracking
NEXT_PUBLIC_ENABLE_SENTINEL=true         # Alert system
NEXT_PUBLIC_ENABLE_MOCKING=false         # Use mock data (true for dev without backend)

# Polling Intervals (milliseconds)
NEXT_PUBLIC_POLL_INTERVAL_ACTIVE=5000    # Active tab polling
NEXT_PUBLIC_POLL_INTERVAL_IDLE=30000     # Idle tab polling
```

### Configuration Modes

#### Development Mode (Mock Data)
```bash
NEXT_PUBLIC_ENABLE_MOCKING=true
```
- Uses MSW to intercept API calls
- Returns fake data for testing
- No backend required
- Perfect for UI development

#### Production Mode (Real Backend)
```bash
NEXT_PUBLIC_ENABLE_MOCKING=false
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
- Connects to real backend API
- Requires backend server running
- Real market data from Alpaca

---

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type check without emitting files
npx tsc --noEmit
```

### Development Workflow

1. **Make changes** to source files in `src/`
2. **Hot reload** automatically updates browser
3. **Check console** for errors and warnings
4. **Test features** in browser
5. **Commit changes** with meaningful messages

### Adding New Features

1. **Create component** in appropriate `src/components/` subdirectory
2. **Add types** in `src/types/`
3. **Update store** if needed in `src/store/`
4. **Add mock data** in `src/mocks/data/`
5. **Update MSW handlers** in `src/mocks/handlers.ts`
6. **Test with mock mode** before connecting to backend

### Code Style Guidelines

- Use **TypeScript** for all new files
- Follow existing **component structure**
- Add **proper type definitions**
- Use **Tailwind classes** for styling
- Implement **loading states** for async operations
- Add **error handling** for API calls
- Write **descriptive comments** for complex logic

---

## API Integration

### API Client Setup

The frontend uses Axios with interceptors for API communication:

```typescript
// src/services/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY,
  },
});
```

### Expected Backend Endpoints

#### Market Data
- `GET /market/quote/{symbol}` - Real-time quote
- `GET /market/history/{symbol}` - Historical OHLCV data

#### Portfolio
- `GET /portfolio/history` - Portfolio performance
- `GET /positions` - Current positions

#### Watchlist
- `GET /monitor/list` - Get watchlist
- `POST /monitor/add` - Add ticker
- `DELETE /monitor/remove` - Remove ticker

#### Analysis
- `GET /analysis/history/{ticker}` - Analysis reports

#### Trading
- `POST /trades/execute` - Execute trade
- `GET /trades/history` - Trade history

#### Autonomous
- `GET /autonomous/status` - Bot status
- `POST /autonomous/config` - Update config

#### Sentinel
- `GET /sentinel/alerts` - Get alerts

For complete API documentation, see the [main README](../README.md#api-documentation).

### CORS Requirements

Backend must allow requests from frontend:

```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms

The app can be deployed to any platform supporting Next.js:
- **Netlify**
- **AWS Amplify**
- **Railway**
- **Render**
- **DigitalOcean**

### Environment Variables for Production

Set these in your hosting platform:

```bash
NEXT_PUBLIC_API_URL=https://your-api.com/api/v1
NEXT_PUBLIC_API_KEY=<secure-production-key>
NEXT_PUBLIC_ENABLE_MOCKING=false
NEXT_PUBLIC_ENABLE_REAL_TRADING=false  # or true when ready
```

---

## Key Features Usage

### Add Ticker to Watchlist
1. Navigate to **Analysis** tab
2. Click **"Add Ticker"** button
3. Enter symbol (e.g., AAPL, NVDA)
4. Click **"Add"**

### View Analysis Report
1. Ensure ticker is in watchlist
2. Click on ticker in **Analysis** tab
3. View AI-generated analysis with confidence scores

### Execute Trade
1. Go to **Auto Trade** tab
2. Click on a ticker
3. Enter quantity
4. Click **BUY** or **SELL**
5. Confirm trade

### Configure Autonomous Trading
1. Go to **Auto Trade** tab
2. Click **settings** icon
3. Adjust budget and risk parameters
4. Enable/disable autonomous mode

---

## Troubleshooting

### Common Issues

**Issue**: "Failed to fetch" errors
- **Solution**: Ensure backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is configured on backend

**Issue**: Mock data not working
- **Solution**: Set `NEXT_PUBLIC_ENABLE_MOCKING=true`
- Clear browser cache and restart dev server
- Check browser console for MSW registration

**Issue**: TypeScript errors
- **Solution**: Run `npm install` to ensure all types are installed
- Check `tsconfig.json` configuration
- Restart TypeScript server in your IDE

**Issue**: Styles not applying
- **Solution**: Ensure Tailwind is properly configured
- Check `tailwind.config.ts`
- Restart dev server

---

## Additional Resources

- **[Next.js Documentation](https://nextjs.org/docs)**
- **[React Documentation](https://react.dev/)**
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)**
- **[Zustand Documentation](https://github.com/pmndrs/zustand)**
- **[MSW Documentation](https://mswjs.io/docs/)**

---

## Support

For questions or issues:
- Check the [main README](../README.md)
- Review the [Frontend Setup Guide](FRONTEND_SETUP_GUIDE.md)
- Review the [API Documentation](API_DOCUMENTATION.md)
- Open an issue on GitHub

---

**Built with ❤️ using Next.js and React**

**Happy Trading!** 📈
