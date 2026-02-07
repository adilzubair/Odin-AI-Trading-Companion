#!/usr/bin/env python3
"""
Simple verification script to check recent user activities in the database.
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select, desc
from app.core.database import AsyncSessionLocal
from app.models.database import UserActivity


async def check_recent_activities():
    """Check recent user activities to verify market context is being stored."""
    
    print("=" * 70)
    print("Recent User Activities - Market Context Verification")
    print("=" * 70)
    
    async with AsyncSessionLocal() as db:
        # Query recent activities
        stmt = select(UserActivity).order_by(desc(UserActivity.timestamp)).limit(10)
        result = await db.execute(stmt)
        activities = result.scalars().all()
        
        if not activities:
            print("\n⚠️  No user activities found in database yet.")
            print("   Execute a trade from the frontend to test the integration.")
            return
        
        print(f"\nFound {len(activities)} recent activities:\n")
        
        for i, activity in enumerate(activities, 1):
            print(f"{i}. Activity ID: {activity.id}")
            print(f"   Symbol: {activity.symbol}")
            print(f"   Type: {activity.activity_type}")
            print(f"   Side: {activity.side or 'N/A'}")
            print(f"   Quantity: {activity.quantity or 'N/A'}")
            print(f"   Time: {activity.timestamp}")
            
            # Check for market context
            has_news = "✓ YES" if activity.news_context else "✗ NO"
            has_sentiment = "✓ YES" if activity.sentiment_score is not None else "✗ NO"
            
            print(f"   News Context: {has_news}")
            if activity.news_context:
                preview = activity.news_context[:80] + "..." if len(activity.news_context) > 80 else activity.news_context
                print(f"      Preview: {preview}")
            
            print(f"   Sentiment Score: {has_sentiment}")
            if activity.sentiment_score is not None:
                print(f"      Value: {activity.sentiment_score:.4f}")
            
            print()
        
        # Summary
        with_news = sum(1 for a in activities if a.news_context)
        with_sentiment = sum(1 for a in activities if a.sentiment_score is not None)
        
        print("=" * 70)
        print(f"Summary: {with_news}/{len(activities)} have news context")
        print(f"         {with_sentiment}/{len(activities)} have sentiment scores")
        print("=" * 70)


if __name__ == "__main__":
    try:
        asyncio.run(check_recent_activities())
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
