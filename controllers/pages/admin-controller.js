const adminService = require('../../services/admin-services')

const adminController = {
  getTweets: async(req, res, next) => {
    await adminService.getTweets(req, (err, data) => err ? next(err) : res.render('admin/tweets', data))
  },
  adminSignInPage: (req, res) => {
    return res.render('admin/signin')
  },
  adminSignIn: (req, res) => {
    req.flash('success_messages', '成功登入!')
    return res.redirect('/admin/tweets')
  },
  getUsers: async(req, res, next) => {
    await adminService.getUsers(req, (err, data) => err ? next(err) : res.render('admin/users', data))
  },
  deleteTweet: async(req, res, next) => {
    await adminService.deleteTweet(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '已刪除推文')
      return res.redirect('/admin/tweets')
    })
  }
}


module.exports = adminController