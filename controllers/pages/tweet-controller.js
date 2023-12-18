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
  //   try {
  //     const currentUserId = getUser(req).id
  //     const tweetId = req.params.id
  //     const { comment } = req.body
  //     const tweet = await Tweet.findByPk(tweetId)
      
  //     if (!tweet) throw new Error('推文不存在')
  //     if (!comment) throw new Error('內容不可空白')
  //     if (comment.length > 140) throw new Error('字數超出上限')

  //     await Reply.create({
  //       userId: currentUserId,
  //       tweetId,
  //       comment
  //     })
      
  //     return res.redirect('back')
  //   } catch(err) {
  //     next(err)
  //   }
  // }
  }
}

module.exports = tweetController