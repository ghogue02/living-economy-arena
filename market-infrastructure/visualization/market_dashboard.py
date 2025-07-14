#!/usr/bin/env python3
"""
Real-time Market Visualization Dashboard
Advanced visualization for market infrastructure monitoring
"""

import asyncio
import time
import json
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from decimal import Decimal
import numpy as np
from collections import defaultdict, deque
import logging
import websockets
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

@dataclass
class MarketDataPoint:
    """Single market data point for visualization"""
    timestamp: float
    symbol: str
    price: float
    volume: float
    bid: Optional[float] = None
    ask: Optional[float] = None
    trades_count: int = 0

@dataclass
class OrderBookSnapshot:
    """Order book snapshot for visualization"""
    timestamp: float
    symbol: str
    bids: List[Tuple[float, float]]  # (price, quantity)
    asks: List[Tuple[float, float]]  # (price, quantity)
    spread: float
    mid_price: float

@dataclass
class TradingMetrics:
    """Real-time trading metrics"""
    timestamp: float
    symbol: str
    total_volume_24h: float
    price_change_24h: float
    volatility: float
    trades_per_minute: float
    average_trade_size: float
    market_cap: Optional[float] = None

class BaseVisualizationComponent(ABC):
    """Base class for visualization components"""
    
    def __init__(self, component_id: str):
        self.component_id = component_id
        self.data_buffer = deque(maxlen=1000)
        self.update_callbacks = []
        
    @abstractmethod
    async def update(self, data: Any) -> None:
        """Update component with new data"""
        pass
    
    @abstractmethod
    def render(self) -> Dict[str, Any]:
        """Render component data for frontend"""
        pass
    
    def add_update_callback(self, callback) -> None:
        """Add callback for data updates"""
        self.update_callbacks.append(callback)

class PriceChartComponent(BaseVisualizationComponent):
    """Real-time price chart visualization"""
    
    def __init__(self, symbol: str, timeframe: str = "1m"):
        super().__init__(f"price_chart_{symbol}_{timeframe}")
        self.symbol = symbol
        self.timeframe = timeframe
        self.ohlcv_data = deque(maxlen=500)  # OHLCV candlestick data
        self.current_candle = None
        
    async def update(self, market_data: MarketDataPoint) -> None:
        """Update price chart with new market data"""
        if market_data.symbol != self.symbol:
            return
        
        # Create or update current candle
        candle_time = self._get_candle_time(market_data.timestamp)
        
        if self.current_candle is None or self.current_candle['timestamp'] != candle_time:
            # Start new candle
            if self.current_candle is not None:
                self.ohlcv_data.append(self.current_candle)
            
            self.current_candle = {
                'timestamp': candle_time,
                'open': market_data.price,
                'high': market_data.price,
                'low': market_data.price,
                'close': market_data.price,
                'volume': market_data.volume
            }
        else:
            # Update current candle
            self.current_candle['high'] = max(self.current_candle['high'], market_data.price)
            self.current_candle['low'] = min(self.current_candle['low'], market_data.price)
            self.current_candle['close'] = market_data.price
            self.current_candle['volume'] += market_data.volume
        
        # Notify callbacks
        for callback in self.update_callbacks:
            await callback(self.render())
    
    def _get_candle_time(self, timestamp: float) -> float:
        """Get candle start time based on timeframe"""
        if self.timeframe == "1m":
            return int(timestamp // 60) * 60
        elif self.timeframe == "5m":
            return int(timestamp // 300) * 300
        elif self.timeframe == "1h":
            return int(timestamp // 3600) * 3600
        else:
            return int(timestamp // 60) * 60  # Default to 1m
    
    def render(self) -> Dict[str, Any]:
        """Render chart data"""
        candles = list(self.ohlcv_data)
        if self.current_candle:
            candles.append(self.current_candle)
        
        return {
            'component_type': 'price_chart',
            'symbol': self.symbol,
            'timeframe': self.timeframe,
            'data': candles,
            'last_update': time.time()
        }

class OrderBookComponent(BaseVisualizationComponent):
    """Order book depth visualization"""
    
    def __init__(self, symbol: str, depth: int = 20):
        super().__init__(f"orderbook_{symbol}")
        self.symbol = symbol
        self.depth = depth
        self.current_snapshot = None
        
    async def update(self, order_book: OrderBookSnapshot) -> None:
        """Update order book visualization"""
        if order_book.symbol != self.symbol:
            return
        
        self.current_snapshot = order_book
        
        # Notify callbacks
        for callback in self.update_callbacks:
            await callback(self.render())
    
    def render(self) -> Dict[str, Any]:
        """Render order book data"""
        if not self.current_snapshot:
            return {
                'component_type': 'orderbook',
                'symbol': self.symbol,
                'data': None
            }
        
        # Process order book for visualization
        bids = sorted(self.current_snapshot.bids, key=lambda x: x[0], reverse=True)[:self.depth]
        asks = sorted(self.current_snapshot.asks, key=lambda x: x[0])[:self.depth]
        
        # Calculate cumulative volumes
        bid_cumulative = []
        ask_cumulative = []
        
        bid_cum_vol = 0
        for price, volume in bids:
            bid_cum_vol += volume
            bid_cumulative.append({'price': price, 'volume': volume, 'cumulative': bid_cum_vol})
        
        ask_cum_vol = 0
        for price, volume in asks:
            ask_cum_vol += volume
            ask_cumulative.append({'price': price, 'volume': volume, 'cumulative': ask_cum_vol})
        
        return {
            'component_type': 'orderbook',
            'symbol': self.symbol,
            'timestamp': self.current_snapshot.timestamp,
            'bids': bid_cumulative,
            'asks': ask_cumulative,
            'spread': self.current_snapshot.spread,
            'mid_price': self.current_snapshot.mid_price,
            'last_update': time.time()
        }

class TradingMetricsComponent(BaseVisualizationComponent):
    """Trading metrics dashboard"""
    
    def __init__(self, symbol: str):
        super().__init__(f"metrics_{symbol}")
        self.symbol = symbol
        self.metrics_history = deque(maxlen=100)
        self.current_metrics = None
        
    async def update(self, metrics: TradingMetrics) -> None:
        """Update trading metrics"""
        if metrics.symbol != self.symbol:
            return
        
        self.current_metrics = metrics
        self.metrics_history.append(metrics)
        
        # Notify callbacks
        for callback in self.update_callbacks:
            await callback(self.render())
    
    def render(self) -> Dict[str, Any]:
        """Render metrics data"""
        if not self.current_metrics:
            return {
                'component_type': 'metrics',
                'symbol': self.symbol,
                'data': None
            }
        
        # Calculate historical trends
        if len(self.metrics_history) > 1:
            volume_trend = self._calculate_trend([m.total_volume_24h for m in self.metrics_history])
            volatility_trend = self._calculate_trend([m.volatility for m in self.metrics_history])
        else:
            volume_trend = 0
            volatility_trend = 0
        
        return {
            'component_type': 'metrics',
            'symbol': self.symbol,
            'current': asdict(self.current_metrics),
            'trends': {
                'volume_trend': volume_trend,
                'volatility_trend': volatility_trend
            },
            'history': [asdict(m) for m in list(self.metrics_history)[-20:]],
            'last_update': time.time()
        }
    
    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate simple trend direction"""
        if len(values) < 2:
            return 0
        
        recent = values[-5:] if len(values) >= 5 else values
        if len(recent) < 2:
            return 0
        
        return (recent[-1] - recent[0]) / recent[0] if recent[0] != 0 else 0

class MarketOverviewComponent(BaseVisualizationComponent):
    """Market overview with multiple symbols"""
    
    def __init__(self, symbols: List[str]):
        super().__init__("market_overview")
        self.symbols = symbols
        self.symbol_data = {}
        
    async def update(self, data: Dict[str, Any]) -> None:
        """Update market overview"""
        symbol = data.get('symbol')
        if symbol in self.symbols:
            self.symbol_data[symbol] = data
            
            # Notify callbacks
            for callback in self.update_callbacks:
                await callback(self.render())
    
    def render(self) -> Dict[str, Any]:
        """Render market overview"""
        summary = []
        
        for symbol in self.symbols:
            if symbol in self.symbol_data:
                data = self.symbol_data[symbol]
                summary.append({
                    'symbol': symbol,
                    'price': data.get('price'),
                    'change_24h': data.get('price_change_24h'),
                    'volume_24h': data.get('total_volume_24h'),
                    'volatility': data.get('volatility')
                })
        
        return {
            'component_type': 'market_overview',
            'summary': summary,
            'last_update': time.time()
        }

class RealTimeTradesFeed(BaseVisualizationComponent):
    """Real-time trades feed"""
    
    def __init__(self, symbol: str, max_trades: int = 100):
        super().__init__(f"trades_{symbol}")
        self.symbol = symbol
        self.max_trades = max_trades
        self.trades = deque(maxlen=max_trades)
        
    async def update(self, trade_data: Dict[str, Any]) -> None:
        """Update with new trade"""
        if trade_data.get('symbol') != self.symbol:
            return
        
        trade = {
            'timestamp': trade_data.get('timestamp', time.time()),
            'price': trade_data.get('price'),
            'quantity': trade_data.get('quantity'),
            'side': trade_data.get('side'),
            'trade_id': trade_data.get('trade_id')
        }
        
        self.trades.append(trade)
        
        # Notify callbacks
        for callback in self.update_callbacks:
            await callback(self.render())
    
    def render(self) -> Dict[str, Any]:
        """Render trades feed"""
        return {
            'component_type': 'trades_feed',
            'symbol': self.symbol,
            'trades': list(self.trades),
            'last_update': time.time()
        }

class MarketVisualizationDashboard:
    """
    Main dashboard coordinating all visualization components
    """
    
    def __init__(self):
        self.components: Dict[str, BaseVisualizationComponent] = {}
        self.websocket_clients = set()
        self.data_feeds = {}
        
        # Performance metrics
        self.update_count = 0
        self.start_time = time.time()
        
        logger.info("Market Visualization Dashboard initialized")
    
    def add_component(self, component: BaseVisualizationComponent) -> None:
        """Add a visualization component"""
        self.components[component.component_id] = component
        
        # Add callback for real-time updates
        component.add_update_callback(self._broadcast_update)
        
        logger.info(f"Added visualization component: {component.component_id}")
    
    def create_symbol_dashboard(self, symbol: str) -> None:
        """Create complete dashboard for a trading symbol"""
        
        # Price chart
        self.add_component(PriceChartComponent(symbol, "1m"))
        self.add_component(PriceChartComponent(symbol, "5m"))
        
        # Order book
        self.add_component(OrderBookComponent(symbol))
        
        # Trading metrics
        self.add_component(TradingMetricsComponent(symbol))
        
        # Trades feed
        self.add_component(RealTimeTradesFeed(symbol))
        
        logger.info(f"Created complete dashboard for {symbol}")
    
    def create_market_overview(self, symbols: List[str]) -> None:
        """Create market overview component"""
        self.add_component(MarketOverviewComponent(symbols))
    
    async def update_market_data(self, market_data: MarketDataPoint) -> None:
        """Update dashboard with new market data"""
        
        # Update relevant components
        for component in self.components.values():
            if hasattr(component, 'symbol') and component.symbol == market_data.symbol:
                if isinstance(component, PriceChartComponent):
                    await component.update(market_data)
        
        # Update market overview
        overview_data = {
            'symbol': market_data.symbol,
            'price': market_data.price,
            'volume': market_data.volume,
            'timestamp': market_data.timestamp
        }
        
        for component in self.components.values():
            if isinstance(component, MarketOverviewComponent):
                await component.update(overview_data)
        
        self.update_count += 1
    
    async def update_order_book(self, order_book: OrderBookSnapshot) -> None:
        """Update dashboard with order book data"""
        
        for component in self.components.values():
            if isinstance(component, OrderBookComponent) and hasattr(component, 'symbol'):
                if component.symbol == order_book.symbol:
                    await component.update(order_book)
    
    async def update_trading_metrics(self, metrics: TradingMetrics) -> None:
        """Update dashboard with trading metrics"""
        
        for component in self.components.values():
            if isinstance(component, TradingMetricsComponent) and hasattr(component, 'symbol'):
                if component.symbol == metrics.symbol:
                    await component.update(metrics)
        
        # Also update market overview
        metrics_data = {
            'symbol': metrics.symbol,
            'price_change_24h': metrics.price_change_24h,
            'total_volume_24h': metrics.total_volume_24h,
            'volatility': metrics.volatility
        }
        
        for component in self.components.values():
            if isinstance(component, MarketOverviewComponent):
                await component.update(metrics_data)
    
    async def update_trade(self, trade_data: Dict[str, Any]) -> None:
        """Update dashboard with new trade"""
        
        for component in self.components.values():
            if isinstance(component, RealTimeTradesFeed) and hasattr(component, 'symbol'):
                if component.symbol == trade_data.get('symbol'):
                    await component.update(trade_data)
    
    async def _broadcast_update(self, component_data: Dict[str, Any]) -> None:
        """Broadcast component update to websocket clients"""
        
        message = {
            'type': 'component_update',
            'data': component_data,
            'timestamp': time.time()
        }
        
        # Send to all connected websocket clients
        if self.websocket_clients:
            message_json = json.dumps(message, default=str)
            disconnected_clients = set()
            
            for client in self.websocket_clients:
                try:
                    await client.send(message_json)
                except websockets.exceptions.ConnectionClosed:
                    disconnected_clients.add(client)
                except Exception as e:
                    logger.error(f"Error sending to websocket client: {e}")
                    disconnected_clients.add(client)
            
            # Remove disconnected clients
            self.websocket_clients -= disconnected_clients
    
    async def handle_websocket_connection(self, websocket, path) -> None:
        """Handle new websocket connection"""
        self.websocket_clients.add(websocket)
        logger.info(f"New websocket client connected. Total: {len(self.websocket_clients)}")
        
        try:
            # Send initial data for all components
            for component in self.components.values():
                initial_data = {
                    'type': 'component_update',
                    'data': component.render(),
                    'timestamp': time.time()
                }
                await websocket.send(json.dumps(initial_data, default=str))
            
            # Keep connection alive
            await websocket.wait_closed()
            
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.websocket_clients.discard(websocket)
            logger.info(f"Websocket client disconnected. Total: {len(self.websocket_clients)}")
    
    def get_dashboard_data(self, component_id: str = None) -> Dict[str, Any]:
        """Get current dashboard data"""
        
        if component_id:
            if component_id in self.components:
                return self.components[component_id].render()
            else:
                return {'error': 'Component not found'}
        
        # Return all components
        dashboard_data = {}
        for comp_id, component in self.components.items():
            dashboard_data[comp_id] = component.render()
        
        return {
            'components': dashboard_data,
            'metadata': {
                'update_count': self.update_count,
                'uptime': time.time() - self.start_time,
                'active_components': len(self.components),
                'connected_clients': len(self.websocket_clients)
            }
        }
    
    async def start_websocket_server(self, host: str = "localhost", port: int = 8765) -> None:
        """Start websocket server for real-time updates"""
        
        logger.info(f"Starting websocket server on {host}:{port}")
        
        start_server = websockets.serve(self.handle_websocket_connection, host, port)
        await start_server
        
        logger.info("Websocket server started")
    
    def generate_html_dashboard(self) -> str:
        """Generate HTML dashboard for browser viewing"""
        
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Market Infrastructure Dashboard</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a1a; color: white; }
                .dashboard-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
                .component { background: #2a2a2a; padding: 20px; border-radius: 8px; border: 1px solid #444; }
                .component h3 { margin-top: 0; color: #00ff88; }
                .metric { display: flex; justify-content: space-between; margin: 10px 0; }
                .metric-value { font-weight: bold; }
                .positive { color: #00ff88; }
                .negative { color: #ff4444; }
                .neutral { color: #ffaa00; }
                .order-book { display: flex; gap: 20px; }
                .bids, .asks { flex: 1; }
                .price-level { display: flex; justify-content: space-between; padding: 2px 5px; margin: 1px 0; }
                .bid-level { background: rgba(0, 255, 136, 0.1); }
                .ask-level { background: rgba(255, 68, 68, 0.1); }
                #status { position: fixed; top: 10px; right: 10px; background: #333; padding: 10px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>Market Infrastructure Dashboard</h1>
            <div id="status">
                <div>Connected: <span id="connection-status">Connecting...</span></div>
                <div>Updates: <span id="update-count">0</span></div>
            </div>
            
            <div class="dashboard-container" id="dashboard">
                <!-- Components will be inserted here -->
            </div>

            <script>
                const ws = new WebSocket('ws://localhost:8765');
                let updateCount = 0;
                
                ws.onopen = function(event) {
                    document.getElementById('connection-status').textContent = 'Connected';
                    document.getElementById('connection-status').style.color = '#00ff88';
                };
                
                ws.onclose = function(event) {
                    document.getElementById('connection-status').textContent = 'Disconnected';
                    document.getElementById('connection-status').style.color = '#ff4444';
                };
                
                ws.onmessage = function(event) {
                    const message = JSON.parse(event.data);
                    if (message.type === 'component_update') {
                        updateComponent(message.data);
                        updateCount++;
                        document.getElementById('update-count').textContent = updateCount;
                    }
                };
                
                function updateComponent(data) {
                    const dashboard = document.getElementById('dashboard');
                    let componentDiv = document.getElementById(data.component_type + '_' + (data.symbol || 'general'));
                    
                    if (!componentDiv) {
                        componentDiv = document.createElement('div');
                        componentDiv.className = 'component';
                        componentDiv.id = data.component_type + '_' + (data.symbol || 'general');
                        dashboard.appendChild(componentDiv);
                    }
                    
                    if (data.component_type === 'metrics') {
                        updateMetricsComponent(componentDiv, data);
                    } else if (data.component_type === 'orderbook') {
                        updateOrderBookComponent(componentDiv, data);
                    } else if (data.component_type === 'market_overview') {
                        updateMarketOverviewComponent(componentDiv, data);
                    } else if (data.component_type === 'trades_feed') {
                        updateTradesComponent(componentDiv, data);
                    }
                }
                
                function updateMetricsComponent(div, data) {
                    if (!data.current) return;
                    
                    const metrics = data.current;
                    div.innerHTML = `
                        <h3>Trading Metrics - ${data.symbol}</h3>
                        <div class="metric">
                            <span>24h Volume:</span>
                            <span class="metric-value">$${metrics.total_volume_24h.toLocaleString()}</span>
                        </div>
                        <div class="metric">
                            <span>24h Change:</span>
                            <span class="metric-value ${metrics.price_change_24h >= 0 ? 'positive' : 'negative'}">
                                ${metrics.price_change_24h.toFixed(2)}%
                            </span>
                        </div>
                        <div class="metric">
                            <span>Volatility:</span>
                            <span class="metric-value">${(metrics.volatility * 100).toFixed(2)}%</span>
                        </div>
                        <div class="metric">
                            <span>Trades/min:</span>
                            <span class="metric-value">${metrics.trades_per_minute.toFixed(1)}</span>
                        </div>
                    `;
                }
                
                function updateOrderBookComponent(div, data) {
                    if (!data.bids || !data.asks) return;
                    
                    const bidsHtml = data.bids.slice(0, 10).map(bid => 
                        `<div class="price-level bid-level">
                            <span>$${bid.price.toFixed(2)}</span>
                            <span>${bid.volume.toFixed(4)}</span>
                        </div>`
                    ).join('');
                    
                    const asksHtml = data.asks.slice(0, 10).map(ask => 
                        `<div class="price-level ask-level">
                            <span>$${ask.price.toFixed(2)}</span>
                            <span>${ask.volume.toFixed(4)}</span>
                        </div>`
                    ).join('');
                    
                    div.innerHTML = `
                        <h3>Order Book - ${data.symbol}</h3>
                        <div class="metric">
                            <span>Spread:</span>
                            <span class="metric-value">$${data.spread.toFixed(2)}</span>
                        </div>
                        <div class="order-book">
                            <div class="bids">
                                <h4>Bids</h4>
                                ${bidsHtml}
                            </div>
                            <div class="asks">
                                <h4>Asks</h4>
                                ${asksHtml}
                            </div>
                        </div>
                    `;
                }
                
                function updateMarketOverviewComponent(div, data) {
                    const summaryHtml = data.summary.map(item => 
                        `<div class="metric">
                            <span>${item.symbol}:</span>
                            <span class="metric-value ${item.change_24h >= 0 ? 'positive' : 'negative'}">
                                $${item.price ? item.price.toFixed(2) : 'N/A'} 
                                (${item.change_24h ? item.change_24h.toFixed(2) : '0.00'}%)
                            </span>
                        </div>`
                    ).join('');
                    
                    div.innerHTML = `
                        <h3>Market Overview</h3>
                        ${summaryHtml}
                    `;
                }
                
                function updateTradesComponent(div, data) {
                    const tradesHtml = data.trades.slice(-10).reverse().map(trade => 
                        `<div class="metric">
                            <span>${new Date(trade.timestamp * 1000).toLocaleTimeString()}</span>
                            <span class="metric-value ${trade.side === 'buy' ? 'positive' : 'negative'}">
                                ${trade.side.toUpperCase()} ${trade.quantity} @ $${trade.price}
                            </span>
                        </div>`
                    ).join('');
                    
                    div.innerHTML = `
                        <h3>Recent Trades - ${data.symbol}</h3>
                        ${tradesHtml}
                    `;
                }
            </script>
        </body>
        </html>
        """
        
        return html_template

def create_comprehensive_dashboard(symbols: List[str]) -> MarketVisualizationDashboard:
    """Create a comprehensive market dashboard"""
    dashboard = MarketVisualizationDashboard()
    
    # Create individual symbol dashboards
    for symbol in symbols:
        dashboard.create_symbol_dashboard(symbol)
    
    # Add market overview
    dashboard.create_market_overview(symbols)
    
    return dashboard

if __name__ == "__main__":
    # Demo
    async def demo():
        symbols = ["BTC/USD", "ETH/USD", "SOL/USD"]
        dashboard = create_comprehensive_dashboard(symbols)
        
        # Start websocket server
        await dashboard.start_websocket_server()
        
        # Generate sample data
        for i in range(10):
            for symbol in symbols:
                # Sample market data
                market_data = MarketDataPoint(
                    timestamp=time.time(),
                    symbol=symbol,
                    price=50000 + np.random.normal(0, 100),
                    volume=np.random.exponential(100)
                )
                
                await dashboard.update_market_data(market_data)
                
                # Sample trading metrics
                metrics = TradingMetrics(
                    timestamp=time.time(),
                    symbol=symbol,
                    total_volume_24h=1000000 + np.random.normal(0, 100000),
                    price_change_24h=np.random.normal(0, 5),
                    volatility=abs(np.random.normal(0.02, 0.01)),
                    trades_per_minute=np.random.exponential(10),
                    average_trade_size=np.random.exponential(1000)
                )
                
                await dashboard.update_trading_metrics(metrics)
            
            await asyncio.sleep(1)
        
        # Keep server running
        await asyncio.Future()  # Run forever
    
    # To run the demo:
    # asyncio.run(demo())
    
    # For now, just create dashboard and show HTML
    symbols = ["BTC/USD", "ETH/USD", "SOL/USD"]
    dashboard = create_comprehensive_dashboard(symbols)
    
    print("Market Visualization Dashboard created successfully!")
    print(f"Components: {list(dashboard.components.keys())}")
    print("\nHTML Dashboard code generated. Save to file and open in browser.")
    
    # You can save this to an HTML file:
    html_content = dashboard.generate_html_dashboard()
    print(f"\nHTML Dashboard length: {len(html_content)} characters")