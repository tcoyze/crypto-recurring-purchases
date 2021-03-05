const _ = require('lodash');
const axios = require('axios');
const CoinbasePro = require('coinbase-pro');

const hookUrl = process.env.SLACK_HOOK_URL;

const authedClient = new CoinbasePro.AuthenticatedClient(
  process.env.KEY,
  process.env.SECRET,
  process.env.PASSPHRASE,
  process.env.URI || 'https://api.pro.coinbase.com'
);

const MAX_MESSAGE_AGE = 1000 * 60 * 60 * 24; // 1 day

exports.coinbaseOrderNotification = async (message, context) => {
  const eventAge = new Date() - Date.parse(context.timestamp);

  if (eventAge > MAX_MESSAGE_AGE) {
    console.warn('max message age reached');
    return Promise.resolve();
  }

  // resolve and log error no need to retry message
  if (!message.data) {
    console.error(new Error('no message data'));
    return Promise.resolve();
  }

  const payload = JSON.parse(Buffer.from(message.data, 'base64').toString());

  const { id } = payload;

  const order = await authedClient.getOrder(id);

  const { product_id, specified_funds, filled_size, executed_value } = order;

  const formattedSize = _.round(_.toNumber(filled_size), 4);
  const formattedFunds = _.round(_.toNumber(specified_funds), 4);
  const formattedNet = _.round(_.toNumber(executed_value), 4);

  await axios.post(hookUrl, {
    text: `
    Bought ${formattedSize} of ${product_id} for $${formattedFunds} (net of fees: $${formattedNet})

Order Details:
    \`\`\`
${JSON.stringify(order, null, 2)}
    \`\`\`
    `
  });

  return Promise.resolve();
};
