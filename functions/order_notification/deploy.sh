#!/bin/bash
set -e

# npm run lint
# npm run test
# npm run build

PROJECT=finances-299706

MEMORY=128MB
CLOUD_REGION=us-central1
RUNTIME=nodejs10
TIMEOUT=30s
TRIGGER_TOPIC=successful-coinbase-orders

gcloud functions deploy coinbaseOrderNotification \
    --memory=$MEMORY \
    --project=$PROJECT \
    --region=$CLOUD_REGION \
    --runtime=$RUNTIME \
    --timeout=$TIMEOUT \
    --trigger-topic=$TRIGGER_TOPIC \
    --env-vars-file .env-prod.yaml \
    --max-instances 1 \
    --retry
