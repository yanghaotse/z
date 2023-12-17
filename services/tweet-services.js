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
  }
}

module.exports = tweetService