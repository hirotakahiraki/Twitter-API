'use strict';
const Twit = require('twit');

const twitter = new Twit({
  consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET,
  access_token: process.env.TWITTER_API_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET
});

twitter.post('direct_messages/events/new', {
  event: {
    type: 'message_create',
    message_create: {
      target: {
        recipient_id: '919587681356488704' // DMを受け取る相手のユーザーid。@から始まるやつ「ではない」
      },
      message_data: {
        text: 'hello world' // DMで送るメッセージ
      }
    }
  }
}).then((response) => {
  console.log(response);
}).catch((error) => {
  console.log(error);
});