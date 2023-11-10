const { User, Tweet, Reply, Like, Followship } = require('../models')
const { Sequelize, Op } = require('sequelize')
const { getUser } = require('../helpers/auth-helpers')
const { getRecommendedFollowings } = require('../services/user-service')
const tweetController = {
  getTweets: async(req, res, next) => {
    try {
      const userId = getUser(req).id
      // 查詢:當前使用者、推薦使用者、所有貼文
      const currentUser = await User.findByPk(userId, { raw: true, nest: true })
      const recommendFollowings = await getRecommendedFollowings(userId)

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

      res.render('tweets', { tweets: tweetsData, currentUser, recommendFollowings })
    } catch(err) {
      next(err)
    }
  }
}

module.exports = tweetController