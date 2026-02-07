"""
Manual test script to verify buy and sell order execution.
This bypasses the analysis system and directly tests Alpaca integration.
"""

import asyncio
from app.services.alpaca_service import AlpacaService
from app.core.database import AsyncSessionLocal
from app.models.database import Position, Trade
from datetime import datetime

async def test_buy_sell():
    """Test buying and selling crypto to verify order execution."""
    
    alpaca = AlpacaService()
    
    print("=" * 60)
    print("MANUAL BUY/SELL TEST")
    print("=" * 60)
    
    # Step 1: Get account info
    print("\n1. Checking account...")
    account = await alpaca.get_account()
    print(f"   Cash: ${account['cash']:,.2f}")
    print(f"   Buying Power: ${account['buying_power']:,.2f}")
    
    # Step 2: Get current BTC price
    print("\n2. Getting BTC price...")
    try:
        quote = await alpaca.get_latest_quote("BTCUSD")
        if quote:
            current_price = quote.get('ask_price') or quote.get('bid_price')
            print(f"   BTC Price: ${current_price:,.2f}")
        else:
            print("   ⚠️  Could not get quote, using $100,000 as estimate")
            current_price = 100000
    except Exception as e:
        print(f"   ⚠️  Quote error: {e}, using $100,000 as estimate")
        current_price = 100000
    
    # Step 3: Calculate quantity (buy $1000 worth)
    test_amount = 1000.0
    quantity = test_amount / current_price
    print(f"\n3. Calculating position size...")
    print(f"   Test Amount: ${test_amount:,.2f}")
    print(f"   Quantity: {quantity:.6f} BTC")
    
    # Step 4: Place BUY order
    print(f"\n4. Placing BUY order...")
    print(f"   Symbol: BTCUSD")
    print(f"   Side: BUY")
    print(f"   Quantity: {quantity:.6f}")
    print(f"   Type: MARKET")
    
    try:
        buy_order = await alpaca.place_market_order(
            symbol="BTCUSD",
            quantity=quantity,
            side="buy"
        )
        print(f"   ✅ BUY Order Placed!")
        print(f"   Order ID: {buy_order['order_id']}")
        print(f"   Status: {buy_order['status']}")
        
        # Wait a moment for order to fill
        await asyncio.sleep(3)
        
        # Step 5: Check position
        print(f"\n5. Checking position...")
        position = await alpaca.get_position("BTCUSD")
        if position:
            print(f"   ✅ Position Found!")
            print(f"   Quantity: {position['quantity']}")
            print(f"   Entry Price: ${position['avg_entry_price']:,.2f}")
            print(f"   Current Value: ${position['market_value']:,.2f}")
            print(f"   P&L: ${position['unrealized_pl']:,.2f}")
            
            # Step 6: Place SELL order to close
            print(f"\n6. Placing SELL order to close position...")
            sell_order = await alpaca.place_market_order(
                symbol="BTCUSD",
                quantity=position['quantity'],
                side="sell"
            )
            print(f"   ✅ SELL Order Placed!")
            print(f"   Order ID: {sell_order['order_id']}")
            print(f"   Status: {sell_order['status']}")
            
            # Wait for order to fill
            await asyncio.sleep(3)
            
            # Step 7: Verify position closed
            print(f"\n7. Verifying position closed...")
            final_position = await alpaca.get_position("BTCUSD")
            if final_position is None:
                print(f"   ✅ Position Successfully Closed!")
            else:
                print(f"   ⚠️  Position still exists: {final_position['quantity']}")
            
            # Step 8: Check final account
            print(f"\n8. Final account status...")
            final_account = await alpaca.get_account()
            print(f"   Cash: ${final_account['cash']:,.2f}")
            print(f"   Portfolio Value: ${final_account['portfolio_value']:,.2f}")
            
            print("\n" + "=" * 60)
            print("✅ BUY/SELL TEST COMPLETED SUCCESSFULLY!")
            print("=" * 60)
            
        else:
            print(f"   ❌ No position found after buy order!")
            print(f"   This might mean:")
            print(f"   - Order is still pending")
            print(f"   - Crypto trading not enabled in Alpaca account")
            print(f"   - Symbol not supported")
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print(f"\nPossible issues:")
        print(f"- Crypto trading not enabled in Alpaca account")
        print(f"- Insufficient buying power")
        print(f"- Symbol not supported (try 'BTC/USD' instead of 'BTCUSD')")
        print(f"- Paper trading limitations")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_buy_sell())
