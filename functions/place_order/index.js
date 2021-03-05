const { PubSub } = require('@google-cloud/pubsub');
const CoinbasePro = require('coinbase-pro');

const pubsub = new PubSub();
const orderTopic = pubsub.topic(process.env.PUBLISH_TOPIC);

const authedClient = new CoinbasePro.AuthenticatedClient(
  process.env.KEY,
  process.env.SECRET,
  process.env.PASSPHRASE,
  process.env.URI || 'https://api.pro.coinbase.com'
);

const MAX_MESSAGE_AGE = 1000 * 60 * 30; // 30 minutes

exports.placeCoinbaseOrder = async (message, context) => {
  const eventAge = new Date() - Date.parse(context.timestamp);

  if (eventAge > MAX_MESSAGE_AGE) {
    console.warn('max message age reached');
    return Promise.resolve();
  }

  // No need to dead letter and retry on bad input data just push error to logs
  if (!message.data) {
    console.error(new Error('no message data'));
    return Promise.resolve();
  }

  const payload = JSON.parse(Buffer.from(message.data, 'base64').toString());

  const { product_id, funds } = payload;

  if (!product_id) {
    console.error(new Error('missing product_id data'));
    return Promise.resolve();
  }

  if (!funds) {
    console.error(new Error('missing funds data'));
    return Promise.resolve();
  }

  console.log('payload:', JSON.stringify(payload));

  const order = await authedClient.buy({
    type: 'market',
    product_id,
    funds
  });

  console.log('order:', JSON.stringify(order));

  try {
    await orderTopic.publish(Buffer.from(JSON.stringify(order), 'utf-8'));
  } catch (error) {
    console.error(new Error('order pubsub publishing failed'));
  }

  return Promise.resolve();
};
