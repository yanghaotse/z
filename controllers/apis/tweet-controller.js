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
    try {
      const tweetId = req.params.id
      const currentUser = getUser(req)
      const recommendFollowings = await getRecommendedFollowings(currentUser.id)

      const tweet = await Tweet.findByPk(tweetId, {
        include: [
          User,
          Like,
          { model: User, as: 'LikedUsers'},
          { model: Reply, include: [User], order: [ ['createdAt', 'DESC'] ] }  
        ]
      })
      if (!tweet) throw new Error('推文不存在')

      const { likesCount, repliesCount, isLiked, ...rest } = tweet.toJSON()
      const tweetData = {
        ...rest,
        likesCount: rest.Likes.length,
        repliesCount: rest.Replies.length,
        isLiked: rest.LikedUsers.some(lu => lu.id === currentUser.id)
      }
      const replies = tweetData.Replies

      return res.render('tweet', { tweet: tweetData, replies, currentUser, recommendFollowings })
    } catch(err) {
      next(err)
    }
  },
  postTweet: async(req, res, next) => {
    try {
      const currentUserId = getUser(req).id
      const { description }  = req.body
      const image = req.file ? req.file : null
      const imgurImage = await imgurFileHandler(image)
      
      if (!description) throw new Error('內容不可空白')
      if (description.length > 140) throw new Error('超過字數上限')

      await Tweet.create({
        userId: currentUserId,
        image: imgurImage || null,
        description
      })

      return res.redirect('/tweets')
    } catch(err) {
      next(err)
    }
  },
  postReply: async(req, res, next) => {
    try {
      const currentUserId = getUser(req).id
      const tweetId = req.params.id
      const { comment } = req.body
      const tweet = await Tweet.findByPk(tweetId)
      
      if (!tweet) throw new Error('推文不存在')
      if (!comment) throw new Error('內容不可空白')
      if (comment.length > 140) throw new Error('字數超出上限')

      await Reply.create({
        userId: currentUserId,
        tweetId,
        comment
      })
      
      return res.redirect('back')
    } catch(err) {
      next(err)
    }
  }
}

module.exports = tweetController