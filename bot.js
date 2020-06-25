const config = require('./config');
const Twit = require('twit');
const T = new Twit(config);

// ------- STREAM EVENTS ------- //

const onTweeted = (err, res) => {
  if (err !== undefined) {
    console.error(err)
  } else {
    console.log('Tweeted: ' + reply.text)
  }
}

const onFollowed = event => {
  const name = event.source.name
  const screenName = event.source.screen_name
  const response = '@' + screenName + ' Thank you for following, ' + name + '!'
  T.post('statuses/update', {
    status: response
  }, onTweeted)
  console.log('I was followed by: ' + name + ' @' + screenName)
}

const onError = (err) => {
  throw err
}

const onAuthenticated = (err, res) => {
  if (err) {
    throw err
  }
  console.log('Authentication successful. Running bot...\r\n')
  const stream = T.stream('statuses/filter', {track: '@hunter_tread'});
  stream.on('follow', onFollowed)
  stream.on('error', onError)
}

T.get('account/verify_credentials', { // this invocation initiates the stream
  include_entities: false,
  skip_status: true,
  include_email: false
}, onAuthenticated)

// --------- AUTOMATED HASHTAG RETWEET ---------- //

const params = {
    q: '#javascript',
    result_type: 'recent',
    count: 1
  }

const retweet = () => {
  searchTweets(params)
}

const searchTweets = () => {
  T.get('search/tweets', params, (err, data, res) => {
    let tweets = data.statuses
    if (!err) {
      for (let dat of tweets) {
        let retweetId = dat.id_str
        postTweet(retweetId)
      }
    }
  })
}

const postTweet = retweetId => {
  T.post('statuses/retweet/:id', {id: retweetId}, (err, res) => {
    if (res) {
    console.log('Retweeted: ' + retweetId)
    }
    if (err) {
    console.log('Something went wrong while retweeting')
    }
  })
}

// const dayInMilliseconds = 1000 * 60 * 60 * 24
// setInterval(retweet, dayInMilliseconds)