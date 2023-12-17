const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User, Tweet, Reply, Followship, Like } = require('../../models')
const { Op } = require('sequelize')
const { getUser } = require('../../helpers/auth-helpers') 
const { getRecommendedFollowings } = require('../../helpers/user-helpers')
const { imgurFileHandler } = require('../../helpers/file-helpers')


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
  }
}


module.exports = userController