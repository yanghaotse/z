const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const { User } = require('../models')

// set up Passport strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'account',
    passwordField: 'password',
    // 讓下面驗證程序可以拿到 req
    passReqToCallback: true
  },
  // authenticate user
  async(req, account, password, cb) => {
    try {
      const user = await User.findOne({ where: { account } })
      if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤!'))
      const comparedPassword = await bcrypt.compare(password, user.password)
      if (!comparedPassword) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤!'))
      return cb(null, user)
    } catch(err) {
      cb(err)
    }
  }
))

// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser(async(id, cb) => {
  try {
    const user = await User.findByPk(id)
    return cb(null, user.toJSON())
  } catch(err) {
    cb(err)
  }
})

module.exports = passport