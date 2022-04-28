const {initialize, orderBooks} = require('./src/services/orderBookStream');

const TradingPairService = require('./src/services/tradingPair');

const express = require('express');
const router = express.Router();

const routes = require('./src/routes');

const port = process.env.PORT;
const app = express();

initialize(TradingPairService.supportedTradingPairs(), process.env.DEPTH)


TradingPairService.supportedTradingPairs()
  .forEach(pair => {
    setInterval(() => {  
      console.log(`Orderbook status for ${pair}:`);
      console.info(orderBooks.find(b => b.pair === pair));
    }, 10000);
});

app.use('/api', routes(router));


app.listen(port, () => {
  console.log(`Trading API listening on port ${port}...`);
});