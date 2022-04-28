const OrderBookService = require("./services/orderBook");
const TradingPairService = require('./services/tradingPair');
const BadRequestMessage = require('./services/badRequestMessage');

const { json } = require('express');

const withValidTradingPair = (req, res, next) => {
    if (!TradingPairService.tradingPairIsValid(req.params.tradingPair)) {
        res.status(400).json(BadRequestMessage.fromError('Invalid or unsupported trading pair'));
    }
    else {
        next();
    }
};

const addRoutes = router => {

    router.get('/orderbook/:tradingPair', withValidTradingPair, (req, res) => {
        res.json(OrderBookService.getOrderBook(req.params.tradingPair));
    });

    router.post('/orderbook/:tradingPair/order', json(), withValidTradingPair, (req, res) => {
        const order = {
            tradingPair: req.params.tradingPair,
            amount: req.body.amount,
            operation: req.body.operation
        };

        const result = OrderBookService.attemptToExecuteOrder(order);

        if (result.errors) {
            return res.status(400).json(BadRequestMessage.fromErrors(result.errors));
        }

        res.json(result);
    });

    return router;
};

module.exports = addRoutes;