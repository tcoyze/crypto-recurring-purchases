# Coinbase Pro Recurring Purchases

To cut down on fees from Coinbase's consumer recurring purchase feature we interface directly with the exchange.
On a periodic basis we place market buy orders for a specified product and a specified amount of quote currency to use.

This project runs on Google Cloud using:

- Cloud Functions
- Cloud Scheduler
- PubSub

Deploy cloud function to place orders on Coinbase pro:
```
cd ./place_order
vim .env-prod.yaml # add docs about this
bash deploy.sh
```

Expected PubSub payload for placing an order:

```json
  {
    "product_id": "BTC-USD",
    "funds": "100.00"
  }
```

Deploy cloud scheduler example to purchase $100 worth of bitcoin on the 1st and 15th of every month:

```shell
gcloud scheduler jobs create pubsub buy-btc-prod \
--project <gcloud project> \
--schedule='0 0 1,15 * *' \
--topic='place-coinbase-order' \
--message-body '{"product_id": "BTC-USD", "funds": "100.00"}'
```

Optional notifications via slack hook:

Setup a slack webhook endpoint for your slack team and deploy cloud function:

```
cd ./order_notification
vim .env-prod.yaml # add docs about this
bash deploy.sh
```
