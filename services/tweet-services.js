const { User, Tweet, Reply, Like } = require('../models')
const { getUser } = require('../helpers/auth-helpers')
const { getRecommendedFollowings } = require('../helpers/user-helpers')
const { imgurFileHandler } = require('../helpers/file-helpers')

const tweetService = {
  getTweets: async(req, cb) => {
    try {
      // 查詢:當前使用者、推薦使用者、所有貼文
      const currentUser = getUser(req) ? getUser(req) : []
      const recommendFollowings = getUser(req) ? await getRecommendedFollowings(currentUser.id) : []

      const tweets = await Tweet.findAll({
        include: [
          User,
          Reply,
          { model: User, as: 'LikedUsers' }
        ],
        order: [
          ['createdAt', 'DESC']
        ]
      })
      const tweetsData = tweets.map(tweet => ({
        ...tweet.toJSON(),
        repliesCount: tweet.Replies.length,
        likesCount: tweet.LikedUsers.length,
        isLiked: tweet.LikedUsers.some( lu => lu.id === currentUser.id)
      }))

      return cb(null, { tweets: tweetsData, currentUser, recommendFollowings })
    } catch(err) {
      cb(err)
    }
  },
  addLike: async(req, cb) => {
    try {
      const currentUserId = Number(getUser(req).id)
      const tweetId = Number(req.params.id)
      if (!tweetId || isNaN(tweetId)) {
        const err = new Error('推文不存在')
        err.status = 404
        throw err
      }

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
      if (!tweet.toJSON().TweetId) {
        const err = new Error('推文不存在')
        err.status = 404
        throw err
      }

      return cb(null, { likedTweet: tweet })
    } catch(err) {
      cb(err)
    }
  },
  removeLike: async(req, cb) => {
    try {
      const currentUserId = getUser(req).id
      const tweetId = Number(req.params.id)
      const likedTweet = await Like.findOne({
        where: {
          tweetId,
          userId: currentUserId
        }
      })
      if (!likedTweet) {
        const err = new Error('喜愛推文不存在')
        err.status = 404
        throw err
      }
      await likedTweet.destroy()
      return cb(null, { removeLikedTweet: likedTweet})
    } catch(err) {
      cb(err)
    }
  },
  getTweet: async(req, cb) => {
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
      if (!tweet) {
        const err = new Error('推文不存在')
        err.status = 404
        throw err
      }

      const { likesCount, repliesCount, isLiked, ...rest } = tweet.toJSON()
      const tweetData = {
        ...rest,
        likesCount: rest.Likes.length,
        repliesCount: rest.Replies.length,
        isLiked: rest.LikedUsers.some(lu => lu.id === currentUser.id)
      }
      const replies = tweetData.Replies

      return cb(null, { tweet: tweetData, replies, currentUser, recommendFollowings })
    } catch(err) {
      cb(err)
    }
  },
  postTweet: async(req, cb) => {
    try {
      const currentUserId = getUser(req).id
      const { description }  = req.body
      const image = req.file ? req.file : null
      const imgurImage = await imgurFileHandler(image)
      
      if (!description) {
        const err = new Error('內容不可空白')
        err.status = 400
        throw err
      }
      if (description.length > 140) {
        const err = new Error('超過字數上限')
        err.status = 413
        throw err
      }

      const newTweet = await Tweet.create({
        userId: currentUserId,
        image: imgurImage || null,
        description
      })

      return cb(null, newTweet)
    } catch(err) {
      cb(err)
    }
  },
  postReply: async(req, cb) => {
    try {
      const currentUserId = getUser(req).id
      const tweetId = req.params.id
      const { comment } = req.body
      const tweet = await Tweet.findByPk(tweetId)
      
      if (!tweet) {
        const err = new Error('推文不存在')
        err.status = 404
        throw err
      }
      if (!comment) {
        const err = new Error('內容不可空白')
        err.status = 400
        throw err
      }
      if (comment.length > 140) {
        const err = new Error('字數超出上限')
        err.status = 413
        throw err
      }

      const reply = await Reply.create({
        userId: currentUserId,
        tweetId,
        comment
      })
      
      return cb(null, { reply })
    } catch(err) {
      cb(err)
    }
  }
}

module.exports = tweetService