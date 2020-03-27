/**
 * タイムラインを3分に1回取得する
 */

'use strict';
const Twit = require('twit');
const cron = require('cron').CronJob;

const twitter = new Twit({
  consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET,
  access_token: process.env.TWITTER_API_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET
});

function getHomeTimeLine(){
  twitter.get('statuses/home_timeline', {}, function(error, tweets, response) {
    if (error) console.log(error);
    console.log(tweets);
  });
}

const cronJob = new cron({
  cronTime: '00 0-59/3 * * * *', // ３分ごとに実行
  start: true, // newした後即時実行するかどうか
  onTick: function() {
    getHomeTimeLine();
  }
});
getHomeTimeLine();