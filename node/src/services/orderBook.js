const { orderBooks } = require('./orderBookStream');

class OrderBookService {

    static getOrderBook(tradingPair) {
        return orderBooks.find(book => book.pair === tradingPair);
    }

}

module.exports = OrderBookService;