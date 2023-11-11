const { User, Tweet, Reply, Like, Followship } = require('../models')
const { Sequelize, Op } = require('sequelize')
const { getUser } = require('../helpers/auth-helpers')
const { getRecommendedFollowings } = require('../services/user-service')
const tweetController = {
  getTweets: async(req, res, next) => {
    try {
      // 查詢:當前使用者、推薦使用者、所有貼文
      const currentUser = getUser(req)
      const recommendFollowings = await getRecommendedFollowings(currentUser.id)

      const tweets = await Tweet.findAll({
        include: [
          User,
          Reply,
          { model: User, as: 'LikedUsers' }
        ]
      })
      const tweetsData = tweets.map(tweet => ({
        ...tweet.toJSON(),
        repliesCount: tweet.Replies.length,
        likesCount: tweet.LikedUsers.length,
        isLiked: tweet.LikedUsers.some( lu => lu.id === currentUser.id)
      }))

      res.render('tweets', { tweets: tweetsData, currentUser, recommendFollowings })
    } catch(err) {
      next(err)
    }
  }
}

module.exports = tweetController