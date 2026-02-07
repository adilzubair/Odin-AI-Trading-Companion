# Unified Trading Bot

A FastAPI-based trading system that combines 

## Features

### Analysis Mode
- **Multi-Agent Analysis**: Fundamentals, News, Social Media, and Technical analysts
- **Debate System**: Bull vs Bear researchers with structured debates
- **Risk Management**: Multi-perspective risk assessment
- **Decision Making**: Final trading decisions with confidence scores

### Autonomous Trading Mode
- **24/7 Signal Gathering**: StockTwits and Reddit sentiment analysis
- **Automated Trading**: Execute trades based on analysis confidence
- **Position Monitoring**: Real-time position tracking with stop-loss/take-profit
- **Risk Management**: Position limits, daily loss limits, staleness detection

## Quick Start

### 1. Installation

```bash
cd UnifiedTradingBot
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
# Edit .env with your API keys
```

Required API keys:
- **Alpaca**: Trading API (get from [alpaca.markets](https://alpaca.markets))
- **OpenAI**: LLM for analysis (or Anthropic/Google)
- **Alpha Vantage**: Financial data (get from [alphavantage.co](https://www.alphavantage.co/support/#api-key))

### 3. Initialize Database

```bash
# The database will be automatically created on first run
# For PostgreSQL, update DATABASE_URL in .env first
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## Usage

### Analysis Mode

Run a trading analysis for a stock:

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

### Autonomous Trading Mode

**Enable autonomous trading:**

```bash
curl -X POST http://localhost:8000/api/v1/autonomous/enable \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Check status:**

```bash
curl http://localhost:8000/api/v1/autonomous/status \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**View positions:**

```bash
curl http://localhost:8000/api/v1/positions \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Emergency kill switch:**

```bash
curl -X POST http://localhost:8000/api/v1/autonomous/kill \
  -H "Authorization: Bearer YOUR_KILL_SWITCH_SECRET"
```

## API Endpoints

### Health
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/db` - Database health check

### Analysis
- `POST /api/v1/analysis/run` - Run trading analysis
- `GET /api/v1/analysis/history/{ticker}` - Get analysis history
- `GET /api/v1/analysis/{id}` - Get specific analysis

### Autonomous Trading
- `POST /api/v1/autonomous/enable` - Enable autonomous mode
- `POST /api/v1/autonomous/disable` - Disable autonomous mode
- `GET /api/v1/autonomous/status` - Get status
- `POST /api/v1/autonomous/config` - Update configuration
- `GET /api/v1/autonomous/signals` - Get recent signals
- `GET /api/v1/autonomous/logs` - Get trading logs
- `POST /api/v1/autonomous/kill` - Emergency kill switch

### Positions
- `GET /api/v1/positions` - List positions
- `GET /api/v1/positions/{symbol}` - Get position details
- `POST /api/v1/positions/{symbol}/close` - Close position
- `GET /api/v1/trades/history` - Get trade history

## Configuration

Key configuration options in `.env`:

```bash
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

# Paper Trading (recommended for testing)
ALPACA_PAPER=true
```

## Architecture

```
UnifiedTradingBot/
├── app/
│   ├── main.py                    # FastAPI application
│   ├── config.py                  # Configuration management
│   ├── api/                       # API endpoints
│   ├── services/                  # Business logic
│   │   ├── analysis_service.py    # TradingAgents integration
│   │   ├── autonomous_service.py  # Autonomous trading
│   │   ├── alpaca_service.py      # Alpaca API wrapper
│   │   └── signal_service.py      # Signal gathering
│   ├── models/                    # Data models
│   ├── core/                      # Core utilities
│   └── agents/                    # TradingAgents code
├── requirements.txt
└── .env
```

## Safety Features

- **Paper Trading**: Test with virtual money
- **Position Limits**: Maximum concurrent positions
- **Stop Loss**: Automatic loss protection
- **Take Profit**: Automatic profit taking
- **Kill Switch**: Emergency shutdown
- **API Authentication**: Secure API access

## Development

### Running Tests

```bash
pytest tests/ -v
```

### Code Formatting

```bash
black app/
ruff check app/
```

## Disclaimer

⚠️ **IMPORTANT**: This software is for educational purposes only. Trading involves substantial risk of loss. Always start with paper trading and never risk money you cannot afford to lose.

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
