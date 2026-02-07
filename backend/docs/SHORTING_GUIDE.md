# Shorting Implementation Guide

## Current Status
- ✅ Alpaca API supports shorting (paper and live accounts)
- ✅ `place_market_order()` accepts both "buy" and "sell" sides
- ❌ Autonomous system only acts on "BUY" signals
- ❌ No logic to open short positions on "SELL" signals

## How to Enable Shorting

### 1. Modify `run_analysis_job` in `autonomous_service.py`

Currently:
```python
if analysis.final_decision == "BUY" and (analysis.confidence or 0) >= min_confidence:
    # Execute buy order
    order = alpaca_service.place_order(symbol=signal.symbol, qty=quantity, side="buy")
```

Should be:
```python
if analysis.final_decision in ["BUY", "SELL"] and (analysis.confidence or 0) >= min_confidence:
    # Determine side based on decision
    side = "buy" if analysis.final_decision == "BUY" else "sell"
    
    # Execute order
    order = alpaca_service.place_order(symbol=signal.symbol, qty=quantity, side=side)
    
    # Track position type
    position = Position(
        symbol=signal.symbol,
        entry_time=datetime.now(),
        entry_price=current_price,
        quantity=quantity if side == "buy" else -quantity,  # Negative for short
        status="open",
        meta_data={"position_type": "long" if side == "buy" else "short"}
    )
```

### 2. Update Position Monitoring for Shorts

Short positions have **inverted P&L**:
- Price goes DOWN → Profit
- Price goes UP → Loss

Modify `monitor_positions_job`:
```python
# Get position type
position_type = position.meta_data.get("position_type", "long")

# Calculate P&L (inverted for shorts)
if position_type == "short":
    pnl_pct = ((entry_price - current_price) / entry_price * 100)  # Inverted
else:
    pnl_pct = ((current_price - entry_price) / entry_price * 100)

# Close position with opposite side
close_side = "buy" if position_type == "short" else "sell"
```

### 3. Add Configuration Option

Add to `TradingConfig`:
```python
allow_shorting: bool = False  # Enable/disable shorting
```

## Risks of Shorting

⚠️ **IMPORTANT WARNINGS:**
1. **Unlimited Loss Potential**: Long positions max loss = 100%, shorts = unlimited
2. **Margin Requirements**: Shorts require margin account (not available in all paper accounts)
3. **Hard-to-Borrow Stocks**: Some stocks can't be shorted or have high borrow fees
4. **Short Squeezes**: Rapid price increases can force liquidation

## Recommended Approach

For autonomous trading, I recommend:
1. **Start with longs only** - Test the system thoroughly
2. **Add shorts later** - Once confident in the analysis quality
3. **Use tighter stop-losses** - Shorts need stricter risk management (e.g., 3% vs 5%)
4. **Smaller position sizes** - Reduce risk exposure for shorts
5. **Check shortability** - Verify stock can be shorted before attempting

## Implementation Priority

**Phase 1 (Current)**: Long positions only ✅
**Phase 2**: Add short support with strict risk controls
**Phase 3**: Optimize short/long ratio based on market conditions
