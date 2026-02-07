"""
Signal gathering service for social media sentiment analysis.

Ported from MAHORAGA's TypeScript implementation.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Set
from datetime import datetime, timedelta
import logging
import httpx
import re
import math

from app.models.database import Signal, UserActivity
from sqlalchemy import select, distinct
from app.config import settings

logger = logging.getLogger(__name__)


# Ticker blacklist - common words that aren't tickers
TICKER_BLACKLIST = {
    # Financial/Trading terms
    "CEO", "CFO", "COO", "CTO", "IPO", "EPS", "GDP", "SEC", "FDA", "USA", "USD", "ETF", "NYSE", "API",
    "ATH", "ATL", "IMO", "FOMO", "YOLO", "DD", "TA", "FA", "ROI", "PE", "PB", "PS", "EV", "DCF",
    "WSB", "RIP", "LOL", "OMG", "WTF", "FUD", "HODL", "APE", "MOASS", "DRS", "NFT", "DAO",
    # Common English words
    "THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU", "ALL", "CAN", "HER", "WAS", "ONE", "OUR",
    "OUT", "WHO", "GET", "HAS", "HIM", "HIS", "HOW", "ITS", "MAY", "NEW", "NOW", "OLD", "SEE",
    "TWO", "WAY", "WHO", "BOY", "DID", "ITS", "LET", "PUT", "SAY", "SHE", "TOO", "USE", "DAY",
    "EVEN", "FIND", "GIVE", "GOOD", "HAND", "HIGH", "KEEP", "LAST", "LEFT", "LIFE", "LONG", "MADE",
    "MAKE", "MANY", "MOST", "MOVE", "MUCH", "MUST", "NAME", "NEED", "NEXT", "ONLY", "OPEN", "OVER",
    "PART", "PLAY", "SAID", "SAME", "SEEM", "SHOW", "SIDE", "SOME", "SUCH", "TAKE", "TELL", "THAN",
    "THAT", "THEM", "THEN", "THEY", "THIS", "TIME", "VERY", "WANT", "WELL", "WENT", "WERE", "WHAT",
    "WHEN", "WILL", "WITH", "WORD", "WORK", "YEAR", "YOUR", "BACK", "CAME", "COME", "EACH", "FROM",
    "HAVE", "HERE", "INTO", "JUST", "LIKE", "LOOK", "MORE", "ONLY", "OTHER", "THAN", "THEIR", "THERE",
    "THESE", "THING", "THINK", "THOSE", "UNDER", "WOULD", "ABOUT", "AFTER", "AGAIN", "BELOW", "COULD",
    "EVERY", "FIRST", "FOUND", "GREAT", "HOUSE", "LARGE", "LEARN", "NEVER", "PLACE", "POINT", "RIGHT",
    "SMALL", "SOUND", "STILL", "STUDY", "THEIR", "THERE", "THESE", "THING", "THINK", "THREE", "WHERE",
    "WHICH", "WHILE", "WORLD", "WOULD", "WRITE", "YEARS", "BEING", "DOING", "GOING", "HAVING", "MAKING",
    "SAYING", "SEEING", "TAKING", "USING", "COMING", "GIVING", "GETTING", "LOOKING", "WORKING", "TRYING",
    # Prepositions/Conjunctions
    "AS", "AT", "BE", "BY", "DO", "GO", "IF", "IN", "IS", "IT", "ME", "MY", "NO", "OF", "ON", "OR",
    "SO", "TO", "UP", "US", "WE", "AN", "AM", "AS", "AT", "BE", "BY", "DO", "GO", "HE", "IF", "IN",
    "IS", "IT", "ME", "MY", "NO", "OF", "ON", "OR", "SO", "TO", "UP", "US", "WE",
    # Trading slang
    "BULL", "BEAR", "CALL", "PUTS", "HOLD", "SELL", "MOON", "PUMP", "DUMP", "BAGS", "TEND",
    "GAIN", "LOSS", "WINS", "FAIL", "TECH", "MEME", "STOCK", "TRADE", "SHORT", "LONG", "PENNY",
}


class SignalService:
    """Service for gathering trading signals from social media."""
    
    def __init__(self, db: AsyncSession):
        """Initialize signal gathering service."""
        self.db = db
        self.source_weights = {
            "stocktwits": 0.85,
            "reddit_wallstreetbets": 0.6,
            "reddit_stocks": 0.9,
            "reddit_investing": 0.8,
            "reddit_options": 0.85,
        }
    
    async def fetch_signals_for_ticker(self, symbol: str) -> List[Signal]:
        """
        Active Fetch: Specifically hunt for signals for a single ticker.
        Useful for 'Observer' when user trades a niche stock.
        """
        logger.info(f"Active Fetch: Hunting signals for {symbol}...")
        signals = []
        
        # 1. StockTwits Specific Stream
        try:
            async with httpx.AsyncClient() as client:
                stream_response = await client.get(
                    f"https://api.stocktwits.com/api/2/streams/symbol/{symbol}.json?limit=30",
                    headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"},
                    timeout=10.0
                )
                stream_response.raise_for_status()
                stream_data = stream_response.json()
                messages = stream_data.get("messages", [])
                
                # Analyze sentiment
                bullish = 0
                bearish = 0
                total_decay = 0
                source_weight = self.source_weights["stocktwits"]
                
                for msg in messages:
                    entities = msg.get("entities") or {}
                    sentiment_obj = entities.get("sentiment") or {}
                    sentiment = sentiment_obj.get("basic")
                    created_at = msg.get("created_at")
                    decay = self._calculate_time_decay(created_at)
                    total_decay += decay
                    
                    if sentiment == "Bullish":
                        bullish += decay
                    elif sentiment == "Bearish":
                        bearish += decay
                
                total = len(messages)
                effective_total = total_decay or 1
                score = (bullish - bearish) / effective_total if effective_total > 0 else 0
                avg_freshness = total_decay / total if total > 0 else 0
                
                # Find best message for Active Fetch
                top_msg_text = "Active Fetch Data"
                if messages:
                    sorted_msgs = sorted(messages, key=lambda m: len(m.get("body", "")), reverse=True)
                    top_msg_text = sorted_msgs[0].get("body", "Activity detected")[:200]
                
                # Only save if there is meaningful data
                if total >= 1: # Lower threshold for active fetch
                     # Create Signal object directly (no save to DB yet, let Observer decide)
                     signals.append(Signal(
                        symbol=symbol,
                        source="stocktwits",
                        source_detail="active_fetch",
                        sentiment=score * source_weight, # Weighted
                        raw_sentiment=score,
                        volume=total,
                        freshness=avg_freshness,
                        source_weight=source_weight,
                        reason=f"Active Fetch: {top_msg_text}",
                        timestamp=datetime.now(),
                        meta_data={"active_fetch": True, "top_content": top_msg_text}
                     ))
        except Exception as e:
            logger.warning(f"Active fetch failed for {symbol}: {e}")
            
        # Save any found signals to DB so they are there for next time
        saved_signals = []
        for s in signals:
            self.db.add(s)
            saved_signals.append(s)
        await self.db.commit()
        for s in saved_signals:
            await self.db.refresh(s)
            
        return saved_signals

        return saved_signals

    async def gather_history_signals(self, exclude_symbols: List[str] = []) -> List[Signal]:
        """
        Gather signals for stocks the user has traded before.
        Crucial for the Sentinel to find 'deja vu' moments even for niche stocks.
        """
        logger.info("Gathering signals for user history (niche stocks)...")
        
        try:
            # 1. Get distinct symbols from UserActivity
            # We want to check stocks the user has actually interacted with
            stmt = select(distinct(UserActivity.symbol)).where(UserActivity.symbol.isnot(None))
            result = await self.db.execute(stmt)
            history_symbols = result.scalars().all()
            
            # Filter out symbols we already gathered in the 'Trending' batch
            # Also filter out blacklisted words if any slipped in
            targets = [
                s for s in history_symbols 
                if s and s not in exclude_symbols and s not in TICKER_BLACKLIST
            ]
            
            logger.info(f"Found {len(targets)} unique symbols in history. Fetching updates...")
            
            gathered_signals = []
            
            # 2. Active Fetch for each target
            for symbol in targets:
                try:
                    # We reuse the active fetch logic
                    # This hits the API individually for each stock
                    signals = await self.fetch_signals_for_ticker(symbol)
                    gathered_signals.extend(signals)
                except Exception as e:
                    logger.warning(f"History fetch failed for {symbol}: {e}")
                    
            return gathered_signals
            
        except Exception as e:
            logger.error(f"Failed to gather history signals: {e}", exc_info=True)
            return []

    async def gather_all_signals(self):
        """Gather signals from all sources."""
        logger.info("Gathering signals from all sources...")
        
        signals = []
        
        # Gather from StockTwits
        try:
            stocktwits_signals = await self._gather_stocktwits()
            signals.extend(stocktwits_signals)
            logger.info(f"Gathered {len(stocktwits_signals)} signals from StockTwits")
        except Exception as e:
            logger.error(f"StockTwits gathering failed: {e}")
        
        # Gather from Reddit
        try:
            reddit_signals = await self._gather_reddit()
            signals.extend(reddit_signals)
            logger.info(f"Gathered {len(reddit_signals)} signals from Reddit")
        except Exception as e:
            logger.error(f"Reddit gathering failed: {e}")
        
        # Save signals to database
        saved_signals = []
        for signal_data in signals:
            signal = Signal(**signal_data)
            self.db.add(signal)
            saved_signals.append(signal)
            
        await self.db.commit()
        
        # Refresh to get IDs
        for signal in saved_signals:
            await self.db.refresh(signal)
            
        logger.info(f"Saved {len(saved_signals)} total signals to database")
        
        return saved_signals
    
    async def _gather_stocktwits(self) -> List[Dict[str, Any]]:
        """Gather signals from StockTwits."""
        signals = []
        source_weight = self.source_weights["stocktwits"]
        
        async with httpx.AsyncClient() as client:
            try:
                # Get trending symbols
                response = await client.get(
                    "https://api.stocktwits.com/api/2/trending/symbols.json",
                    headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"},
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                trending = data.get("symbols", [])[:15]
                
                # Get sentiment for each trending symbol
                for sym_data in trending:
                    symbol = sym_data.get("symbol")
                    if not symbol:
                        continue
                    
                    try:
                        # Get stream for symbol
                        stream_response = await client.get(
                            f"https://api.stocktwits.com/api/2/streams/symbol/{symbol}.json?limit=30",
                            timeout=10.0
                        )
                        stream_response.raise_for_status()
                        stream_data = stream_response.json()
                        messages = stream_data.get("messages", [])
                        
                        # Analyze sentiment
                        bullish = 0
                        bearish = 0
                        total_decay = 0
                        
                        for msg in messages:
                            entities = msg.get("entities") or {}
                            sentiment_obj = entities.get("sentiment") or {}
                            sentiment = sentiment_obj.get("basic")
                            created_at = msg.get("created_at")
                            
                            # Calculate time decay
                            decay = self._calculate_time_decay(created_at)
                            total_decay += decay
                            
                            if sentiment == "Bullish":
                                bullish += decay
                            elif sentiment == "Bearish":
                                bearish += decay
                        
                        total = len(messages)
                        effective_total = total_decay or 1
                        score = (bullish - bearish) / effective_total if effective_total > 0 else 0
                        avg_freshness = total_decay / total if total > 0 else 0
                        
                        if total >= 5:
                            weighted_sentiment = score * source_weight * avg_freshness
                            
                            # Find a representative message
                            top_msg_text = "High volume activity"
                            if messages:
                                # Simple heuristic: Take the longest message that is recent
                                sorted_msgs = sorted(messages, key=lambda m: len(m.get("body", "")), reverse=True)
                                top_msg_text = sorted_msgs[0].get("body", "Activity detected")[:150]
                            
                            signals.append({
                                "symbol": symbol,
                                "source": "stocktwits",
                                "source_detail": "stocktwits_trending",
                                "sentiment": weighted_sentiment,
                                "raw_sentiment": score,
                                "volume": total,
                                "freshness": avg_freshness,
                                "source_weight": source_weight,
                                # Save the actual content in reason
                                "reason": f"StockTwits: {top_msg_text} (Sentiment: {score*100:.0f}%)",
                                "timestamp": datetime.now(),
                                "meta_data": {"bullish": int(bullish), "bearish": int(bearish), "top_content": top_msg_text}
                            })
                        
                        await asyncio.sleep(0.2)  # Rate limiting
                        
                    except Exception as e:
                        logger.debug(f"Failed to get stream for {symbol}: {e}")
                        continue
                        
            except Exception as e:
                logger.error(f"Failed to get StockTwits trending: {e}")
        
        return signals
    
    async def _gather_reddit(self) -> List[Dict[str, Any]]:
        """Gather signals from Reddit."""
        subreddits = ["wallstreetbets", "stocks", "investing", "options"]
        ticker_data = {}
        
        async with httpx.AsyncClient() as client:
            for sub in subreddits:
                source_weight = self.source_weights.get(f"reddit_{sub}", 0.7)
                
                try:
                    response = await client.get(
                        f"https://www.reddit.com/r/{sub}/hot.json?limit=25",
                        headers={"User-Agent": "UnifiedTradingBot/0.1"},
                        timeout=10.0
                    )
                    response.raise_for_status()
                    data = response.json()
                    posts = [child["data"] for child in data.get("data", {}).get("children", [])]
                    
                    for post in posts:
                        title = post.get("title", "")
                        selftext = post.get("selftext", "")
                        text = f"{title} {selftext}"
                        
                        # Extract tickers
                        tickers = self._extract_tickers(text)
                        
                        # Detect sentiment
                        raw_sentiment = self._detect_sentiment(text)
                        
                        # Calculate quality score
                        created_utc = post.get("created_utc", datetime.now().timestamp())
                        time_decay = self._calculate_time_decay_from_timestamp(created_utc)
                        upvotes = post.get("ups", 0)
                        comments = post.get("num_comments", 0)
                        engagement_mult = self._get_engagement_multiplier(upvotes, comments)
                        quality_score = time_decay * engagement_mult * source_weight
                        
                        # Aggregate by ticker
                        for ticker in tickers:
                            if ticker not in ticker_data:
                                ticker_data[ticker] = {
                                    "mentions": 0,
                                    "weighted_sentiment": 0,
                                    "raw_sentiment": 0,
                                    "total_quality": 0,
                                    "upvotes": 0,
                                    "comments": 0,
                                    "sources": set(),
                                    "freshest_post": 0,
                                }
                            
                            d = ticker_data[ticker]
                            d["mentions"] += 1
                            d["raw_sentiment"] += raw_sentiment
                            d["weighted_sentiment"] += raw_sentiment * quality_score
                            d["total_quality"] += quality_score
                            d["upvotes"] += upvotes
                            d["comments"] += comments
                            d["sources"].add(sub)
                            d["freshest_post"] = max(d["freshest_post"], created_utc)
                            
                            # Keep track of the most significant post content for this ticker
                            # We use engagement (quality_score) to decide which post title represents the "News"
                            if quality_score > d.get("max_quality", -1):
                                d["max_quality"] = quality_score
                                d["top_content"] = title[:150] # Store title, truncate if too long
                    
                    await asyncio.sleep(1.0)  # Rate limiting
                    
                except Exception as e:
                    logger.error(f"Failed to gather from r/{sub}: {e}")
                    continue
        
        # Convert to signals
        signals = []
        for symbol, data in ticker_data.items():
            if data["mentions"] >= 1: # Lower threshold to catch niche stocks
                avg_raw_sentiment = data["raw_sentiment"] / data["mentions"]
                final_sentiment = data["weighted_sentiment"] / data["mentions"] if data["total_quality"] > 0 else avg_raw_sentiment * 0.5
                freshness = self._calculate_time_decay_from_timestamp(data["freshest_post"])
                
                # Create a RICH reason that includes the content
                # Find the most upvoted post text for this ticker to use as the "Headline"
                # This fixes the issue of losing the "Event" (e.g. Contract Signed)
                best_post_text = "Multiple discussions"
                max_score = -1
                
                # Ideally we would have stored the posts in the aggregation loop,
                # but for now we can infer it or we should refactor to keep the top post.
                # Refactoring aggregation to keep top post content:
                
                top_content = data.get("top_content", "High activity detected")
                
                signals.append({
                    "symbol": symbol,
                    "source": "reddit",
                    "source_detail": f"reddit_{','.join(data['sources'])}",
                    "sentiment": final_sentiment,
                    "raw_sentiment": avg_raw_sentiment,
                    "volume": data["mentions"],
                    "freshness": freshness,
                    "source_weight": 0.75,  # Average
                    "reason": f"Reddit: {top_content} ({data['mentions']} mentions)",
                    "timestamp": datetime.now(),
                    "meta_data": {
                        "upvotes": data["upvotes"],
                        "comments": data["comments"],
                        "subreddits": list(data["sources"]),
                        "top_content": top_content 
                    }
                })
        
        return signals
    
    def _extract_tickers(self, text: str) -> List[str]:
        """Extract stock tickers from text."""
        tickers = set()
        
        # Pattern: $SYMBOL or SYMBOL followed by trading keywords
        pattern = r'\$([A-Z]{1,5})\b|\b([A-Z]{2,5})\b(?=\s+(?:calls?|puts?|stock|shares?|moon|rocket|yolo|buy|sell|long|short))'
        
        for match in re.finditer(pattern, text, re.IGNORECASE):
            ticker = (match.group(1) or match.group(2) or "").upper()
            if 2 <= len(ticker) <= 5 and ticker not in TICKER_BLACKLIST:
                tickers.add(ticker)
        
        return list(tickers)
    
    def _detect_sentiment(self, text: str) -> float:
        """Detect sentiment from text (-1 to +1)."""
        text_lower = text.lower()
        
        bullish = ["moon", "rocket", "buy", "calls", "long", "bullish", "yolo", "tendies", "gains", "diamond", "squeeze", "pump", "green", "up", "breakout"]
        bearish = ["puts", "short", "sell", "bearish", "crash", "dump", "drill", "tank", "rip", "red", "down", "bag", "overvalued", "bubble"]
        
        bull_count = sum(1 for word in bullish if word in text_lower)
        bear_count = sum(1 for word in bearish if word in text_lower)
        
        total = bull_count + bear_count
        if total == 0:
            return 0
        
        return (bull_count - bear_count) / total
    
    def _calculate_time_decay(self, created_at_str: str) -> float:
        """Calculate time decay from ISO timestamp string."""
        try:
            created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
            age_minutes = (datetime.now(created_at.tzinfo) - created_at).total_seconds() / 60
        except:
            age_minutes = 0
        
        half_life = 120  # 2 hours
        decay = math.pow(0.5, age_minutes / half_life)
        return max(0.2, min(1.0, decay))
    
    def _calculate_time_decay_from_timestamp(self, timestamp: float) -> float:
        """Calculate time decay from Unix timestamp."""
        age_minutes = (datetime.now().timestamp() - timestamp) / 60
        half_life = 120  # 2 hours
        decay = math.pow(0.5, age_minutes / half_life)
        return max(0.2, min(1.0, decay))
    
    def _get_engagement_multiplier(self, upvotes: int, comments: int) -> float:
        """Calculate engagement multiplier."""
        upvote_mult = 0.8
        if upvotes >= 1000:
            upvote_mult = 1.5
        elif upvotes >= 500:
            upvote_mult = 1.3
        elif upvotes >= 200:
            upvote_mult = 1.2
        elif upvotes >= 100:
            upvote_mult = 1.1
        elif upvotes >= 50:
            upvote_mult = 1.0
        
        comment_mult = 0.9
        if comments >= 200:
            comment_mult = 1.4
        elif comments >= 100:
            comment_mult = 1.25
        elif comments >= 50:
            comment_mult = 1.15
        elif comments >= 20:
            comment_mult = 1.05
        
        return (upvote_mult + comment_mult) / 2


# Add asyncio import at top
import asyncio
