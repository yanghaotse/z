const jwt = require('jsonwebtoken')
const { getUser } = require('../../helpers/auth-helpers') 
const userService = require('../../services/user-services')

const userController = {
  signIn: async(req, res, next) => {
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
  signUp: async(req, res, next) => {
    await userService.signup(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUserTweets: async(req, res, next) => {
    await userService.getUserTweets(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUserFollowers: async(req, res, next) => {
    await userService.getUserFollowers(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUserFollowings: async(req, res, next) => {
    await userService.getUserFollowings(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUserReplies: async(req, res, next) => {
    await userService.getUserReplies(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUserLikes: async(req, res, next) => {
    await userService.getUserLikes(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }

}


module.exports = userController