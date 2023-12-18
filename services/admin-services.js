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
  }
}

module.exports = adminService