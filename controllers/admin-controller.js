const { User, Tweet } = require('../models')
const { Op } = require('sequelize')

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
  getUsers: async(req, res, next) => {
    try{
      const users = await User.findAll({
        where: {
          [Op.or]: [{ role: 'user' }, { role: 'null' }]
        },
        include: [
          Tweet,
          { model: Tweet, as: 'LikedTweets' },
          { model: User, as: 'Followings' },
          { model: User, as: 'Followers' }
        ]
      })
      const userData = users.map(user => {
        return {
          ...user.toJSON(),
          tweetsCount: user.Tweets.length,
          likesCount: user.LikedTweets.length,
          followingsCount: user.Followings.length,
          followersCount: user.Followers.length
        }
      })
      res.render('admin/users', { users: userData })
    } catch(err) {
      next(err)
    }
  }
}


module.exports = adminController