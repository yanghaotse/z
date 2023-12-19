const bcrypt = require('bcryptjs')
const { User, Tweet, Reply, Followship, Like } = require('../models')
const { Op } = require('sequelize')
const { getUser } = require('../helpers/auth-helpers') 
const { getRecommendedFollowings } = require('../helpers/user-helpers')
const { imgurFileHandler } = require('../helpers/file-helpers')

const userService = {
  signup: async(req, cb) => {
    const { account, name, email, password, checkPassword } = req.body
    try {
      if (!account || !name || !email || !password || !checkPassword) {
        const err = new Error('所有欄位都為必填')
        err.status = 400
        throw err
      }
      if (password !== checkPassword) {
        const err = new Error('密碼與確認密碼不符!')
        err.status = 412
        throw err
      }
      if (name.length > 50) {
        const err = new Error('字數超出上限!')
        err.status = 413
        throw err
      }

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { account: account },
            { email: email }
          ]
        }
      })
      if (existingUser) {
        if (existingUser.toJSON().account === account) {
          const err = new Error('帳號已經被使用!')
          err.status = 409
          throw err
        }
        if (existingUser.toJSON().email === email) {
          const err = new Error('Email 已經被使用!')
          err.status = 409
          throw err
        }
      }
      const hashPassword = await bcrypt.hash(password, 10)
      const createUser = await User.create({
        account,
        name,
        email,
        password: hashPassword,
        role: 'user'
      })

      return cb(null, { createUser })
    } catch(err) {
      cb(err)
    }
  }
}


module.exports = userService