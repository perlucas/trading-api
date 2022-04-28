/**
 * Based on the example provided in: https://bittrex.github.io/samples/V3WebsocketExample.js
 * This module connects to the orderbook changes' streaming and listens to updates made on each trading pair's
 * orderbook.
 * Changes are stored in an in-memory representation of each orderbook.
 */

const signalR = require('signalr-client');
const zlib = require('zlib');

const STREAM_URL = process.env.STREAM_URL;
const HUB = ['c3'];

var client;
var resolveInvocationPromise = () => { };

const orderBooks = [];

async function initialize(tradingPairs, depth) {
  tradingPairs.forEach(pair => {
    orderBooks.push({
      pair,
      ask: [],
      bid: []
    });
  });

  client = await connect();
  await subscribe(client, tradingPairs, depth);
}

async function connect() {
  return new Promise((resolve) => {
    const client = new signalR.client(STREAM_URL, HUB);
    client.serviceHandlers.messageReceived = messageReceived;
    client.serviceHandlers.connected = () => {
      console.log('Connected');
      return resolve(client)
    }
  });
}

const scanRatesFromUpdate = deltas => {
  const ratesToRemove = [];
  const ratesToAdd = [];
  for (const delta of deltas) {
    ratesToRemove.push(delta.rate); // remove all deltas that will be overwritten
    if (delta.quantity > 0) { // deltas with quantity = 0 mean that no longer belong to this orderbook's depth
      ratesToAdd.push(delta);
    }
  }
  return [ratesToRemove, ratesToAdd];
}

function updateOrderBook(orderUpdate) {
  const currentBook = orderBooks.find(book => book.pair === orderUpdate.marketSymbol);

  const bidRates = scanRatesFromUpdate(orderUpdate.bidDeltas);

  const newBids = [
    ...currentBook.bid.filter(bid => !bidRates[0].includes(bid.rate)),
    ...bidRates[1]
  ].sort((delta1, delta2) => +(delta2.rate) - +(delta1.rate)); // sort bid rates DESC

  currentBook.bid = newBids;

  const askRates = scanRatesFromUpdate(orderUpdate.askDeltas);

  const newAsks = [
    ...currentBook.ask.filter(bid => !askRates[0].includes(bid.rate)),
    ...askRates[1]
  ].sort((delta1, delta2) => +(delta1.rate) - +(delta2.rate)); // sort ask rates ASC

  currentBook.ask = newAsks;
}


async function subscribe(client, tradingPairs, depth) {
  const channels = [
    'heartbeat',
    ...tradingPairs.map(
      tradingPair => `orderbook_${tradingPair}_${depth}`
    )
  ];

  const response = await invoke(client, 'subscribe', channels);

  for (let i = 0; i < channels.length; i++) {
    if (response[i]['Success']) {
      console.log('Subscription to "' + channels[i] + '" successful');
    }
    else {
      console.log('Subscription to "' + channels[i] + '" failed: ' + response[i]['ErrorCode']);
    }
  }
}

async function invoke(client, method, ...args) {
  return new Promise((resolve, reject) => {
    resolveInvocationPromise = resolve; // Promise will be resolved when response message received

    client
      .call(HUB[0], method, ...args)
      .done(err => {
        if (err) { return reject(err); }
      });
  });
}




function messageReceived(message) {
  const data = JSON.parse(message.utf8Data);

  if (data['R']) {
    resolveInvocationPromise(data.R);
    return;
  }

  if (data['M']) {
    data.M.forEach(m => {
      if (!m['A']) return;

      if (m.A[0]) {
        const b64 = m.A[0];
        const raw = new Buffer.from(b64, 'base64');

        zlib.inflateRaw(raw, (err, inflated) => {
          if (err) return;

          const json = JSON.parse(inflated.toString('utf8'));

          if (m.M == 'orderBook') {
            updateOrderBook(json); // listen to 'order book updated' event
          }
        });
      }
      else if (m.M == 'heartbeat') {
        console.log('We\'re still connected...');
      }

    });
  }
}

module.exports = {
  initialize,
  orderBooks
};