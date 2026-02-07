# 🧠 Odin AI Trading Companion

An advanced AI-powered autonomous trading platform combining intelligent multi-agent systems for comprehensive market analysis and automated trading. Built with Next.js frontend and FastAPI backend.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript) ![Python](https://img.shields.io/badge/Python-3.10+-green?style=flat-square&logo=python) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)

---

## Overview

Odin AI Trading Companion leverages artificial intelligence to provide multi-agent analysis, autonomous trading, real-time market data, and comprehensive portfolio management with sophisticated risk controls.

### Key Features

- **Multi-Agent Analysis**: Specialized AI agents (fundamentals, news, social sentiment, technical) with bull/bear debate system
- **Autonomous Trading**: 24/7 automated trading with configurable risk management
- **Real-Time Data**: Live quotes and historical data via Alpaca Markets API
- **Portfolio Management**: Track positions, P&L, and performance metrics
- **Safety Features**: Paper trading, position limits, stop-loss/take-profit, emergency kill switch

---

## Quick Start

### Prerequisites
- Node.js 18+, Python 3.10+, npm 9+
- API Keys: Alpaca Markets, OpenAI/Anthropic/Google, Alpha Vantage

### Installation

**1. Clone Repository**
```bash
git clone <repository-url>
cd Odin-AI-Trading-Companion
```

**2. Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
uvicorn app.main:app --reload
```
Backend: http://localhost:8000 | Docs: http://localhost:8000/docs

**3. Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local
npm run dev
```
Frontend: http://localhost:3000

---

## Configuration

### Backend (.env)
```bash
# Trading
ALPACA_API_KEY=your_key
ALPACA_SECRET_KEY=your_secret
ALPACA_PAPER=true

# AI/LLM
OPENAI_API_KEY=your_key

# Market Data
ALPHA_VANTAGE_API_KEY=your_key

# Database
DATABASE_URL=sqlite:///./trading.db

# Trading Parameters
MAX_POSITIONS=5
MAX_POSITION_VALUE=5000.0
MIN_ANALYST_CONFIDENCE=0.6
TAKE_PROFIT_PCT=10.0
STOP_LOSS_PCT=5.0

# Security
API_KEY=dev_secret_key
KILL_SWITCH_SECRET=emergency_kill
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_KEY=dev_secret_key
NEXT_PUBLIC_ENABLE_MOCKING=false
NEXT_PUBLIC_ENABLE_REAL_TRADING=false
```

---

## Tech Stack

**Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand, Recharts, Framer Motion

**Backend**: FastAPI, Python 3.10+, SQLAlchemy, LangChain, LangGraph, Alpaca-py, yfinance

**AI/LLM**: OpenAI, Anthropic, Google Generative AI, ChromaDB

---

## Key API Endpoints

### Health & Market
- `GET /api/v1/health` - Health check
- `GET /api/v1/market/quote/{symbol}` - Real-time quote
- `GET /api/v1/market/history/{symbol}` - Historical data

### Analysis & Trading
- `POST /api/v1/analysis/run` - Run multi-agent analysis
- `POST /api/v1/trades/execute` - Execute trade
- `GET /api/v1/positions` - List positions

### Autonomous Trading
- `POST /api/v1/autonomous/enable` - Enable autonomous mode
- `GET /api/v1/autonomous/status` - Get status
- `POST /api/v1/autonomous/kill` - Emergency kill switch

**Full API Docs**: http://localhost:8000/docs

---

## Usage

### Run Analysis
```bash
curl -X POST http://localhost:8000/api/v1/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"ticker": "NVDA", "analysts": ["fundamentals", "news", "social"]}'
```

### Enable Autonomous Trading
```bash
curl -X POST http://localhost:8000/api/v1/autonomous/enable \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Emergency Kill Switch
```bash
curl -X POST http://localhost:8000/api/v1/autonomous/kill \
  -H "Authorization: Bearer YOUR_KILL_SWITCH_SECRET"
```

---

## Development

### Backend
```bash
# Run tests
pytest tests/ -v --cov=app

# Format code
black app/
ruff check app/

# Run server with debug
uvicorn app.main:app --reload --log-level debug
```

### Frontend
```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## Safety & Risk Management

- **Paper Trading**: Test with virtual money before risking real capital
- **Position Limits**: Maximum concurrent positions and position sizes
- **Stop Loss/Take Profit**: Automatic risk protection
- **Daily Loss Limits**: Prevent excessive losses
- **Kill Switch**: Emergency shutdown capability
- **API Authentication**: Secure access control

---

## Project Structure

```
Odin-AI-Trading-Companion/
├── frontend/              # Next.js React Application
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React components
│   │   ├── store/        # Zustand state
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   └── public/
│
└── backend/              # FastAPI Python Application
    ├── app/
    │   ├── main.py       # FastAPI entry point
    │   ├── api/          # API endpoints
    │   ├── services/     # Business logic
    │   ├── agents/       # AI agents
    │   ├── models/       # Data models
    │   └── core/         # Core utilities
    └── tests/
```

---

## Disclaimer

⚠️ **IMPORTANT**: This software is for educational purposes only. Trading involves substantial risk of loss. Always start with paper trading and never risk money you cannot afford to lose.

---

## Support & Resources

- **Frontend Guide**: [frontend/README.md](frontend/README.md)
- **Backend Guide**: [backend/README.md](backend/README.md)
- **API Documentation**: http://localhost:8000/docs
- **Issues**: Open an issue on GitHub

---

**Build by Odin AI Team**

**Happy Trading!** 📈
