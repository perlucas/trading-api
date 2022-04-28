# Trading API

Trading API excercise.

## Description

Simple NodeJS based API for tracking trading pairs and simulate order executions.

## Getting Started

### Installing & Executing

* Run ```docker compose up --build``` to build up and execute the docker container holding the API setup. This API should be mounted into ```http://localhost:8080```.

## Dev Notes

This setup uses a streamming service provided by BitRex to listen to changes in the corresponding order books and store them in memory. The events listener is set up when the Express API is first initialized, and it keeps running in background. The API endpoints make use of this in-memory order book to actually retrieve the order book tips and to execute orders.
In a more realistic scenario, this in-memory order book representation and the event listener would be installed and executed in a different container/environment, and a different in-memory storage could be used, such as Redis or Memcached.


## API Docs

### Get Order Book
Retrieves the order book current status of a trading pair indicating bids and asks prices and amounts.

URL: `/api/orderbook/:tradingPair`

Method: `GET`

Parameters:
- tradingPair: trading pair for which to return the order book tips. It should be either BTC-USD or ETH-USD.

Response HTTP 200:
```
{
    ask: [
        {
            amount: '0.18500000',
            price: '5001.00000000'
        },
        ...
    ],
    bid: [
        {
            amount: '0.18500000',
            price: '5001.00000000'
        },
        ...
    ]
}
```
Response HTTP 400:
```
{
    message: 'Invalid request',
    errors: [
        {
            message: 'Specific error message'
        },
        ...
    ]
}
```

### Execute Order
Simulates an order execution for the given trading pair and amount.

URL: `/api/orderbook/:tradingPair/order`

Method: `POST`

Parameters:
- tradingPair: trading pair for which to return the order book tips. It should be either BTC-USD or ETH-USD.

Request body:
- amount: floating point number indicating the order's amount.
- operation: string that indicates the type or operation to be executed. It should be either 'sell' or 'buy'.

```
{
    amount: '0.3345',
    operation: 'sell'
}
```


Response HTTP 200:
- isPartialResult: if it's true, it indicates that the order couldn't be fully executed with the current depth of the orderbook. Even when using all the tips of the order book, the order's size you've entered couldn't be fully covered. The result this endpoint returns is then a partial result. To actually get the total result you could try increasing the DEPTH parameter in the .env file.
- totalAmount: it contains the order's amount that was executed. It'll always be equal to the order's amount, unless `isPartialResult` is true.
- totalPrice: it contains the total order execution price, calculated by summing up all the items that are shown in `executionPath`.
- executionPath: specifies the way in which this order would be executed according to the specified order operation and amount, and the current order book status.
```
{
    isPartialResult: false,
    totalAmount: '0.35',
    totalPrice: '3149.5000',
    executionPath: [
        {
            amount: '0.30',
            price: '9000.0000'
        },
        {
            amount: '0.05',
            price: '8990.0000'
        }
    ]
}
```
Response HTTP 400:
```
{
    message: 'Invalid request',
    errors: [
        {
            message: 'Specific error message'
        },
        ...
    ]
}
```