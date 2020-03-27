'use strict';
const Twit = require('twit');
const cron = require('cron').CronJob;
const moment = require('moment-timezone');

const twitter = new Twit({
  consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET,
  access_token: process.env.TWITTER_API_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET
});
/** DMを送る */
function sendDirectMessage(message) {
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
}

/** アカウントのIdとツイートの組みを保存する。 */
const savedTweetsMap = new Map();

/** タイムラインを取得する */
function getHomeTimeLine() {
  console.log('cron came!');
  twitter.get('statuses/home_timeline', { count: 5 }, function(error, tweets, response) {
    /** エラーがあったら表示 */
    if (error) {
      console.log(error);
      return;
    }

    tweets = dateFormats(tweets);  // 日付を更新する
    console.log(tweets[0].created_at);

    // 初回起動時は取得するだけで終了
    if (savedTweetsMap.size === 0) {
      tweets.forEach(function(homeTimeLineTweet, key) {
        savedTweetsMap.set(homeTimeLineTweet.id, homeTimeLineTweet); // マップに追加
      });
      //console.log(savedTweetsMap);

      return;
    }
        
    // 新しいツイートを追加
    for (let j = 0; j < tweets.length; j++) {
      if (savedTweetsMap.has(tweets[j].id) === false) {
        savedTweetsMap.set(tweets[j].id, tweets[j]);
      }
    }

    console.log(savedTweetsMap);

    });
}
        
function dateFormats(tweets) {
    tweets.forEach(function(tweet, key) {
 
    const times = tweet.created_at.split(' ');
    const date = new Date(times[1] + ' ' + times[2] + ', ' + times[5] + ' ' + times[3]);
    tweet.created_at = moment(date).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss');
  });
 
   return tweets;
 }
const cronJob = new cron({
  cronTime: '0,15,30,45 * * * * *', // 15秒ごとに実行
  start: true, // newした後即時実行するかどうか
  onTick: function() {
    getHomeTimeLine();
  }
});
getHomeTimeLine();