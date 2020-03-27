/**
 * タイムラインを取得する
 */

'use strict';
const Twit = require('twit');

const twitter = new Twit({
  consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET,
  access_token: process.env.TWITTER_API_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET
});


twitter.get('statuses/home_timeline', {}, function(error, tweets, response) {
  if (error) console.log(error);
  console.log(tweets);
});


//console.log(process.env.TWITTER_API_ACCESS_TOKEN)