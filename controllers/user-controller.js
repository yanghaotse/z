const bcrypt = require('bcryptjs')
const { User } = require('../models')
const { Op } = require('sequelize')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: async(req, res, next) => {
    const { account, name, email, password, checkPassword } = req.body
    try {
      if (!account || !name || !email || !password || !checkPassword) throw new Error('所有欄位都為必填')
      if (password !== checkPassword) throw new Error('密碼與確認密碼不符!')
      if (name.length > 50) throw new Error('字數超出上限!')

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { account: account },
            { email: email }
          ]
        }
      })
      if (existingUser) {
        if (existingUser.toJSON().account === account) throw new Error('帳號已經被使用!')
        if (existingUser.toJSON().email === email) throw new Error('Email 已經被使用!')
      }
      const hashPassword = await bcrypt.hash(password, 10)
      const createUser = await User.create({
        account,
        name,
        email,
        password: hashPassword,
        role: 'user'
      })
      req.flash('success_messages', '成功註冊!')
      res.redirect('/signin')
    } catch(err) {
      next(err)
    }
  },
  signInPage: (req, res, next) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {
    req.flash('success_messages', '成功登入!')
    res.redirect('/tweets')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功!')
    req.logout()
    res.redirect('/signin')
  }
}


module.exports = userController