# 🧠 PsyTrade - Multi-Agent Trading Platform

An advanced AI-powered autonomous trading platform that combines intelligent multi-agent systems for comprehensive market analysis and automated trading.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Backend Integration](#-backend-integration)
- [Usage](#-usage)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Capabilities

- **Real-Time Market Data**: Live stock quotes and historical charts via Alpaca API
- **Multi-Agent Analysis**: AI-powered analysis from specialized agents (MAHORAGA, TauricResearch)
- **Autonomous Trading**: Configurable auto-trading with risk management
- **Portfolio Management**: Track positions, P&L, and performance metrics
- **Sentinel Alerts**: AI-generated alerts for market opportunities and risks
- **Observer System**: User behavior tracking for personalized insights

### 📊 Dashboard Features

#### Analysis Tab
- Watchlist management (add/remove tickers)
- Historical analysis reports
- AI agent decisions with confidence scores
- Market reports and risk assessments

#### Auto Trade Tab
- Real-time position tracking
- Live P&L calculations
- Active trading signals
- Trade execution interface
- Autonomous trading controls

#### Portfolio Tab
- Equity curve visualization
- Historical performance charts
- Asset allocation breakdown
- Detailed metrics and statistics

### 🎨 UI/UX

- **Modern Design**: Glassmorphism with gradient accents
- **Dark Theme**: Professional trading interface
- **Responsive**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data polling every 5 seconds
- **Smooth Animations**: Framer Motion transitions

---

## 🚀 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Development Tools
- **Mocking**: [MSW (Mock Service Worker)](https://mswjs.io/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Linting**: ESLint
- **Formatting**: Prettier

### Backend Integration
- **API**: RESTful API (FastAPI/Python)
- **Market Data**: Alpaca Markets API
- **Authentication**: API Key (X-API-Key header)

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multi_agent_trader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration (see [Configuration](#-configuration))

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_KEY=dev_secret_key

# Feature Flags
NEXT_PUBLIC_ENABLE_REAL_TRADING=false    # Set to true for real money trading
NEXT_PUBLIC_ENABLE_OBSERVER=true         # User behavior tracking
NEXT_PUBLIC_ENABLE_SENTINEL=true         # Alert system
NEXT_PUBLIC_ENABLE_MOCKING=true          # Use mock data (false for real backend)

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

#### Production Mode (Real Backend)
```bash
NEXT_PUBLIC_ENABLE_MOCKING=false
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
- Connects to real backend API
- Requires backend server running
- Real market data from Alpaca

---

## 📁 Project Structure

```
multi_agent_trader/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Main dashboard page
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # React components
│   │   ├── tabs/               # Tab components
│   │   │   ├── AnalysisTab.tsx
│   │   │   ├── AutoTradeTab.tsx
│   │   │   └── PortfolioTab.tsx
│   │   ├── analysis/           # Analysis features
│   │   │   ├── TickerSelector.tsx
│   │   │   └── AnalysisReport.tsx
│   │   ├── trader/             # Trading features
│   │   │   ├── PortfolioOverview.tsx
│   │   │   ├── ActivePositions.tsx
│   │   │   ├── ActiveSignals.tsx
│   │   │   └── LLMCosts.tsx
│   │   ├── trade/              # Trade execution
│   │   │   └── StockDetail.tsx
│   │   └── ui/                 # Reusable UI components
│   │       ├── card.tsx
│   │       ├── button.tsx
│   │       └── badge.tsx
│   │
│   ├── store/                   # Zustand state stores
│   │   ├── useAnalysisStore.ts
│   │   └── useTraderStore.ts
│   │
│   ├── services/                # API services
│   │   └── api/
│   │       └── endpoints/
│   │           ├── market.ts
│   │           └── portfolio.ts
│   │
│   ├── mocks/                   # MSW mock data
│   │   ├── browser.ts
│   │   ├── handlers.ts
│   │   └── data/
│   │       ├── mockWatchlist.ts
│   │       ├── mockTrades.ts
│   │       └── mockAutonomous.ts
│   │
│   ├── types/                   # TypeScript types
│   │   ├── index.ts
│   │   └── api.ts
│   │
│   └── lib/                     # Utilities
│       ├── utils.ts
│       ├── mockData.ts
│       └── chartData.ts
│
├── public/                      # Static assets
│   └── mockServiceWorker.js    # MSW service worker
│
├── .env.example                 # Environment template
├── .env.local                   # Local environment (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔌 Backend Integration

### API Endpoints

The frontend expects the following backend endpoints:

#### Market Data
- `GET /market/quote/{symbol}` - Real-time quote
- `GET /market/history/{symbol}` - Historical OHLCV data

#### Portfolio
- `GET /portfolio/history` - Portfolio performance history
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
- `GET /autonomous/config` - Configuration
- `POST /autonomous/config` - Update config

#### Sentinel
- `GET /sentinel/alerts` - Get alerts
- `POST /sentinel/alerts/{id}/read` - Mark as read

#### Real-time
- `GET /updates/since` - Poll for updates

#### Signals
- `GET /signals/recent` - Recent trading signals

#### Observer
- `POST /observer/log` - Log user action

### CORS Configuration

Backend must allow requests from frontend:

```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

### Authentication

All API requests include:
```
X-API-Key: <your-api-key>
```

---

## 💻 Usage

### Running with Mock Data

1. Ensure `NEXT_PUBLIC_ENABLE_MOCKING=true` in `.env.local`
2. Start dev server: `npm run dev`
3. Open http://localhost:3000
4. All API calls will be intercepted by MSW

### Running with Real Backend

1. Start backend server on port 8000
2. Set `NEXT_PUBLIC_ENABLE_MOCKING=false` in `.env.local`
3. Restart dev server: `npm run dev`
4. Frontend will connect to real API

### Key Features

#### Add Ticker to Watchlist
1. Go to Analysis tab
2. Click "Add Ticker" button
3. Enter symbol (e.g., AAPL)
4. Click "Add"

#### View Analysis Report
1. Ensure ticker is in watchlist
2. Click on ticker in Analysis tab
3. View AI-generated analysis report

#### Execute Trade
1. Go to Auto Trade tab
2. Click on a ticker
3. Enter quantity
4. Click BUY or SELL
5. Confirm trade

#### Configure Autonomous Trading
1. Go to Auto Trade tab
2. Click settings icon
3. Adjust budget and risk parameters
4. Enable/disable autonomous mode

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### Development Workflow

1. **Make changes** to source files
2. **Hot reload** automatically updates browser
3. **Check console** for errors
4. **Test features** in browser
5. **Commit changes** with meaningful messages

### Adding New Features

1. Create component in `src/components/`
2. Add types in `src/types/`
3. Update store if needed in `src/store/`
4. Add mock data in `src/mocks/data/`
5. Update MSW handlers in `src/mocks/handlers.ts`

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Render
- DigitalOcean

### Environment Variables for Production

Set these in your hosting platform:

```bash
NEXT_PUBLIC_API_URL=https://your-api.com/api/v1
NEXT_PUBLIC_API_KEY=<secure-production-key>
NEXT_PUBLIC_ENABLE_MOCKING=false
NEXT_PUBLIC_ENABLE_REAL_TRADING=false  # or true if ready
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new files
- Follow existing code structure
- Add comments for complex logic
- Update types when adding features

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Alpaca Markets** - Market data API
- **Next.js Team** - Amazing framework
- **Vercel** - Hosting platform
- **MSW** - API mocking library

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review API documentation

---

## 🎯 Roadmap

- [ ] WebSocket integration for real-time updates
- [ ] Advanced charting with TradingView
- [ ] Mobile app (React Native)
- [ ] Multi-user support
- [ ] Backtesting engine
- [ ] Strategy builder
- [ ] Social trading features

---

**Built with ❤️ for traders, by traders**

---

## 📸 Screenshots

### Analysis Dashboard
![Analysis Tab](docs/screenshots/analysis-tab.png)

### Auto Trading
![Auto Trade Tab](docs/screenshots/auto-trade-tab.png)

### Portfolio Performance
![Portfolio Tab](docs/screenshots/portfolio-tab.png)

---

**Happy Trading!** 📈
