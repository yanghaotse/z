const { User, Tweet, Reply, Like } = require('../../models')
const { Op } = require('sequelize')

const adminController = {
  getTweets: async(req, res, next) => {
    try {
      const tweets = await Tweet.findAll({
        include: [User],
        order: [ ['createdAt', 'DESC'] ],
        raw: true,
        nest: true
      })

      return res.render('admin/tweets', { tweets })
    } catch(err) {
      next(err)
    }
  },
  adminSignInPage: (req, res) => {
    return res.render('admin/signin')
  },
  adminSignIn: (req, res) => {
    req.flash('success_messages', '成功登入!')
    return res.redirect('/admin/tweets')
  },
  getUsers: async(req, res, next) => {
    try {
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
      const usersData = users.map(user => {
        return {
          ...user.toJSON(),
          tweetsCount: user.Tweets.length,
          likesCount: user.LikedTweets.length,
          followingsCount: user.Followings.length,
          followersCount: user.Followers.length
        }
      })
      return res.render('admin/users', { users: usersData })
    } catch(err) {
      next(err)
    }
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