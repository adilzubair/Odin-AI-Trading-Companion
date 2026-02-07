#!/usr/bin/env python3
"""
Hackathon Demo Data Generator

Creates realistic mock data for demonstrating the Sentinel alert system:
1. Past user trades with various market conditions
2. Outcomes (profits/losses)
3. Matching signals to trigger alerts

Run: cd backend && uv run python scripts/generate_demo_data.py
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta
from random import uniform, choice

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from app.models.database import UserActivity, Signal
from app.services.sentinel_service import SentinelService


# Mock past trades with realistic scenarios
MOCK_TRADES = [
    {
        "symbol": "AAPL",
        "scenario": "Earnings Report",
        "news": "Apple Q4 earnings beat expectations, stock up 8%",
        "side": "buy",
        "quantity": 10,
        "price": 175.50,
        "outcome": "Loss: -$87.50 (-5%)",
        "sentiment": 0.85,
        "days_ago": 45,
    },
    {
        "symbol": "AAPL",
        "scenario": "Product Launch",
        "news": "Apple announces new iPhone 16 with AI features",
        "side": "buy",
        "quantity": 15,
        "price": 182.30,
        "outcome": "Profit: +$273.00 (+10%)",
        "sentiment": 0.92,
        "days_ago": 30,
    },
    {
        "symbol": "TSLA",
        "scenario": "Government Contract",
        "news": "Tesla wins $500M government contract for EV infrastructure",
        "side": "buy",
        "quantity": 8,
        "price": 245.00,
        "outcome": "Profit: +$196.00 (+10%)",
        "sentiment": 0.88,
        "days_ago": 60,
    },
    {
        "symbol": "TSLA",
        "scenario": "Production Issues",
        "news": "Tesla reports production delays at Gigafactory",
        "side": "buy",
        "quantity": 12,
        "price": 238.50,
        "outcome": "Loss: -$286.20 (-10%)",
        "sentiment": 0.35,
        "days_ago": 20,
    },
    {
        "symbol": "NVDA",
        "scenario": "AI Boom",
        "news": "NVIDIA announces breakthrough in AI chip technology",
        "side": "buy",
        "quantity": 5,
        "price": 485.00,
        "outcome": "Profit: +$364.50 (+15%)",
        "sentiment": 0.95,
        "days_ago": 50,
    },
    {
        "symbol": "NVDA",
        "scenario": "Market Correction",
        "news": "Tech stocks fall amid market correction concerns",
        "side": "buy",
        "quantity": 7,
        "price": 512.00,
        "outcome": "Loss: -$358.40 (-10%)",
        "sentiment": 0.25,
        "days_ago": 15,
    },
    {
        "symbol": "MSFT",
        "scenario": "Cloud Growth",
        "news": "Microsoft Azure revenue grows 30% YoY",
        "side": "buy",
        "quantity": 20,
        "price": 378.00,
        "outcome": "Profit: +$378.00 (+5%)",
        "sentiment": 0.82,
        "days_ago": 40,
    },
    {
        "symbol": "MSFT",
        "scenario": "Antitrust Concerns",
        "news": "Microsoft faces antitrust investigation in EU",
        "side": "buy",
        "quantity": 10,
        "price": 385.50,
        "outcome": "Loss: -$192.75 (-5%)",
        "sentiment": 0.30,
        "days_ago": 25,
    },
    {
        "symbol": "GOOGL",
        "scenario": "Tax Policy Change",
        "news": "New tax policy affects tech companies' overseas revenue",
        "side": "buy",
        "quantity": 12,
        "price": 142.00,
        "outcome": "Loss: -$170.40 (-10%)",
        "sentiment": 0.28,
        "days_ago": 35,
    },
    {
        "symbol": "GOOGL",
        "scenario": "AI Product Launch",
        "news": "Google launches Gemini 2.0 with advanced capabilities",
        "side": "buy",
        "quantity": 15,
        "price": 138.50,
        "outcome": "Profit: +$207.75 (+10%)",
        "sentiment": 0.90,
        "days_ago": 18,
    },
    {
        "symbol": "AMZN",
        "scenario": "Prime Day Success",
        "news": "Amazon Prime Day breaks sales records",
        "side": "buy",
        "quantity": 8,
        "price": 178.00,
        "outcome": "Profit: +$142.40 (+10%)",
        "sentiment": 0.87,
        "days_ago": 55,
    },
    {
        "symbol": "AMZN",
        "scenario": "Regulatory Pressure",
        "news": "Amazon faces increased regulatory scrutiny",
        "side": "buy",
        "quantity": 10,
        "price": 182.50,
        "outcome": "Loss: -$91.25 (-5%)",
        "sentiment": 0.32,
        "days_ago": 12,
    },
]

# Matching signals to trigger alerts (similar to past trades)
TRIGGER_SIGNALS = [
    {
        "symbol": "AAPL",
        "source": "news",
        "reason": "Apple Q1 earnings report scheduled for next week",
        "sentiment": 0.80,
        "volume": 1500,
    },
    {
        "symbol": "TSLA",
        "source": "news",
        "reason": "Tesla announces new Gigafactory location",
        "sentiment": 0.75,
        "volume": 1200,
    },
    {
        "symbol": "NVDA",
        "source": "reddit",
        "reason": "NVIDIA rumored to announce new AI chip at GTC",
        "sentiment": 0.88,
        "volume": 2000,
    },
    {
        "symbol": "MSFT",
        "source": "news",
        "reason": "Microsoft Azure shows strong growth in cloud market",
        "sentiment": 0.78,
        "volume": 1800,
    },
    {
        "symbol": "GOOGL",
        "source": "news",
        "reason": "Google faces new tax regulations in multiple countries",
        "sentiment": 0.35,
        "volume": 1100,
    },
]


async def clear_demo_data(db):
    """Clear existing demo data"""
    print("🧹 Clearing existing demo data...")
    
    # Delete all user activities
    from sqlalchemy import delete
    await db.execute(delete(UserActivity))
    
    # Delete all signals
    await db.execute(delete(Signal))
    
    # Delete all alerts
    from app.models.database import Alert
    await db.execute(delete(Alert))
    
    await db.commit()
    print("✅ Cleared existing data\n")


async def create_past_trades(db):
    """Create mock past trades"""
    print("📊 Creating past trades...")
    
    activities = []
    for trade in MOCK_TRADES:
        timestamp = datetime.utcnow() - timedelta(days=trade["days_ago"])
        
        activity = UserActivity(
            user_id="default_user",
            activity_type="manual_trade_executed",
            symbol=trade["symbol"],
            side=trade["side"],
            quantity=trade["quantity"],
            price_at_action=trade["price"],
            sentiment_score=trade["sentiment"],
            news_context=trade["news"],
            technical_context=f"Manual {trade['side']} via Trade Panel - {trade['scenario']}",
            timestamp=timestamp,
            outcome=trade["outcome"],
            meta_data={
                "scenario": trade["scenario"],
                "demo_data": True
            }
        )
        
        db.add(activity)
        activities.append(activity)
        
        print(f"  ✓ {trade['symbol']}: {trade['scenario']} - {trade['outcome']}")
    
    await db.commit()
    
    # Refresh to get IDs
    for activity in activities:
        await db.refresh(activity)
    
    print(f"\n✅ Created {len(activities)} past trades\n")
    return activities


async def populate_memory(activities):
    """Add activities to ChromaDB memory for pattern matching"""
    print("🧠 Populating memory with past trades...")
    
    from app.services.memory_service import UserHistoryMemory
    
    memory = UserHistoryMemory()
    
    for activity in activities:
        # Create context text for embedding
        activity_text = f"News about {activity.symbol}: {activity.news_context}"
        
        metadata = {
            "activity_id": activity.id,
            "symbol": activity.symbol,
            "activity_type": activity.activity_type,
            "side": activity.side,
            "quantity": float(activity.quantity) if activity.quantity else 0,
            "price": float(activity.price_at_action) if activity.price_at_action else 0,
            "outcome": activity.outcome,
            "timestamp": activity.timestamp.isoformat()
        }
        
        memory.add_activity(
            activity_text=activity_text,
            metadata=metadata
        )
        
        print(f"  ✓ Added {activity.symbol} to memory")
    
    print(f"\n✅ Populated memory with {len(activities)} activities\n")


async def create_trigger_signals(db):
    """Create signals that will trigger alerts"""
    print("🔔 Creating trigger signals...")
    
    signals = []
    for signal_data in TRIGGER_SIGNALS:
        signal = Signal(
            symbol=signal_data["symbol"],
            source=signal_data["source"],
            source_detail=f"{signal_data['source'].title()} mention",
            sentiment=signal_data["sentiment"],
            volume=signal_data["volume"],
            reason=signal_data["reason"],
            timestamp=datetime.utcnow(),
            meta_data={"demo_data": True}
        )
        
        db.add(signal)
        signals.append(signal)
        
        print(f"  ✓ {signal_data['symbol']}: {signal_data['reason'][:60]}...")
    
    await db.commit()
    print(f"\n✅ Created {len(signals)} trigger signals\n")
    return signals


async def process_signals_for_alerts(db, signals):
    """Process signals through Sentinel to generate alerts"""
    print("🎯 Processing signals to generate alerts...")
    
    sentinel = SentinelService(db)
    alerts_generated = 0
    
    for signal in signals:
        try:
            alert = await sentinel.process_signal(signal)
            if alert:
                alerts_generated += 1
                print(f"  ✓ Alert generated for {signal.symbol}: {alert.alert_type}")
            else:
                print(f"  ⊘ No match found for {signal.symbol}")
        except Exception as e:
            print(f"  ✗ Error processing {signal.symbol}: {e}")
    
    print(f"\n✅ Generated {alerts_generated} alerts\n")


async def display_summary(db):
    """Display summary of generated data"""
    from sqlalchemy import select, func
    from app.models.database import Alert
    
    # Count activities
    result = await db.execute(select(func.count(UserActivity.id)))
    activity_count = result.scalar()
    
    # Count signals
    result = await db.execute(select(func.count(Signal.id)))
    signal_count = result.scalar()
    
    # Count alerts by type
    result = await db.execute(
        select(Alert.alert_type, func.count(Alert.id))
        .group_by(Alert.alert_type)
    )
    alert_counts = dict(result.all())
    
    print("=" * 70)
    print("📊 DEMO DATA SUMMARY")
    print("=" * 70)
    print(f"Past Trades: {activity_count}")
    print(f"Signals: {signal_count}")
    print(f"Alerts Generated:")
    for alert_type, count in alert_counts.items():
        icon = "🔴" if alert_type == "risk_warning" else "🟢" if alert_type == "opportunity" else "🔵"
        print(f"  {icon} {alert_type}: {count}")
    print("=" * 70)
    print("\n✅ Demo data ready for hackathon!")
    print("🌐 Open http://localhost:3000 and click 'Alerts' tab\n")


async def main():
    """Main function"""
    print("\n" + "=" * 70)
    print("🚀 HACKATHON DEMO DATA GENERATOR")
    print("=" * 70 + "\n")
    
    async with AsyncSessionLocal() as db:
        # Step 1: Clear existing data
        await clear_demo_data(db)
        
        # Step 2: Create past trades
        activities = await create_past_trades(db)
        
        # Step 3: Populate memory with past trades
        await populate_memory(activities)
        
        # Step 4: Create trigger signals
        signals = await create_trigger_signals(db)
        
        # Step 5: Process signals to generate alerts
        await process_signals_for_alerts(db, signals)
        
        # Step 6: Display summary
        await display_summary(db)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
