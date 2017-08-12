module.exports = {
  WATSON_TONE_API_KEY: {
    username: process.env.WATSON_TONE_USERNAME,
    password: process.env.WATSON_TONE_PASSWORD,
  },
  WATSON_NLU_API_KEY: {
    username: process.env.WATSON_NLU_USERNAME,
    password: process.env.WATSON_NLU_PASSWORD,
  },
  MM_API_KEY: process.env.MM_API_KEY,
  DATABASE_URL: process.env.MONGODB_URI,
  SPOTIFY_CLIENT_API_KEY: process.env.SPOTIFY_CLIENT_API_KEY,
  SPOTIFY_CLIENT_SECRET_API_KEY: process.env.SPOTIFY_CLIENT_SECRET_API_KEY,
  REDIRECT: process.env.REDIRECT,
  redisUrl: process.env.REDISTOGO_URL,

  SPOTIFY: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    secret: process.env.SPOTIFY_SECRET,
    cbURL: process.env.SPOTIFY_CB_URL,
  },
};
