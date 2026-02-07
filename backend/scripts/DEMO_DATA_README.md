# Hackathon Demo Data - README

## Overview

This demo data generator creates realistic trading scenarios to demonstrate the Sentinel alert system for your hackathon presentation.

## What It Creates

### 1. Past Trades (12 total)
Realistic trading history across 5 major stocks with various market conditions:

| Symbol | Scenario | Outcome | Days Ago |
|--------|----------|---------|----------|
| AAPL | Earnings Report | Loss: -$87.50 (-5%) | 45 |
| AAPL | Product Launch | Profit: +$273.00 (+10%) | 30 |
| TSLA | Government Contract | Profit: +$196.00 (+10%) | 60 |
| TSLA | Production Issues | Loss: -$286.20 (-10%) | 20 |
| NVDA | AI Boom | Profit: +$364.50 (+15%) | 50 |
| NVDA | Market Correction | Loss: -$358.40 (-10%) | 15 |
| MSFT | Cloud Growth | Profit: +$378.00 (+5%) | 40 |
| MSFT | Antitrust Concerns | Loss: -$192.75 (-5%) | 25 |
| GOOGL | Tax Policy Change | Loss: -$170.40 (-10%) | 35 |
| GOOGL | AI Product Launch | Profit: +$207.75 (+10%) | 18 |
| AMZN | Prime Day Success | Profit: +$142.40 (+10%) | 55 |
| AMZN | Regulatory Pressure | Loss: -$91.25 (-5%) | 12 |

### 2. Trigger Signals (5 total)
Current market events that match past trading patterns:

1. **AAPL** - "Apple Q1 earnings report scheduled for next week"
2. **TSLA** - "Tesla announces new Gigafactory location"
3. **NVDA** - "NVIDIA rumored to announce new AI chip at GTC"
4. **MSFT** - "Microsoft Azure shows strong growth in cloud market"
5. **GOOGL** - "Google faces new tax regulations in multiple countries"

### 3. Generated Alerts (4 total)

#### 🟢 Opportunities (2)
- **NVDA**: AI chip announcement matches past profitable AI trade (+15%)
- **MSFT**: Cloud growth matches past profitable cloud trade (+5%)

#### 🔴 Risk Warnings (2)
- **TSLA**: Gigafactory news matches past production issue loss (-10%)
- **GOOGL**: Tax regulation matches past tax policy loss (-10%)

## How to Use

### Generate Demo Data
```bash
cd backend
uv run python scripts/generate_demo_data.py
```

### View Results
1. Open http://localhost:3000
2. Click the "Alerts" tab
3. You'll see 4 alerts with:
   - News events that triggered them
   - Past trade details
   - Profit/loss outcomes
   - Color-coded warnings

### Re-generate Data
The script clears existing data before generating new data, so you can run it multiple times:

```bash
# Run again to reset demo
cd backend && uv run python scripts/generate_demo_data.py
```

## Demo Talking Points

### 1. Pattern Recognition
"Our AI system recognized that when similar news about NVDA's AI technology appeared in the past, you made a 15% profit. This is an opportunity alert."

### 2. Risk Prevention
"When Tesla had production-related news before, you lost 10%. The system is warning you to be cautious this time."

### 3. Rich Context
"Each alert shows:
- The specific news event
- Your past action (bought X shares at $Y)
- The outcome (profit or loss)
- Intelligent advice based on history"

### 4. Real-time Learning
"As you trade more, the system learns your patterns and gets better at predicting which situations lead to profits vs losses."

## Database Schema

### user_activities
Stores past trades with full context:
- Trade details (symbol, side, quantity, price)
- Market context (news, sentiment)
- Outcomes (profit/loss)

### signals
Current market events:
- News/social media mentions
- Sentiment scores
- Source information

### alerts
Generated warnings/opportunities:
- Links to triggering signal
- Links to matched past trade
- Similarity score
- Rich message with advice

## ChromaDB Memory

The system uses vector embeddings to find similar situations:
1. Past trades are embedded with their news context
2. New signals are embedded
3. Cosine similarity finds matches
4. High similarity (>35%) triggers alerts

## Customization

Edit `generate_demo_data.py` to add more scenarios:

```python
MOCK_TRADES = [
    {
        "symbol": "YOUR_STOCK",
        "scenario": "Your Scenario",
        "news": "Your news headline",
        "side": "buy",
        "quantity": 10,
        "price": 100.00,
        "outcome": "Profit: +$50.00 (+5%)",
        "sentiment": 0.75,
        "days_ago": 30,
    },
    # ... more trades
]
```

## Tips for Hackathon Demo

1. **Start Fresh**: Run the script before your presentation
2. **Show Variety**: Point out different alert types (risk vs opportunity)
3. **Explain Intelligence**: Show how similarity scores work
4. **Demonstrate Value**: "This could have saved me $286 on that TSLA trade"
5. **Future Vision**: "Imagine this across your entire trading history"

## Troubleshooting

### No alerts generated?
- Check that ChromaDB is working
- Verify OpenAI API key is set
- Lower similarity threshold in `sentinel_service.py`

### Wrong outcomes?
- Edit the `outcome` field in `MOCK_TRADES`
- Re-run the script

### Need more data?
- Add more entries to `MOCK_TRADES` and `TRIGGER_SIGNALS`
- Increase variety of scenarios

## Success Metrics

After running the script, you should see:
- ✅ 12 past trades in database
- ✅ 12 activities in ChromaDB memory
- ✅ 5 signals in database
- ✅ 4 alerts in database (2 opportunities, 2 risks)
- ✅ Alerts visible in frontend

Good luck with your hackathon! 🚀
