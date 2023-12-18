const { User, Tweet, Reply, Like } = require('../../models')
const { getUser } = require('../../helpers/auth-helpers')
const { getRecommendedFollowings } = require('../../helpers/user-helpers')
const { imgurFileHandler } = require('../../helpers/file-helpers')
const tweetService = require('../../services/tweet-services')

const tweetController = {
  getTweets: async(req, res, next) => {
    await tweetService.getTweets(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  addLike: async(req, res, next) => {
    await tweetService.addLike(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  removeLike: async(req, res, next) => {
    await tweetService.removeLike(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getTweet: async(req, res, next) => {
    await tweetService.getTweet(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  postTweet: async(req, res, next) => {
    await tweetService.postTweet(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  postReply: async(req, res, next) => {
    await tweetService.postReply(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = tweetController