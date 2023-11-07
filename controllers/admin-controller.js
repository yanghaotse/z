const adminController = {
  getTweets: (req, res) => {
    res.render('admin/tweets')
  },
  adminSignInPage: (req, res) => {
    res.render('admin/signin')
  },
  adminSignIn: (req, res) => {
    req.flash('success_messages', '成功登入!')
    res.render('admin/tweets')
  },
  getUsers: (req, res, next) => {
    res.render('admin/users')
  }
}


module.exports = adminController