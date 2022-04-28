const { orderBooks } = require('./orderBookStream');
const TradingPairService = require('./tradingPair');

const isSellOperation = op => op.toLowerCase() === 'sell';
const isBuyOperation = op => op.toLowerCase() === 'buy';
const isValidOperation = op => isSellOperation(op) || isBuyOperation(op);

const orderBookFromPair = pair => orderBooks.find(book => book.pair === pair);

const PRICE_MAX_DECIMALS = 8;
const TOTAL_RESULT_MAX_DECIMALS = 4;

class OrderBookService {

    static getOrderBook(tradingPair) {
        const { ask, bid } = orderBookFromPair(tradingPair);

        const changeDeltaPropertyNames = delta => {
            const { quantity: amount, rate: price } = delta;
            return { amount, price };
        };

        return {
            ask: ask.map(changeDeltaPropertyNames),
            bid: bid.map(changeDeltaPropertyNames)
        };

    }

    static attemptToExecuteOrder(order) {
        const [hasErrors, errors] = validateOrder(order);

        if (hasErrors) {
            return { errors };
        }

        const { ask, bid } = orderBookFromPair(order.tradingPair);
        const deltasToUse = isSellOperation(order.operation) ? bid : ask;

        const executionPrices = [];
        let remainingAmount = +order.amount;
        for (const delta of deltasToUse) {

            if (remainingAmount > +delta.quantity) {
                remainingAmount = remainingAmount - +delta.quantity;
                executionPrices.push({
                    amount: delta.quantity,
                    price: delta.rate
                });
            }
            else {
                executionPrices.push({
                    amount: remainingAmount.toFixed(PRICE_MAX_DECIMALS),
                    price: delta.rate
                });
                remainingAmount = 0;
                break;
            }

        }

        return {
            isPartialResult: remainingAmount > 0,
            executionPath: executionPrices,
            totalPrice: executionPrices.reduce((carry, current) => carry + (+current.amount * +current.price), 0).toFixed(TOTAL_RESULT_MAX_DECIMALS),
            totalAmount: (+order.amount - remainingAmount).toFixed(TOTAL_RESULT_MAX_DECIMALS)
        };
    }
}

const validateOrder = order => {
    const errors = [];

    if (
        !order.tradingPair ||
        !TradingPairService.tradingPairIsValid(order.tradingPair)
    ) {
        errors.push('Trading pair is not set or is unknown');
    }

    if (
        !order.operation ||
        !isValidOperation(order.operation)
    ) {
        errors.push('Trading operation is not set or is invalid. Should it be sell or buy');
    }

    if (
        !order.amount ||
        +order.amount <= 0
    ) {
        errors.push('Trading amount is not set or is not positive');
    }

    return [errors.length > 0, errors];
};

module.exports = OrderBookService;