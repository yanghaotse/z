const { getUser, ensureAuthenticated } = require('../helpers/auth-helper')

const authenticated = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    if (getUser(req).role === 'user') return next()
    if (getUser(req).role === 'admin') {
      req.flash('error_messages', '後臺帳號不能進入前台!')
      res.redirect('/admin/tweets')
    } else {
      res.redirect('/signin')
    }
  }
  res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    if (getUser(req).role === 'admin') return next()
    if (getUser(req).role === 'user') {
      req.flash('error_messages', '前台帳號不能進入後台!')
      res.redirect('/tweets')
    }
  } else{
    res.redirect('/signin')
  }
}

module.exports = {
  authenticated,
  authenticatedAdmin
}