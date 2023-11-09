const { User, Tweet, Reply, Like, Followship } = require('../models')
const { getUser } = require('../helpers/auth-helpers')


const tweetController = {
  getTweets: async(req, res, next) => {
    try {
      const userId = getUser(req).id
      const tweets = await Tweet.findAll({
        include: [
          User,
          Reply,
          Like
        ]
      })
      const tweetsData = tweets.map(tweet => ({
        ...tweet.toJSON(),
        repliesCount: tweet.Replies.length,
        likesCount: tweet.Likes.length,
        isLiked: tweet.Likes.some(like => like.userId === userId)
      }))
      const currentUser = await User.findByPk(userId, { raw: true, nest: true})

      res.render('tweets', { tweets: tweetsData, currentUser })
    } catch(err) {
      next(err)
    }
  }
}

module.exports = tweetController