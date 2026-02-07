# 🧠 Odin AI Trading Companion

An advanced AI-powered autonomous trading platform that combines intelligent multi-agent systems for comprehensive market analysis and automated trading. Built with a modern Next.js frontend and a robust FastAPI backend.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.10+-green?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Safety Features](#-safety-features)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

Odin AI Trading Companion is a full-stack trading platform that leverages artificial intelligence to provide:

- **Multi-Agent Analysis**: Specialized AI agents (MAHORAGA, TauricResearch) analyze fundamentals, news, social sentiment, and technical indicators
- **Autonomous Trading**: 24/7 automated trading with configurable risk management
- **Real-Time Market Data**: Live stock quotes and historical data via Alpaca Markets API
- **Portfolio Management**: Comprehensive tracking of positions, P&L, and performance metrics
- **Intelligent Alerts**: AI-generated sentinel alerts for market opportunities and risks

---

##  Features

###  Core Capabilities

#### Multi-Agent Analysis System
- **Fundamentals Analyst**: Deep dive into company financials and metrics
- **News Analyst**: Real-time news sentiment and impact analysis
- **Social Media Analyst**: StockTwits and Reddit sentiment tracking
- **Technical Analyst**: Chart patterns and technical indicators
- **Debate System**: Bull vs Bear researchers with structured debates
- **Risk Management**: Multi-perspective risk assessment

#### Autonomous Trading Mode
- **24/7 Signal Gathering**: Continuous market monitoring
- **Automated Execution**: Trade based on AI confidence scores
- **Position Monitoring**: Real-time tracking with stop-loss/take-profit
- **Risk Controls**: Position limits, daily loss limits, staleness detection
- **Emergency Kill Switch**: Instant shutdown capability

#### Portfolio & Analytics
- **Real-Time Positions**: Live P&L calculations
- **Equity Curve**: Historical performance visualization
- **Asset Allocation**: Breakdown by sector and position
- **Trade History**: Detailed execution logs
- **Performance Metrics**: Sharpe ratio, max drawdown, win rate

###  Frontend Features

- **Modern UI**: Glassmorphism design with gradient accents
- **Dark Theme**: Professional trading interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-Time Updates**: Live data polling every 5 seconds
- **Smooth Animations**: Framer Motion transitions
- **Interactive Charts**: Recharts for data visualization

---

##  Architecture

```
Odin-AI-Trading-Companion/
├── frontend/                    # Next.js React Application
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   ├── components/         # React components
│   │   │   ├── tabs/          # Tab components
│   │   │   ├── analysis/      # Analysis features
│   │   │   ├── trader/        # Trading features
│   │   │   └── ui/            # Reusable UI components
│   │   ├── store/             # Zustand state management
│   │   ├── services/          # API services
│   │   ├── mocks/             # MSW mock data
│   │   └── types/             # TypeScript types
│   └── public/                # Static assets
│
└── backend/                    # FastAPI Python Application
    ├── app/
    │   ├── main.py            # FastAPI application
    │   ├── config.py          # Configuration management
    │   ├── api/               # API endpoints
    │   │   ├── v1/           # API version 1
    │   │   └── routes/       # Route handlers
    │   ├── services/          # Business logic
    │   │   ├── analysis_service.py    # Multi-agent analysis
    │   │   ├── autonomous_service.py  # Autonomous trading
    │   │   ├── alpaca_service.py      # Alpaca API wrapper
    │   │   └── signal_service.py      # Signal gathering
    │   ├── models/            # Data models
    │   ├── core/              # Core utilities
    │   └── agents/            # AI Trading Agents
    ├── tests/                 # Test suite
    └── scripts/               # Utility scripts
```

---

##  Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Mocking**: [MSW (Mock Service Worker)](https://mswjs.io/)

### Backend
- **Framework**: [FastAPI 0.115](https://fastapi.tiangolo.com/)
- **Language**: Python 3.10+
- **Database**: SQLAlchemy with PostgreSQL/SQLite
- **Trading API**: [Alpaca Markets](https://alpaca.markets/)
- **AI/LLM**: LangChain with OpenAI/Anthropic/Google
- **Data Sources**: 
  - Alpha Vantage (Financial data)
  - yfinance (Market data)
  - akshare (Alternative data)
- **Task Scheduling**: APScheduler
- **Testing**: pytest, pytest-asyncio

---

##  Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Python**: 3.10 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version
- **API Keys**:
  - Alpaca Markets (trading)
  - OpenAI/Anthropic/Google (AI analysis)
  - Alpha Vantage (financial data)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd Odin-AI-Trading-Companion
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Initialize database (auto-created on first run)
# For PostgreSQL, update DATABASE_URL in .env first

# Start backend server
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

---

## Configuration

### Backend Configuration (.env)

```bash
# Trading API
ALPACA_API_KEY=your_alpaca_key
ALPACA_SECRET_KEY=your_alpaca_secret
ALPACA_PAPER=true  # Use paper trading (recommended for testing)

# AI/LLM
OPENAI_API_KEY=your_openai_key
# Or use Anthropic/Google
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Market Data
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# Database
DATABASE_URL=sqlite:///./trading.db
# For PostgreSQL: postgresql://user:password@localhost/dbname

# Trading Parameters
MAX_POSITIONS=5
MAX_POSITION_VALUE=5000.0
MIN_SENTIMENT_SCORE=0.3
MIN_ANALYST_CONFIDENCE=0.6
TAKE_PROFIT_PCT=10.0
STOP_LOSS_PCT=5.0

# Autonomous Trading
AUTONOMOUS_ENABLED=false
DATA_POLL_INTERVAL_SECONDS=30
ANALYST_INTERVAL_SECONDS=120

# Security
API_KEY=dev_secret_key
KILL_SWITCH_SECRET=emergency_kill_secret
```

### Frontend Configuration (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_KEY=dev_secret_key

# Feature Flags
NEXT_PUBLIC_ENABLE_REAL_TRADING=false    # Set to true for real money trading
NEXT_PUBLIC_ENABLE_OBSERVER=true         # User behavior tracking
NEXT_PUBLIC_ENABLE_SENTINEL=true         # Alert system
NEXT_PUBLIC_ENABLE_MOCKING=false         # Use mock data (true for testing without backend)

# Polling Intervals (milliseconds)
NEXT_PUBLIC_POLL_INTERVAL_ACTIVE=5000    # Active tab polling
NEXT_PUBLIC_POLL_INTERVAL_IDLE=30000     # Idle tab polling
```

---

## 💻 Usage

### Running the Full Stack

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/docs

### Key Workflows

#### Add Ticker to Watchlist
1. Navigate to Analysis tab
2. Click "Add Ticker" button
3. Enter symbol (e.g., AAPL, NVDA)
4. Click "Add"

#### Run Trading Analysis
```bash
curl -X POST http://localhost:8000/api/v1/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "ticker": "NVDA",
    "date": "2024-05-10",
    "analysts": ["market", "fundamentals", "news", "social"]
  }'
```

#### Execute Trade
1. Go to Auto Trade tab
2. Click on a ticker
3. Enter quantity
4. Click BUY or SELL
5. Confirm trade

#### Enable Autonomous Trading
```bash
curl -X POST http://localhost:8000/api/v1/autonomous/enable \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Emergency Kill Switch
```bash
curl -X POST http://localhost:8000/api/v1/autonomous/kill \
  -H "Authorization: Bearer YOUR_KILL_SWITCH_SECRET"
```

---

##  API Documentation

### Core Endpoints

#### Health
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/db` - Database health check

#### Market Data
- `GET /api/v1/market/quote/{symbol}` - Real-time quote
- `GET /api/v1/market/history/{symbol}` - Historical OHLCV data

#### Analysis
- `POST /api/v1/analysis/run` - Run trading analysis
- `GET /api/v1/analysis/history/{ticker}` - Get analysis history
- `GET /api/v1/analysis/{id}` - Get specific analysis

#### Portfolio
- `GET /api/v1/portfolio/history` - Portfolio performance history
- `GET /api/v1/positions` - Current positions
- `POST /api/v1/positions/{symbol}/close` - Close position

#### Trading
- `POST /api/v1/trades/execute` - Execute trade
- `GET /api/v1/trades/history` - Trade history

#### Autonomous Trading
- `POST /api/v1/autonomous/enable` - Enable autonomous mode
- `POST /api/v1/autonomous/disable` - Disable autonomous mode
- `GET /api/v1/autonomous/status` - Get status
- `POST /api/v1/autonomous/config` - Update configuration
- `GET /api/v1/autonomous/signals` - Get recent signals
- `POST /api/v1/autonomous/kill` - Emergency kill switch

#### Watchlist
- `GET /api/v1/monitor/list` - Get watchlist
- `POST /api/v1/monitor/add` - Add ticker
- `DELETE /api/v1/monitor/remove` - Remove ticker

#### Sentinel Alerts
- `GET /api/v1/sentinel/alerts` - Get alerts
- `POST /api/v1/sentinel/alerts/{id}/read` - Mark as read

For complete API documentation, visit http://localhost:8000/docs when the backend is running.

---

## 🛠️ Development

### Backend Development

```bash
# Run tests
pytest tests/ -v

# Code formatting
black app/
ruff check app/

# Type checking
mypy app/

# Run with hot reload
uvicorn app.main:app --reload --log-level debug
```

### Frontend Development

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

### Running Tests

#### Backend Tests
```bash
cd backend
pytest tests/ -v --cov=app
```

#### Frontend Tests
```bash
cd frontend
npm test
```

### Development with Mock Data

Set `NEXT_PUBLIC_ENABLE_MOCKING=true` in frontend `.env.local` to use MSW for API mocking without running the backend.

---

##  Deployment

```

#### Other Platforms
- Netlify
- AWS Amplify
- Railway
- Render

### Environment Variables for Production

Ensure these are set in your hosting platform:

**Backend:**
- `ALPACA_API_KEY`, `ALPACA_SECRET_KEY`
- `OPENAI_API_KEY` (or other LLM provider)
- `DATABASE_URL`
- `API_KEY`, `KILL_SWITCH_SECRET`

**Frontend:**
- `NEXT_PUBLIC_API_URL=https://your-api.com/api/v1`
- `NEXT_PUBLIC_API_KEY=<secure-production-key>`
- `NEXT_PUBLIC_ENABLE_MOCKING=false`
- `NEXT_PUBLIC_ENABLE_REAL_TRADING=false` (or true when ready)

---

##  Safety Features

- **Paper Trading**: Test with virtual money before risking real capital
- **Position Limits**: Maximum concurrent positions and position sizes
- **Stop Loss**: Automatic loss protection on all positions
- **Take Profit**: Automatic profit taking at target levels
- **Kill Switch**: Emergency shutdown of all trading activity
- **API Authentication**: Secure API access with key-based auth
- **Daily Loss Limits**: Prevent excessive losses in a single day
- **Staleness Detection**: Avoid trading on outdated signals
- **Risk Scoring**: Multi-factor risk assessment before trades

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

**Frontend:**
- Use TypeScript for all new files
- Follow existing component structure
- Add proper type definitions
- Update mock data when adding features

**Backend:**
- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Add tests for new features

---

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

---

##  Disclaimer

**IMPORTANT**: This software is for educational purposes only. Trading involves substantial risk of loss. Always start with paper trading and never risk money you cannot afford to lose. The developers are not responsible for any financial losses incurred while using this software.

---

##  Acknowledgments

- **Alpaca Markets** - Trading and market data API
- **OpenAI/Anthropic/Google** - AI/LLM capabilities
- **Next.js Team** - Amazing frontend framework
- **FastAPI** - High-performance backend framework
- **LangChain** - AI agent orchestration

---

##  Support

For questions or issues:
- Open an issue on GitHub
- Check the [API Documentation](http://localhost:8000/docs)
- Review the [Frontend Setup Guide](frontend/FRONTEND_SETUP_GUIDE.md)
- Review the [Backend Requirements](backend/backend_requirements.md)

---

##  Roadmap

- [ ] WebSocket integration for real-time updates
- [ ] Advanced charting with TradingView
- [ ] Mobile app (React Native)
- [ ] Multi-user support with authentication
- [ ] Backtesting engine
- [ ] Strategy builder interface
- [ ] Social trading features
- [ ] Options trading support
- [ ] Crypto trading integration
- [ ] Advanced risk analytics

---

**Built with ❤️ for traders, by traders**

**Happy Trading!** 📈
