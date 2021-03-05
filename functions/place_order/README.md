# Coinbase Pro Recurring Purchases

To cut down on fees from Coinbase's main line recurring purchase feature we interface directly with the exchange. On a periodic basis we place market buy orders for a specified product and a specified amount of quote currency to use.

This project runs on Google Cloud using:

- Cloud Functions
- Cloud Scheduler
- PubSub
- Big Query

Expected PubSub payload:

```json
  {
    "product_id": "BTC-USD",
    "funds": "100.00"
  }
```

Deploy cloud scheduler example:

```shell
gcloud scheduler jobs create pubsub buy-btc-prod \
--project finances-299706 \
--schedule='0 0 1,15 * *' \
--topic='place-coinbase-order' \
--message-body '{"product_id": "BTC-USD", "funds": "15.00"}'
```
