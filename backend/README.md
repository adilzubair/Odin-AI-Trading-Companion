# 🤖 Odin AI Trading Companion - Backend

High-performance FastAPI backend for AI-powered autonomous trading with multi-agent analysis, real-time market data, and sophisticated risk management.

![Python](https://img.shields.io/badge/Python-3.10+-green?style=flat-square&logo=python) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi) ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red?style=flat-square)

---

## Features

### Multi-Agent Analysis
- **Fundamentals Analyst**: Company financials, earnings, valuation
- **News Analyst**: Real-time news sentiment and impact
- **Social Media Analyst**: StockTwits and Reddit sentiment
- **Technical Analyst**: Chart patterns and indicators
- **Debate System**: Bull vs Bear with structured arguments

### Autonomous Trading
- 24/7 signal gathering and automated execution
- Position monitoring with stop-loss/take-profit
- Risk controls: position limits, daily loss limits, staleness detection
- Emergency kill switch

### Data Integration
Alpaca Markets, Alpha Vantage, yfinance, akshare

---

## Tech Stack

**Core**: FastAPI 0.115, Python 3.10+, Uvicorn

**Database**: SQLAlchemy 2.0, Alembic, asyncpg, aiosqlite

**AI/LLM**: LangChain, LangGraph, OpenAI, Anthropic, Google Generative AI, ChromaDB

**Trading**: Alpaca-py, yfinance, akshare, stockstats

**Development**: pytest, black, ruff, mypy

---

## Quick Start

### Prerequisites
- Python 3.10+
- API Keys: Alpaca Markets, OpenAI/Anthropic/Google, Alpha Vantage

### Installation

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with API keys
uvicorn app.main:app --reload
```

**API Docs**: http://localhost:8000/docs

---

## Configuration

### Environment Variables (.env)

```bash
# Trading API
ALPACA_API_KEY=your_key
ALPACA_SECRET_KEY=your_secret
ALPACA_PAPER=true

# AI/LLM
OPENAI_API_KEY=your_key
DEFAULT_LLM_PROVIDER=openai

# Market Data
ALPHA_VANTAGE_API_KEY=your_key

# Database
DATABASE_URL=sqlite:///./trading.db
# PostgreSQL: postgresql://user:password@localhost:5432/trading_db

# Trading Parameters
MAX_POSITIONS=5
MAX_POSITION_VALUE=5000.0
MIN_ANALYST_CONFIDENCE=0.6
TAKE_PROFIT_PCT=10.0
STOP_LOSS_PCT=5.0
MAX_DAILY_LOSS=1000.0

# Autonomous Trading
AUTONOMOUS_ENABLED=false
DATA_POLL_INTERVAL_SECONDS=30
ANALYST_INTERVAL_SECONDS=120

# Security
API_KEY=dev_secret_key
KILL_SWITCH_SECRET=emergency_kill

# Application
DEBUG=true
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000
```

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Configuration
│   ├── api/v1/              # API endpoints
│   ├── services/            # Business logic
│   ├── agents/              # AI trading agents
│   ├── models/              # Data models
│   ├── core/                # Core utilities
│   └── utils/               # Helper functions
├── tests/                   # Test suite
└── scripts/                 # Utility scripts
```

---

## API Endpoints

### Health & Market
- `GET /api/v1/health` - Health check
- `GET /api/v1/market/quote/{symbol}` - Real-time quote
- `GET /api/v1/market/history/{symbol}` - Historical data

### Analysis
- `POST /api/v1/analysis/run` - Run multi-agent analysis
- `GET /api/v1/analysis/history/{ticker}` - Analysis history

### Trading
- `POST /api/v1/trades/execute` - Execute trade
- `GET /api/v1/trades/history` - Trade history
- `GET /api/v1/positions` - List positions
- `POST /api/v1/positions/{symbol}/close` - Close position

### Autonomous
- `POST /api/v1/autonomous/enable` - Enable autonomous mode
- `GET /api/v1/autonomous/status` - Get status
- `POST /api/v1/autonomous/config` - Update config
- `POST /api/v1/autonomous/kill` - Emergency kill switch

**Full Docs**: http://localhost:8000/docs

---

## Multi-Agent System

### Agent Workflow
```
Data Collection → Individual Analysis → Debate → Risk Assessment → Decision
```

### Agents
1. **Fundamentals**: Financials, earnings, valuation
2. **News**: Sentiment and impact analysis
3. **Social**: StockTwits and Reddit tracking
4. **Technical**: Patterns and indicators
5. **Bull/Bear Researchers**: Structured debate with evidence

---

## Development

### Running Server
```bash
uvicorn app.main:app --reload              # Development
uvicorn app.main:app --reload --log-level debug  # Debug mode
```

### Code Quality
```bash
black app/           # Format
ruff check app/      # Lint
mypy app/            # Type check
```

### Database Migrations
```bash
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

### Testing
```bash
pytest                    # Run all tests
pytest --cov=app         # With coverage
pytest tests/test_api.py # Specific file
```

---

## Deployment

### Docker
```bash
docker build -t odin-backend .
docker run -p 8000:8000 --env-file .env odin-backend
```

### Cloud Platforms
- **AWS Lambda + API Gateway**
- **Google Cloud Run**: `gcloud run deploy odin-backend --source .`
- **Heroku**: `heroku create && git push heroku main`

---

## Safety & Risk Management

- **Paper Trading**: Test with virtual money
- **Position Limits**: Max concurrent positions and sizes
- **Stop Loss/Take Profit**: Automatic protection
- **Daily Loss Limits**: Prevent excessive losses
- **Kill Switch**: Emergency shutdown
- **API Authentication**: Secure access

### Best Practices
1. Always start with paper trading
2. Test thoroughly before autonomous mode
3. Set conservative risk parameters
4. Monitor positions regularly
5. Keep kill switch secret secure

---

## Troubleshooting

**Database errors**: Check `DATABASE_URL`, verify PostgreSQL is running

**Alpaca errors**: Verify API keys, check base URL (paper vs live)

**LLM errors**: Verify API keys, check rate limits and quota

**Import errors**: Activate venv, run `pip install -r requirements.txt`

---

## Disclaimer

⚠️ **IMPORTANT**: Educational purposes only. Trading involves substantial risk. Always start with paper trading. Never risk money you cannot afford to lose.

---

**Builded by Odin AI Team**

**Happy Trading!** 📈
