const { User, Tweet, Reply, Like } = require('../../models')
const { getUser } = require('../../helpers/auth-helpers')
const { getRecommendedFollowings } = require('../../helpers/user-helpers')
const { imgurFileHandler } = require('../../helpers/file-helpers')
const tweetService = require('../../services/tweet-services')

const tweetController = {
  getTweets: async(req, res, next) => {
    await tweetService.getTweets(req, (err, data) => err ? next(err) : res.render('tweets', data))
  },
  addLike: async(req, res, next) => {
    await tweetService.addLike(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  removeLike: async(req, res, next) => {
    await tweetService.removeLike(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  getTweet: async(req, res, next) => {
    await tweetService.getTweet(req, (err, data) => err ? next(err) : res.render('tweet', data))
  },
  postTweet: async(req, res, next) => {
    await tweetService.postTweet(req, (err, data) => err ? next(err) : res.redirect('/tweets'))
  },
  postReply: async(req, res, next) => {
    await tweetService.postReply(req, (err, data) => err ? next(err) : res.redirect('back'))
  }
}

module.exports = tweetController