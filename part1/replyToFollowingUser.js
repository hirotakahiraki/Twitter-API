/**
 * フォローしているユーザーへリプを送る
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

/** ここに取得したツイートを入れて行く */
let checkedTweets = [];

/** タイムラインの情報を取得して checkedTweets に入れる。 */
function getHomeTimeLine() {
  twitter.get('statuses/home_timeline', {}, function(error, tweets, response) {
    if(error) console.log(error);

     // 初回起動時は取得するだけで終了。一度しか呼ばれない。
      if (checkedTweets.length === 0) {
          tweets.forEach(function(homeTimeLineTweet, key) {
            checkedTweets.push(homeTimeLineTweet); // 配列に追加
          });
    
          return;
        }

        /** 新しいツイートのみをここに追加する。*/
        const newTweets = [];

        /** 重複しているツイートがないかチェックし、重複がなければ、リプを送る */
        tweets.forEach(function(homeTimeLineTweet, key) {
          if (isCheckedTweet(homeTimeLineTweet) === false) {
            responseHomeTimeLine(homeTimeLineTweet); // リプを送る
            newTweets.push(homeTimeLineTweet); // 新しいツイートを追加
          }
        });
        
  checkedTweets = newTweets.concat(checkedTweets); 
  if(checkedTweets.length > 1000) checkedTweets.length = 1000;  /** 最新の1000件のツイートのみについて確認する */
  });
}


/** cron によって新たに取得したタイムラインのツイートが、
 *  1. 自分のツイートでないか
 *  2. すでに取得済みのツイートかどうか
 *  を確認する */
function isCheckedTweet(homeTimeLineTweet) {
  // ボット自身のツイートは無視する。
  if (homeTimeLineTweet.user.screen_name === 'hirakidev11111') { /** botのscreen name. screen nameは"@"の次から始まる文字列 */
    return true;
  }
    
  for (let checkedTweet of checkedTweets) {
    // 同内容を連続投稿をするアカウントがあるため、一度でも返信した内容は返信しない仕様にしています。
    if (checkedTweet.id_str === homeTimeLineTweet.id_str || checkedTweet.text === homeTimeLineTweet.text) {
      return true;
    }
  }   
  return false;
}

const responses = ['面白い！', 'すごい！', 'なるほど！'];

/**
 * タイムライン上のユーザーに対してリプを送る。
 * 送る内容は、responses からランダムで選んでいる。
 * 送り先のユーザーはhomeTimeLineTweet.user.screen_nameで決まるので、タイムラインにいる自身以外の全員にリプが飛ばされる。
 */
function responseHomeTimeLine(homeTimeLineTweet) {
  const tweetMessage = '@' + homeTimeLineTweet.user.screen_name + '「' + homeTimeLineTweet.text + '」 ' + responses[Math.floor(Math.random() * responses.length)];
  twitter.post('statuses/update', {
    status: tweetMessage,
    in_reply_to_status_id: homeTimeLineTweet.id_str
  }).then((tweet) => {
    console.log(tweet);
  }).catch((error) => {
    throw error;
  });
}

/**
 * 定期実行を行う。
 */
const cronJob = new cron({
     cronTime: '00 0-59/1 * * * *', // 1分ごとに実行
     start: true, // newした後即時実行するかどうか
     onTick: function() {
       getHomeTimeLine();
     }
   });

getHomeTimeLine();