const ACCEPTED_TRADING_PAIRS = [
    'BTC-USD',
    'ETH-USD'
];

class TradingPairService
{
    static tradingPairIsValid(tradingPair) {
        return ACCEPTED_TRADING_PAIRS.filter(pair => pair === tradingPair).length > 0;
    }

    static supportedTradingPairs() {
        return ACCEPTED_TRADING_PAIRS;
    }
}

module.exports = TradingPairService;