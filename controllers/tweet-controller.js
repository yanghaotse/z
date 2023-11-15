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
  },
  addLike: async(req, res, next) => {
    try {
      const currentUserId = Number(getUser(req).id)
      const tweetId = Number(req.params.id)
      if (!tweetId || isNaN(tweetId)) throw new Error('推文不存在')

      const [tweet, created] = await Like.findOrCreate({
        where: {
          tweetId: tweetId,
          userId: currentUserId
        },
        defaults: {
          TweetId: tweetId,
          UserId: currentUserId
        }
      })
      if (!tweet.toJSON().TweetId) throw new Error('推文不存在')

      res.redirect('back')
    } catch(err) {
      next(err)
    }
  },
  removeLike: async(req, res, next) => {
    try {
      const currentUserId = getUser(req).id
      const tweetId = Number(req.params.id)
      const likedTweet = await Like.findOne({
        where: {
          tweetId,
          userId: currentUserId
        }
      })
      if (!likedTweet) throw new Error('喜愛貼文不存在')
      await likedTweet.destroy()
      res.redirect('back')
    } catch(err) {
      next(err)
    }
  },
  getTweet: async(req, res, next) => {
    try {
      const tweetId = req.params.id
      const currentUser = getUser(req)
      const recommendFollowings = await getRecommendedFollowings(currentUser.id)
      
      const tweet = await Tweet.findByPk(tweetId, {
        include: [
          User,
          Like,
          { model: User, as: 'LikedUsers'},
          { model: Reply, include: [User] }  
        ]
      })
      if (!tweet) throw new Error('貼文不存在')

      const { likesCount, repliesCount, isLiked, ...rest } = tweet.toJSON()
      const tweetData = {
        ...rest,
        likesCount: rest.Likes.length,
        repliesCount: rest.Replies.length,
        isLiked: rest.LikedUsers.some(lu => lu.id === currentUser.id)
      }
      const replies = tweetData.Replies

      res.render('tweet', { tweet: tweetData, replies, currentUser, recommendFollowings })
    } catch(err) {
      next(err)
    }
  }
}

module.exports = tweetController