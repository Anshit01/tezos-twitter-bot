const Twit = require("twit")

const twit = new Twit(require("./config.js"))

const params = { q: "#tezos", count: 10, tweet_mode: "extended", exclude: "retweets" }

// Tags to mark spam
tags = new Set([
  "BITCOIN",
  "BTC",
  "ETH",
  "ETHEREUM",
  "XRP",
  "POLYGON",
  "MATIC",
  "BNB",
  "CARDANO",
  "ADA",
  "SOLANA",
  "SOL",
  "FLOW",
  "NEAR",
  "TERRA",
  "LUNA",
  "LUNC",
  "POLKADOT",
  "DOT",
  "UNI",
  "CHAINLINK",
  "LINK",
  "DOGE",
  "TRX",
  "AVALANCHE",
  "AVAX",
  "COSMOS",
  "ATOM",
  "ALGORAND",
  "ALGO",
  "FILECOIN",
  "FIL",
  "FOUNDATION",
  "OPENSEA"
])

function log(text) {
  console.log((new Date()).toISOString() + " " + text)
}

function retweet(tweet_id, message) {
  twit.post("statuses/retweet/" + tweet_id, {}, (error, response) => {
    if (error) {
      log(message + " Error: " + error.message)
    } else {
      log(message + " Retweeted")
    }
  })
}

function isSpam(text) {
  let spamScore = 0
  for (word of text.replaceAll("\n", " ").split(" ")) {
    if (word.startsWith("#")) {
      if (tags.has(word.slice(1).toUpperCase())) {
        spamScore += 3
      } else {
        spamScore += 1
      }
    } else if (word.startsWith("$")) {
      if (tags.has(word.slice(1).toUpperCase())) {
        spamScore += 4
      } else {
        spamScore += 2
      }
    }
  }
  return spamScore > 5
}

function retweetLatest() {
  twit.get("search/tweets", params, (error, data) => {
    if (error) {
      log("Error in querying tweets: " + error.message)
    } else {
      log("Got " + data.statuses.length + " tweets")
      data.statuses.forEach(tweet => {
        let message = tweet.id_str
        let text = tweet.full_text
        if (tweet.full_text.startsWith("RT @") && tweet.retweeted_status) {
          message += " (RT)"
          text = tweet.retweeted_status.full_text
        }
        if (isSpam(text)) {
          message += " Marked as spam"
          log(message)
        } else {
          retweet(tweet.id_str, message)
        }
      })
    }
  })
}

retweetLatest()
