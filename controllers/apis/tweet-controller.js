const { User, Tweet, Reply, Like } = require('../../models')
const { getUser } = require('../../helpers/auth-helpers')
const { getRecommendedFollowings } = require('../../services/user-service')
const { imgurFileHandler } = require('../../helpers/file-helpers')

const tweetController = {
  getTweets: async(req, res, next) => {
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

      return res.json({ tweets: tweetsData, currentUser, recommendFollowings })
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

      return res.redirect('back')
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
      return res.redirect('back')
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