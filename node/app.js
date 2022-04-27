const {initialize, orderBooks} = require('./src/services/orderBookStream');
const express = require('express');
const router = express.Router();

const routes = require('./src/routes');

const port = process.env.PORT;
const app = express();

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

app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

app.use('/api', routes(router));


app.listen(port, () => {
  console.log(`Trading API listening on port ${port}...`);
});