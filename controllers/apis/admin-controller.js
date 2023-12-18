const jwt = require('jsonwebtoken')
const { User, Tweet, Reply, Like } = require('../../models')
const { Op } = require('sequelize')
const { getUser } = require('../../helpers/auth-helpers')
const adminService = require('../../services/admin-services')

const adminController = {
  adminSignIn: async(req, res, next) => {
    try {
      const userData = getUser(req).toJSON() // 因在路由處設定{session: false}沒進入返序列化程序，所以資料是sequelize物件
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '90d' }) // 簽發 JWT，效期為 90 天
      return res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch(err) {
      next(err)
    }
  },
  getTweets: async(req, res, next) => {
    await adminService.getTweets(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUsers: async(req, res, next) => {
    await adminService.getUsers(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteTweet: async(req, res, next) => {
    await adminService.deleteTweet(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = adminController