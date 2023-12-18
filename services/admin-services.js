const { User, Tweet, Reply, Like } = require('../models')
const { Op } = require('sequelize')
const { getUser } = require('../helpers/auth-helpers')

const adminService = {
  getTweets: async(req, cb) => {
    try {
      const tweets = await Tweet.findAll({
        include: [User],
        order: [ ['createdAt', 'DESC'] ],
        raw: true,
        nest: true
      })

      return cb(null, { tweets })
    } catch(err) {
      next(err)
    }
  },
  getUsers: async(req, cb) => {
    try {
      const users = await User.findAll({
        where: {
          [Op.or]: [{ role: 'user' }, { role: 'null' }]
        },
        include: [
          Tweet,
          { model: Tweet, as: 'LikedTweets' },
          { model: User, as: 'Followings' },
          { model: User, as: 'Followers' }
        ]
      })
      const usersData = users.map(user => {
        return {
          ...user.toJSON(),
          tweetsCount: user.Tweets.length,
          likesCount: user.LikedTweets.length,
          followingsCount: user.Followings.length,
          followersCount: user.Followers.length
        }
      })
      return cb(null, { users: usersData })
    } catch(err) {
      next(err)
    }
  }
}

module.exports = adminService