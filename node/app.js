const {initialize, orderBooks} = require('./src/orderBook');

const currencies = [
  'BTC-USD',
  'ETH-USD'
];

initialize(currencies, 25)


currencies.forEach(pair => {
  setInterval(() => {  
    console.log(`Orderbook status for ${pair}:`);
    console.info(orderBooks.find(b => b.pair === pair));
  }, 5000);
})


