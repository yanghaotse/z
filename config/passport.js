const passport = require('passport')
const LocalStrategy = require('passport-local')
const passoprtJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')

const JWTStrategy = passoprtJWT.Strategy
const ExtractJWT = passoprtJWT.ExtractJwt
const { User, Tweet } = require('../models')
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET'

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
      // admin不能進入前台; user不能進入後台
      if (req.path === '/signin' && user.toJSON().role === 'admin') return cb(null, false, req.flash('error_messages', '帳號不存在!'))
      if (req.path === '/admin/signin' && user.toJSON().role === 'user') return cb(null, false, req.flash('error_messages', '帳號不存在!'))

      const comparedPassword = await bcrypt.compare(password, user.password)
      if (!comparedPassword) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤!'))
      return cb(null, user)
    } catch(err) {
      cb(err)
    }
  }
))
// JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
}
passport.use(new JWTStrategy(jwtOptions, async(jwtPayload, cb) => {
  try {
    const user = await User.findByPk(jwtPayload.id, {
      include: [
        { model: Tweet, as: 'LikedTweets' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ]
    })

    return cb(null, user.toJSON())
  } catch(err) {
    cb(err, false)
  }
}))
// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser(async(id, cb) => {
  try {
    const user = await User.findByPk(id, {
      include: [
        { model: Tweet, as: 'LikedTweets' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ]
    })
    return cb(null, user.toJSON())
  } catch(err) {
    cb(err)
  }
})

module.exports = passport