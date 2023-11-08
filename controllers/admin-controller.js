const { User, Tweet } = require('../models')


const adminController = {
  getTweets: async(req, res, next) => {
    try {
      const tweets = await Tweet.findAll({
        include: [User],
        raw: true,
        nest: true
      })

      res.render('admin/tweets', { tweets })
    } catch(err) {
      next(err)
    }
  },
  adminSignInPage: (req, res) => {
    res.render('admin/signin')
  },
  adminSignIn: (req, res) => {
    req.flash('success_messages', '成功登入!')
    res.redirect('/admin/tweets')
  },
  getUsers: (req, res, next) => {
    res.render('admin/users')
  }
}


module.exports = adminController