# 🤖 Odin AI Trading Companion - Backend

A high-performance FastAPI backend for AI-powered autonomous trading. Features multi-agent analysis, real-time market data integration, and sophisticated risk management.

![Python](https://img.shields.io/badge/Python-3.10+-green?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red?style=flat-square)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Multi-Agent System](#multi-agent-system)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Overview

The backend provides a robust API for AI-driven trading analysis and execution. It integrates multiple AI agents, real-time market data, and automated trading capabilities with comprehensive risk management.

### Key Highlights

- **Multi-Agent Analysis**: Specialized AI agents for fundamentals, news, social sentiment, and technical analysis
- **Autonomous Trading**: 24/7 automated trading with configurable risk parameters
- **Real-Time Data**: Integration with Alpaca Markets, Alpha Vantage, and yfinance
- **Risk Management**: Position limits, stop-loss, take-profit, and emergency kill switch
- **Database**: SQLAlchemy ORM with PostgreSQL/SQLite support

---

## Features

### Analysis Mode

#### Multi-Agent System
- **Fundamentals Analyst**: Company financials, earnings, and valuation metrics
- **News Analyst**: Real-time news sentiment and impact analysis
- **Social Media Analyst**: StockTwits and Reddit sentiment tracking
- **Technical Analyst**: Chart patterns, indicators, and trend analysis

#### Debate System
- **Bull vs Bear Researchers**: Structured debates with evidence-based arguments
- **Risk Assessment**: Multi-perspective risk evaluation
- **Decision Making**: Final trading decisions with confidence scores

### Autonomous Trading Mode

- **24/7 Signal Gathering**: Continuous monitoring of StockTwits and Reddit
- **Automated Execution**: Trade based on AI confidence thresholds
- **Position Monitoring**: Real-time tracking with stop-loss/take-profit
- **Risk Controls**:
  - Maximum concurrent positions
  - Position size limits
  - Daily loss limits
  - Signal staleness detection
- **Emergency Kill Switch**: Instant shutdown of all trading activity

### Data Integration

- **Alpaca Markets**: Real-time quotes, historical data, and trade execution
- **Alpha Vantage**: Fundamental data and company information
- **yfinance**: Alternative market data source
- **akshare**: Additional data feeds

---

## Tech Stack

### Core Framework
- **[FastAPI 0.115](https://fastapi.tiangolo.com/)** - Modern async web framework
- **[Python 3.10+](https://www.python.org/)** - Programming language
- **[Uvicorn](https://www.uvicorn.org/)** - ASGI server

### Database & ORM
- **[SQLAlchemy 2.0](https://www.sqlalchemy.org/)** - ORM
- **[Alembic](https://alembic.sqlalchemy.org/)** - Database migrations
- **[asyncpg](https://github.com/MagicStack/asyncpg)** - PostgreSQL async driver
- **[aiosqlite](https://github.com/omnilib/aiosqlite)** - SQLite async driver

### AI & LLM
- **[LangChain](https://www.langchain.com/)** - LLM orchestration
- **[LangGraph](https://github.com/langchain-ai/langgraph)** - Multi-agent workflows
- **[OpenAI](https://openai.com/)** - GPT models
- **[Anthropic](https://www.anthropic.com/)** - Claude models
- **[Google Generative AI](https://ai.google.dev/)** - Gemini models
- **[ChromaDB](https://www.trychroma.com/)** - Vector database

### Trading & Market Data
- **[Alpaca-py](https://github.com/alpacahq/alpaca-py)** - Alpaca API client
- **[yfinance](https://github.com/ranaroussi/yfinance)** - Yahoo Finance data
- **[akshare](https://github.com/akfamily/akshare)** - Alternative data
- **[stockstats](https://github.com/jealous/stockstats)** - Technical indicators

### Task Scheduling
- **[APScheduler](https://apscheduler.readthedocs.io/)** - Background job scheduling

### Development Tools
- **[pytest](https://pytest.org/)** - Testing framework
- **[black](https://black.readthedocs.io/)** - Code formatter
- **[ruff](https://github.com/astral-sh/ruff)** - Fast linter
- **[mypy](https://mypy.readthedocs.io/)** - Static type checker

---

## Getting Started

### Prerequisites

- **Python**: 3.10 or higher
- **pip**: Latest version
- **PostgreSQL**: Optional (SQLite works for development)
- **API Keys**:
  - Alpaca Markets (trading)
  - OpenAI/Anthropic/Google (AI analysis)
  - Alpha Vantage (financial data)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys (see [Configuration](#configuration))

5. **Initialize database**
   ```bash
   # Database will be auto-created on first run
   # For PostgreSQL, update DATABASE_URL in .env first
   ```

6. **Start the server**
   ```bash
   uvicorn app.main:app --reload
   ```

7. **Access API documentation**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI application entry point
│   ├── config.py                    # Configuration management
│   │
│   ├── api/                         # API endpoints
│   │   ├── __init__.py
│   │   └── v1/                      # API version 1
│   │       ├── __init__.py
│   │       ├── health.py           # Health check endpoints
│   │       ├── analysis.py         # Analysis endpoints
│   │       ├── autonomous.py       # Autonomous trading endpoints
│   │       ├── positions.py        # Position management
│   │       ├── trades.py           # Trade execution
│   │       ├── market.py           # Market data
│   │       ├── portfolio.py        # Portfolio endpoints
│   │       └── sentinel.py         # Alert endpoints
│   │
│   ├── services/                    # Business logic
│   │   ├── __init__.py
│   │   ├── analysis_service.py     # Multi-agent analysis
│   │   ├── autonomous_service.py   # Autonomous trading logic
│   │   ├── alpaca_service.py       # Alpaca API wrapper
│   │   ├── signal_service.py       # Signal gathering
│   │   ├── risk_service.py         # Risk management
│   │   └── portfolio_service.py    # Portfolio tracking
│   │
│   ├── agents/                      # AI Trading Agents
│   │   ├── __init__.py
│   │   ├── fundamentals.py         # Fundamentals analyst
│   │   ├── news.py                 # News analyst
│   │   ├── social.py               # Social sentiment analyst
│   │   ├── technical.py            # Technical analyst
│   │   └── debate.py               # Debate system
│   │
│   ├── models/                      # Data models
│   │   ├── __init__.py
│   │   ├── database.py             # Database models
│   │   └── schemas.py              # Pydantic schemas
│   │
│   ├── core/                        # Core utilities
│   │   ├── __init__.py
│   │   ├── database.py             # Database connection
│   │   ├── security.py             # Authentication
│   │   └── exceptions.py           # Custom exceptions
│   │
│   └── utils/                       # Utility functions
│       ├── __init__.py
│       └── helpers.py
│
├── tests/                           # Test suite
│   ├── __init__.py
│   ├── test_api.py
│   ├── test_services.py
│   └── test_agents.py
│
├── scripts/                         # Utility scripts
│   ├── init_db.py
│   └── seed_data.py
│
├── .env.example                     # Environment template
├── .env                             # Environment variables (gitignored)
├── requirements.txt                 # Python dependencies
├── pyproject.toml                   # Project metadata
├── pytest.ini                       # Pytest configuration
└── README.md                        # This file
```

---

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```bash
# ============================================
# Trading API
# ============================================
ALPACA_API_KEY=your_alpaca_key
ALPACA_SECRET_KEY=your_alpaca_secret
ALPACA_PAPER=true                    # Use paper trading (recommended for testing)
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# ============================================
# AI/LLM Configuration
# ============================================
# Choose one or more LLM providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Default LLM provider (openai, anthropic, google)
DEFAULT_LLM_PROVIDER=openai

# ============================================
# Market Data
# ============================================
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# ============================================
# Database
# ============================================
# SQLite (default for development)
DATABASE_URL=sqlite:///./trading.db

# PostgreSQL (recommended for production)
# DATABASE_URL=postgresql://user:password@localhost:5432/trading_db

# ============================================
# Trading Parameters
# ============================================
MAX_POSITIONS=5                      # Maximum concurrent positions
MAX_POSITION_VALUE=5000.0           # Maximum value per position ($)
MIN_SENTIMENT_SCORE=0.3             # Minimum sentiment score to trade
MIN_ANALYST_CONFIDENCE=0.6          # Minimum AI confidence to trade
TAKE_PROFIT_PCT=10.0                # Take profit percentage
STOP_LOSS_PCT=5.0                   # Stop loss percentage
MAX_DAILY_LOSS=1000.0               # Maximum daily loss ($)

# ============================================
# Autonomous Trading
# ============================================
AUTONOMOUS_ENABLED=false             # Enable autonomous trading
DATA_POLL_INTERVAL_SECONDS=30       # Signal gathering interval
ANALYST_INTERVAL_SECONDS=120        # Analysis interval
SIGNAL_STALENESS_MINUTES=15         # Max signal age

# ============================================
# Security
# ============================================
API_KEY=dev_secret_key              # API authentication key
KILL_SWITCH_SECRET=emergency_kill   # Emergency kill switch secret

# ============================================
# Application
# ============================================
DEBUG=true
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Configuration Modes

#### Development Mode
```bash
DEBUG=true
ALPACA_PAPER=true
DATABASE_URL=sqlite:///./trading.db
AUTONOMOUS_ENABLED=false
```

#### Production Mode
```bash
DEBUG=false
ALPACA_PAPER=false  # Use real trading (be careful!)
DATABASE_URL=postgresql://user:password@host:5432/db
AUTONOMOUS_ENABLED=true  # Enable after thorough testing
```

---

## API Endpoints

### Health Checks
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/db` - Database health check

### Market Data
- `GET /api/v1/market/quote/{symbol}` - Real-time quote
- `GET /api/v1/market/history/{symbol}` - Historical OHLCV data
- `GET /api/v1/market/search` - Search for symbols

### Analysis
- `POST /api/v1/analysis/run` - Run multi-agent analysis
  ```json
  {
    "ticker": "NVDA",
    "date": "2024-05-10",
    "analysts": ["market", "fundamentals", "news", "social"]
  }
  ```
- `GET /api/v1/analysis/history/{ticker}` - Get analysis history
- `GET /api/v1/analysis/{id}` - Get specific analysis

### Portfolio
- `GET /api/v1/portfolio/history` - Portfolio performance history
- `GET /api/v1/portfolio/summary` - Portfolio summary

### Positions
- `GET /api/v1/positions` - List all positions
- `GET /api/v1/positions/{symbol}` - Get position details
- `POST /api/v1/positions/{symbol}/close` - Close position

### Trading
- `POST /api/v1/trades/execute` - Execute trade
  ```json
  {
    "symbol": "AAPL",
    "side": "buy",
    "quantity": 10,
    "order_type": "market"
  }
  ```
- `GET /api/v1/trades/history` - Trade history
- `GET /api/v1/trades/{id}` - Get trade details

### Autonomous Trading
- `POST /api/v1/autonomous/enable` - Enable autonomous mode
- `POST /api/v1/autonomous/disable` - Disable autonomous mode
- `GET /api/v1/autonomous/status` - Get status
- `POST /api/v1/autonomous/config` - Update configuration
  ```json
  {
    "max_positions": 5,
    "max_position_value": 5000.0,
    "min_confidence": 0.6
  }
  ```
- `GET /api/v1/autonomous/signals` - Get recent signals
- `GET /api/v1/autonomous/logs` - Get trading logs
- `POST /api/v1/autonomous/kill` - Emergency kill switch

### Watchlist
- `GET /api/v1/monitor/list` - Get watchlist
- `POST /api/v1/monitor/add` - Add ticker
- `DELETE /api/v1/monitor/remove` - Remove ticker

### Sentinel Alerts
- `GET /api/v1/sentinel/alerts` - Get alerts
- `POST /api/v1/sentinel/alerts/{id}/read` - Mark alert as read

For complete interactive documentation, visit http://localhost:8000/docs

---

## Multi-Agent System

### Agent Architecture

The backend uses a sophisticated multi-agent system powered by LangChain and LangGraph:

#### Analyst Agents

1. **Fundamentals Analyst**
   - Company financials and metrics
   - Earnings analysis
   - Valuation ratios
   - Growth trends

2. **News Analyst**
   - Real-time news sentiment
   - Impact assessment
   - Event detection
   - Headline analysis

3. **Social Media Analyst**
   - StockTwits sentiment
   - Reddit discussion analysis
   - Social volume tracking
   - Influencer monitoring

4. **Technical Analyst**
   - Chart patterns
   - Technical indicators (RSI, MACD, etc.)
   - Trend analysis
   - Support/resistance levels

#### Debate System

- **Bull Researcher**: Builds bullish case with evidence
- **Bear Researcher**: Builds bearish case with evidence
- **Moderator**: Synthesizes arguments and makes final decision

### Agent Workflow

```
1. Data Collection → 2. Individual Analysis → 3. Debate → 4. Risk Assessment → 5. Decision
```

---

## Development

### Running the Server

```bash
# Development mode with hot reload
uvicorn app.main:app --reload

# With custom host and port
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# With debug logging
uvicorn app.main:app --reload --log-level debug
```

### Code Formatting

```bash
# Format code with black
black app/

# Lint with ruff
ruff check app/

# Fix linting issues
ruff check app/ --fix
```

### Type Checking

```bash
# Run mypy for type checking
mypy app/
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

---

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_api.py

# Run with verbose output
pytest -v

# Run tests matching pattern
pytest -k "test_analysis"
```

### Test Structure

```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

---

## Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t odin-backend .

# Run container
docker run -p 8000:8000 --env-file .env odin-backend
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: trading_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Cloud Platforms

#### AWS Lambda + API Gateway
- Package application with dependencies
- Configure environment variables
- Set up API Gateway routes

#### Google Cloud Run
```bash
gcloud run deploy odin-backend \
  --source . \
  --platform managed \
  --region us-central1
```

#### Heroku
```bash
heroku create odin-backend
git push heroku main
```

---

## Safety & Risk Management

### Built-in Safety Features

- **Paper Trading**: Test with virtual money
- **Position Limits**: Maximum concurrent positions
- **Position Size Limits**: Maximum value per position
- **Stop Loss**: Automatic loss protection
- **Take Profit**: Automatic profit taking
- **Daily Loss Limits**: Prevent excessive losses
- **Signal Staleness**: Avoid trading on old signals
- **Emergency Kill Switch**: Instant shutdown
- **API Authentication**: Secure access control

### Best Practices

1. **Always start with paper trading**
2. **Test thoroughly before enabling autonomous mode**
3. **Set conservative risk parameters**
4. **Monitor positions regularly**
5. **Keep kill switch secret secure**
6. **Review logs frequently**
7. **Never risk more than you can afford to lose**

---

## Troubleshooting

### Common Issues

**Issue**: Database connection errors
- **Solution**: Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running (if using PostgreSQL)
- Verify database credentials

**Issue**: Alpaca API errors
- **Solution**: Verify API keys in `.env`
- Check if using correct base URL (paper vs live)
- Ensure account has sufficient permissions

**Issue**: LLM API errors
- **Solution**: Verify API keys for OpenAI/Anthropic/Google
- Check API rate limits
- Ensure sufficient credits/quota

**Issue**: Import errors
- **Solution**: Activate virtual environment
- Run `pip install -r requirements.txt`
- Check Python version (3.10+)

---

## Additional Resources

- **[FastAPI Documentation](https://fastapi.tiangolo.com/)**
- **[SQLAlchemy Documentation](https://docs.sqlalchemy.org/)**
- **[LangChain Documentation](https://python.langchain.com/)**
- **[Alpaca API Documentation](https://alpaca.markets/docs/)**

---

## Support

For questions or issues:
- Check the [main README](../README.md)
- Review the [API Documentation](API_DOCUMENTATION.md)
- Review the [Backend Requirements](backend_requirements.md)
- Open an issue on GitHub

---

## Disclaimer

⚠️ **IMPORTANT**: This software is for educational purposes only. Trading involves substantial risk of loss. Always start with paper trading and never risk money you cannot afford to lose. The developers are not responsible for any financial losses incurred while using this software.

---

**Built with ❤️ using FastAPI and Python**

**Happy Trading!** 📈
