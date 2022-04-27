const OrderBookService = require("./services/orderBook");

const addRoutes = router => {

    router.get('/orderbook/:tradingPair', (req, res) => {
        // res.send(`You've asked for the trading pair ${req.params.tradingPair}`);
        res.json(OrderBookService.getOrderBook(req.params.tradingPair));
    });

    router.get('/orderbook/:tradingPair/order', (req, res) => {
        res.send(`You've added an order for the trading pair ${req.params.tradingPair}`);
    });

    return router;
};

module.exports = addRoutes;