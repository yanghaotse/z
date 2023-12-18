const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    // 使用 passport 回傳的 user 
    if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })
    if (user.role === 'admin') return res.status(403).json({ status: 'error', message: 'permission denied'})
    // 將 req.user 傳遞下去
    req.user = user
    next()
  })(req, res, next)
}

const authenticateAdmin = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    // 使用 passport 回傳的 user
    if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })
    if (req.user.role === 'admin') return res.status(403).json({ status: 'error', message: 'permission denied' })
    // 將 req.user 傳遞下去
    req.user = user
    next()
  })(req, res, next)
}

module.exports = {
  authenticated,
  authenticateAdmin
}