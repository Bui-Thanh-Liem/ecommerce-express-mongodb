const development = {
  app: {
    port: process.env.DEV_APP_PORT,
  },
  db: {
    host: process.env.DEV_DB_HOST,
    port: process.env.DEV_DB_PORT,
    name: process.env.DEV_DB_NAME,
  },
  redis: {
    host: process.env.DEV_REDIS_HOST,
    port: process.env.DEV_REDIS_PORT,
  },
  discord: {
    botToken: process.env.DEV_BOT_TOKEN,
    logChannelId: process.env.DEV_LOG_CHANNEL_ID,
    urlWebhook: process.env.DEV_URL_WEBHOOK,
    botName: process.env.DEV_BOT_NAME,
    botAvatar: process.env.DEV_BOT_AVATAR,
  },
};

const production = {
  app: {
    port: process.env.PROD_APP_PORT,
  },
  db: {
    host: process.env.PROD_DB_HOST,
    port: process.env.PROD_DB_PORT,
    name: process.env.PROD_DB_NAME,
  },
  redis: {
    host: process.env.DEV_REDIS_HOST,
    port: process.env.DEV_REDIS_PORT,
  },
  discord: {
    botToken: process.env.PROD_BOT_TOKEN,
    logChannelId: process.env.PROD_LOG_CHANNEL_ID,
    botName: process.env.PROD_BOT_NAME,
    botAvatar: process.env.PROD_BOT_AVATAR,
  },
};

const config = { development, production };
const env = process.env.NODE_ENV;

export default config[env];
