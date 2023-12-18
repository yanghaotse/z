const { User, Tweet, Reply, Like } = require('../../models')
const { Op } = require('sequelize')
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
    try {
      const tweetId = req.params.id
      const tweet = await Tweet.findByPk(tweetId)
      if (!tweet) throw new Error('此篇推文不存在')

      await Reply.destroy({ where: { TweetId: tweetId } })
      await Like.destroy({ where: { TweetId: tweetId } })
      await Tweet.destroy({ where: { id: tweetId } })

      return res.redirect('/admin/tweets')
    } catch(err) {
      next(err)
    }

  }
}


module.exports = adminController